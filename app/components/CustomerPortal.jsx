"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

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
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function statusColor(status) {
  if (status === "active")  return { bg: "rgba(16,185,129,0.15)", color: "#10b981", label: "Active" };
  if (status === "trial")   return { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa", label: "Trial" };
  if (status === "expired") return { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", label: "Expired" };
  return { bg: "rgba(156,163,175,0.15)", color: "#9ca3af", label: "Suspended" };
}

// ─────────────────────────────────────────
// Shared styles
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
// Login Screen
// ─────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem", justifyContent: "center" }}>
          <img src="/logo.png" alt="North Hill Systems" style={{ height: 52, width: "auto" }} />
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
            <button type="submit" style={S.btnPrimary} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <a href="/" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>← Back to home</a>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#4b5563", marginTop: "1.5rem" }}>
          Don't have an account?{" "}
          <a href="/#pricing" style={{ color: "#a78bfa", textDecoration: "none" }}>View plans →</a>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Dashboard Screen
// ─────────────────────────────────────────
function Dashboard({ user, subscription, onLogout }) {
  const [showPassword, setShowPassword] = useState(false);
  const days   = daysRemaining(subscription?.end_date);
  const status = statusColor(subscription?.status || "active");

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}`}</style>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.95)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="North Hill Systems" style={{ height: 52, width: "auto" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>{user?.email}</span>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "7px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.6rem,3vw,2rem)", color: "#fff", marginBottom: "0.4rem" }}>
          My Subscription
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: "2.5rem" }}>
          Your current plan details and streaming credentials
        </p>

        {!subscription ? (
          <div style={{ ...S.card, textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: 40, marginBottom: "1rem" }}>📭</div>
            <p style={{ color: "#9ca3af", fontSize: 15 }}>No active subscription found.</p>
            <a href="/#pricing" style={{ display: "inline-block", marginTop: "1.25rem", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "10px 24px", borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              View Plans
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.25rem" }}>

            {days !== null && days <= 14 && days > 0 && (
              <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span style={{ fontSize: 14, color: "#fbbf24" }}>
                  Your subscription expires in <strong>{days} day{days !== 1 ? "s" : ""}</strong>. Contact us to renew and avoid interruption.
                </span>
              </div>
            )}
            {days !== null && days <= 0 && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🔴</span>
                <span style={{ fontSize: 14, color: "#ef4444" }}>Your subscription has expired. <a href="/#pricing" style={{ color: "#ef4444", fontWeight: 600 }}>Renew now →</a></span>
              </div>
            )}

            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <p style={S.label}>Current Plan</p>
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

            <div style={S.card}>
              <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: "#fff", marginBottom: "1.25rem" }}>
                Streaming Credentials
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
            </div>

            <div style={{ ...S.card, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Need to renew or upgrade?</p>
                <p style={{ fontSize: 13, color: "#9ca3af" }}>Contact us and we'll get you sorted within minutes.</p>
              </div>
              <a href="/#pricing" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "10px 24px", borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                View Plans →
              </a>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Credential Row component
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
          <button onClick={onToggleMask} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "#9ca3af", padding: "6px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>
            {masked ? "Show" : "Hide"}
          </button>
        )}
        {canCopy && (
          <button onClick={handleCopy} style={{ background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.07)", border: "none", color: copied ? "#10b981" : "#9ca3af", padding: "6px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main export — orchestrates auth state
// ─────────────────────────────────────────
export default function CustomerPortal() {
  const [user, setUser]                 = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading]           = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // onAuthStateChange fires synchronously with INITIAL_SESSION on subscribe,
    // passing the session already in storage — no separate getSession() needed.
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchSubscription(session.user.id);
      } else {
        setUser(null);
        setSubscription(null);
        setLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  const fetchSubscription = async (userId) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    setSubscription(data || null);
    setLoading(false);
  };

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

  // onAuthStateChange handles the SIGNED_IN event automatically after login
  if (!user) return <LoginScreen onLogin={() => {}} />;

  return <Dashboard user={user} subscription={subscription} onLogout={handleLogout} />;
}
