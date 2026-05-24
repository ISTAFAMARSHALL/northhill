// app/api/orders/activate-if-paid/route.js
//
// Called by the customer portal whenever it sees an "invoiced" order.
// Checks Wave payment status and, if paid, auto-activates the line
// without any admin involvement.
//
// Auth: user JWT — only the order's own user can trigger this.
// Idempotent: returns {alreadyActive:true} if already activated.

import { createClient }             from "@supabase/supabase-js";
import { NextResponse }             from "next/server";
import { createResellerLine }       from "@/lib/reseller";

export const maxDuration = 60;

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );
}

async function getWaveInvoiceStatus(invoiceId) {
  const res = await fetch("https://gql.waveapps.com/graphql/public", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WAVE_FULL_ACCESS_TOKEN}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      query: `
        query($businessId: ID!, $invoiceId: ID!) {
          business(id: $businessId) {
            invoice(id: $invoiceId) {
              id status lastViewedAt
              amountDue  { value }
              amountPaid { value }
              total      { value }
            }
          }
        }
      `,
      variables: {
        businessId: process.env.WAVE_BUSINESS_ID,
        invoiceId,
      },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map(e => e.message).join(", "));
  return json.data.business.invoice;
}

export async function POST(req) {
  // Verify caller is the order owner via their Supabase JWT
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = adminClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  // Fetch the order — must belong to this user
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Already active — nothing to do
  if (order.status === "active") {
    return NextResponse.json({ alreadyActive: true });
  }

  // No Wave invoice yet — payment not initiated
  if (!order.wave_invoice_id) {
    return NextResponse.json({ isPaid: false, reason: "no invoice" });
  }

  // Check Wave for payment status
  let invoice;
  try {
    invoice = await getWaveInvoiceStatus(order.wave_invoice_id);
  } catch (err) {
    console.error("[activate-if-paid] Wave check failed:", err.message);
    return NextResponse.json({ error: "Wave check failed", detail: err.message }, { status: 502 });
  }

  const isPaid = invoice?.status === "PAID" || parseFloat(invoice?.amountDue?.value) === 0;

  if (!isPaid) {
    return NextResponse.json({ isPaid: false, invoiceStatus: invoice?.status });
  }

  console.log("[activate-if-paid] Payment confirmed for order:", orderId, "— activating");

  // ── Create reseller line ──────────────────────────────────────────────
  const startDate = new Date().toISOString().split("T")[0];
  let credentials;
  try {
    credentials = await createResellerLine({
      planName:    order.plan_name,
      planTerm:    order.plan_term,
      connections: order.connections,
      startDate,
      description: `${order.plan_name} · ${order.plan_term} — ${order.user_email}`,
    });
  } catch (lineErr) {
    console.error("[activate-if-paid] Line creation failed:", lineErr.message);
    return NextResponse.json({ error: "Line creation failed", detail: lineErr.message }, { status: 500 });
  }

  const { iptvServerUrl, iptvUsername, iptvPassword, expiryDate } = credentials;

  // ── Save subscription ─────────────────────────────────────────────────
  await supabase.from("subscriptions").insert({
    user_id:          order.user_id,
    plan_name:        order.plan_name,
    plan_term:        order.plan_term,
    connections:      order.connections,
    status:           "active",
    start_date:       startDate,
    end_date:         expiryDate,
    iptv_server_url:  iptvServerUrl,
    iptv_username:    iptvUsername,
    iptv_password:    iptvPassword,
    reseller_line_id: iptvUsername,
  });

  // ── Mark order active ─────────────────────────────────────────────────
  await supabase.from("orders").update({ status: "active" }).eq("id", orderId);

  // ── Email customer credentials ────────────────────────────────────────
  const planLabel = order.plan_name.toLowerCase().includes(order.plan_term.toLowerCase())
    ? order.plan_name : `${order.plan_name} · ${order.plan_term}`;

  await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from:    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to:      order.user_email,
      subject: "✅ Your North Hill Systems service is active!",
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:2rem 1rem">
<tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,0.08)">
  <p style="font-family:Georgia,serif;font-size:18px;color:#fff;margin:0">North Hill Systems</p>
</td></tr>
<tr><td style="padding:2rem 0">
  <h2 style="color:#10b981;margin:0 0 0.5rem;font-family:Georgia,serif">Your service is live!</h2>
  <p style="color:#6b7280;margin:0 0 1.5rem;font-size:15px;line-height:1.6">
    Hi ${order.user_name || order.user_email}, your <strong style="color:#e8e8f0">${planLabel}</strong> subscription is now active.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:10px;margin-bottom:1.25rem">
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);width:35%">Server URL</td>
        <td style="padding:10px 1rem;color:#a78bfa;font-family:monospace;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvServerUrl}</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06)">Username</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-family:monospace;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvUsername}</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase">Password</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-family:monospace;font-size:13px">${iptvPassword}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;margin-bottom:1.5rem">
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);width:40%">Plan</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.06)">${planLabel}</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">Connections</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${order.connections} simultaneous stream${order.connections > 1 ? "s" : ""}</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">Start Date</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${startDate}</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:13px">Expires</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px">${expiryDate}</td></tr>
  </table>
  <table cellpadding="0" cellspacing="0" style="margin-bottom:1.5rem">
    <tr><td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:9px">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none">View My Account →</a>
    </td></tr>
  </table>
  <p style="font-size:14px;color:#6b7280;margin:0">Need help? Contact us at <a href="mailto:northhillsystems@gmail.com" style="color:#a78bfa">northhillsystems@gmail.com</a></p>
</td></tr>
<tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:1.25rem 0 0;text-align:center">
  <p style="font-size:12px;color:#374151;margin:0">© ${new Date().getFullYear()} North Hill Systems LLC. All rights reserved.</p>
</td></tr>
</table></td></tr></table></body></html>`,
    }),
  });

  console.log("[activate-if-paid] ✅ Activated:", iptvUsername);
  return NextResponse.json({
    activated:    true,
    iptvServerUrl,
    iptvUsername,
    iptvPassword,
    expiryDate,
  });
}
