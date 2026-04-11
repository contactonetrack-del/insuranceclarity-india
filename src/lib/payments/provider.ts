import { RazorpayPaymentProvider } from './razorpay-provider';
import type { PaymentProvider } from './types';

let provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
    if (!provider) {
        provider = new RazorpayPaymentProvider();
    }
    return provider;
}

export function resetPaymentProviderForTests(): void {
    provider = null;
}
