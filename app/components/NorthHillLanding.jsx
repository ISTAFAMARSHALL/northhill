"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const PLANS = [
  {
    id: "solo-monthly",
    name: "Solo",
    connections: 1,
    term: "monthly",
    termLabel: "1 Month",
    price: 13,
    credits: 1,
    badge: null,
    highlight: false,
    perMonth: 13,
    description: "Perfect for a single screen",
  },
  {
    id: "solo-quarterly",
    name: "Solo",
    connections: 1,
    term: "quarterly",
    termLabel: "3 Months",
    price: 33,
    credits: 3,
    badge: "Save $6",
    highlight: false,
    perMonth: 11,
    description: "Best solo value",
  },
  {
    id: "solo-annual",
    name: "Solo",
    connections: 1,
    term: "annual",
    termLabel: "12 Months",
    price: 99,
    credits: 12,
    badge: "Save $57",
    highlight: false,
    perMonth: 8.25,
    description: "Lowest price per month",
  },
  {
    id: "standard-monthly",
    name: "Standard",
    connections: 2,
    term: "monthly",
    termLabel: "1 Month",
    price: 22,
    credits: 2,
    badge: null,
    highlight: false,
    perMonth: 22,
    description: "Share with a partner",
  },
  {
    id: "standard-quarterly",
    name: "Standard",
    connections: 2,
    term: "quarterly",
    termLabel: "3 Months",
    price: 55,
    credits: 3,
    badge: "Most Popular",
    highlight: true,
    perMonth: 18.33,
    description: "Best overall value",
  },
  {
    id: "standard-annual",
    name: "Standard",
    connections: 2,
    term: "annual",
    termLabel: "12 Months",
    price: 159,
    credits: 12,
    badge: "Best Deal",
    highlight: false,
    perMonth: 13.25,
    description: "Maximum savings",
  },
  {
    id: "family-monthly",
    name: "Family",
    connections: 3,
    term: "monthly",
    termLabel: "1 Month",
    price: 28,
    credits: 3,
    badge: null,
    highlight: false,
    perMonth: 28,
    description: "Three simultaneous streams",
  },
  {
    id: "family-quarterly",
    name: "Family",
    connections: 3,
    term: "quarterly",
    termLabel: "3 Months",
    price: 72,
    credits: 6,
    badge: null,
    highlight: false,
    perMonth: 24,
    description: "Family savings",
  },
  {
    id: "family-annual",
    name: "Family",
    connections: 3,
    term: "annual",
    termLabel: "12 Months",
    price: 199,
    credits: 16,
    badge: null,
    highlight: false,
    perMonth: 16.58,
    description: "Best family rate",
  },
  {
    id: "premium-monthly",
    name: "Premium",
    connections: 4,
    term: "monthly",
    termLabel: "1 Month",
    price: 35,
    credits: 4,
    badge: null,
    highlight: false,
    perMonth: 35,
    description: "Power user setup",
  },
  {
    id: "premium-quarterly",
    name: "Premium",
    connections: 4,
    term: "quarterly",
    termLabel: "3 Months",
    price: 90,
    credits: 8,
    badge: null,
    highlight: false,
    perMonth: 30,
    description: "Quarterly premium value",
  },
  {
    id: "max-monthly",
    name: "Max",
    connections: 5,
    term: "monthly",
    termLabel: "1 Month",
    price: 42,
    credits: 5,
    badge: null,
    highlight: false,
    perMonth: 42,
    description: "Full household coverage",
  },
  {
    id: "max-quarterly",
    name: "Max",
    connections: 5,
    term: "quarterly",
    termLabel: "3 Months",
    price: 115,
    credits: 10,
    badge: null,
    highlight: false,
    perMonth: 38.33,
    description: "Max streams, max savings",
  },
];

const FEATURES = [
  { icon: "📡", title: "99.9% Uptime", desc: "Rock-solid servers with industry-leading reliability" },
  { icon: "📺", title: "EPG Channel Guides", desc: "Full electronic program guides on all channels" },
  { icon: "🎬", title: "Thousands of VOD", desc: "Movies and TV shows available on demand, 24/7" },
  { icon: "⚡", title: "Instant Activation", desc: "Your service is live within minutes of payment" },
  { icon: "🌍", title: "All Content Types", desc: "Sports, international, news, entertainment & more" },
  { icon: "🛠️", title: "24hr Free Trial", desc: "Try before you commit — no credit card required" },
];

const TERMS = ["monthly", "quarterly", "annual"];
const TERM_LABELS = { monthly: "Monthly", quarterly: "3 Months", annual: "12 Months" };

