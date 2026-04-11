export interface CreatePaymentOrderInput {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
}

export interface PaymentOrder {
    id: string;
    status?: string;
    createdAtUnix?: number;
}

export interface PaymentOrderCollection {
    items: Array<{
        id: string;
        status: string;
    }>;
}

export interface CreateSubscriptionInput {
    planId: string;
    totalCount: number;
    quantity: number;
    notifyEmail: string;
    userId: string;
    plan: 'PRO' | 'ENTERPRISE';
    userName: string;
}

export interface SubscriptionRecord {
    id: string;
    planId: string;
    shortUrl: string;
    status: string;
}

export interface PaymentProvider {
    createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>;
    fetchOrder(orderId: string): Promise<PaymentOrder>;
    fetchOrderPayments(orderId: string): Promise<PaymentOrderCollection>;
    createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionRecord>;
    cancelSubscription(subscriptionId: string, atPeriodEnd: boolean): Promise<void>;
}
