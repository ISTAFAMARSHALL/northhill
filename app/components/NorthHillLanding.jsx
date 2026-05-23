"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { PLANS } from "@/lib/plans"
import { FEATURES } from "@/lib/feature-list"

const TERMS       = ["monthly", "quarterly", "annual"];
const TERM_LABELS = { monthly: "Monthly", quarterly: "3 Months", annual: "12 Months" };

export default function NorthHillLanding() {
  const [activeTerm,      setActiveTerm]      = useState("quarterly");
  const [loggedIn,        setLoggedIn]        = useState(false);
  const [hasActiveSub,    setHasActiveSub]    = useState(false);
  const [addingLine,      setAddingLine]      = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // If user arrived via portal "Add Another Line" confirmation, keep buttons active
    const params = new URLSearchParams(window.location.search);
    const isAddingLine = params.get("addline") === "true";
    if (isAddingLine) setAddingLine(true);

    import("@/lib/supabase").then(async ({ createClient }) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setLoggedIn(true);

        // Only check for active sub if NOT coming from addline flow
        // so plan buttons stay enabled when user wants to add a line
        if (!isAddingLine) {
          const { data: subs } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("user_id", session.user.id)
            .eq("status", "active");

          if (subs && subs.length > 0) setHasActiveSub(true);
        }
      }
      setCheckingSession(false);
    });
  }, []);

  const openTrial = () => {
    if (planButtonsDisabled) { window.location.href = "/portal"; return; }
    window.location.href = loggedIn ? "/plans?trial=true" : "/signup?trial=true";
  };

  const visiblePlans = PLANS.filter((p) => p.term === activeTerm);

  // Plan buttons disabled only when user has active sub AND is NOT adding a line
  const planButtonsDisabled = hasActiveSub && !addingLine;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .plan-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .plan-card:hover { transform: translateY(-4px); }
        .term-btn { transition: all 0.15s ease; cursor: pointer; border: none; }
        .cta-btn  { transition: all 0.15s ease; cursor: pointer; border: none; }
        .cta-btn:hover { opacity: 0.85; transform: scale(1.02); }
        .nav-link:hover { color: #e8e8f0 !important; }
        .plan-btn:hover { opacity: 0.88; transform: scale(1.01); }
        .portal-btn:hover { opacity: 0.85; background: rgba(255,255,255,0.08) !important; color: #e8e8f0 !important; }
        .footer-link:hover { color: #a78bfa !important; }
        .disabled-card:hover { cursor: pointer; opacity: 0.7 !important; }
        .sub-banner-btn:hover { opacity: 0.88; }
        .view-plans-link:hover { opacity: 0.85; }
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-logo-wrap img { height: 150px !important; width: auto !important; }
          .nav-logo-wrap span { height: 44px !important; width: auto !important; }
        }
      `}</style>

      {/* NAV — always fully active */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 80, padding: "0 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <a href="./" className="nav-logo-wrap" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 250, width: "auto" }} />
        </a>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div className="nav-links-desktop" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <a href="#features" className="nav-link" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", transition: "color 0.15s ease" }}>Features</a>
            <a href="#pricing" className="nav-link" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", transition: "color 0.15s ease" }}>Pricing</a>
            <a href="#faq" className="nav-link" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", transition: "color 0.15s ease" }}>FAQ</a>
            <a href="/setup" className="nav-link" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", transition: "color 0.15s ease" }}>Setup</a>
            <a href="/portal" className="nav-link" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", transition: "color 0.15s ease" }}>Account</a>
          </div>
          <button className="cta-btn" onClick={openTrial} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
            {planButtonsDisabled ? "My Portal →" : "Free Trial"}
          </button>
        </div>
      </nav>

      {/* HERO — always fully active */}
      <section style={{ textAlign: "center", padding: "6rem 2rem 4rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.15), transparent)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#a78bfa", marginBottom: "1.5rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          99.9% Uptime Guaranteed
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.1, letterSpacing: "-1px", color: "#fff", maxWidth: 750, margin: "0 auto 1.25rem" }}>
          Premium Streaming.<br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>No Contracts.</span>
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#9ca3af", maxWidth: 540, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          {"15,000+ live channels, 42,000+ movies, 7,800+ shows. Starting at $20/month. Your cable bill's replacement is here."}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="cta-btn" onClick={openTrial} style={{ display: "inline-flex", alignItems: "center", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 0 30px rgba(124,58,237,0.35)" }}>
            {planButtonsDisabled ? "Go to My Portal →" : "Start Free Trial →"}
          </button>
          <a href="#pricing" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 500, border: "1px solid rgba(255,255,255,0.12)", color: "#e8e8f0", textDecoration: "none", background: "rgba(255,255,255,0.04)", transition: "all 0.15s ease" }}>
            View Plans
          </a>
        </div>
        <p style={{ marginTop: "1rem", fontSize: 13, color: "#6b7280" }}>No credit card required · Instant activation</p>
      </section>

      {/* FEATURES — always fully active */}
      <section id="features" style={{ padding: "4rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", textAlign: "center", color: "#fff", marginBottom: "3rem" }}>
          Everything included, every plan
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.25rem" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.5rem", flex: "1 1 280px", maxWidth: 340 }}>
              <div style={{ fontSize: 28, marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING — plan buttons selectively disabled */}
      <section id="pricing" style={{ padding: "4rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", textAlign: "center", color: "#fff", marginBottom: "0.75rem" }}>
          Simple, transparent pricing
        </h2>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: 15, marginBottom: "2rem" }}>
          No hidden fees. No throttling. Cancel anytime.
        </p>

        {/* Banner — only when user has active sub and is NOT adding a line */}
        {planButtonsDisabled && (
          <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: "1rem 1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={{ fontSize: 14, color: "#a78bfa" }}>
                You already have an active subscription. To add another line, visit your portal.
              </span>
            </div>
            <a href="/portal" className="sub-banner-btn" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", transition: "opacity 0.15s ease" }}>
              Go to Portal →
            </a>
          </div>
        )}

        {/* Term toggle — always active */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: "2.5rem", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4, width: "fit-content", margin: "0 auto 2.5rem" }}>
          {TERMS.map((t) => (
            <button key={t} className="term-btn" onClick={() => setActiveTerm(t)} style={{ padding: "8px 22px", borderRadius: 8, fontSize: 14, fontWeight: 500, background: activeTerm === t ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "transparent", color: activeTerm === t ? "#fff" : "#9ca3af" }}>
              {TERM_LABELS[t]}
              {t === "quarterly" && <span style={{ marginLeft: 6, fontSize: 11, background: "rgba(16,185,129,0.2)", color: "#10b981", padding: "2px 6px", borderRadius: 4 }}>Save</span>}
            </button>
          ))}
        </div>

        {/* Plan cards — only these buttons are disabled */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
          {visiblePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              loggedIn={loggedIn}
              disabled={planButtonsDisabled}
              checkingSession={checkingSession}
            />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "4rem 2rem", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", textAlign: "center", color: "#fff", marginBottom: "0.75rem" }}>
          Up and running in minutes
        </h2>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: 15, marginBottom: "3rem" }}>
          No contracts, no complexity. Three steps and you're watching.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
          {[
            { step: "01", icon: "📋", title: "Pick your plan", desc: "Choose the number of connections and term that fits your household. Solo, family, or full house — we have you covered." },
            { step: "02", icon: "💳", title: "Pay your invoice", desc: "A secure Wave invoice lands in your email. Pay with any major card in minutes — no account needed." },
            { step: "03", icon: "📺", title: "Start streaming", desc: "Your credentials arrive by email, usually within 15 minutes. Load them into TiviMate, IPTV Smarters, or any IPTV app and go." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "1.75rem", position: "relative", justifyItems: "center"}}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>STEP {step}</div>
              <div style={{ fontSize: 28, marginBottom: "0.75rem" }}>{icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: "2rem 2rem 4rem", maxWidth: 900, margin: "0 auto" }}>
        <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginBottom: "1.5rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          What our customers say
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {[
            { quote: "Cutting the cord was so easy and pain-free. I had no idea it could be this simple.", name: "Paul", location: "Brooklyn, NY" },
            { quote: "Setup is quick and easy. Now I can watch all the sporting events without hassle.", name: "Kevin", location: "Miami, FL" },
          ].map(({ quote, name, location }) => (
            <div key={name} style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16, padding: "1.5rem" }}>
              <p style={{ fontSize: 15, color: "#e8e8f0", lineHeight: 1.7, marginBottom: "1.25rem", fontStyle: "italic" }}>
                {`"${quote}"`}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#a78bfa" }}>
                  {name[0]}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>{name}</p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{location}</p>
                </div>
              </div>
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
          ["What devices are supported?",        "Our service works on Smart TVs, Firestick, Android TV, iOS, Android, MAG boxes, and most IPTV players like TiviMate, IPTV Smarters, and Perfect Player."],
          ["How fast is activation?",            "Your credentials land in your inbox the same day — usually within 15 minutes of payment confirmation."],
          ["What is a connection?",              "Each connection is one simultaneous stream. A 2-connection plan lets you watch on two devices at the same time."],
          ["Can I upgrade my plan later?",       "Yes — you can upgrade connections or switch to a longer term at any time. Contact support and we'll prorate the difference."],
          ["Is there a free trial?",             "Yes, we offer a 24-hour free trial so you can verify the service works on your device before committing. No credit card required."],
          ["What payment methods do you accept?","We accept all major credit and debit cards via secure Wave invoice. You'll receive your invoice by email and can pay online in minutes."],
        ].map(([q, a]) => <FAQItem key={q} question={q} answer={a} />)}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────
// Plan Card
// disabled prop ONLY controls the plan selection button
// Nav, hero, FAQ, footer are completely unaffected
// ─────────────────────────────────────────
function PlanCard({ plan, loggedIn, disabled, checkingSession }) {
  return (
    <div
      className="plan-card"
      style={{
        background:    plan.highlight ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
        border:        plan.highlight ? "1.5px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius:  16,
        padding:       "1.5rem",
        position:      "relative",
        display:       "flex",
        flexDirection: "column",
        opacity:       disabled ? 0.55 : 1,
        transition:    "opacity 0.2s",
        flex:          "1 1 200px",
        maxWidth:      240,
      }}
    >
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

      {/* THIS is the only button affected by disabled */}
      {disabled ? (
        <div
          onClick={() => window.location.href = "/portal"}
          className="disabled-card"
          style={{ display: "block", width: "100%", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.04)", color: "#4b5563", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", cursor: "pointer", userSelect: "none", transition: "opacity 0.15s ease" }}
        >
          Manage in Portal →
        </div>
      ) : (
        <a
          href={loggedIn ? `/plans?plan=${plan.id}` : "/signup"}
          className="cta-btn plan-btn"
          style={{ display: "block", width: "100%", padding: "10px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: plan.highlight ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.08)", color: "#fff", cursor: checkingSession ? "wait" : "pointer", border: "none", textAlign: "center", textDecoration: "none", transition: "all 0.15s ease" }}
        >
          {loggedIn ? "Select Plan" : "Get Started"}
        </a>
      )}
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
