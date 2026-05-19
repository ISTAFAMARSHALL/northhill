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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?trial=${isTrial}`,
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

  if (confirmEmail) {
    return (
      <div style={S.page}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem", justifyContent: "center" }}>
            <Image src="/logo.png" width={500} height={500} alt="North Hill Systems" style={{ height: 100, width: "auto" }} />
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

            <button type="submit" style={S.btn} disabled={loading}>
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
