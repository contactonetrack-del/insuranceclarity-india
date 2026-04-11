import { subscriptionRepository } from '@/repositories/subscription.repository';

export async function findSubscriptionByRazorpayId(razorpaySubscriptionId: string) {
    return subscriptionRepository.findByRazorpaySubscriptionId(razorpaySubscriptionId);
}

export async function cancelSubscriptionByRazorpayId(razorpaySubscriptionId: string) {
    return subscriptionRepository.cancelByRazorpaySubscriptionId(razorpaySubscriptionId);
}

export async function completePauseOrExpireAndDowngrade(params: {
    razorpaySubscriptionId: string;
    status: 'COMPLETED' | 'PAUSED' | 'EXPIRED';
    userId: string;
}) {
    return subscriptionRepository.completePauseOrExpireAndDowngrade(params);
}
