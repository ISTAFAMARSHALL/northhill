"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function daysRemaining(endDate) {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
}

function statusColor(status) {
  if (status === "active")  return { bg: "rgba(16,185,129,0.15)",  color: "#10b981", label: "Active"    };
  if (status === "trial")   return { bg: "rgba(96,165,250,0.15)",   color: "#60a5fa", label: "Trial"     };
  if (status === "expired") return { bg: "rgba(239,68,68,0.15)",    color: "#ef4444", label: "Expired"   };
  return                           { bg: "rgba(156,163,175,0.15)",  color: "#9ca3af", label: "Suspended" };
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const S = {
  page:       { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0" },
  card:       { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.75rem" },
  label:      { fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  value:      { fontSize: 16, color: "#e8e8f0", fontWeight: 500 },
  input:      { width: "100%", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 15, outline: "none", marginBottom: "1rem", boxSizing: "border-box" },
  btnPrimary: { background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", width: "100%" },
  error:      { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: "1rem" },
};

// ─────────────────────────────────────────
// Add Subscription Confirmation Modal
// ─────────────────────────────────────────
function AddSubscriptionModal({ activeCount, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ ...S.card, width: "100%", maxWidth: 460, padding: "2rem" }}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: "1rem" }}>➕</div>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: "#fff", textAlign: "center", marginBottom: "0.75rem" }}>
          Add Another Subscription?
        </h2>
        <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          You currently have <strong style={{ color: "#fff" }}>{activeCount} active subscription{activeCount !== 1 ? "s" : ""}</strong>. 
          You are about to order an additional line. Each subscription is billed and managed separately.
        </p>
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, padding: "0.9rem 1.1rem", marginBottom: "1.5rem", fontSize: 13, color: "#fbbf24", lineHeight: 1.6 }}>
          ⚠️ Confirming will take you to the plan selection screen where you can choose and request your additional subscription.
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onCancel}
            className="modal-cancel" style={{ flex: 1, padding: "11px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="modal-confirm" style={{ flex: 2, padding: "11px", borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s ease" }}
          >
            Yes, Add Another Line →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Login Screen
// ─────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLogin();
    setLoading(false);
  };

  return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box}
        .portal-nav-link:hover { color: #e8e8f0 !important; }
        .portal-cta:hover { opacity: 0.88; transform: scale(1.01); }
        .portal-ghost:hover { background: rgba(255,255,255,0.1) !important; color: #e8e8f0 !important; }
        .portal-add-btn:hover { background: rgba(124,58,237,0.25) !important; border-color: rgba(124,58,237,0.6) !important; }
        .portal-support:hover { opacity: 0.88; }
        .portal-copy-btn:hover { background: rgba(255,255,255,0.12) !important; color: #e8e8f0 !important; }
        .portal-toggle-btn:hover { background: rgba(255,255,255,0.12) !important; color: #e8e8f0 !important; }
        .portal-signout:hover { background: rgba(255,255,255,0.1) !important; color: #e8e8f0 !important; }
        .portal-renew-link:hover { color: #f87171 !important; }
        .modal-cancel:hover { background: rgba(255,255,255,0.1) !important; }
        .modal-confirm:hover { opacity: 0.88; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "-4rem", justifyContent: "center" }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 300, width: "auto" }} />
        </div>
        <div style={{ ...S.card, padding: "2.25rem" }}>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: "#fff", marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: "1.75rem" }}>Sign in to view your subscription</p>
          {error && <div style={S.error}>{error}</div>}
          <form onSubmit={handleLogin}>
            <label style={S.label}>Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={S.input} />
            <label style={S.label}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...S.input, marginBottom: "1.5rem" }} />
            <button type="submit" className="login-submit" style={{ ...S.btnPrimary, transition: "opacity 0.15s ease" }} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <Link href="/" className="login-back" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", transition: "color 0.15s ease" }}>← Back to home</Link>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: "#4b5563", marginTop: "1.5rem" }}>
          {"Don't have an account?"}
          <Link href="/#pricing" className="login-plans" style={{ color: "#a78bfa", textDecoration: "none", transition: "color 0.15s ease" }}>View plans →</Link>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Single Subscription Card
