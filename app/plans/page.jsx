"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

// ─────────────────────────────────────────
// Shared plan data — single source of truth
// ─────────────────────────────────────────
export const PLANS = [
  { id: "solo-monthly",       name: "Solo",     connections: 1, term: "monthly",   termLabel: "1 Month",   price: 13,  perMonth: 13,    badge: null,          highlight: false, description: "Perfect for a single screen",    months: 1  },
  { id: "solo-quarterly",     name: "Solo",     connections: 1, term: "quarterly", termLabel: "3 Months",  price: 33,  perMonth: 11,    badge: "Save $6",     highlight: false, description: "Best solo value",                months: 3  },
  { id: "solo-annual",        name: "Solo",     connections: 1, term: "annual",    termLabel: "12 Months", price: 99,  perMonth: 8.25,  badge: "Save $57",    highlight: false, description: "Lowest price per month",         months: 12 },
  { id: "standard-monthly",   name: "Standard", connections: 2, term: "monthly",   termLabel: "1 Month",   price: 22,  perMonth: 22,    badge: null,          highlight: false, description: "Share with a partner",           months: 1  },
  { id: "standard-quarterly", name: "Standard", connections: 2, term: "quarterly", termLabel: "3 Months",  price: 55,  perMonth: 18.33, badge: "Most Popular", highlight: true,  description: "Best overall value",             months: 3  },
  { id: "standard-annual",    name: "Standard", connections: 2, term: "annual",    termLabel: "12 Months", price: 159, perMonth: 13.25, badge: "Best Deal",    highlight: false, description: "Maximum savings",                months: 12 },
  { id: "family-monthly",     name: "Family",   connections: 3, term: "monthly",   termLabel: "1 Month",   price: 28,  perMonth: 28,    badge: null,          highlight: false, description: "Three simultaneous streams",     months: 1  },
  { id: "family-quarterly",   name: "Family",   connections: 3, term: "quarterly", termLabel: "3 Months",  price: 72,  perMonth: 24,    badge: null,          highlight: false, description: "Family savings",                 months: 3  },
  { id: "family-annual",      name: "Family",   connections: 3, term: "annual",    termLabel: "12 Months", price: 199, perMonth: 16.58, badge: null,          highlight: false, description: "Best family rate",               months: 12 },
  { id: "premium-monthly",    name: "Premium",  connections: 4, term: "monthly",   termLabel: "1 Month",   price: 35,  perMonth: 35,    badge: null,          highlight: false, description: "Power user setup",               months: 1  },
  { id: "premium-quarterly",  name: "Premium",  connections: 4, term: "quarterly", termLabel: "3 Months",  price: 90,  perMonth: 30,    badge: null,          highlight: false, description: "Quarterly premium value",        months: 3  },
  { id: "max-monthly",        name: "Max",      connections: 5, term: "monthly",   termLabel: "1 Month",   price: 42,  perMonth: 42,    badge: null,          highlight: false, description: "Full household coverage",        months: 1  },
  { id: "max-quarterly",      name: "Max",      connections: 5, term: "quarterly", termLabel: "3 Months",  price: 115, perMonth: 38.33, badge: null,          highlight: false, description: "Max streams, max savings",       months: 3  },
];

const TERMS      = ["monthly", "quarterly", "annual"];
const TERM_LABELS = { monthly: "Monthly", quarterly: "3 Months", annual: "12 Months" };

const S = {
  page:  { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0" },
  card:  { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.5rem", position: "relative", display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform 0.15s ease, border-color 0.15s ease" },
  error: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: "1rem" },
};

