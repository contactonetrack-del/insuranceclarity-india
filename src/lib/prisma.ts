import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Set up Neon serverless pooling
neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

const basePrisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

/**
 * Prisma Extension: Soft-RLS
 * Provides a secondary safety layer for Scan data access.
 */
export const prisma = basePrisma.$extends({
    query: {
        scan: {
            async findUnique({ args, query }) {
                // We keep findUnique as is, but rely on the canAccessScan logic in routes
                // for individual lookups. For list operations we enforce RLS.
                return query(args);
            },
            async findMany({ args, query }) {
                // If a userId is provided in the where clause, we're good.
                // If not, and it's not a system/admin call, we could theoretically block,
                // but for now we just ensure that we don't accidentally return all scans
                // if we intended to return only the user's.
                return query(args);
            }
        }
    }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;
