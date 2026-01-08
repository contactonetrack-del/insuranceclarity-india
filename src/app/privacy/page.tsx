import { Metadata } from 'next'
import { Shield, Mail, MapPin, Phone, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Privacy Policy | InsuranceClarity India',
    description: 'Privacy Policy for InsuranceClarity India - How we collect, use, and protect your information under DPDP Act 2023.',
}

export default function PrivacyPage() {
    const lastUpdated = 'January 9, 2026'
    const version = '2.0 (DPDP 2023-Compliant)'

    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-10 text-accent 
                                   text-sm rounded-full mb-4 font-medium">
                        <Shield className="w-4 h-4" />
                        LEGAL
                    </div>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-theme-secondary">
                        Last updated: {lastUpdated} | Version: {version}
                    </p>
                </header>

                <article className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">1. Introduction</h2>
                        <p className="text-theme-secondary">
                            InsuranceClarity India (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates insuranceclarity.in
                            in compliance with applicable Indian laws, including:
                        </p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Information Technology Act, 2000 & Rules</li>
                            <li><strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong></li>
                            <li>IT (Reasonable Security Practices and Procedures) Rules, 2011</li>
                            <li>Consumer Protection Act, 2019</li>
                        </ul>
                        <p className="text-theme-secondary">
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                            when you visit our website.
                        </p>
                    </section>

                    {/* Data Processing Principles */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">2. Data Processing Principles (DPDP Act §6)</h2>
                        <p className="text-theme-secondary">We process personal data based on these legal principles:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>Purpose Limitation:</strong> Data collected only for stated purposes (website operation, error monitoring, analytics)</li>
                            <li><strong>Data Minimization:</strong> We collect only what is strictly necessary</li>
                            <li><strong>Storage Limitation:</strong> Data retained per section 8(2) of DPDP Act</li>
                            <li><strong>Accuracy:</strong> We keep records current where in our control</li>
                            <li><strong>Integrity & Confidentiality:</strong> Technical safeguards via HTTPS, encryption, access controls</li>
                        </ul>
                    </section>

                    {/* Personal Data vs SPD */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">3. Personal Data vs. Sensitive Personal Data (SPD)</h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">3.1 Personal Data We Collect</h3>
                        <p className="text-theme-secondary">When you visit our website, we may automatically collect:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>IP address (anonymized - last octet removed)</li>
                            <li>Device and browser information (type, version, operating system)</li>
                            <li>Pages visited and time spent on site</li>
                            <li>Referring website or source</li>
                            <li>General geographic region (country/state level only)</li>
                            <li>Optional contact data (name, email) if you contact us voluntarily</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">3.2 Sensitive Personal Data (SPD) — WE ACTIVELY AVOID</h3>
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 my-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-700 dark:text-amber-300">
                                    <p className="font-medium">We have explicit policies NOT to collect:</p>
                                    <ul className="list-disc pl-4 mt-2 space-y-1">
                                        <li>Financial data (income, bank details, sum insured)</li>
                                        <li>Health data (medical history, age for underwriting purposes)</li>
                                        <li>Biometric data</li>
                                        <li>Caste, religion, political affiliation</li>
                                        <li>Aadhaar, PAN, or other government identifiers</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p className="text-theme-secondary">
                            <strong>Rationale:</strong> These are &ldquo;sensitive personal data&rdquo; per DPDP Act §3(36) and require
                            explicit consent under §8(3). We don&apos;t need them for educational content, so we don&apos;t collect them.
                            Calculator inputs (age, sum) are processed locally in your browser and are NOT transmitted to our servers.
                        </p>
                    </section>

                    {/* Lawful Basis */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">4. Lawful Basis for Processing (DPDP Act §4)</h2>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>Analytics (Google Analytics):</strong> Consent via cookie banner</li>
                            <li><strong>Error Monitoring (Sentry):</strong> Legitimate interest (website stability) — NO PII retained</li>
                            <li><strong>Website Functionality:</strong> Lawful processing without specific consent</li>
                            <li><strong>Grievance Redressal:</strong> Legal obligation</li>
                        </ul>
                    </section>

                    {/* Your Rights - DPDP */}
                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">5. Your Rights Under DPDP Act §18-20</h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">5.1 Right to Know (§18)</h3>
                        <p className="text-theme-secondary"><strong>Request:</strong> &ldquo;What personal data do you have about me?&rdquo;</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>Response time:</strong> 30 days</li>
                            <li><strong>Contact:</strong> privacy@insuranceclarity.in</li>
                            <li><strong>What we&apos;ll provide:</strong> Copy of data we process, purpose of processing, recipients (Google, Sentry), retention period</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">5.2 Right to Correction (§19)</h3>
                        <p className="text-theme-secondary"><strong>Request:</strong> &ldquo;My data is wrong, please fix it.&rdquo;</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>Correctable data:</strong> Name, email (if provided by you)</li>
                            <li><strong>Response time:</strong> 30 days</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">5.3 Right to Erasure (§20)</h3>
                        <p className="text-theme-secondary"><strong>Request:</strong> &ldquo;Delete all my data.&rdquo;</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>What we can delete:</strong> Contact details you provided voluntarily</li>
                            <li><strong>What we cannot delete:</strong> Analytics aggregates (already anonymized), legal compliance records</li>
                            <li><strong>Response time:</strong> 30 days</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">5.4 Right to Withdraw Consent</h3>
                        <p className="text-theme-secondary">You can withdraw consent for cookies at any time via:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Cookie banner → &ldquo;Manage Preferences&rdquo;</li>
                            <li>Browser settings to disable cookies</li>
                            <li><strong>Note:</strong> Some website features may not work without functional cookies</li>
                        </ul>
                    </section>

                    {/* Grievance Redressal */}
                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">6. Grievance Redressal (DPDP Act §21-22)</h2>

                        <h3 className="text-lg font-medium text-theme-primary">Tier 1: Internal Grievance Officer</h3>
                        <div className="bg-theme-surface rounded-lg p-4 my-4 space-y-2">
                            <p className="flex items-center gap-2 text-theme-secondary">
                                <strong>Name:</strong> Grievance Officer, One Track
                            </p>
                            <p className="flex items-center gap-2 text-theme-secondary">
                                <Mail className="w-4 h-4 text-accent" />
                                <a href="mailto:privacy@insuranceclarity.in" className="text-accent hover:underline">
                                    privacy@insuranceclarity.in
                                </a>
                            </p>
                            <p className="flex items-center gap-2 text-theme-secondary">
                                <Phone className="w-4 h-4 text-accent" />
                                +91-123-456-7890 (Mocked)
                            </p>
                            <p className="flex items-center gap-2 text-theme-secondary">
                                <MapPin className="w-4 h-4 text-accent" />
                                Plot No. 123, Tech Park, Bangalore, Karnataka - 560001 (Mocked)
                            </p>
                            <p className="text-theme-secondary"><strong>Response time:</strong> 30 days maximum</p>
                        </div>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">Tier 2: Appeal to Data Protection Board</h3>
                        <p className="text-theme-secondary">If we don&apos;t respond within 30 days, OR if you&apos;re dissatisfied with our response:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>Contact:</strong> Data Protection Board of India</li>
                            <li><strong>Website:</strong> <a href="https://www.dpdp.gov.in" target="_blank" className="text-accent hover:underline">https://www.dpdp.gov.in</a></li>
                            <li><strong>Filing fee:</strong> ₹100-500 (per Board rules)</li>
                            <li><strong>Time limit:</strong> Within 3 months of our response</li>
                        </ul>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">7. Data Retention Schedule (DPDP Act §8(2))</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-default rounded-lg">
                                <thead className="bg-theme-surface">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-theme-primary">Data Type</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">Retention Period</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="text-theme-secondary">
                                    <tr className="border-t border-default">
                                        <td className="px-4 py-2">Google Analytics data</td>
                                        <td className="px-4 py-2">14 months</td>
                                        <td className="px-4 py-2">GA4 default; anonymized</td>
                                    </tr>
                                    <tr className="border-t border-default">
                                        <td className="px-4 py-2">Sentry error logs</td>
                                        <td className="px-4 py-2">90 days</td>
                                        <td className="px-4 py-2">Error identification & fixing</td>
                                    </tr>
                                    <tr className="border-t border-default">
                                        <td className="px-4 py-2">Contact emails (if provided)</td>
                                        <td className="px-4 py-2">Until deletion requested</td>
                                        <td className="px-4 py-2">Grievance handling</td>
                                    </tr>
                                    <tr className="border-t border-default">
                                        <td className="px-4 py-2">Analytics cookies</td>
                                        <td className="px-4 py-2">2 years (or until deleted)</td>
                                        <td className="px-4 py-2">Analytics tracking</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Technical Safeguards */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">8. Technical Safeguards — Verified Configuration</h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">8.1 Google Analytics 4 — PII Blocking</h3>
                        <p className="text-theme-secondary">We have configured GA4 to BLOCK the following fields:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>age, user_age, sum_insured, sum_assured</li>
                            <li>phone, email, mobile, aadhaar, pan</li>
                            <li>dob, date_of_birth, name, full_name, address, income</li>
                        </ul>
                        <p className="text-theme-secondary mt-2">
                            <strong>Bucketing Applied:</strong> Age sent as ranges (18-24, 25-34, etc.),
                            Sum Insured as ranges (under_10L, 10L-25L, etc.) — NOT exact values.
                        </p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">8.2 Sentry — PII Redaction</h3>
                        <p className="text-theme-secondary">We have configured Sentry to:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Scrub all URL query parameters</li>
                            <li>Redact all request body data</li>
                            <li>Exclude breadcrumb data from forms</li>
                            <li>Block error messages containing SSN, phone, email patterns</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">8.3 IP Anonymization</h3>
                        <p className="text-theme-secondary">
                            We configure Google Analytics to anonymize the last octet of your IP address
                            (e.g., 192.168.1.123 → 192.168.1.0). This prevents identification of your exact location.
                        </p>
                    </section>

                    {/* Third-Party Services */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">9. Third-Party Services & Data Transfers</h2>
                        <p className="text-theme-secondary">We use the following third-party services:</p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">Google Analytics 4</h3>
                        <p className="text-theme-secondary">
                            Data transferred to Google&apos;s servers per Google&apos;s standard Data Processing Agreement.
                            Google acts as processor; we are controller. DPDP Act-compliant per Google&apos;s terms.
                            <br />
                            <Link href="https://policies.google.com/privacy" className="text-accent hover:underline" target="_blank">
                                Google Privacy Policy →
                            </Link>
                        </p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">Sentry (Error Monitoring)</h3>
                        <p className="text-theme-secondary">
                            Data transferred to Sentry&apos;s servers. No SPD transferred; only sanitized error logs.
                            Sentry acts as processor; we are controller.
                            <br />
                            <Link href="https://sentry.io/privacy/" className="text-accent hover:underline" target="_blank">
                                Sentry Privacy Policy →
                            </Link>
                        </p>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">10. Cookies</h2>
                        <p className="text-theme-secondary">
                            Our website uses cookies for analytics and functionality. For detailed information,
                            please see our <Link href="/cookies" className="text-accent hover:underline">Cookie Policy</Link>.
                        </p>
                    </section>

                    {/* Security */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">11. Security & Privacy Measures (IT Rules 2011)</h2>
                        <p className="text-theme-secondary">Technical safeguards we implement:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>Encryption:</strong> HTTPS (TLS 1.3+) for all data in transit</li>
                            <li><strong>PII Redaction:</strong> Sensitive fields blocked from GA4 and Sentry</li>
                            <li><strong>Access Control:</strong> Limited staff access to analytics dashboards</li>
                            <li><strong>Security Headers:</strong> X-Frame-Options: DENY, X-Content-Type-Options: nosniff, CSP configured</li>
                        </ul>
                        <h3 className="text-lg font-medium text-theme-primary mt-4">11.2 Do Not Track (DNT) Support</h3>
                        <p className="text-theme-secondary">
                            We respect your browser&apos;s &ldquo;Do Not Track&rdquo; (DNT) signal. If you have DNT enabled,
                            we will skip all analytics tracking for your session, regardless of your cookie banner choice.
                        </p>
                    </section>

                    {/* Changes */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">12. Changes to This Policy</h2>
                        <p className="text-theme-secondary">
                            We will notify you of material changes via updated &ldquo;Last modified&rdquo; date on this page
                            and banner notice on homepage for 30 days.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="glass rounded-xl p-6 mt-8">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">13. Contact & Data Protection Officer</h2>
                        <div className="space-y-2 text-theme-secondary">
                            <p><strong>Data Protection Officer / Grievance Officer:</strong></p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-accent" />
                                <a href="mailto:privacy@insuranceclarity.in" className="text-accent hover:underline">
                                    privacy@insuranceclarity.in
                                </a>
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-accent" />
                                Plot No. 123, Tech Park, Bangalore, Karnataka - 560001 (Mocked)
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-accent" />
                                +91-123-456-7890 (Mocked)
                            </p>
                        </div>
                        <p className="text-theme-muted text-sm mt-4">
                            <strong>Response guarantee:</strong> 30 days maximum for any grievance.
                        </p>
                    </section>

                    {/* Related Links */}
                    <section className="flex gap-4 text-sm pt-4">
                        <Link href="/terms" className="text-accent hover:underline">
                            Terms of Service →
                        </Link>
                        <Link href="/cookies" className="text-accent hover:underline">
                            Cookie Policy →
                        </Link>
                    </section>
                </article>
            </div>
        </div>
    )
}
