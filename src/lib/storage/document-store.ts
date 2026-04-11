import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { get, put } from '@vercel/blob';
import { v2 as cloudinary } from 'cloudinary';
import { isPlaceholderValue } from '@/lib/security/env';
import { logger } from '@/lib/logger';

export type DocumentStorageProvider = 'blob' | 'cloudinary' | 's3';

interface S3StorageConfig {
    bucket: string;
    client: S3Client;
    keyPrefix: string;
}

const CLOUDINARY_FOLDER = 'policy-scans';
const DEFAULT_S3_KEY_PREFIX = 'policy-scans';
const BLOB_REFERENCE_PREFIX = 'vercel-blob://';

let cloudinaryConfigured = false;
let cachedS3Config: S3StorageConfig | null = null;

function getDocumentStorageProvider(): DocumentStorageProvider {
    const configured = (process.env.DOCUMENT_STORAGE_PROVIDER ?? '').trim().toLowerCase();
    if (configured === 's3') {
        return 's3';
    }

    if (configured === 'blob') {
        return 'blob';
    }

    return 'cloudinary';
}

function getObjectStorageKeyPrefix(): string {
    return (process.env.DOCUMENT_STORAGE_KEY_PREFIX?.trim() || DEFAULT_S3_KEY_PREFIX)
        .replace(/^\/+|\/+$/g, '');
}

function getS3StorageConfig(): S3StorageConfig {
    if (cachedS3Config) {
        return cachedS3Config;
    }

    const bucket = process.env.DOCUMENT_STORAGE_BUCKET?.trim() ?? '';
    const region = process.env.DOCUMENT_STORAGE_REGION?.trim() ?? 'auto';
    const endpoint = process.env.DOCUMENT_STORAGE_ENDPOINT?.trim() ?? '';
    const accessKeyId = process.env.DOCUMENT_STORAGE_ACCESS_KEY_ID?.trim() ?? '';
    const secretAccessKey = process.env.DOCUMENT_STORAGE_SECRET_ACCESS_KEY?.trim() ?? '';
    const keyPrefix = getObjectStorageKeyPrefix();
    const forcePathStyle = (process.env.DOCUMENT_STORAGE_FORCE_PATH_STYLE?.trim() ?? 'false').toLowerCase() === 'true';

    if (
        !bucket ||
        !accessKeyId ||
        !secretAccessKey ||
        isPlaceholderValue(bucket) ||
        isPlaceholderValue(accessKeyId) ||
        isPlaceholderValue(secretAccessKey)
    ) {
        throw new Error('S3 document storage is not configured correctly.');
    }

    cachedS3Config = {
        bucket,
        keyPrefix,
        client: new S3Client({
            region,
            ...(endpoint ? { endpoint } : {}),
            forcePathStyle,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        }),
    };

    return cachedS3Config;
}

function ensureCloudinaryConfigured(): void {
    if (cloudinaryConfigured) {
        return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? '';
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim() ?? '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? '';

    if (
        !cloudName ||
        !apiKey ||
        !apiSecret ||
        isPlaceholderValue(cloudName) ||
        isPlaceholderValue(apiKey) ||
        isPlaceholderValue(apiSecret)
    ) {
        throw new Error('Cloudinary document storage is not configured correctly.');
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });

    cloudinaryConfigured = true;
}

function sanitizeBaseName(fileName: string): string {
    const baseName = fileName.replace(/\.[^/.]+$/, '').toLowerCase();
    const sanitized = baseName
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return sanitized || 'document';
}

function buildStorageObjectKey(fileName: string): string {
    const datePrefix = new Date().toISOString().slice(0, 10);
    const extension = extname(fileName).toLowerCase() || '.pdf';
    const safeExtension = extension === '.pdf' ? extension : '.bin';
    return `${datePrefix}/${sanitizeBaseName(fileName)}-${randomUUID()}${safeExtension}`;
}

function buildS3Reference(bucket: string, key: string): string {
    return `s3://${bucket}/${key}`;
}

function buildBlobReference(pathname: string): string {
    const normalizedPathname = pathname.replace(/^\/+/, '');
    return `${BLOB_REFERENCE_PREFIX}${normalizedPathname}`;
}

function parseS3Reference(reference: string): { bucket: string; key: string } | null {
    if (!reference.startsWith('s3://')) {
        return null;
    }

    const withoutScheme = reference.slice('s3://'.length);
    const firstSlash = withoutScheme.indexOf('/');
    if (firstSlash <= 0 || firstSlash === withoutScheme.length - 1) {
        return null;
    }

    return {
        bucket: withoutScheme.slice(0, firstSlash),
        key: withoutScheme.slice(firstSlash + 1),
    };
}

export function isS3DocumentReference(reference: string): boolean {
    return reference.startsWith('s3://');
}

function parseBlobReference(reference: string): string | null {
    if (!reference.startsWith(BLOB_REFERENCE_PREFIX)) {
        return null;
    }

    const pathname = reference.slice(BLOB_REFERENCE_PREFIX.length).replace(/^\/+/, '');
    return pathname ? pathname : null;
}

