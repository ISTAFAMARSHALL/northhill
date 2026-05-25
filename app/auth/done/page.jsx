"use client";

// app/auth/done/page.jsx
//
// Landing page after any Supabase auth redirect:
//   - OAuth social logins (Google, Apple, Facebook) — PKCE code exchange
//   - Email confirmation links — implicit token in URL fragment
//
// After session is established the user is forwarded to `?next=` (default /portal).

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AuthDonePage() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function finish() {
      // Grab all search params from the URL
      const params = new URLSearchParams(window.location.search);
      const code   = params.get("code");
      const error  = params.get("error");
      const errorDesc = params.get("error_description");

      // Where to land after success
      const next = params.get("next") || "/portal";

      // ── OAuth / email-confirmation error from provider ───────────────
      if (error) {
        setStatus("error");
        setMessage(errorDesc || error);
        return;
      }

      // ── PKCE code exchange (OAuth & email-confirm with PKCE) ──────────
      if (code) {
        const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchErr) {
          setStatus("error");
          setMessage(exchErr.message);
          return;
        }
        window.location.replace(next);
        return;
      }

      // ── Implicit flow — token lives in the URL fragment (#access_token=…) ─
      // getSession() picks it up automatically from the fragment.
      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) {
        setStatus("error");
        setMessage(sessErr.message);
        return;
      }

      if (session) {
        window.location.replace(next);
        return;
      }

      // No code, no session — wait briefly for onAuthStateChange
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
        if (sess) {
          subscription.unsubscribe();
          window.location.replace(next);
        }
      });

      // Timeout fallback
      setTimeout(() => {
        setStatus("error");
        setMessage("Session not established. Please try signing in again.");
      }, 8000);
    }

    finish();
  }, []);

  if (status === "error") {
    return (
      <div style={{ fontFamily: "sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 48, marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "#ef4444", marginBottom: "0.75rem" }}>Sign-in failed</h2>
          <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: "1.5rem", lineHeight: 1.7 }}>{message}</p>
          <a
            href="/portal"
            style={{ display: "inline-block", padding: "11px 28px", borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", animation: "spin 0.8s linear infinite", margin: "0 auto 1.25rem" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: "#9ca3af", fontSize: 15 }}>Signing you in…</p>
      </div>
    </div>
  );
}
