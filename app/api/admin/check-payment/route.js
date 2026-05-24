// app/api/admin/check-payment/route.js
// Checks Wave for payment status.
// If paid, auto-creates the reseller line and activates the subscription.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse }                          from "next/server";
import { createResellerLine }                    from "@/lib/reseller";

export const maxDuration = 60;

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );
}

async function verifyAdmin(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user } } = await adminClient().auth.getUser(token);
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

async function getInvoiceStatus(invoiceId) {
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
      variables: { businessId: process.env.WAVE_BUSINESS_ID, invoiceId },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map(e => e.message).join(", "));
  return json.data.business.invoice;
}

export async function POST(req) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderId, waveInvoiceId } = await req.json();

    if (!waveInvoiceId) {
      return NextResponse.json({ error: "No Wave invoice ID on this order" }, { status: 400 });
    }

    const invoice = await getInvoiceStatus(waveInvoiceId);
    if (!invoice) return NextResponse.json({ error: "Invoice not found in Wave" }, { status: 404 });

    const isPaid = invoice.status === "PAID" || parseFloat(invoice.amountDue?.value) === 0;

    if (!isPaid) {
      return NextResponse.json({
        isPaid:     false,
        status:     invoice.status,
        amountPaid: invoice.amountPaid?.value,
        amountDue:  invoice.amountDue?.value,
        lastViewed: invoice.lastViewedAt,
      });
    }

    // ── Payment confirmed — fetch order ──────────────────────
    const supabase = adminClient();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      console.error("[check-payment] Order not found:", orderId, orderErr?.message);
      return NextResponse.json({ error: `Order not found: ${orderErr?.message}` }, { status: 404 });
    }

    if (order.status === "active") {
      return NextResponse.json({ isPaid: true, alreadyActivated: true, status: invoice.status });
    }

    // ── Auto-create reseller line ─────────────────────────────
    console.log(`[check-payment] Payment confirmed — auto-activating order ${orderId}`);

    const startDate   = new Date().toISOString().split("T")[0];
    const credentials = await createResellerLine({
      planName:    order.plan_name,
      planTerm:    order.plan_term,
      connections: order.connections,
      startDate,
      description: `${order.plan_name} · ${order.plan_term} — ${order.user_email}`,
    });

    const { iptvServerUrl, iptvUsername, iptvPassword, expiryDate } = credentials;

    // ── Save subscription ─────────────────────────────────────
    await supabase.from("subscriptions").insert({
      user_id:         order.user_id,
      plan_name:       order.plan_name,
      plan_term:       order.plan_term,
      connections:     order.connections,
      status:          "active",
      start_date:      startDate,
      end_date:        expiryDate,
      iptv_server_url: iptvServerUrl,
      iptv_username:   iptvUsername,
      iptv_password:   iptvPassword,
    });

    // ── Mark order active ─────────────────────────────────────
    await supabase.from("orders").update({ status: "active" }).eq("id", orderId);

    // ── Email customer credentials ────────────────────────────
    const planLabel = order.plan_name.toLowerCase().includes(order.plan_term.toLowerCase())
      ? order.plan_name : `${order.plan_name} · ${order.plan_term}`;

    await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to:      order.user_email,
        subject: "✅ Your North Hill Systems service is active!",
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
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
  <p style="font-size:14px;color:#6b7280;margin:0">
    Need help? Visit <a href="${process.env.NEXT_PUBLIC_SITE_URL}/setup" style="color:#a78bfa">northhillsystems.com/setup</a>
  </p>
</td></tr>
<tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:1.25rem 0 0;text-align:center">
  <p style="font-size:12px;color:#374151;margin:0">© ${new Date().getFullYear()} North Hill Systems LLC.</p>
</td></tr>
</table></td></tr></table></body></html>`,
      }),
    });

    console.log(`[check-payment] ✅ Auto-activated: ${iptvUsername}`);

    return NextResponse.json({
      isPaid:     true,
      activated:  true,
      status:     invoice.status,
      amountPaid: invoice.amountPaid?.value,
      credentials: { iptvServerUrl, iptvUsername, iptvPassword, expiryDate },
    });

  } catch (err) {
    console.error("check-payment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}