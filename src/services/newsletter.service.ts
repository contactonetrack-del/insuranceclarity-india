import { newsletterRepository } from '@/repositories/newsletter.repository';

export async function findNewsletterByEmail(email: string) {
    return newsletterRepository.findByEmail(email);
}

export async function createNewsletterSubscriber(email: string) {
    return newsletterRepository.create(email);
}
