// app/api/orders/request/route.js
// Fires when a customer selects a plan and confirms.
// 1. Saves a pending order to Supabase
// 2. Emails you (the admin) with full order details

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error("Missing Supabase env vars in .env.local");
    }

    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth:   { persistSession: false },
    });

    const body = await req.json();
    const {
      planId, planName, planTerm, price,
      connections, userEmail, userName, userId,
    } = body;

    // ── Fix: clean plan label so "Free Trial · trial" never appears ──
    // Only append planTerm if it isn't already part of planName
    const planLabel = planName.toLowerCase().includes(planTerm.toLowerCase())
      ? planName
      : `${planName} · ${planTerm}`;

    // ── 1. Save pending order to Supabase ──────────────────────
    const { error: dbError } = await supabase
      .from("orders")
      .insert({
        user_id:    userId,
        plan_id:    planId,
        plan_name:  planName,
        plan_term:  planTerm,
        connections,
        price,
        status:     "pending",
        user_email: userEmail,
        user_name:  userName,
      });

    if (dbError) throw new Error(dbError.message);

    // ── 2. Send notification email to admin ────────────────────
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to:      process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL,
        subject: `🆕 New Service Request — ${userName || userEmail} · ${planLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#e8e8f0;padding:2rem;border-radius:12px">
            <h2 style="color:#a78bfa;margin-bottom:0.5rem">New Service Request</h2>
            <p style="color:#6b7280;margin-bottom:1.5rem">A customer has selected a plan and is ready to be invoiced.</p>

            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Name</td>        <td style="padding:8px 0;color:#fff;font-weight:600">${userName || "Not provided"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Email</td>       <td style="padding:8px 0;color:#a78bfa">${userEmail}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Plan</td>        <td style="padding:8px 0;color:#fff;font-weight:600">${planLabel}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Connections</td> <td style="padding:8px 0;color:#fff">${connections}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Amount</td>      <td style="padding:8px 0;color:#10b981;font-size:18px;font-weight:700">$${price}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">User ID</td>     <td style="padding:8px 0;color:#4b5563;font-size:12px">${userId}</td></tr>
            </table>

            <div style="margin-top:1.5rem;padding:1rem;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:8px">
              <p style="margin:0;font-size:13px;color:#9ca3af"><strong style="color:#fff">Next steps:</strong></p>
              <ol style="margin:0.5rem 0 0;padding-left:1.25rem;font-size:13px;color:#9ca3af;line-height:1.8">
                <li>Send a Wave invoice to ${userEmail} for $${price}</li>
                <li>Once paid, create their IPTV credentials in your reseller panel</li>
                <li>Enter credentials in your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="color:#a78bfa">Admin Panel</a></li>
                <li>Customer will see credentials in their portal automatically</li>
              </ol>
            </div>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      console.error("Email send failed:", await emailRes.text());
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Order request error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}