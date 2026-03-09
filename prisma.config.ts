import "dotenv/config";

export default {
    datasource: {
        url: "postgresql://neondb_owner:npg_uyNX2KSJF1Oo@ep-spring-grass-a4el2jz4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
    },
    migrations: {
        seed: 'npx tsx prisma/seed.ts',
    }
};
