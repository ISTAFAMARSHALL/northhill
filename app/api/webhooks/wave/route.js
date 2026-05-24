
// app/api/webhooks/wave/route.js
//
// Listens for Wave payment events.
// When an invoice is paid, finds the matching renewal_invoice in Supabase,
// extends the reseller line, updates the subscription, and emails the customer.
//
// Required env vars:
//   WAVE_WEBHOOK_SECRET    — from Wave dashboard → Settings → Webhooks
//   RESELLER_USERNAME
//   RESELLER_PASSWORD
//   RESELLER_SERVER_URL
//   RESEND_API_KEY
//   RESEND_FROM_EMAIL
//   NEXT_PUBLIC_SITE_URL
 
import { NextResponse }                    from "next/server";
import { createClient as createSupabase }  from "@supabase/supabase-js";
import { extendResellerLine }              from "@/lib/reseller";
import crypto                              from "crypto";
 
function adminClient() {
  return createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );
}
 
// ── Verify Wave webhook signature ─────────────────────────
function verifySignature(rawBody, signature) {
  const secret = process.env.WAVE_WEBHOOK_SECRET;
  if (!secret) return true; // skip if not configured yet
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ""));
}
 
export async function POST(req) {
  const rawBody  = await req.text();
  const signature = req.headers.get("x-wave-signature") || "";
 
  if (!verifySignature(rawBody, signature)) {
    console.warn("[wave-webhook] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
 
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
 
  console.log("[wave-webhook] Received event:", event.type || event.event_type);
 
  // Only handle invoice payment events
  const eventType  = event.type || event.event_type || "";
  const invoiceData = event.data?.invoice || event.invoice || {};
  const waveInvoiceId = invoiceData.id || event.data?.id;
 
  if (!eventType.includes("invoice") || !eventType.includes("paid")) {
    return NextResponse.json({ received: true, skipped: "not a paid invoice event" });
  }
 
  if (!waveInvoiceId) {
    return NextResponse.json({ received: true, skipped: "no invoice id" });
  }
 
  console.log("[wave-webhook] Invoice paid:", waveInvoiceId);
 
  const supabase = adminClient();
 
  // ── 1. Look up renewal_invoices for this Wave invoice ────
  const { data: renewal, error: renewalErr } = await supabase
    .from("renewal_invoices")
    .select("*, subscriptions(*)")
    .eq("wave_invoice_id", waveInvoiceId)
    .single();
 
  if (renewalErr || !renewal) {
    // Could be an initial order invoice — check orders table
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("wave_invoice_id", waveInvoiceId)
      .single();
 
    if (order && order.status === "invoiced") {
      // Mark order as paid — admin still clicks Activate for initial orders
      await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
      console.log("[wave-webhook] Initial order marked as paid:", order.id);
      return NextResponse.json({ received: true, action: "order_marked_paid" });
    }
 
    console.log("[wave-webhook] No matching renewal or order found for invoice:", waveInvoiceId);
    return NextResponse.json({ received: true, skipped: "no matching record" });
  }
 
  const sub = renewal.subscriptions;
  if (!sub) {
    console.error("[wave-webhook] Renewal found but subscription missing");
    return NextResponse.json({ error: "subscription not found" }, { status: 500 });
  }
 
  // ── 2. Extend reseller line ───────────────────────────────
  let newExpiryDate;
  try {
    const result = await extendResellerLine({
      lineId:         sub.reseller_line_id,
      planTerm:       sub.plan_term,
      currentEndDate: sub.end_date,
    });
    newExpiryDate = result.newExpiryDate;
    console.log("[wave-webhook] Line extended to:", newExpiryDate);
  } catch (err) {
    console.error("[wave-webhook] Line extension failed:", err.message);
    // Don't fail the webhook — still update Supabase so admin can fix manually
    newExpiryDate = null;
  }
 
  // ── 3. Update subscription end date in Supabase ──────────
  if (newExpiryDate) {
    const { error: updateErr } = await supabase
      .from("subscriptions")
      .update({ end_date: newExpiryDate, status: "active" })
      .eq("id", sub.id);
 
    if (updateErr) console.error("[wave-webhook] Supabase update failed:", updateErr.message);
  }
 
  // ── 4. Mark renewal invoice as paid ──────────────────────
  await supabase
    .from("renewal_invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", renewal.id);
 
  // ── 5. Email customer renewal confirmation ────────────────
  const customerEmail = sub.user_email || renewal.user_email;
  if (customerEmail && newExpiryDate) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to:      customerEmail,
        subject: "✅ Your North Hill Systems subscription has been renewed",
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:2rem 1rem">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
    <tr><td style="padding-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,0.08)">
      <p style="font-family:Georgia,serif;font-size:18px;color:#fff;margin:0">North Hill Systems</p>
    </td></tr>
    <tr><td style="padding:2rem 0">
      <h2 style="color:#10b981;margin:0 0 0.75rem;font-family:Georgia,serif;font-size:22px">Subscription Renewed!</h2>
      <p style="color:#9ca3af;margin:0 0 1.5rem;font-size:15px;line-height:1.6">
        Your <strong style="color:#e8e8f0">${sub.plan_name} · ${sub.plan_term}</strong> subscription has been renewed successfully.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:10px;margin-bottom:1.5rem">
        <tr>
          <td style="padding:10px 1rem;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);width:40%">Plan</td>
          <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.06)">${sub.plan_name} · ${sub.plan_term}</td>
        </tr>
        <tr>
          <td style="padding:10px 1rem;color:#6b7280;font-size:13px">New Expiry</td>
          <td style="padding:10px 1rem;color:#10b981;font-size:13px;font-weight:600">${newExpiryDate}</td>
        </tr>
      </table>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 1rem">Your streaming credentials remain the same — no changes needed in your app.</p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:9px">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal" style="display:inline-block;padding:11px 24px;font-size:14px;font-weight:600;color:#fff;text-decoration:none">View My Account →</a>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:1.25rem 0 0;text-align:center">
      <p style="font-size:12px;color:#374151;margin:0">© ${new Date().getFullYear()} North Hill Systems LLC. All rights reserved.</p>
    </td></tr>
  </table>
  </td></tr>
</table>
</body></html>`,
      }),
    });
    console.log("[wave-webhook] Renewal confirmation emailed to:", customerEmail);
  }
 
  return NextResponse.json({ received: true, action: "renewal_processed", newExpiryDate });
}