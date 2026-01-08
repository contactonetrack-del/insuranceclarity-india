import { Metadata } from 'next'
import { FileText, AlertTriangle, Mail, Phone, MapPin, Scale } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Terms of Service | InsuranceClarity India',
    description: 'Terms of Service for InsuranceClarity India - Please read these terms carefully before using our website.',
}

export default function TermsPage() {
    const lastUpdated = 'January 9, 2026'
    const version = '2.0 (Consumer Protection Act Compliant)'

    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-10 text-accent 
                                   text-sm rounded-full mb-4 font-medium">
                        <FileText className="w-4 h-4" />
                        LEGAL
                    </div>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-theme-secondary">
                        Last updated: {lastUpdated} | Version: {version}
                    </p>
                </header>

                {/* IRDAI Regulatory Notice - Prominent */}
                <section className="rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-amber-700 dark:text-amber-300">
                            <h2 className="font-bold text-lg mb-3">REGULATORY NOTICE — IRDAI COMPLIANCE</h2>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold mb-2">What InsuranceClarity IS:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Educational content platform</li>
                                        <li>Generic comparison tool (unranked, non-advisory)</li>
                                        <li>Information aggregator from IRDAI & insurer websites</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-semibold mb-2">What InsuranceClarity IS NOT:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>IRDAI-licensed agent, broker, or intermediary</li>
                                        <li>Insurance advisor or recommender</li>
                                        <li>Policy distribution or sales platform</li>
                                        <li>Entity earning commissions from insurers</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-amber-500/30">
                                <p className="font-semibold mb-2">We do NOT:</p>
                                <ul className="list-disc pl-4 space-y-1 text-sm">
                                    <li>Advise you on which policy to buy</li>
                                    <li>Rank policies as &ldquo;best&rdquo; or &ldquo;worst&rdquo;</li>
                                    <li>Solicit insurance applications</li>
                                    <li>Collect your data for underwriting</li>
                                    <li>Forward your data to insurers</li>
                                    <li>Earn any financial benefit from your insurance purchases</li>
                                </ul>
                            </div>

                            <div className="mt-4 pt-4 border-t border-amber-500/30 text-sm">
                                <p className="font-semibold">You MUST:</p>
                                <ol className="list-decimal pl-4 space-y-1 mt-2">
                                    <li>Read the <strong>full policy document</strong> from the insurer</li>
                                    <li>Verify <strong>exclusions and terms</strong> directly with the insurer</li>
                                    <li>Consult an <strong>IRDAI-licensed advisor</strong> before buying</li>
                                    <li>Confirm <strong>eligibility</strong> with insurer</li>
                                    <li>Ask the insurer about <strong>current premiums</strong> (ours are indicative only)</li>
                                </ol>
                            </div>

                            <div className="mt-4 pt-4 border-t border-amber-500/30 text-sm">
                                <p><strong>IRDAI Complaints:</strong> If you believe we have violated IRDAI regulations:</p>
                                <ul className="list-disc pl-4 mt-1">
                                    <li>Website: <a href="https://www.irdai.gov.in" target="_blank" className="underline">www.irdai.gov.in</a></li>
                                    <li>Email: complaints@irdai.gov.in</li>
                                    <li>Phone: 1800-425-4477 (toll-free)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <article className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    {/* Acceptance */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">1. Acceptance of Terms</h2>
                        <p className="text-theme-secondary">
                            By accessing or using InsuranceClarity India (&ldquo;the Website&rdquo;), you agree to be bound
                            by these Terms of Service. If you do not agree to these terms, please do not use the Website.
                        </p>
                    </section>

                    {/* Nature of Service */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">2. Nature of Service</h2>
                        <p className="text-theme-secondary">InsuranceClarity provides:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Educational content about insurance products in India</li>
                            <li>Informational tools such as premium calculators and policy comparisons</li>
                            <li>General information about insurance claims and exclusions</li>
                        </ul>
                        <p className="text-theme-secondary mt-4 font-medium">WE DO NOT PROVIDE:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Financial, insurance, legal, or tax advice</li>
                            <li>Insurance sales, solicitation, or intermediation services</li>
                            <li>Personalized policy recommendations</li>
                            <li>Claims processing or policy servicing</li>
                        </ul>
                    </section>

                    {/* No Professional Advice */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">3. No Professional Advice</h2>
                        <p className="text-theme-secondary">
                            All content on this Website is for general informational and educational purposes only.
                            It does not constitute professional financial, insurance, legal, or tax advice.
                        </p>
                        <p className="text-theme-secondary">Before making any insurance decisions, you should:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Consult with a qualified, IRDAI-licensed insurance advisor</li>
                            <li>Read the complete policy documents from the insurer</li>
                            <li>Verify all terms, conditions, and exclusions directly with the insurer</li>
                            <li>Consider your specific circumstances and needs</li>
                        </ul>
                    </section>

                    {/* Accuracy of Information */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">4. Accuracy of Information</h2>
                        <p className="text-theme-secondary">We strive to provide accurate and up-to-date information. However:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Insurance products, terms, and premiums change frequently</li>
                            <li>Information may not reflect the latest insurer offerings</li>
                            <li>Calculator estimates are indicative only and may not match actual premiums</li>
                            <li>Comparison data is based on publicly available information and may be incomplete</li>
                        </ul>
                        <p className="text-theme-secondary mt-2">
                            We do not guarantee the accuracy, completeness, or timeliness of any information on this Website.
                        </p>
                    </section>

                    {/* Limitation of Liability - REVISED */}
                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">5. Limitation of Liability (Revised)</h2>

                        <h3 className="text-lg font-medium text-theme-primary">5.1 What We Are NOT Liable For</h3>
                        <p className="text-theme-secondary">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, we shall not be liable for:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>Indirect, Incidental, or Consequential Damages:</strong> Lost profits, lost opportunity, emotional distress</li>
                            <li><strong>Direct Damages From Your Use:</strong> Insurance purchasing decisions, policy claims denied, premium changes, coverage gaps</li>
                            <li><strong>Third-Party Conduct:</strong> Actions of insurers, payment gateways, or other service providers</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">5.2 What We ARE Potentially Liable For</h3>
                        <p className="text-theme-secondary">You may have a claim against us <strong>only if you prove:</strong></p>
                        <ol className="list-decimal pl-6 text-theme-secondary space-y-1">
                            <li>We made a <strong>materially false statement</strong> on our website</li>
                            <li>You <strong>reasonably relied</strong> on that statement</li>
                            <li>You suffered <strong>direct financial loss</strong></li>
                            <li>Our false statement <strong>directly caused</strong> the loss</li>
                        </ol>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">5.3 Cap on Liability</h3>
                        <p className="text-theme-secondary">Maximum liability per claim:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>The GREATER of: <strong>₹50,000</strong> (baseline cap) OR <strong>actual damages proven</strong></li>
                            <li><strong>Liability is UNLIMITED if:</strong> We commit gross negligence, willful misconduct, or breach data protection law (DPDP Act)</li>
                        </ul>
                    </section>

                    {/* Intellectual Property */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">6. Intellectual Property</h2>
                        <p className="text-theme-secondary">
                            All content on this Website is the property of InsuranceClarity or its licensors and is protected
                            by intellectual property laws. Insurer names, logos, and trademarks belong to their respective
                            owners and are used solely for identification and educational purposes.
                        </p>
                    </section>

                    {/* Prohibited Uses */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">7. Prohibited Uses</h2>
                        <p className="text-theme-secondary">You may not:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Use the Website for any unlawful purpose</li>
                            <li>Scrape, copy, or reproduce content without permission</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Transmit malware, viruses, or harmful code</li>
                            <li>Misrepresent your affiliation with us</li>
                        </ul>
                    </section>

                    {/* Third-Party Links */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">8. Third-Party Links</h2>
                        <p className="text-theme-secondary">
                            This Website may contain links to third-party websites. We do not control these websites
                            and are not responsible for their content, privacy practices, or terms of service.
                        </p>
                    </section>

                    {/* Monetization Disclosure */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">9. Monetization & Independence</h2>
                        <p className="text-theme-secondary">
                            As of the date of these terms, <strong>we do not receive commissions, referral fees, or
                                compensation</strong> from any insurance company for leads, sales, or placements.
                        </p>
                        <p className="text-theme-secondary">
                            If this changes in the future, we will update this section and clearly disclose any
                            commercial relationships that may affect our content.
                        </p>
                    </section>

                    {/* Indemnification - MUTUAL */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">10. Indemnification (Mutual)</h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">10.1 Your Indemnification of Us</h3>
                        <p className="text-theme-secondary">
                            You agree to indemnify and hold harmless InsuranceClarity from any claims, damages, or expenses
                            arising from your violation of these Terms, misuse of information, or third-party claims
                            related to your conduct.
                        </p>
                        <p className="text-theme-secondary">
                            <strong>Exception:</strong> You are NOT required to indemnify us if the claim arises from
                            our gross negligence, willful misconduct, or breach of privacy laws.
                        </p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">10.2 Our Indemnification of You</h3>
                        <p className="text-theme-secondary">
                            We agree to indemnify and hold harmless you from any third-party claims arising from
                            our violation of intellectual property law or misrepresentation of facts that expose your data.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">11. Governing Law & Jurisdiction</h2>
                        <p className="text-theme-secondary">
                            These Terms shall be governed by and construed in accordance with the laws of India.
                            Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
                        </p>
                    </section>

                    {/* Changes */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">12. Changes to Terms</h2>
                        <p className="text-theme-secondary">
                            We reserve the right to modify these Terms at any time. Changes will be effective upon
                            posting with an updated &ldquo;Last modified&rdquo; date. Your continued use constitutes acceptance.
                        </p>
                    </section>

                    {/* Consumer Protection & Grievance Redressal - NEW SECTION */}
                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-accent" />
                            13. Consumer Protection & Grievance Redressal
                        </h2>

                        <h3 className="text-lg font-medium text-theme-primary">13.1 Consumer Rights Under Consumer Protection Act, 2019</h3>
                        <p className="text-theme-secondary">You have the right to:</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li>Receive accurate, clear information about our service</li>
                            <li>File a complaint if you believe this website caused financial loss</li>
                            <li>Seek compensation for misleading information (if proven)</li>
                            <li>Get a response within the time frames specified below</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-6">13.2 Grievance Redressal Officer</h3>
                        <div className="bg-theme-surface rounded-lg p-4 my-4">
                            <p className="font-semibold text-theme-primary mb-3">Tier 1: Grievance Officer (Direct Contact)</p>
                            <div className="space-y-2 text-theme-secondary text-sm">
                                <p><strong>Name:</strong> Grievance Officer, One Track</p>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-accent" />
                                    <a href="mailto:grievance@insuranceclarity.in" className="text-accent hover:underline">
                                        grievance@insuranceclarity.in
                                    </a>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-accent" />
                                    +91-123-456-7890 (Mocked)
                                </p>
                                <p className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-accent" />
                                    Plot No. 123, Tech Park, Bangalore, Karnataka - 560001 (Mocked)
                                </p>
                                <div className="mt-3 pt-3 border-t border-default">
                                    <p><strong>Response Time:</strong></p>
                                    <ul className="list-disc pl-4 mt-1">
                                        <li>Acknowledgment: 5 working days</li>
                                        <li>Resolution: 30 days maximum</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-theme-surface rounded-lg p-4 my-4">
                            <p className="font-semibold text-theme-primary mb-3">Tier 2: District Consumer Protection Authority</p>
                            <p className="text-theme-secondary text-sm">
                                If you&apos;re not satisfied with our response within 30 days, you may escalate to:
                            </p>
                            <ul className="list-disc pl-6 text-theme-secondary space-y-1 text-sm mt-2">
                                <li><strong>District Consumer Disputes Redressal Forum</strong> of your jurisdiction</li>
                                <li>Filing fee: ₹100-5,000 (per authority rules)</li>
                                <li>Time limit: Within 2 years from date of issue</li>
                                <li>Website: <a href="https://consumerhelpline.gov.in" target="_blank" className="text-accent hover:underline">consumerhelpline.gov.in</a></li>
                            </ul>
                        </div>

                        <div className="bg-theme-surface rounded-lg p-4 my-4">
                            <p className="font-semibold text-theme-primary mb-3">Tier 3: State & National Consumer Commission</p>
                            <p className="text-theme-secondary text-sm">
                                For claims exceeding ₹1 crore, you may file before State or National Consumer Disputes Redressal Commission.
                            </p>
                        </div>

                        <h3 className="text-lg font-medium text-theme-primary mt-6">13.3 How to File a Complaint</h3>
                        <div className="text-theme-secondary text-sm space-y-3">
                            <p><strong>Step 1: Written Notice</strong><br />
                                Send a detailed complaint to grievance@insuranceclarity.in including: your name, email, phone;
                                date of issue; description of grievance; specific loss suffered (if any); proof (screenshots); requested remedy.</p>

                            <p><strong>Step 2: We Acknowledge</strong><br />
                                Within 5 working days, we&apos;ll send an acknowledgment with a reference number.</p>

                            <p><strong>Step 3: We Investigate & Respond</strong><br />
                                Within 30 days, we&apos;ll send our response with remediation proposal or dispute explanation.</p>

                            <p><strong>Step 4: Escalation</strong><br />
                                If dissatisfied, file with your District Consumer Protection Authority.</p>
                        </div>

                        <h3 className="text-lg font-medium text-theme-primary mt-6">13.4 Refund / Service Withdrawal Policy</h3>
                        <p className="text-theme-secondary text-sm">
                            Since we provide <strong>free educational tools</strong>, there is no refund policy.
                            If we discontinue a tool, we&apos;ll provide 30 days&apos; notice. No payment has been collected; no refund applies.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="glass rounded-xl p-6 mt-8">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">14. Contact</h2>
                        <div className="space-y-2 text-theme-secondary">
                            <p>For questions about these Terms:</p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-accent" />
                                <a href="mailto:legal@insuranceclarity.in" className="text-accent hover:underline">
                                    legal@insuranceclarity.in
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Related Links */}
                    <section className="flex gap-4 text-sm pt-4">
                        <Link href="/privacy" className="text-accent hover:underline">
                            Privacy Policy →
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
