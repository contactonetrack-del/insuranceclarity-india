import { prisma } from '@/lib/prisma';

export class NewsletterRepository {
    findByEmail(email: string) {
        return prisma.newsletter.findUnique({ where: { email } });
    }

    create(email: string) {
        return prisma.newsletter.create({ data: { email } });
    }
}

export const newsletterRepository = new NewsletterRepository();