// ─────────────────────────────────────────
function SubscriptionCard({ subscription, index }) {
  const [showPassword, setShowPassword] = useState(false);
  const days   = daysRemaining(subscription?.end_date);
  const status = statusColor(subscription?.status || "active");

  return (
    <div style={{ display: "grid", gap: "1.25rem", marginBottom: "1.5rem" }}>

      {/* Expiry warnings */}
      {days !== null && days <= 14 && days > 0 && (
        <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 14, color: "#fbbf24" }}>
            Subscription {index + 1} expires in <strong>{days} day{days !== 1 ? "s" : ""}</strong>. Contact us to renew.
          </span>
        </div>
      )}
      {days !== null && days <= 0 && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔴</span>
          <span style={{ fontSize: 14, color: "#ef4444" }}>Subscription {index + 1} has expired. <a href="/#pricing" className="portal-renew-link" style={{ color: "#ef4444", fontWeight: 600, transition: "color 0.15s ease" }}>Renew now →</a></span>
        </div>
      )}

      {/* Plan info */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <p style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Subscription {index + 1}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
              {subscription.plan_name}{" "}
              <span style={{ fontSize: 14, fontWeight: 400, color: "#9ca3af", textTransform: "capitalize" }}>· {subscription.plan_term}</span>
            </p>
          </div>
          <div style={{ background: status.bg, color: status.color, fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 20 }}>
            {status.label}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1.25rem" }}>
          <div>
            <p style={S.label}>Connections</p>
            <p style={S.value}>{subscription.connections} simultaneous stream{subscription.connections !== 1 ? "s" : ""}</p>
          </div>
          <div>
            <p style={S.label}>Start Date</p>
            <p style={S.value}>{fmt(subscription.start_date)}</p>
          </div>
          <div>
            <p style={S.label}>Expiry Date</p>
            <p style={{ ...S.value, color: days !== null && days <= 7 ? "#ef4444" : "#e8e8f0" }}>
              {fmt(subscription.end_date)}
              {days !== null && days > 0 && (
                <span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280" }}>({days}d left)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Credentials */}
      <div style={S.card}>
        <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: "#fff", marginBottom: "1.25rem" }}>
          Streaming Credentials — Line {index + 1}
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Use these details to configure TiviMate, IPTV Smarters, Perfect Player, or any other IPTV app.
        </p>
        <div style={{ display: "grid", gap: "1rem" }}>
          <CredentialRow label="Server URL" value={subscription.iptv_server_url} canCopy />
          <CredentialRow label="Username"   value={subscription.iptv_username}   canCopy />
          <CredentialRow
            label="Password"
            value={subscription.iptv_password}
            canCopy
            masked={!showPassword}
            onToggleMask={() => setShowPassword(p => !p)}
            showToggle
          />
        </div>
        <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0", marginBottom: 2 }}>Need help setting up?</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>Step-by-step guide for TiviMate, TiviMax, and IPTV Smarters.</p>
          </div>
          <a href="/setup" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all 0.15s ease", whiteSpace: "nowrap" }}>
            📺 Setup Guide →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Dashboard Screen
// ─────────────────────────────────────────
function Dashboard({ user, subscriptions, pendingOrders = [], activatingOrder = false, onLogout }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const activeCount = subscriptions.filter(s => s.status === "active" || s.status === "trial").length;

  const handleAddConfirm = () => {
    setShowAddModal(false);
    // Route to pricing with a flag so buttons are active
    window.location.href = "/plans?addline=true";
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box}
        .cta-btn  { transition: all 0.15s ease; cursor: pointer; border: none; }
        .portal-nav-link:hover { color: #e8e8f0 !important; }
        .portal-cta:hover { opacity: 0.88; transform: scale(1.01); }
        .portal-ghost:hover { background: rgba(255,255,255,0.1) !important; color: #e8e8f0 !important; }
        .portal-add-btn:hover { background: rgba(124,58,237,0.25) !important; border-color: rgba(124,58,237,0.6) !important; }
        .portal-support:hover { opacity: 0.88; }
        .portal-copy-btn:hover { background: rgba(255,255,255,0.12) !important; color: #e8e8f0 !important; }
        .portal-toggle-btn:hover { background: rgba(255,255,255,0.12) !important; color: #e8e8f0 !important; }
        .portal-signout:hover { background: rgba(255,255,255,0.1) !important; color: #e8e8f0 !important; }
        .portal-renew-link:hover { color: #f87171 !important; }
        .modal-cancel:hover { background: rgba(255,255,255,0.1) !important; }
        .dl-btn:hover{opacity:0.88} .support-btn:hover{opacity:0.88}
        .modal-confirm:hover { opacity: 0.88; }
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-logo-wrap img { height: 150px !important; width: auto !important; }
          .nav-logo-wrap span { height: 44px !important; width: auto !important; }
        }
      `}</style>

      {/* NAV — always fully active */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 80, padding: "0 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <div className="nav-logo-wrap" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 250, width: "auto" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>{user?.email}</span>
          <a href="/setup" className="nav-link" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", transition: "color 0.15s ease" }}>Setup</a>
          <button className="dl-btn" onClick={onLogout} style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:600, textDecoration:"none", transition:"opacity 0.15s" }}>
            Sign out
          </button>
        </div>
      </nav>
      
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.6rem,3vw,2rem)", color: "#fff", marginBottom: "0.4rem" }}>
              My Subscriptions
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              {subscriptions.length > 0
                ? `${subscriptions.length} subscription${subscriptions.length !== 1 ? "s" : ""} on your account`
                : "Your plan details and streaming credentials"}
            </p>
          </div>
          {/* Add subscription button — only shown when user has at least one sub */}
          {activeCount > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="cta-btn" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa", padding: "10px 20px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease" }}
            >
              + Get Additional Subscription
            </button>
          )}
        </div>

        {/* ── Pending payment banner ─────────────────────────────── */}
        {(pendingOrders.length > 0 || activatingOrder) && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: 20 }}>{activatingOrder ? "⚙️" : "⏳"}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", margin: 0 }}>
                {activatingOrder ? "Activating your subscription…" : "Payment received — setting up your account"}
              </p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                {activatingOrder
                  ? "Creating your streaming line — this takes about 30 seconds."
                  : "We found your payment. Refresh this page in a moment to see your credentials."}
              </p>
            </div>
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div style={{ ...S.card, textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: 40, marginBottom: "1rem" }}>📺</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: "#fff", marginBottom: "0.5rem" }}>{"You're not streaming yet"}</h2>
            <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.7, marginBottom: "1.5rem", maxWidth: 340, margin: "0 auto 1.5rem" }}>
              {"Pick a plan and get your credentials in your inbox — usually within 15 minutes."}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/#pricing" className="portal-cta" style={{ display: "inline-block", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "11px 28px", borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 0.15s ease" }}>
                View Plans →
              </Link>
              <a href="/plans?trial=true" className="portal-cta" style={{ display: "inline-block", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "11px 28px", borderRadius: 9, fontSize: 14, textDecoration: "none", transition: "all 0.15s ease" }}>
                Try Free for 24hrs
              </a>
            </div>
          </div>
        ) : (
          <>
            {subscriptions.map((sub, i) => (
              <SubscriptionCard key={sub.id} subscription={sub} index={i} />
            ))}

            {/* Bottom CTA */}
            <div style={{ ...S.card, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginTop: "0.5rem" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Need to renew or upgrade?</p>
                <p style={{ fontSize: 13, color: "#9ca3af" }}>Contact us and we'll get you sorted within minutes.</p>
              </div>
              <a href="mailto:northhillsystems@gmail.com" className="portal-support" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "10px 24px", borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", transition: "opacity 0.15s ease" }}>
                Contact Support →
              </a>
            </div>
          </>
        )}
      </div>

      {/* Add subscription confirmation modal */}
      {showAddModal && (
        <AddSubscriptionModal
          activeCount={activeCount}
          onConfirm={handleAddConfirm}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Credential Row
// ─────────────────────────────────────────
function CredentialRow({ label, value, canCopy, masked, onToggleMask, showToggle }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "0.9rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{label}</p>
        <p style={{ fontSize: 14, color: "#e8e8f0", fontFamily: "'DM Sans',monospace", wordBreak: "break-all" }}>
          {masked ? "••••••••••" : (value || "Not set")}
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {showToggle && (
          <button onClick={onToggleMask} className="portal-toggle-btn" style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "#9ca3af", padding: "6px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", transition: "all 0.15s ease" }}>
            {masked ? "Show" : "Hide"}
          </button>
        )}
        {canCopy && (
          <button onClick={handleCopy} className="portal-copy-btn" style={{ background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.07)", border: "none", color: copied ? "#10b981" : "#9ca3af", padding: "6px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main export
// ─────────────────────────────────────────
export default function CustomerPortal() {
  const [user,            setUser]            = useState(null);
  const [subscriptions,   setSubscriptions]   = useState([]);
  const [pendingOrders,   setPendingOrders]   = useState([]);
  const [activatingOrder, setActivatingOrder] = useState(false);
  const [loading,         setLoading]         = useState(true);
  const supabase = createClient();

  const fetchSubscriptions = async (userId) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setSubscriptions(data || []);
  };

  const fetchOrders = async (userId) => {
    const { data } = await supabase
      .from("orders")
      .select("id, status, wave_invoice_id, wave_invoice_url, plan_name, plan_term")
      .eq("user_id", userId)
      .eq("status", "invoiced")
      .not("wave_invoice_id", "is", null);
    setPendingOrders(data || []);
  };

  // Auto-check invoiced orders for payment and activate if paid.
  // Runs once when the portal loads — fires silently in the background.
  const checkAndActivatePending = async (session, invoicedOrders) => {
    if (!invoicedOrders || invoicedOrders.length === 0) return;
    setActivatingOrder(true);
    for (const order of invoicedOrders) {
      try {
        const res  = await fetch("/api/orders/activate-if-paid", {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ orderId: order.id }),
        });
        const data = await res.json();
        if (data.activated) {
          // Refresh subscriptions so credentials appear immediately
          await fetchSubscriptions(session.user.id);
          await fetchOrders(session.user.id);
        }
      } catch (_) {
        // Silent — cron will catch any failures
      }
    }
    setActivatingOrder(false);
  };

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchSubscriptions(session.user.id);
        await fetchOrders(session.user.id);
        setLoading(false);
        // Auto-check invoiced orders after data loads
        const { data: invoiced } = await supabase
          .from("orders")
          .select("id, wave_invoice_id")
          .eq("user_id", session.user.id)
          .eq("status", "invoiced")
          .not("wave_invoice_id", "is", null);
        if (invoiced?.length) checkAndActivatePending(session, invoiced);
      } else {
        setUser(null);
        setSubscriptions([]);
        setPendingOrders([]);
        setLoading(false);
      }
    });
    return () => authSub.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "#6b7280" }}>Loading…</div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={() => {}} />;

  return (
    <Dashboard
      user={user}
      subscriptions={subscriptions}
      pendingOrders={pendingOrders}
      activatingOrder={activatingOrder}
      onLogout={handleLogout}
    />
  );
}