export default function NorthHillLanding() {
  const [activeTerm, setActiveTerm] = useState("quarterly");
  const [loggedIn, setLoggedIn]     = useState(false);
  const [userEmail, setUserEmail]   = useState("");

  useEffect(() => {
    import("@/lib/supabase").then(({ createClient }) => {
      createClient().auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setLoggedIn(true);
          setUserEmail(session.user.email);
        }
      });
    });
  }, []);

  const openTrial = () => {
    window.location.href = loggedIn ? "/plans?trial=true" : "/signup?trial=true";
  };

  const visiblePlans = PLANS.filter((p) => p.term === activeTerm);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0" }}>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .plan-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .plan-card:hover { transform: translateY(-4px); }
        .term-btn { transition: all 0.15s ease; cursor: pointer; border: none; }
        .cta-btn { transition: all 0.15s ease; cursor: pointer; border: none; }
        .cta-btn:hover { opacity: 0.85; transform: scale(1.02); }
        .trial-link { cursor: pointer; background: none; border: none; text-decoration: underline; color: #a78bfa; font-size: inherit; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 80, padding: "0 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
          <a href="./" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 250, width: "auto" }} />
          </a>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="#features" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>Features</a>
          <a href="#pricing" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>Pricing</a>
          <a href="#faq" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>FAQ</a>
          <a href="/portal" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>My Account</a>
          <button className="cta-btn" onClick={openTrial} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
            Free Trial
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "6rem 2rem 4rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.15), transparent)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#a78bfa", marginBottom: "1.5rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          99.9% Uptime Guaranteed
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.1, letterSpacing: "-1px", color: "#fff", marginBottom: "1.25rem", maxWidth: 750, margin: "0 auto 1.25rem" }}>
          Premium Streaming.<br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>No Contracts.</span>
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#9ca3af", maxWidth: 540, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          Thousands of live channels, on-demand movies & shows, full EPG guides — starting at $13/month. Cut the cable bill for good.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="cta-btn" onClick={openTrial} style={{ display: "inline-flex", alignItems: "center", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 0 30px rgba(124,58,237,0.35)" }}>
            Start Free Trial →
          </button>
          <a href="#pricing" style={{ display: "inline-flex", alignItems: "center", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 500, border: "1px solid rgba(255,255,255,0.12)", color: "#e8e8f0", textDecoration: "none", background: "rgba(255,255,255,0.04)" }}>
            View Plans
          </a>
        </div>
        <p style={{ marginTop: "1rem", fontSize: 13, color: "#6b7280" }}>No credit card required · Instant activation</p>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "4rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", textAlign: "center", color: "#fff", marginBottom: "3rem" }}>
          Everything included, every plan
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.5rem" }}>
              <div style={{ fontSize: 28, marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "4rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", textAlign: "center", color: "#fff", marginBottom: "0.75rem" }}>
          Simple, transparent pricing
        </h2>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: 15, marginBottom: "2rem" }}>
          No hidden fees. No throttling. Cancel anytime.
        </p>

        {/* Term toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: "2.5rem", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4, width: "fit-content", margin: "0 auto 2.5rem" }}>
          {TERMS.map((t) => (
            <button key={t} className="term-btn" onClick={() => setActiveTerm(t)} style={{ padding: "8px 22px", borderRadius: 8, fontSize: 14, fontWeight: 500, background: activeTerm === t ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "transparent", color: activeTerm === t ? "#fff" : "#9ca3af" }}>
              {TERM_LABELS[t]}
              {t === "quarterly" && <span style={{ marginLeft: 6, fontSize: 11, background: "rgba(16,185,129,0.2)", color: "#10b981", padding: "2px 6px", borderRadius: 4 }}>Save</span>}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {visiblePlans.map((plan) => (
            <div key={plan.id} className="plan-card" style={{ background: plan.highlight ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)", border: plan.highlight ? "1.5px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "1.5rem", position: "relative", display: "flex", flexDirection: "column" }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.highlight ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(16,185,129,0.2)", color: plan.highlight ? "#fff" : "#10b981", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ marginBottom: "auto" }}>
                <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: "1rem" }}>{plan.connections} connection{plan.connections > 1 ? "s" : ""} · {plan.termLabel}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: "#fff" }}>${plan.price}</span>
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: "1.25rem" }}>${plan.perMonth.toFixed(2)}/mo</div>
                <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.5, marginBottom: "1.5rem" }}>{plan.description}</p>
              </div>
              <a href={loggedIn ? `/plans?plan=${plan.id}` : "/signup"} className="cta-btn" style={{ display: "block", width: "100%", padding: "10px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: plan.highlight ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", border: "none", textAlign: "center", textDecoration: "none" }}>
                {loggedIn ? "Select Plan" : "Get Started"}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: "4rem 2rem", maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", textAlign: "center", color: "#fff", marginBottom: "2.5rem" }}>
          Common questions
        </h2>
        {[
          ["What devices are supported?", "Our service works on Smart TVs, Firestick, Android TV, iOS, Android, MAG boxes, and most IPTV players like TiviMate, IPTV Smarters, and Perfect Player."],
          ["How fast is activation?", "Most subscriptions are activated within minutes. You'll receive your credentials by email immediately after payment."],
          ["What is a connection?", "Each connection is one simultaneous stream. A 2-connection plan lets you watch on two devices at the same time."],
          ["Can I upgrade my plan later?", "Yes — you can upgrade connections or switch to a longer term at any time. Contact support and we'll prorate the difference."],
          ["Is there a free trial?", "Yes, we offer a 24-hour free trial so you can verify the service works on your device before committing. No credit card required."],
          ["What payment methods do you accept?", "We accept all major credit/debit cards and multiple digital payment options. Payment is processed securely at checkout."],
        ].map(([q, a]) => (
          <FAQItem key={q} question={q} answer={a} />
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "0.75rem" }}>
          <a href="/terms" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Terms of Service</a>

          <a href="./" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 200, width: "auto" }} />
          </a>

          <a href="/portal" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>My Account</a>
        </div>
        <p style={{ fontSize: 13, color: "#4b5563" }}>© {new Date().getFullYear()} North Hill Systems LLC. All rights reserved.</p>
      </footer>

    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem 0" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#e8e8f0" }}>{question}</span>
        <span style={{ color: "#7c3aed", fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <p style={{ marginTop: "0.75rem", fontSize: 14, color: "#9ca3af", lineHeight: 1.7 }}>{answer}</p>}
    </div>
  );
}
