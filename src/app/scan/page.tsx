import type { Metadata } from 'next';
import { DropZone } from '@/components/upload/DropZone';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
    title: 'Scan Your Insurance Policy — Insurance Clarity',
    description: 'Upload your insurance policy PDF and get an AI-powered analysis of hidden clauses, claim risks, exclusions, and a transparent score in seconds.',
    openGraph: {
        title: 'Free AI Insurance Policy Scanner',
        description: 'Discover hidden risks in your policy before it\'s too late.',
    },
};

export default async function ScanPage() {
    const t = await getTranslations('scan');

    const policyTypes = [
        { icon: '🏥', key: 'health' as const },
        { icon: '🚗', key: 'motor' as const },
        { icon: '🛡️', key: 'termLife' as const },
        { icon: '🏠', key: 'home' as const },
        { icon: '✈️', key: 'travel' as const },
        { icon: '💼', key: 'business' as const },
    ];

    return (
        <main className="scan-page" id="main-content">
            <div className="scan-page__container">

                {/* ── Header ── */}
                <header className="scan-page__header">
                    <div className="scan-page__badge">
                        <span aria-hidden>🤖</span> {t('badge')}
                    </div>
                    <h1 className="scan-page__title">
                        {t('title')}
                    </h1>
                    <p className="scan-page__subtitle">
                        {t('subtitle')}
                    </p>
                </header>

                {/* ── Upload Zone ── */}
                <section aria-label={t('upload.title')} className="scan-page__upload-section">
                    <DropZone />
                </section>

                {/* ── Trust Signals ── */}
                <section className="scan-page__trust" aria-label="Security and privacy information">
                    <div className="trust-grid">
                        <div className="trust-item">
                            <span className="trust-item__icon" aria-hidden>🔒</span>
                            <div>
                                <strong>{t('trust.encrypted')}</strong>
                                <p>{t('trust.encryptedDesc')}</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <span className="trust-item__icon" aria-hidden>🗑️</span>
                            <div>
                                <strong>{t('trust.autoDeleted')}</strong>
                                <p>{t('trust.autoDeletedDesc')}</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <span className="trust-item__icon" aria-hidden>⚡</span>
                            <div>
                                <strong>{t('trust.fastResults')}</strong>
                                <p>{t('trust.fastResultsDesc')}</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <span className="trust-item__icon" aria-hidden>🇮🇳</span>
                            <div>
                                <strong>{t('trust.indiaFirst')}</strong>
                                <p>{t('trust.indiaFirstDesc')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Sample Policy Types ── */}
                <section className="scan-page__examples" aria-label={t('policyTypes.heading')}>
                    <h2 className="scan-page__examples-heading">{t('policyTypes.heading')}</h2>
                    <ul className="policy-type-list" role="list">
                        {policyTypes.map((p) => (
                            <li key={p.key} className="policy-type-pill">
                                <span aria-hidden>{p.icon}</span> {t(`policyTypes.${p.key}`)}
                            </li>
                        ))}
                    </ul>
                </section>

            </div>
        </main>
    );
}
