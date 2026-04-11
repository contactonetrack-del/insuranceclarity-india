type OtpEntry = {
    otp: string;
    expiresAt: number;
};

declare global {
    // eslint-disable-next-line no-var
    var __icE2eOtpStore: Map<string, OtpEntry> | undefined;
}

function getStore(): Map<string, OtpEntry> {
    if (!globalThis.__icE2eOtpStore) {
        globalThis.__icE2eOtpStore = new Map<string, OtpEntry>();
    }

    return globalThis.__icE2eOtpStore;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function isE2eOtpHarnessEnabled(): boolean {
    return process.env.NODE_ENV !== 'production' && Boolean(process.env.E2E_TEST_SECRET?.trim());
}

export function setE2eOtp(email: string, otp: string, ttlMs = 5 * 60 * 1000): void {
    if (!isE2eOtpHarnessEnabled()) {
        return;
    }

    getStore().set(normalizeEmail(email), {
        otp,
        expiresAt: Date.now() + ttlMs,
    });
}

export function getE2eOtp(email: string, consume = true): string | null {
    if (!isE2eOtpHarnessEnabled()) {
        return null;
    }

    const key = normalizeEmail(email);
    const entry = getStore().get(key);
    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        getStore().delete(key);
        return null;
    }

    if (consume) {
        getStore().delete(key);
    }

    return entry.otp;
}

export function clearE2eOtp(email: string): void {
    getStore().delete(normalizeEmail(email));
}
