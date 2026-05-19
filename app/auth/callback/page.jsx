"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

    const isTrial = new URLSearchParams(window.location.search).get("trial") === "true";

    createClient()
      .auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setStatus("Confirmation failed: " + error.message);
          setTimeout(() => { window.location.href = "/signup"; }, 3000);
        } else {
          window.location.href = isTrial ? "/plans?trial=true" : "/plans";
        }
      });
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <Image src="/logo.png" width={500} height={500} alt="North Hill Systems" style={{ height: 100, width: "auto" }} />
      <p style={{ color: "#9ca3af", fontSize: 15 }}>{status}</p>
    </div>
  );
}
