/**
 * Email Service - powered by Resend SDK
 * Updated for production reliability with the official SDK.
 */

import { Resend } from 'resend';
import { createSafeUserContext, logger } from '@/lib/logger';
import { isEmailSuppressed } from '@/lib/email/suppression';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
        return null;
    }

    if (!resendClient) {
        resendClient = new Resend(apiKey);
    }

    return resendClient;
}

type SupportedLocale = 'en' | 'hi';

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

interface ScanCompletePayload {
    userName: string;
    scanId: string;
    fileName: string;
    score: number;
    locale?: SupportedLocale;
}

interface WelcomeEmailPayload {
    userName: string;
    locale?: SupportedLocale;
}

interface NewsletterPayload {
    email: string;
    subject: string;
    html: string;
}

interface ContactAlertPayload {
    name: string;
    email: string;
    subject: string;
    message: string;
}

interface ScanLimitNudgePayload {
    userName: string;
    plan: string;
    monthlyLimit?: number;
    locale?: SupportedLocale;
}

interface OtpEmailPayload {
    otp: string;
    locale?: SupportedLocale;
}

function resolveLocale(locale?: string): SupportedLocale {
    return locale?.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    margin: 0; padding: 0;
`;

const cardStyle = `
    max-width: 580px; margin: 40px auto; background: #1e293b;
    border-radius: 16px; border: 1px solid #334155; overflow: hidden;
`;

const headerStyle = `
    background: linear-gradient(135deg, #1d4ed8, #7c3aed);
    padding: 32px 40px; text-align: center;
`;

const bodyStyle = `padding: 32px 40px;`;

const footerStyle = `
    padding: 24px 40px; border-top: 1px solid #334155;
    text-align: center; font-size: 12px; color: #64748b;
`;

function getScoreColor(score: number): string {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
}

function getScoreLabel(score: number, locale: SupportedLocale): string {
    if (locale === 'hi') {
        if (score >= 70) return 'अच्छी स्पष्टता';
        if (score >= 40) return 'मध्यम जोखिम';
        return 'उच्च जोखिम';
    }

    if (score >= 70) return 'Good Clarity';
    if (score >= 40) return 'Moderate Risk';
    return 'High Risk';
}

/**
 * Core send function using Resend SDK
 */
async function sendEmail(payload: EmailPayload): Promise<boolean> {
    const safeRecipient = createSafeUserContext({ email: payload.to });
    const suppressed = await isEmailSuppressed(payload.to);
    if (suppressed) {
        logger.info({
            action: 'email.suppressed.skip',
            ...safeRecipient,
            subject: payload.subject,
        });
        return false;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? 'Insurance Clarity <noreply@insuranceclarity.in>';

    if (!apiKey) {
        if (process.env.NODE_ENV !== 'production') {
            logger.info({
                action: 'email.dev.skip',
                ...safeRecipient,
                subject: payload.subject,
            });
        } else {
            logger.warn({ action: 'email.resend.not.configured', subject: payload.subject });
        }
        return false;
    }

    const resend = getResendClient();
    if (!resend) {
        logger.warn({ action: 'email.resend.client.unavailable', subject: payload.subject });
        return false;
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to: [payload.to],
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            tags: [
                { name: 'category', value: payload.subject.includes('Login') ? 'auth' : 'transactional' }
            ]
        });

        if (error) {
            logger.error({ action: 'email.resend.error', error });
            return false;
        }

        logger.info({ action: 'email.sent', id: data?.id, ...safeRecipient, subject: payload.subject });
        return true;
    } catch (error) {
        logger.error({
            action: 'email.send.failed',
            ...safeRecipient,
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

export async function sendScanCompleteEmail(
    to: string,
    payload: ScanCompletePayload,
): Promise<boolean> {
    const locale = resolveLocale(payload.locale);
    const safeUserName = escapeHtml(payload.userName);
    const safeFileName = escapeHtml(payload.fileName);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://insuranceclarity.in';
    const resultUrl = `${appUrl}/scan/result/${payload.scanId}`;
    const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(to)}`;
    const scoreColor = getScoreColor(payload.score);
    const scoreLabel = getScoreLabel(payload.score, locale);

    const copy = locale === 'hi'
        ? {
            preheader: 'INSURANCE CLARITY',
            title: 'आपकी पॉलिसी रिपोर्ट तैयार है',
            greeting: `नमस्ते ${safeUserName},`,
            intro: 'हमने आपकी बीमा पॉलिसी का विश्लेषण पूरा कर लिया है।',
            scoreCaption: 'क्लैरिटी स्कोर (100 में से)',
            document: 'दस्तावेज़',
            includes: 'आपकी पूरी रिपोर्ट में शामिल है:',
            points: [
                'सभी छिपे हुए जोखिम और एक्सक्लूजन क्लॉज',
                'कवरेज बेहतर करने के लिए स्पष्ट सुझाव',
                'समान पॉलिसियों के साथ विशेषज्ञ तुलना',
            ],
            cta: 'पूरी रिपोर्ट देखें →',
            footer: 'फ्री प्रीव्यू में केवल टॉप 3 जोखिम दिखते हैं।',
            unlock: 'पूरा रिपोर्ट सिर्फ ₹199 में अनलॉक करें।',
            unsubscribe: 'अनसब्सक्राइब',
            subject: `आपकी पॉलिसी का स्कोर ${payload.score}/100 - ${scoreLabel} | Insurance Clarity`,
            text: `नमस्ते ${payload.userName}, आपकी पॉलिसी रिपोर्ट तैयार है। स्कोर: ${payload.score}/100 (${scoreLabel}). रिपोर्ट देखें: ${resultUrl}`,
        }
        : {
            preheader: 'INSURANCE CLARITY',
            title: 'Your Policy Analysis is Ready',
            greeting: `Hi ${safeUserName},`,
            intro: "We've finished analyzing your insurance policy. Here's what we found:",
            scoreCaption: 'Clarity Score out of 100',
            document: 'Document',
            includes: 'Your full report includes:',
            points: [
                'All hidden risks and exclusion clauses',
                'Actionable suggestions to improve your coverage',
                'Expert comparison with similar policies',
            ],
            cta: 'View Full Report →',
            footer: 'The free preview shows your top 3 risks only.',
            unlock: 'Unlock the complete report for just ₹199.',
            unsubscribe: 'Unsubscribe',
            subject: `Your policy scored ${payload.score}/100 - ${scoreLabel} | Insurance Clarity`,
            text: `Hi ${payload.userName}, your policy analysis is ready. Score: ${payload.score}/100 (${scoreLabel}). View your report: ${resultUrl}`,
        };

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="${baseStyle}">
<div style="${cardStyle}">
    <div style="${headerStyle}">
        <div style="font-size:14px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:8px;">${copy.preheader}</div>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">${copy.title}</h1>
    </div>
    <div style="${bodyStyle}">
        <p style="margin-top:0;color:#94a3b8;">${copy.greeting}</p>
        <p style="color:#e2e8f0;">${copy.intro}</p>

        <div style="background:#0f172a;border-radius:12px;padding:24px;margin:24px 0;text-align:center;border:1px solid #334155;">
            <div style="font-size:48px;font-weight:800;color:${scoreColor};">${payload.score}</div>
            <div style="font-size:14px;color:#94a3b8;margin-top:4px;">${copy.scoreCaption}</div>
            <div style="display:inline-block;background:${scoreColor}20;color:${scoreColor};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;margin-top:8px;">${scoreLabel}</div>
        </div>

        <p style="color:#94a3b8;font-size:14px;"><strong style="color:#e2e8f0;">${copy.document}:</strong> ${safeFileName}</p>

        <p style="color:#e2e8f0;">${copy.includes}</p>
        <ul style="color:#94a3b8;line-height:1.8;">
            <li>${copy.points[0]}</li>
            <li>${copy.points[1]}</li>
            <li>${copy.points[2]}</li>
        </ul>

        <div style="text-align:center;margin:32px 0;">
            <a href="${resultUrl}" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#ffffff;font-weight:700;font-size:16px;padding:16px 32px;border-radius:12px;text-decoration:none;">
                ${copy.cta}
            </a>
        </div>

        <p style="color:#64748b;font-size:13px;text-align:center;">
            ${copy.footer}<br>${copy.unlock}
        </p>
    </div>
    <div style="${footerStyle}">
        <p style="margin:0;">Insurance Clarity · AI-Powered Policy Analysis</p>
        <p style="margin:4px 0 0;"><a href="${unsubscribeUrl}" style="color:#475569;text-decoration:underline;">${copy.unsubscribe}</a></p>
    </div>
</div>
</body>
</html>`;

    return sendEmail({
        to,
        subject: copy.subject,
        html,
        text: copy.text,
    });
}

export async function sendWelcomeEmail(
    to: string,
    payload: WelcomeEmailPayload,
): Promise<boolean> {
    const locale = resolveLocale(payload.locale);
    const safeUserName = escapeHtml(payload.userName);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://insuranceclarity.in';

    const copy = locale === 'hi'
        ? {
            title: 'Insurance Clarity में आपका स्वागत है',
            greeting: `नमस्ते ${safeUserName},`,
            intro: 'अब आपके पास भारत का स्मार्ट AI-आधारित बीमा विश्लेषक है।',
            points: [
                'अपनी पॉलिसी PDF स्कैन करें',
                'छिपे हुए एक्सक्लूजन समझें',
                'AI से कवरेज सुधार सुझाव लें',
                'पॉलिसियों की तुलना करें',
            ],
            cta: 'पहली पॉलिसी स्कैन करें →',
            footer: 'फ्री प्लान में प्रति माह 2 स्कैन शामिल हैं।',
            subject: 'Insurance Clarity में आपका स्वागत है - अपनी पॉलिसी स्कैन करें',
            text: `नमस्ते ${payload.userName}, Insurance Clarity में आपका स्वागत है! स्कैन शुरू करें: ${appUrl}/scan`,
        }
        : {
            title: 'Welcome to Insurance Clarity',
            greeting: `Hi ${safeUserName},`,
            intro: "You now have access to India's smartest AI-powered insurance analyzer.",
            points: [
                'Scan your policy PDF',
                'Discover hidden exclusions',
                'Get AI recommendations',
                'Compare policies side-by-side',
            ],
            cta: 'Scan Your First Policy →',
            footer: 'Free plan includes 2 scans per month. No credit card required.',
            subject: 'Welcome to Insurance Clarity - Start Scanning Your Policy',
            text: `Hi ${payload.userName}, welcome to Insurance Clarity! Start scanning at ${appUrl}/scan`,
        };

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${baseStyle}">
<div style="${cardStyle}">
    <div style="${headerStyle}">
        <div style="font-size:14px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:8px;">INSURANCE CLARITY</div>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">${copy.title}</h1>
    </div>
    <div style="${bodyStyle}">
        <p style="margin-top:0;color:#94a3b8;">${copy.greeting}</p>
        <p style="color:#e2e8f0;">${copy.intro}</p>
        <ul style="color:#94a3b8;line-height:2;">
            <li>${copy.points[0]}</li>
            <li>${copy.points[1]}</li>
            <li>${copy.points[2]}</li>
            <li>${copy.points[3]}</li>
        </ul>
        <div style="text-align:center;margin:32px 0;">
            <a href="${appUrl}/scan" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#ffffff;font-weight:700;font-size:16px;padding:16px 32px;border-radius:12px;text-decoration:none;">
                ${copy.cta}
            </a>
        </div>
        <p style="color:#64748b;font-size:13px;text-align:center;">${copy.footer}</p>
    </div>
    <div style="${footerStyle}">
        <p style="margin:0;">Insurance Clarity · AI-Powered Policy Analysis · India</p>
    </div>
</div>
</body>
</html>`;

    return sendEmail({
        to,
        subject: copy.subject,
        html,
        text: copy.text,
    });
}

export async function sendScanLimitNudgeEmail(
    to: string,
    payload: ScanLimitNudgePayload,
): Promise<boolean> {
    const locale = resolveLocale(payload.locale);
    const safeUserName = escapeHtml(payload.userName);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://insuranceclarity.in';
    const limitText = payload.monthlyLimit
        ? `${payload.monthlyLimit}`
        : (payload.plan.toUpperCase() === 'ENTERPRISE' ? 'Unlimited' : 'your current');

    const copy = locale === 'hi'
        ? {
            title: 'आपने अपना स्कैन लिमिट पूरा कर लिया है',
            intro: `नमस्ते ${safeUserName}, इस महीने के लिए आपके ${limitText} स्कैन पूरे हो चुके हैं।`,
            body: 'अपनी अगली पॉलिसी तुरंत स्कैन करने के लिए प्लान अपग्रेड करें और पूरी रिपोर्ट अनलॉक रखें।',
            cta: 'प्लान अपग्रेड करें →',
            subject: 'स्कैन लिमिट पूरी हुई - Insurance Clarity',
            text: `नमस्ते ${payload.userName}, आपका स्कैन लिमिट पूरा हो गया है। अपग्रेड करें: ${appUrl}/pricing`,
        }
        : {
            title: 'You have reached your scan limit',
            intro: `Hi ${safeUserName}, you have used your ${limitText} scans for this month.`,
            body: 'Upgrade your plan to keep scanning policies and unlocking full reports instantly.',
            cta: 'Upgrade Your Plan →',
            subject: 'Scan limit reached - Insurance Clarity',
            text: `Hi ${payload.userName}, you have reached your scan limit. Upgrade here: ${appUrl}/pricing`,
        };

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="${baseStyle}">
<div style="${cardStyle}">
    <div style="${headerStyle}">
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">${copy.title}</h1>
    </div>
    <div style="${bodyStyle}">
        <p style="margin-top:0;color:#94a3b8;">${copy.intro}</p>
        <p style="color:#e2e8f0;">${copy.body}</p>
        <div style="text-align:center;margin:32px 0;">
            <a href="${appUrl}/pricing" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#ffffff;font-weight:700;font-size:16px;padding:16px 32px;border-radius:12px;text-decoration:none;">
                ${copy.cta}
            </a>
        </div>
    </div>
    <div style="${footerStyle}">
        <p style="margin:0;">Insurance Clarity · AI-Powered Policy Analysis</p>
    </div>
</div>
</body>
</html>`;

    return sendEmail({
        to,
        subject: copy.subject,
        html,
        text: copy.text,
    });
}

export async function sendNewsletterEmail(payload: NewsletterPayload): Promise<boolean> {
    return sendEmail({
        to: payload.email,
        subject: payload.subject,
        html: payload.html,
    });
}

export async function sendContactAlert(payload: ContactAlertPayload): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0] ?? process.env.EMAIL_FROM ?? '';
    if (!adminEmail) return false;

    const safeName = escapeHtml(payload.name);
    const safeEmail = escapeHtml(payload.email);
    const safeSubject = escapeHtml(payload.subject);
    const safeMessage = escapeHtml(payload.message);

    const html = `
<div style="${baseStyle}">
<div style="${cardStyle}">
<div style="${headerStyle}"><h1 style="margin:0;font-size:20px;color:#fff;">New Contact Form Submission</h1></div>
<div style="${bodyStyle}">
    <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
    <p><strong>Subject:</strong> ${safeSubject}</p>
    <p><strong>Message:</strong></p>
    <div style="background:#0f172a;padding:16px;border-radius:8px;color:#94a3b8;">${safeMessage}</div>
</div>
</div>
</div>`;

    return sendEmail({
        to: adminEmail,
        subject: `[Contact] ${payload.subject} - from ${payload.name}`,
        html,
    });
}

export async function sendOtpEmail(to: string, payload: OtpEmailPayload): Promise<boolean> {
    const locale = resolveLocale(payload.locale);
    
    const copy = locale === 'hi' ? {
        title: 'आपका वेरिफिकेशन कोड',
        intro: 'Insurance Clarity में लॉगिन करने के लिए कृपया नीचे दिए गए 6-अंकों वाले कोड का उपयोग करें:',
        warning: 'यह कोड 5 मिनट में समाप्त हो जाएगा। यदि आपने इसका अनुरोध नहीं किया है, तो इस ईमेल को अनदेखा करें।',
        subject: `${payload.otp} - Insurance Clarity लॉगिन कोड`
    } : {
        title: 'Your Verification Code',
        intro: 'Please use the 6-digit code below to sign in to Insurance Clarity:',
        warning: 'This code will expire in 5 minutes. If you did not request this, please ignore this email.',
        subject: `${payload.otp} - Insurance Clarity Login Code`
    };

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="${baseStyle}">
<div style="${cardStyle}">
    <div style="${headerStyle}">
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">${copy.title}</h1>
    </div>
    <div style="${bodyStyle}">
        <p style="margin-top:0;color:#94a3b8;">${copy.intro}</p>
        
        <div style="background:#0f172a;border-radius:12px;padding:24px;margin:24px 0;text-align:center;border:1px solid #334155;">
            <div style="font-size:36px;font-weight:800;color:#e2e8f0;letter-spacing:4px;">${payload.otp}</div>
        </div>
        
        <p style="color:#64748b;font-size:13px;text-align:center;">${copy.warning}</p>
    </div>
    <div style="${footerStyle}">
        <p style="margin:0;">Insurance Clarity · AI-Powered Policy Analysis</p>
    </div>
</div>
</body>
</html>`;

    return sendEmail({
        to,
        subject: copy.subject,
        html,
        text: `${copy.intro} \n\n ${payload.otp} \n\n ${copy.warning}`,
    });
}
