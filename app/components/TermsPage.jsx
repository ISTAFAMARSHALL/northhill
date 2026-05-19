"use client";
import Image from "next/image";

const LAST_UPDATED = "May 19, 2026";
const COMPANY = "North Hill Systems LLC";
const SITE = "northhillsystems.com";
const EMAIL = "support@northhillsystems.com";

const S = {
  page: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0" },
  wrap: { maxWidth: 780, margin: "0 auto", padding: "3rem 2rem 5rem" },
  h1:   { fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", color: "#fff", marginBottom: "0.5rem", lineHeight: 1.2 },
  h2:   { fontFamily: "'DM Serif Display',serif", fontSize: "1.25rem", color: "#fff", marginTop: "2.5rem", marginBottom: "0.75rem" },
  p:    { fontSize: 15, color: "#9ca3af", lineHeight: 1.8, marginBottom: "1rem" },
  li:   { fontSize: 15, color: "#9ca3af", lineHeight: 1.8, marginBottom: "0.4rem" },
  ul:   { paddingLeft: "1.4rem", marginBottom: "1rem" },
  rule: { border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "2rem 0" },
  highlight: { background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" },
  warn:      { background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" },
};

function Section({ title, children }) {
  return (
    <>
      <h2 style={S.h2}>{title}</h2>
      {children}
    </>
  );
}

export default function TermsPage() {
  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Nav */}
      {/* <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 250, width: "auto" }} />
        </div>
        </a>
        <a href="/" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>← Back to Home</a>
      </nav> */}
      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 80, padding: "0 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a href="./" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 250, width: "auto" }} />
          </a>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="./" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>← Back to Home</a>
        </div>
      </nav>

      <div style={S.wrap}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Legal</p>
          <h1 style={S.h1}>Terms of Service</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: "0.5rem" }}>Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Intro callout */}
        <div style={S.highlight}>
          <p style={{ fontSize: 14, color: "#a78bfa", fontWeight: 600, marginBottom: 4 }}>Please read these terms carefully.</p>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.7 }}>
            By creating an account, placing an order, or using any service provided by {COMPANY}, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.
          </p>
        </div>

        {/* 1 */}
        <Section title="1. About North Hill Systems LLC">
          <p style={S.p}>
            {COMPANY} ("Company," "we," "us," or "our") is a limited liability company providing internet-based streaming service reseller solutions. We operate the website located at {SITE} and related services (collectively, the "Service").
          </p>
          <p style={S.p}>
            For questions about these Terms, contact us at: <a href={`mailto:${EMAIL}`} style={{ color: "#a78bfa" }}>{EMAIL}</a>
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 2 */}
        <Section title="2. Eligibility & Account Registration">
          <p style={S.p}>To use our Service you must:</p>
          <ul style={S.ul}>
            <li style={S.li}>Be at least 18 years of age, or the age of majority in your jurisdiction</li>
            <li style={S.li}>Provide accurate, complete, and current registration information</li>
            <li style={S.li}>Maintain the security of your account credentials</li>
            <li style={S.li}>Notify us immediately of any unauthorized use of your account</li>
          </ul>
          <p style={S.p}>
            You are responsible for all activity that occurs under your account. {COMPANY} reserves the right to refuse service, terminate accounts, or cancel orders at its sole discretion.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 3 */}
        <Section title="3. Services Provided">
          <p style={S.p}>
            {COMPANY} provides access to internet protocol television (IPTV) streaming services on a subscription basis. Service includes access to live channels, video on demand (VOD) content, and electronic program guide (EPG) data as available through our provider network.
          </p>
          <p style={S.p}>
            Channel availability, content libraries, and stream quality may vary and are subject to change without notice based on our upstream provider. We do not guarantee the availability of any specific channel, program, or content at any given time.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 4 */}
        <Section title="4. Subscription Plans & Billing">
          <p style={S.p}>
            Services are offered on prepaid subscription plans (monthly, quarterly, or annual). Pricing is clearly stated at the time of purchase. By completing payment, you agree to the price and term of the selected plan.
          </p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: "#e8e8f0" }}>Prepaid:</strong> All subscriptions are paid in full before service is activated.</li>
            <li style={S.li}><strong style={{ color: "#e8e8f0" }}>No auto-renewal:</strong> Subscriptions do not renew automatically unless explicitly agreed to in writing.</li>
            <li style={S.li}><strong style={{ color: "#e8e8f0" }}>Invoicing:</strong> Invoices are issued via Wave and are due upon receipt unless otherwise stated.</li>
            <li style={S.li}><strong style={{ color: "#e8e8f0" }}>Service activation:</strong> Access credentials are issued after payment is confirmed, typically within a few hours.</li>
          </ul>
        </Section>

        <hr style={S.rule} />

        {/* 5 */}
        <Section title="5. Refund & Cancellation Policy">
          <div style={S.warn}>
            <p style={{ fontSize: 14, color: "#fca5a5", fontWeight: 600, marginBottom: 4 }}>All sales are final.</p>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.7 }}>
              All services are prepaid and non-refundable. Once credentials have been issued or service has been made available, no refunds will be issued for any reason, including but not limited to: change of mind, non-use of service, device incompatibility, or dissatisfaction with content availability.
            </p>
          </div>
          <p style={S.p}>
            Monthly subscriptions apply only to the billing period for which payment was made. No credits or prorations are issued for early cancellation or partial use of a billing period.
          </p>
          <p style={S.p}>
            If you believe there is a service-side technical error affecting your access, contact us at {EMAIL} and we will investigate in good faith. Refunds or service credits for verified technical outages caused solely by {COMPANY} are at our sole discretion.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 6 */}
        <Section title="6. Chargeback Policy">
          <div style={S.warn}>
            <p style={{ fontSize: 14, color: "#fca5a5", fontWeight: 600, marginBottom: 4 }}>Chargebacks are prohibited once service has been delivered or made available.</p>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.7 }}>
              By completing payment, you waive your right to initiate a chargeback or payment dispute with your financial institution for any transaction where service credentials were issued or access was granted. Initiating a fraudulent chargeback constitutes a material breach of these Terms.
            </p>
          </div>
          <p style={S.p}>
            In the event of a chargeback, {COMPANY} reserves the right to immediately suspend or terminate your account, pursue recovery of the disputed amount, and report the activity to relevant fraud prevention services. We may also pursue legal remedies to the fullest extent permitted by law.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 7 */}
        <Section title="7. Acceptable Use">
          <p style={S.p}>You agree not to use the Service to:</p>
          <ul style={S.ul}>
            <li style={S.li}>Share, resell, redistribute, or sublicense your credentials to third parties without written authorization</li>
            <li style={S.li}>Exceed the number of simultaneous connections included in your plan</li>
            <li style={S.li}>Use automated tools, bots, or scrapers to access the Service</li>
            <li style={S.li}>Attempt to circumvent security measures, access controls, or usage limits</li>
            <li style={S.li}>Use the Service for any unlawful purpose</li>
          </ul>
          <p style={S.p}>
            Violation of these terms may result in immediate account suspension without refund and, where applicable, legal action.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 8 */}
        <Section title="8. Connections & Fair Use">
          <p style={S.p}>
            Each subscription plan includes a defined number of simultaneous streams ("connections"). Exceeding your allotted connections may result in stream interruption or account suspension. Connection upgrades are available at any time by contacting support.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 9 */}
        <Section title="9. Service Availability & Uptime">
          <p style={S.p}>
            While we strive for 99.9% uptime, we do not guarantee uninterrupted, error-free service. Downtime may occur due to scheduled maintenance, upstream provider outages, network issues, or circumstances beyond our control. We are not liable for any damages arising from service interruptions.
          </p>
          <p style={S.p}>
            Planned maintenance will be communicated in advance where reasonably possible. Emergency maintenance may be performed without prior notice.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 10 */}
        <Section title="10. Intellectual Property">
          <p style={S.p}>
            All content delivered through the Service is owned by or licensed to their respective rights holders. {COMPANY} does not claim ownership of any streamed content. Access to content is provided solely for personal, non-commercial viewing.
          </p>
          <p style={S.p}>
            The {COMPANY} name, logo, website design, and original materials are the intellectual property of {COMPANY} and may not be used without prior written consent.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 11 */}
        <Section title="11. Privacy">
          <p style={S.p}>
            We collect and store the minimum personal information necessary to provide the Service, including your name, email address, and payment records. We do not sell, rent, or share your personal information with third parties except as required to process payments or comply with legal obligations.
          </p>
          <p style={S.p}>
            By using the Service, you consent to the collection and use of information as described herein. For questions about data handling, contact us at {EMAIL}.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 12 */}
        <Section title="12. Disclaimer of Warranties">
          <p style={S.p}>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. {COMPANY.toUpperCase()} DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 13 */}
        <Section title="13. Limitation of Liability">
          <p style={S.p}>
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, {COMPANY.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p style={S.p}>
            OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO {COMPANY.toUpperCase()} IN THE THIRTY (30) DAYS PRECEDING THE CLAIM.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 14 */}
        <Section title="14. Indemnification">
          <p style={S.p}>
            You agree to indemnify, defend, and hold harmless {COMPANY}, its members, officers, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 15 */}
        <Section title="15. Account Termination">
          <p style={S.p}>
            {COMPANY} reserves the right to suspend or terminate your account and access to the Service at any time, with or without notice, for conduct that we determine in our sole discretion violates these Terms or is harmful to other users, us, or third parties.
          </p>
          <p style={S.p}>
            Upon termination, your right to use the Service ceases immediately. No refunds will be issued for the remaining unused portion of any prepaid subscription period.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 16 */}
        <Section title="16. Governing Law & Dispute Resolution">
          <p style={S.p}>
            These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming, without regard to its conflict of law provisions, regardless of where you are located or where you access the Service.
          </p>
          <p style={S.p}>
            Any dispute arising from or relating to these Terms or the Service shall first be addressed through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration in accordance with the rules of the American Arbitration Association, conducted in Sheridan County, Wyoming. You waive any right to a jury trial or to participate in a class action lawsuit.
          </p>
          <p style={S.p}>
            Notwithstanding the foregoing, {COMPANY} reserves the right to seek injunctive or other equitable relief in any court of competent jurisdiction to prevent irreparable harm.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 17 */}
        <Section title="17. Changes to These Terms">
          <p style={S.p}>
            {COMPANY} reserves the right to modify these Terms at any time. Changes will be posted to this page with an updated "Last Updated" date. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms. We will make reasonable efforts to notify active subscribers of material changes via email.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* 18 */}
        <Section title="18. Entire Agreement">
          <p style={S.p}>
            These Terms, together with any invoices, order confirmations, or written agreements referencing these Terms, constitute the entire agreement between you and {COMPANY} regarding the Service and supersede all prior communications or agreements.
          </p>
          <p style={S.p}>
            If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
          </p>
        </Section>

        <hr style={S.rule} />

        {/* Contact */}
        <div style={{ ...S.highlight, marginTop: "2rem" }}>
          <p style={{ fontSize: 14, color: "#a78bfa", fontWeight: 600, marginBottom: 6 }}>Contact Us</p>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.8 }}>
            {COMPANY}<br />
            30 N Gould St, Ste R<br />
            Sheridan, WY 82801<br />
            Email: <a href={`mailto:${EMAIL}`} style={{ color: "#a78bfa" }}>{EMAIL}</a><br />
            Website: <a href={`https://${SITE}`} style={{ color: "#a78bfa" }}>{SITE}</a>
          </p>
        </div>

        {/* Bottom note */}
        <p style={{ fontSize: 12, color: "#374151", marginTop: "2rem", lineHeight: 1.7 }}>
          By using {COMPANY}'s services or completing payment, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem 2rem", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#374151" }}>© {new Date().getFullYear()} {COMPANY}. All rights reserved.</p>
      </footer>
    </div>
  );
}
