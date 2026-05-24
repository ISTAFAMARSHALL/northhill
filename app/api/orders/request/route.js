// app/api/orders/request/route.js
// Fires when a customer selects a plan and confirms.
// 1. Checks trial limit (max 1 per user)
// 2. Saves a pending order to Supabase
// 3. Auto-activates free trials immediately via Puppeteer reseller automation
// 4. Creates Wave invoice for paid plans
// 5. Emails admin

import { createClient }                      from "@supabase/supabase-js";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse }                      from "next/server";
import { createWaveInvoice }                 from "@/lib/wave";
import { createResellerLine }                from "@/lib/reseller";

const TRIAL_LIMIT = 1;

function adminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );
}

export const maxDuration = 60; // seconds

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth:   { persistSession: false },
      }
    );

    const { planId, planName, planTerm, price, connections, userEmail, userName, userId } = await req.json();

    const isTrial  = planTerm?.toLowerCase() === "trial" || parseFloat(price) === 0;
    const today    = new Date().toISOString().split("T")[0];
    const supabase = adminSupabase();

    const planLabel = planName.toLowerCase().includes(planTerm.toLowerCase())
      ? planName : `${planName} · ${planTerm}`;

    // ── 1. Trial limit check ────────────────────────────────────
    if (isTrial) {
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("plan_term", "trial");

      if (existing && existing.length >= TRIAL_LIMIT) {
        return NextResponse.json({
          error:        "Trial limit reached",
          trialBlocked: true,
          message:      "You have already used your free trial. Please select a paid plan to continue.",
        }, { status: 403 });
      }
    }

    // ── 2. Save pending order ───────────────────────────────────
    const { data: order, error: dbError } = await supabaseUser
      .from("orders")
      .insert({ user_id: userId, plan_id: planId, plan_name: planName, plan_term: planTerm, connections, price, status: "pending", user_email: userEmail, user_name: userName })
      .select("id").single();

    if (dbError) throw new Error(dbError.message);
    const orderId = order.id;

    // ── 3. Auto-activate trials ─────────────────────────────────
    if (isTrial) {
      console.log(`[orders/request] Auto-activating trial for ${userEmail}...`);
      try {
        const { iptvServerUrl, iptvUsername, iptvPassword, expiryDate } = await createResellerLine({
          planName: "Trial", planTerm: "trial", connections: 1, startDate: today,
          description: `Trial — ${userEmail}`,
        });

        await supabase.from("subscriptions").insert({
          user_id: userId, plan_name: planName, plan_term: "trial", connections: 1,
          status: "active", start_date: today, end_date: expiryDate,
          iptv_server_url: iptvServerUrl, iptv_username: iptvUsername, iptv_password: iptvPassword,
        });

        await supabase.from("orders").update({ status: "active" }).eq("id", orderId);

        // Email customer
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: userEmail,
            subject: "🎉 Your North Hill Systems free trial is active!",
            html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:2rem 1rem">
<tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,0.08)">
  <p style="font-family:Georgia,serif;font-size:18px;color:#fff;margin:0">North Hill Systems</p>
</td></tr>
<tr><td style="padding:2rem 0">
  <h2 style="color:#10b981;margin:0 0 0.5rem;font-family:Georgia,serif">Your free trial is live!</h2>
  <p style="color:#6b7280;margin:0 0 1.5rem;font-size:15px;line-height:1.6">Hi ${userName || userEmail}, your 24-hour free trial is now active.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:10px;margin-bottom:1.25rem">
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);width:35%">Server URL</td>
        <td style="padding:10px 1rem;color:#a78bfa;font-family:monospace;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvServerUrl}</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06)">Username</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-family:monospace;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvUsername}</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase">Password</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-family:monospace;font-size:13px">${iptvPassword}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;margin-bottom:1.5rem">
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);width:40%">Trial Period</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.06)">24 hours</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:13px">Expires</td>
        <td style="padding:10px 1rem;color:#f59e0b;font-size:13px;font-weight:600">${expiryDate}</td></tr>
  </table>
  <p style="font-size:14px;color:#6b7280;margin:0 0 1rem">Need help? Visit <a href="${process.env.NEXT_PUBLIC_SITE_URL}/setup" style="color:#a78bfa">northhillsystems.com/setup</a></p>
  <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:1rem;margin-bottom:1.5rem">
    <p style="color:#10b981;font-weight:600;margin:0 0 4px">Love the service?</p>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 12px">Upgrade before your trial ends and keep watching.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/plans" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">View Plans →</a>
  </div>
