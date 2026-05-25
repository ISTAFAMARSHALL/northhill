"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

const S = {
  page:  { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" },
  card:  { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "2.25rem", width: "100%", maxWidth: 420 },
  label: { display: "block", fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 },
  input: { width: "100%", padding: "11px 14px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: "1rem" },
  btn:   { width: "100%", padding: "12px", borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer" },
  error: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: "1rem" },
};

export default function SignupPage() {
  const [fullName, setFullName]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");
  const [error, setError]               = useState("");
  const [confirmEmail, setConfirmEmail] = useState(false);
  const supabase = createClient();

  const isTrial = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("trial") === "true";

  const destination = isTrial ? "/plans?trial=true" : "/plans";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/done?next=${encodeURIComponent(destination)}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // session is present → email confirmation disabled, go straight
    if (data.session) {
      window.location.href = destination;
      return;
    }

    // session is null → Supabase sent a confirmation email
    setLoading(false);
    setConfirmEmail(true);
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    setError("");
    const redirectTo = `${window.location.origin}/auth/done?next=${encodeURIComponent(destination)}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) {
      setError(error.message);
      setOauthLoading("");
    }
  };

  const oauthBtnStyle = (name) => ({
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    width: "100%", padding: "11px 14px", borderRadius: 9,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#e8e8f0", fontSize: 14, fontWeight: 500, cursor: "pointer", boxSizing: "border-box",
    opacity: oauthLoading && oauthLoading !== name ? 0.5 : 1, marginBottom: "0.6rem",
  });

  if (confirmEmail) {
    return (
      <div style={S.page}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem", justifyContent: "center" }}>
            <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 100, width: "auto" }} />
          </div>
          <div style={S.card}>
            <div style={{ fontSize: 48, marginBottom: "1rem" }}>📬</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#fff", marginBottom: 8 }}>Check your inbox</h2>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              We sent a confirmation link to <strong style={{ color: "#e8e8f0" }}>{email}</strong>. Click it to verify your account, then come back.
            </p>
            <a href={destination} style={{ display: "block", padding: "12px", borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              {isTrial ? "I've confirmed — Request Trial →" : "I've confirmed — Pick a Plan →"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder{color:#4b5563}`}</style>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem", justifyContent: "center" }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⬡</div>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: "#fff" }}>North Hill Systems</span>
        </div>

        <div style={S.card}>
          {/* Header */}
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: "#fff", marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: "1.75rem", lineHeight: 1.6 }}>
            Get started in minutes. Pick your plan after signup.
          </p>

          {/* ── Social sign-up buttons ── */}
          <div style={{ marginBottom: "1.25rem" }}>
            <button style={oauthBtnStyle("google")} onClick={() => handleOAuth("google")} disabled={!!oauthLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {oauthLoading === "google" ? "Redirecting…" : "Sign up with Google"}
            </button>
            <button style={oauthBtnStyle("apple")} onClick={() => handleOAuth("apple")} disabled={!!oauthLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              {oauthLoading === "apple" ? "Redirecting…" : "Sign up with Apple"}
            </button>
            <button style={{ ...oauthBtnStyle("facebook"), marginBottom: 0 }} onClick={() => handleOAuth("facebook")} disabled={!!oauthLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {oauthLoading === "facebook" ? "Redirecting…" : "Sign up with Facebook"}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "#4b5563" }}>or create account with email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Steps indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "1.75rem" }}>
            {["Create Account", "Pick Plan", "Go Live"].map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.08)", border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: i === 0 ? "#fff" : "#4b5563", marginBottom: 4 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 10, color: i === 0 ? "#a78bfa" : "#4b5563", whiteSpace: "nowrap" }}>{step}</span>
                </div>
                {i < 2 && <div style={{ height: 1, background: "rgba(255,255,255,0.08)", flex: 1, marginBottom: 18, marginTop: -4 }} />}
              </div>
            ))}
          </div>

          {error && <div style={S.error}>{error}</div>}

          <form onSubmit={handleSignup}>
            <label style={S.label}>Full Name</label>
            <input
              type="text" required value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Smith" style={S.input}
            />

            <label style={S.label}>Email Address</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" style={S.input}
            />

            <label style={S.label}>Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters" style={S.input}
            />

            <label style={S.label}>Confirm Password</label>
            <input
              type="password" required value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              style={{ ...S.input, marginBottom: "1.5rem" }}
            />

            <button type="submit" style={S.btn} disabled={loading || !!oauthLoading}>
              {loading ? "Creating account…" : "Create Account & Pick Plan →"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#4b5563", marginTop: "1.25rem" }}>
            Already have an account?{" "}
            <a href="/portal" style={{ color: "#a78bfa", textDecoration: "none" }}>Sign in →</a>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#374151", marginTop: "1.25rem" }}>
          By creating an account you agree to our{" "}
          <a href="/terms" style={{ color: "#6b7280", textDecoration: "underline" }}>Terms of Service</a>
        </p>
      </div>
    </div>
  );
}
