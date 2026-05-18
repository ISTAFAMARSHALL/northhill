"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AuthCallback() {
  const [status, setStatus] = useState("Confirming your account…");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      setStatus("No confirmation code found. Redirecting…");
      setTimeout(() => { window.location.href = "/signup"; }, 2000);
      return;
    }

    createClient()
      .auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setStatus("Confirmation failed: " + error.message);
          setTimeout(() => { window.location.href = "/signup"; }, 3000);
        } else {
          window.location.href = "/plans";
        }
      });
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⬡</div>
      <p style={{ color: "#9ca3af", fontSize: 15 }}>{status}</p>
    </div>
  );
}