</td></tr>
<tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:1.25rem 0 0;text-align:center">
  <p style="font-size:12px;color:#374151;margin:0">© ${new Date().getFullYear()} North Hill Systems LLC.</p>
</td></tr>
</table></td></tr></table></body></html>`,
          }),
        });

        // Notify admin
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL,
            subject: `🆕 Trial Activated — ${userName || userEmail}`,
            html: `<div style="font-family:sans-serif;max-width:520px;background:#0a0a0f;color:#e8e8f0;padding:2rem;border-radius:12px">
              <h2 style="color:#10b981">Free Trial Auto-Activated</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Customer</td><td style="color:#fff">${userName || userEmail}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="color:#a78bfa">${userEmail}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Username</td><td style="color:#e8e8f0;font-family:monospace">${iptvUsername}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Expires</td><td style="color:#f59e0b">${expiryDate}</td></tr>
              </table>
            </div>`,
          }),
        });

        console.log(`[orders/request] ✅ Trial activated: ${iptvUsername}`);
        return NextResponse.json({ success: true, activated: true });

      } catch (activationErr) {
        console.error("[orders/request] Trial activation failed:", activationErr.message);
        await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
        return NextResponse.json({ success: true, activated: false, activationError: activationErr.message });
      }
    }

    // ── 4. Wave invoice for paid plans ──────────────────────────
    let waveInvoiceUrl = null, waveInvoiceId = null, waveError = null;
    try {
      const wave = await createWaveInvoice({ userName, userEmail, planName: planLabel, planTerm, price, startDate: today });
      waveInvoiceUrl = wave.invoiceUrl;
      waveInvoiceId  = wave.invoiceId;
      await supabase.from("orders").update({ status: "invoiced", wave_invoice_url: waveInvoiceUrl, wave_invoice_id: waveInvoiceId }).eq("id", orderId);
    } catch (waveErr) {
      waveError = waveErr.message;
      console.error("[orders/request] Wave invoice failed:", waveErr.message);
    }

    // ── 5. Notify admin ─────────────────────────────────────────
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL,
        subject: `🆕 New Order — ${userName || userEmail} · ${planLabel}`,
        html: `<div style="font-family:sans-serif;max-width:520px;background:#0a0a0f;color:#e8e8f0;padding:2rem;border-radius:12px">
          <h2 style="color:#a78bfa">New Service Order</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Name</td><td style="color:#fff;font-weight:600">${userName || "Not provided"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Email</td><td style="color:#a78bfa">${userEmail}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Plan</td><td style="color:#fff;font-weight:600">${planLabel}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Amount</td><td style="color:#10b981;font-size:18px;font-weight:700">$${price}</td></tr>
          </table>
          <div style="margin-top:1.5rem;padding:1rem;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:8px">
            <p style="margin:0;font-size:13px;color:#9ca3af">${waveInvoiceUrl ? `✅ Invoice sent ($${price})` : `⚠️ Wave failed: ${waveError}`}</p>
            ${waveInvoiceUrl ? `<a href="${waveInvoiceUrl}" style="color:#a78bfa;font-size:13px">View Invoice →</a>` : ""}
          </div>
        </div>`,
      }),
    });

    return NextResponse.json({ success: true, waveInvoiceUrl, waveError: waveError ?? undefined });

  } catch (err) {
    console.error("Order request error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}