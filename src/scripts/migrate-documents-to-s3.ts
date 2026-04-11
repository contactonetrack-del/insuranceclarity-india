import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
    isBlobDocumentReference,
    isS3DocumentReference,
    readStoredDocument,
    uploadDocument,
} from '../lib/storage/document-store';

interface ScriptOptions {
    apply: boolean;
    limit: number | null;
    scanId: string | null;
}

const prisma = new PrismaClient();

type ObjectStorageProvider = 'blob' | 's3';

function parseOptions(argv: string[]): ScriptOptions {
    let apply = false;
    let limit: number | null = null;
    let scanId: string | null = null;

    for (const arg of argv) {
        if (arg === '--apply') {
            apply = true;
            continue;
        }

        if (arg.startsWith('--limit=')) {
            const parsed = Number.parseInt(arg.slice('--limit='.length), 10);
            if (Number.isFinite(parsed) && parsed > 0) {
                limit = parsed;
            }
            continue;
        }

        if (arg.startsWith('--scan-id=')) {
            const parsed = arg.slice('--scan-id='.length).trim();
            if (parsed) {
                scanId = parsed;
            }
        }
    }

    return { apply, limit, scanId };
}

function getObjectStorageProvider(): ObjectStorageProvider {
    const provider = (process.env.DOCUMENT_STORAGE_PROVIDER ?? '').trim().toLowerCase();
    if (provider === 's3' || provider === 'blob') {
        return provider;
    }

    throw new Error('Set DOCUMENT_STORAGE_PROVIDER to `s3` or `blob` before running the document migration.');
}

function isObjectStorageReference(reference: string): boolean {
    return isS3DocumentReference(reference) || isBlobDocumentReference(reference);
}

async function main(): Promise<void> {
    const options = parseOptions(process.argv.slice(2));
    const provider = getObjectStorageProvider();

    const candidates = await prisma.scan.findMany({
        where: options.scanId ? { id: options.scanId } : undefined,
        orderBy: { createdAt: 'asc' },
        ...(options.limit ? { take: options.limit } : {}),
        select: {
            id: true,
            fileName: true,
            fileUrl: true,
            createdAt: true,
        },
    });

    const scansToMigrate = candidates.filter((scan) => !isObjectStorageReference(scan.fileUrl));
    console.log(`Found ${scansToMigrate.length} scan document(s) that still point at remote non-object storage.`);

    if (scansToMigrate.length === 0) {
        return;
    }

    if (!options.apply) {
        console.log(`Dry run only. Re-run with --apply to migrate and rewrite Scan.fileUrl values for ${provider}.`);
        scansToMigrate.slice(0, 10).forEach((scan) => {
            console.log(`- ${scan.id} :: ${scan.fileName} :: ${scan.fileUrl}`);
        });
        return;
    }

    let migrated = 0;
    for (const scan of scansToMigrate) {
        const buffer = await readStoredDocument(scan.fileUrl);
        const nextReference = await uploadDocument(buffer, scan.fileName);

        const migratedToObjectStorage = provider === 'blob'
            ? isBlobDocumentReference(nextReference)
            : isS3DocumentReference(nextReference);

        if (!migratedToObjectStorage) {
            throw new Error(`Document migration for scan ${scan.id} returned an unexpected ${provider} reference.`);
        }

        await prisma.scan.update({
            where: { id: scan.id },
            data: { fileUrl: nextReference },
        });

        migrated += 1;
        console.log(`Migrated ${migrated}/${scansToMigrate.length}: ${scan.id}`);
    }

    console.log(`Document migration complete for ${provider}. Updated ${migrated} scan document reference(s).`);
}

void main()
    .catch((error: unknown) => {
        console.error('Document migration failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
