/**
 * PII (Personally Identifiable Information) Masking Utilities
 * 
 * For Insurance platforms, never log full PII.
 * Use these utilities in logs, analytics, and error reports.
 */

/**
 * Masks an Aadhaar number, revealing only first 2 and last 4 digits.
 * @example maskAadhaar('123456789012') => '12XXXXXX9012'
 */
export function maskAadhaar(aadhaar: string): string {
    if (!aadhaar || aadhaar.length < 12) return 'INVALID_AADHAAR';
    const cleaned = aadhaar.replace(/\D/g, '');
    return cleaned.slice(0, 2) + 'XXXXXX' + cleaned.slice(-4);
}

/**
 * Masks a PAN number, revealing only last 4 characters.
 * @example maskPAN('ABCDE1234F') => 'XXXXX234F'
 */
export function maskPAN(pan: string): string {
    if (!pan || pan.length !== 10) return 'INVALID_PAN';
    return 'XXXXX' + pan.slice(-4);
}

/**
 * Masks a policy number, revealing only last 4 characters.
 * @example maskPolicyNo('POL-2024-123456') => 'XX-XXXX-3456'
 */
export function maskPolicyNo(policyNo: string): string {
    if (!policyNo || policyNo.length < 4) return 'INVALID_POLICY';
    return 'XX-XXXX-' + policyNo.slice(-4);
}

/**
 * Masks an email address, keeping first 2 chars and domain.
 * @example maskEmail('john.doe@example.com') => 'jo***@example.com'
 */
export function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return 'INVALID_EMAIL';
    const [local, domain] = email.split('@');
    const maskedLocal = local.slice(0, 2) + '***';
    return `${maskedLocal}@${domain}`;
}

/**
 * Masks a phone number, revealing only last 4 digits.
 * @example maskPhone('+919876543210') => '+91****3210'
 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 10) return 'INVALID_PHONE';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return '******' + cleaned.slice(-4);
    }
    // International format
    return '+' + cleaned.slice(0, 2) + '****' + cleaned.slice(-4);
}