// ─────────────────────────────────────────
// Confirm Modal
// ─────────────────────────────────────────
function ConfirmModal({ plan, user, onConfirm, onCancel, loading }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onCancel()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1.5rem" }}>
      <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2.25rem", maxWidth: 440, width: "100%" }}>
        <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#fff", marginBottom: 8 }}>Confirm your request</h3>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: "1.5rem", lineHeight: 1.65 }}>
          You're requesting the <strong style={{ color: "#e8e8f0" }}>{plan.name} {plan.termLabel}</strong> plan. We'll send you a Wave invoice at <strong style={{ color: "#e8e8f0" }}>{user?.email}</strong> within a few hours. Your service activates once payment is received.
        </p>

        {/* Order summary */}
        <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>Plan</span>
            <span style={{ fontSize: 13, color: "#e8e8f0", fontWeight: 500 }}>{plan.name} · {plan.termLabel}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>Connections</span>
            <span style={{ fontSize: 13, color: "#e8e8f0" }}>{plan.connections} simultaneous stream{plan.connections > 1 ? "s" : ""}</span>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>Total due</span>
            <span style={{ fontSize: 18, color: "#a78bfa", fontWeight: 700 }}>${plan.price}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", fontSize: 14, cursor: "pointer" }}>
            Go Back
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 2, padding: "11px", borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
            {loading ? "Sending request…" : "Confirm & Request Service →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Success Screen
// ─────────────────────────────────────────
function SuccessScreen({ plan, email }) {
  return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 1.5rem" }}>✓</div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "#fff", marginBottom: "0.75rem" }}>Request received!</h1>
        <p style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.7, marginBottom: "2rem" }}>
          Your <strong style={{ color: "#e8e8f0" }}>{plan.name} {plan.termLabel}</strong> request has been sent. Check <strong style={{ color: "#e8e8f0" }}>{email}</strong> — you'll receive a Wave invoice shortly. Once paid, your IPTV credentials will appear in your portal automatically.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/portal" style={{ padding: "11px 28px", borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Go to My Portal →
          </a>
          <a href="/" style={{ padding: "11px 28px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Plan Selection Page
// ─────────────────────────────────────────
export default function PlanSelectionPage() {
  const [user, setUser]           = useState(null);
  const [activeTerm, setTerm]     = useState("quarterly");
  const [selected, setSelected]   = useState(null);
  const [confirming, setConfirming]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const supabase = createClient();

  // Guard — must be logged in; also pre-select plan or handle ?trial=true
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const params = new URLSearchParams(window.location.search);

      if (!session?.user) {
        const dest = params.get("trial") === "true" ? "/signup?trial=true" : "/signup";
        window.location.href = dest;
        return;
      }

      setUser(session.user);
      setAccessToken(session.access_token);

      // Pre-select a specific plan
      const planId = params.get("plan");
      if (planId) {
        const match = PLANS.find(p => p.id === planId);
        if (match) { setSelected(match); setTerm(match.term); setConfirming(true); }
        return;
      }

      // Free trial flow — auto-open the trial confirmation modal
      if (params.get("trial") === "true") {
        const trialPlan = {
          id: "free-trial", name: "Free Trial", connections: 1,
          term: "trial", termLabel: "24 Hours", price: 0,
        };
        setSelected(trialPlan);
        setConfirming(true);
      }
    });
  }, []);

  const visiblePlans = PLANS.filter(p => p.term === activeTerm);

  const handleRequestService = async () => {
    if (!selected || !user) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          planId:      selected.id,
          planName:    selected.name,
          planTerm:    selected.term,
          price:       selected.price,
          connections: selected.connections,
          userEmail:   user.email,
          userName:    user.user_metadata?.full_name || "",
          userId:      user.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed.");
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
    setConfirming(false);
  };

  if (submitted && selected) return <SuccessScreen plan={selected} email={user?.email} />;
  if (!user) return <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#6b7280" }}>Loading…</p></div>;

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}.pc:hover{transform:translateY(-3px);border-color:rgba(124,58,237,0.4)!important}`}</style>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.97)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 17, color: "#fff" }}>North Hill Systems</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>{user.email}</span>
          <a href="/portal" style={{ fontSize: 13, color: "#a78bfa", textDecoration: "none" }}>My Portal →</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, maxWidth: 360, margin: "0 auto 2.5rem" }}>
          {["Create Account", "Pick Plan", "Go Live"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: i === 0 ? "rgba(16,185,129,0.2)" : i === 1 ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.06)", border: i === 0 ? "1px solid #10b981" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: i === 0 ? "#10b981" : i === 1 ? "#fff" : "#4b5563", marginBottom: 4 }}>
                  {i === 0 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i === 1 ? "#a78bfa" : i === 0 ? "#10b981" : "#4b5563", whiteSpace: "nowrap" }}>{step}</span>
              </div>
              {i < 2 && <div style={{ height: 1, background: i === 0 ? "#10b981" : "rgba(255,255,255,0.08)", flex: 1, marginBottom: 18, marginTop: -4 }} />}
            </div>
          ))}
        </div>

        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", color: "#fff", textAlign: "center", marginBottom: "0.5rem" }}>Choose your plan</h1>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: 14, marginBottom: "2rem" }}>
          Hi {user.user_metadata?.full_name?.split(" ")[0] || "there"} — pick the plan that fits. You'll get a Wave invoice after selecting.
        </p>

        {error && <div style={{ ...S.error, maxWidth: 500, margin: "0 auto 1.5rem" }}>{error}</div>}

        {/* Term toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 3 }}>
            {TERMS.map(t => (
              <button key={t} onClick={() => setTerm(t)} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: activeTerm === t ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent", color: activeTerm === t ? "#fff" : "#6b7280", border: "none", cursor: "pointer" }}>
                {TERM_LABELS[t]}
                {t === "quarterly" && <span style={{ marginLeft: 5, fontSize: 10, background: "rgba(16,185,129,0.2)", color: "#10b981", padding: "2px 5px", borderRadius: 4 }}>Save</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plan grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {visiblePlans.map(plan => {
            const isSelected = selected?.id === plan.id;
            return (
              <div key={plan.id} className="pc" onClick={() => setSelected(plan)}
                style={{ ...S.card, background: isSelected ? "rgba(124,58,237,0.14)" : plan.highlight ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)", border: isSelected ? "2px solid #7c3aed" : plan.highlight ? "1.5px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)" }}>

                {plan.badge && (
                  <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: plan.highlight ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(16,185,129,0.2)", color: plan.highlight ? "#fff" : "#10b981", fontSize: 10, fontWeight: 700, padding: "3px 11px", borderRadius: 20, whiteSpace: "nowrap" }}>
                    {plan.badge}
                  </div>
                )}

                {isSelected && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>✓</div>
                )}

                <div style={{ marginBottom: "auto" }}>
                  <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: "0.75rem" }}>{plan.connections} connection{plan.connections > 1 ? "s" : ""} · {plan.termLabel}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 2 }}>${plan.price}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: "0.75rem" }}>${plan.perMonth.toFixed(2)}/mo</div>
                  <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, marginBottom: "1.25rem" }}>{plan.description}</p>
                </div>

                <div style={{ padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: "center", background: isSelected ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.06)", color: isSelected ? "#fff" : "#9ca3af" }}>
                  {isSelected ? "Selected ✓" : "Select Plan"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Request service CTA */}
        {selected && (
          <div style={{ position: "sticky", bottom: "1.5rem", display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#111118", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 14, padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", flexWrap: "wrap", justifyContent: "center" }}>
              <div>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Selected: </span>
                <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{selected.name} {selected.termLabel}</span>
                <span style={{ fontSize: 14, color: "#a78bfa", fontWeight: 700, marginLeft: 8 }}>${selected.price}</span>
              </div>
              <button onClick={() => setConfirming(true)} style={{ padding: "11px 28px", borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                Request Service →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirming && selected && (
        <ConfirmModal
          plan={selected}
          user={user}
          loading={loading}
          onConfirm={handleRequestService}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
