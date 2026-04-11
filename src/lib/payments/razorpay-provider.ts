import Razorpay from 'razorpay';
import { getRazorpayCredentials } from '@/lib/security/env';
import type {
    CreatePaymentOrderInput,
    CreateSubscriptionInput,
    PaymentOrder,
    PaymentOrderCollection,
    PaymentProvider,
    SubscriptionRecord,
} from './types';

interface RazorpayOrderResponse {
    id: string;
    status?: string;
    created_at?: number;
}

interface RazorpaySubscriptionResponse {
    id: string;
    plan_id: string;
    short_url: string;
    status: string;
}

function getBasicAuthHeader(): string {
    const { keyId, keySecret } = getRazorpayCredentials();
    return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

export class RazorpayPaymentProvider implements PaymentProvider {
    private readonly client: Razorpay;

    constructor() {
        const { keyId, keySecret } = getRazorpayCredentials();
        this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }

    async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
        const order = await this.client.orders.create({
            amount: input.amount,
            currency: input.currency,
            receipt: input.receipt,
            notes: input.notes,
        });

        return {
            id: order.id,
            status: order.status,
            createdAtUnix: order.created_at,
        };
    }

    async fetchOrder(orderId: string): Promise<PaymentOrder> {
        const order = await this.client.orders.fetch(orderId) as RazorpayOrderResponse;
        return {
            id: order.id,
            status: order.status,
            createdAtUnix: order.created_at,
        };
    }

    async fetchOrderPayments(orderId: string): Promise<PaymentOrderCollection> {
        const payments = await this.client.orders.fetchPayments(orderId);
        return {
            items: payments.items.map((item) => ({
                id: item.id,
                status: item.status,
            })),
        };
    }

    async createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionRecord> {
        const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': getBasicAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan_id: input.planId,
                total_count: input.totalCount,
                quantity: input.quantity,
                notify_info: {
                    notify_phone: '',
                    notify_email: input.notifyEmail,
                },
                notes: {
                    userId: input.userId,
                    plan: input.plan,
                    userName: input.userName,
                },
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ description: response.statusText })) as { description?: string };
            throw new Error(`Razorpay API error: ${err.description ?? response.statusText}`);
        }

        const subscription = await response.json() as RazorpaySubscriptionResponse;
        return {
            id: subscription.id,
            planId: subscription.plan_id,
            shortUrl: subscription.short_url,
            status: subscription.status,
        };
    }

    async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean): Promise<void> {
        const response = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': getBasicAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cancel_at_cycle_end: atPeriodEnd ? 1 : 0,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ description: response.statusText })) as { description?: string };
            throw new Error(`Razorpay API error: ${err.description ?? response.statusText}`);
        }
    }
}
