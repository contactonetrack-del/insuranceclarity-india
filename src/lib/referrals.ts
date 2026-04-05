import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';

const REFERRAL_PREFIX = 'ICR';
const REFERRAL_SECRET = process.env.REFERRAL_CODE_SECRET ?? 'insurance-clarity-referrals';
const REFERRAL_TTL_SECONDS = 60 * 60 * 24 * 180;

export function getReferralCodeForUser(userId: string): string {
    const digest = crypto
        .createHash('sha256')
        .update(`${REFERRAL_SECRET}:${userId}`)
        .digest('hex')
        .slice(0, 8)
        .toUpperCase();

    return `${REFERRAL_PREFIX}${digest}`;
}

export function sanitizeReferralCode(input: string): string {
    return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export async function trackReferralVisit(code: string): Promise<void> {
    const normalized = sanitizeReferralCode(code);
    if (!normalized) return;

    const key = `referral:visits:${normalized}`;
    const value = await redisClient.incr(key);
    if (value === 1) {
        await redisClient.expire(key, REFERRAL_TTL_SECONDS);
    }
}

export async function getReferralVisitCount(code: string): Promise<number> {
    const normalized = sanitizeReferralCode(code);
    const raw = await redisClient.get<number | string>(`referral:visits:${normalized}`);
    return Number(raw ?? 0);
}

export async function getReferralStats(code: string): Promise<{
    visits: number;
    conversions: number;
}> {
    const normalized = sanitizeReferralCode(code);
    const [visits, conversions] = await Promise.all([
        getReferralVisitCount(normalized),
        prisma.lead.count({
            where: {
                source: 'REFERRAL',
                notes: `ref:${normalized}`,
            },
        }),
    ]);

    return { visits, conversions };
}

export async function recordReferralConversion(params: {
    code: string;
    name: string;
    email: string;
    phone?: string;
}): Promise<void> {
    const code = sanitizeReferralCode(params.code);
    if (!code) {
        throw new Error('Invalid referral code.');
    }

    const email = params.email.trim().toLowerCase();
    const existing = await prisma.lead.findFirst({
        where: {
            email,
            source: 'REFERRAL',
            notes: `ref:${code}`,
        },
        select: { id: true },
    });

    if (existing) {
        return;
    }

    await prisma.lead.create({
        data: {
            name: params.name.trim() || 'Referral User',
            email,
            phone: params.phone?.trim() || 'NA',
            insuranceType: 'REFERRAL',
            source: 'REFERRAL',
            notes: `ref:${code}`,
        },
    });
}
