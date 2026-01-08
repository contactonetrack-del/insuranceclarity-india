import { Metadata } from 'next'
import { Cookie, Settings, BarChart3, Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Cookie Policy | InsuranceClarity India',
    description: 'Cookie Policy for InsuranceClarity India - How we use cookies and how to manage your preferences.',
}

export default function CookiePolicyPage() {
    const lastUpdated = 'January 9, 2026'

    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-10 text-accent 
                                   text-sm rounded-full mb-4 font-medium">
                        <Cookie className="w-4 h-4" />
                        LEGAL
                    </div>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-4">
                        Cookie Policy
                    </h1>
                    <p className="text-theme-secondary">
                        Last updated: {lastUpdated}
                    </p>
                </header>

                <article className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    {/* What Are Cookies */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">1. What Are Cookies?</h2>
                        <p className="text-theme-secondary">
                            Cookies are small text files stored on your device when you visit websites. They help
                            websites remember your preferences and track usage patterns. Cookies cannot access
                            other data on your device or harm your computer.
                        </p>
                    </section>

                    {/* Cookies We Use */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">2. Cookies We Use</h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            Essential Cookies (No Consent Required)
                        </h3>
                        <p className="text-theme-secondary">These are necessary for the website to function:</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-default rounded-lg">
                                <thead className="bg-theme-surface">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-theme-primary">Cookie Name</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">Purpose</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">Lifespan</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">Consent</th>
                                    </tr>
                                </thead>
                                <tbody className="text-theme-secondary">
                                    <tr className="border-t border-default">
                                        <td className="px-4 py-2 font-mono text-xs">theme_preference</td>
                                        <td className="px-4 py-2">Remembers dark/light mode</td>
                                        <td className="px-4 py-2">1 year</td>
                                        <td className="px-4 py-2">No</td>
                                    </tr>
                                    <tr className="border-t border-default">
                                        <td className="px-4 py-2 font-mono text-xs">cookie_consent</td>
                                        <td className="px-4 py-2">Stores your cookie preferences</td>
                                        <td className="px-4 py-2">1 year</td>
                                        <td className="px-4 py-2">No (meta-cookie)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-lg font-medium text-theme-primary mt-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            Analytics Cookies (Requires Consent)
                        </h3>
                        <p className="text-theme-secondary">These help us understand how you use the website:</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-default rounded-lg">
                                <thead className="bg-theme-surface">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-theme-primary">Cookie Name</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">Provider</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">Purpose</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">Lifespan</th>
                                    </tr>
                                </thead>
                                <tbody className="text-theme-secondary">
                                    <tr className="border-t border-default">
                                        <td className="px-4 py-2 font-mono text-xs">_ga</td>
                                        <td className="px-4 py-2">Google Analytics 4</td>
                                        <td className="px-4 py-2">Tracks unique visitors</td>
                                        <td className="px-4 py-2">2 years</td>
                                    </tr>
                                    <tr className="border-t border-default">
                                        <td className="px-4 py-2 font-mono text-xs">_ga_*</td>
                                        <td className="px-4 py-2">Google Analytics 4</td>
                                        <td className="px-4 py-2">Tracks sessions and events</td>
                                        <td className="px-4 py-2">1 year</td>
                                    </tr>
                                    <tr className="border-t border-default">
                                        <td className="px-4 py-2 font-mono text-xs">_gat</td>
                                        <td className="px-4 py-2">Google Analytics 4</td>
                                        <td className="px-4 py-2">Throttles request rate</td>
                                        <td className="px-4 py-2">10 minutes</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-lg font-medium text-theme-primary mt-6">Advertising Cookies</h3>
                        <p className="text-theme-secondary">
                            <strong>We do NOT use advertising cookies.</strong> We do not display targeted ads or
                            use any advertising networks (Meta Pixel, Google Ads, etc.).
                        </p>
                    </section>

                    {/* Managing Preferences */}
                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-accent" />
                            3. Managing Your Cookie Preferences
                        </h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">Option 1: Cookie Banner (First Visit)</h3>
                        <p className="text-theme-secondary">
                            When you first visit, a cookie banner appears with options to:
                        </p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>&ldquo;Accept All&rdquo;</strong> — Accept all non-essential cookies</li>
                            <li><strong>&ldquo;Reject Non-Essential&rdquo;</strong> — Use essential cookies only</li>
                            <li><strong>&ldquo;Manage Preferences&rdquo;</strong> — Choose what cookies to accept</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">Option 2: Browser Settings</h3>
                        <p className="text-theme-secondary">You can control cookies in your browser:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>Chrome:</strong> Settings → Privacy & Security → Cookies</li>
                            <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                            <li><strong>Edge:</strong> Settings → Privacy & Security → Cookies</li>
                        </ul>
                        <p className="text-theme-muted text-sm mt-2">
                            Note: Disabling essential cookies may break website functionality.
                        </p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">Option 3: Opt-Out of Google Analytics</h3>
                        <p className="text-theme-secondary">
                            You can exclude yourself from GA4 tracking by installing the{' '}
                            <a
                                href="https://tools.google.com/dlpage/gaoptout"
                                target="_blank"
                                className="text-accent hover:underline"
                            >
                                Google Analytics Opt-out Browser Extension
                            </a>.
                        </p>
                    </section>

                    {/* Third-Party Disclosure */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">4. Third-Party Cookie Disclosure</h2>
                        <p className="text-theme-secondary">Our website does NOT embed:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Social media tracking pixels (Meta Pixel, Twitter Pixel, etc.)</li>
                            <li>Advertising networks (Google Ads, Facebook Ads, etc.)</li>
                            <li>CRM tracking (HubSpot, Marketo, etc.)</li>
                        </ul>
                        <p className="text-theme-secondary mt-4">
                            <strong>Only trackers present:</strong>
                        </p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Google Analytics 4 (analytics, with PII blocking enabled)</li>
                            <li>Sentry (error monitoring, with PII redaction)</li>
                        </ul>
                    </section>

                    {/* Data Protection */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">5. How We Protect Cookie Data</h2>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>PII Blocking:</strong> We block age, email, phone, and other sensitive fields from analytics cookies</li>
                            <li><strong>IP Anonymization:</strong> Last octet of IP address is removed before analytics processing</li>
                            <li><strong>Data Minimization:</strong> We only track non-identifying, aggregated usage patterns</li>
                            <li><strong>Secure Transmission:</strong> All cookies are transmitted over HTTPS only</li>
                        </ul>
                    </section>

                    {/* Changes */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">6. Changes to This Cookie Policy</h2>
                        <p className="text-theme-secondary">
                            We may update this policy to reflect new cookies or service providers. Changes will be
                            posted here with an updated &ldquo;Last modified&rdquo; date. If we add new analytics or tracking
                            cookies, we will request your consent again.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">7. Contact</h2>
                        <p className="text-theme-secondary">
                            For questions about our cookie use:
                        </p>
                        <p className="text-theme-secondary mt-2">
                            Email:{' '}
                            <a href="mailto:privacy@insuranceclarity.in" className="text-accent hover:underline">
                                privacy@insuranceclarity.in
                            </a>
                        </p>
                        <p className="text-theme-muted text-sm mt-2">Response time: 30 days</p>
                    </section>

                    {/* Related Links */}
                    <section className="flex gap-4 text-sm pt-4">
                        <Link href="/privacy" className="text-accent hover:underline">
                            Privacy Policy →
                        </Link>
                        <Link href="/terms" className="text-accent hover:underline">
                            Terms of Service →
                        </Link>
                    </section>
                </article>
            </div>
        </div>
    )
}