export function isBlobDocumentReference(reference: string): boolean {
    return reference.startsWith(BLOB_REFERENCE_PREFIX);
}

function getBlobReadWriteToken(): string {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() ?? '';
    if (!token || isPlaceholderValue(token)) {
        throw new Error('Vercel Blob document storage is not configured correctly.');
    }

    return token;
}

async function uploadToCloudinary(buffer: Buffer, fileName: string): Promise<string> {
    ensureCloudinaryConfigured();

    try {
        return await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: CLOUDINARY_FOLDER,
                    resource_type: 'raw',
                    type: 'authenticated',
                    sign_url: true,
                    public_id: `${sanitizeBaseName(fileName)}-${Date.now()}`,
                    tags: ['insurance-policy', 'scan'],
                },
                (error, result) => {
                    if (error) {
                        logger.error({
                            action: 'document_store.cloudinary.stream_error',
                            error: error.message,
                        });
                        reject(new Error('Cloudinary storage stream failed.'));
                        return;
                    }

                    if (!result?.secure_url) {
                        reject(new Error('Cloudinary secure URL missing in response.'));
                        return;
                    }

                    resolve(result.secure_url);
                },
            );

            uploadStream.end(buffer);
        });
    } catch (error) {
        logger.error({
            action: 'document_store.cloudinary.upload_failed',
            fileName,
            error: error instanceof Error ? error.message : String(error),
        });
        throw new Error('Document storage failed. Please try again later.');
    }
}

async function uploadToS3(buffer: Buffer, fileName: string): Promise<string> {
    const { bucket, client, keyPrefix } = getS3StorageConfig();
    const key = `${keyPrefix}/${buildStorageObjectKey(fileName)}`;

    try {
        await client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: 'application/pdf',
            Metadata: {
                originalName: fileName,
            },
        }));

        return buildS3Reference(bucket, key);
    } catch (error) {
        logger.error({
            action: 'document_store.s3.upload_failed',
            fileName,
            bucket,
            key,
            error: error instanceof Error ? error.message : String(error),
        });
        throw new Error('Document storage failed. Please try again later.');
    }
}

async function uploadToBlob(buffer: Buffer, fileName: string): Promise<string> {
    const token = getBlobReadWriteToken();
    const keyPrefix = getObjectStorageKeyPrefix();
    const pathname = `${keyPrefix}/${buildStorageObjectKey(fileName)}`;

    try {
        const blob = await put(pathname, buffer, {
            access: 'private',
            addRandomSuffix: false,
            contentType: 'application/pdf',
            token,
        });

        return buildBlobReference(blob.pathname);
    } catch (error) {
        logger.error({
            action: 'document_store.blob.upload_failed',
            fileName,
            pathname,
            error: error instanceof Error ? error.message : String(error),
        });
        throw new Error('Document storage failed. Please try again later.');
    }
}

export async function uploadDocument(buffer: Buffer, fileName: string): Promise<string> {
    const provider = getDocumentStorageProvider();

    if (provider === 's3') {
        return uploadToS3(buffer, fileName);
    }

    if (provider === 'blob') {
        return uploadToBlob(buffer, fileName);
    }

    return uploadToCloudinary(buffer, fileName);
}

async function readS3Document(reference: string): Promise<Buffer> {
    const parsed = parseS3Reference(reference);
    if (!parsed) {
        throw new Error('Invalid S3 document reference.');
    }

    const { client } = getS3StorageConfig();
    const result = await client.send(new GetObjectCommand({
        Bucket: parsed.bucket,
        Key: parsed.key,
    }));

    if (!result.Body) {
        throw new Error('Document body missing from S3 response.');
    }

    const byteArray = await result.Body.transformToByteArray();
    return Buffer.from(byteArray);
}

async function readBlobDocument(reference: string): Promise<Buffer> {
    const pathname = parseBlobReference(reference);
    if (!pathname) {
        throw new Error('Invalid Vercel Blob document reference.');
    }

    const token = getBlobReadWriteToken();
    const result = await get(pathname, {
        access: 'private',
        token,
    });

    if (!result?.stream) {
        throw new Error('Document body missing from Vercel Blob response.');
    }

    const arrayBuffer = await new Response(result.stream).arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function readRemoteDocument(reference: string): Promise<Buffer> {
    const response = await fetch(reference);
    if (!response.ok) {
        throw new Error(`Unable to fetch stored document (${response.status}).`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export async function readStoredDocument(reference: string): Promise<Buffer> {
    if (isS3DocumentReference(reference)) {
        return readS3Document(reference);
    }

    if (isBlobDocumentReference(reference)) {
        return readBlobDocument(reference);
    }

    if (reference.startsWith('http://') || reference.startsWith('https://')) {
        return readRemoteDocument(reference);
    }

    throw new Error('Unsupported document storage reference.');
}
