// app/api/cron/activate-paid-orders/route.js
//
// Sweeps all "invoiced" orders, checks Wave for payment, and activates
// any that have been paid. Runs every 5 minutes via Vercel cron (Pro plan)
// or can be triggered manually at /api/cron/activate-paid-orders.
//
// This is the fallback for customers who don't return to the portal after
// paying — the portal's /api/orders/activate-if-paid handles the fast path.
//
// Protected by CRON_SECRET (same as renewal-invoices cron).

import { createClient as createSupabase } from "@supabase/supabase-js";
import { NextResponse }                   from "next/server";
import { createResellerLine }             from "@/lib/reseller";

export const maxDuration = 60;

function adminClient() {
  return createSupabase(
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
              id status
              amountDue { value }
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

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = adminClient();

  // Find all orders waiting on payment (have a Wave invoice but aren't active yet)
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "invoiced")
    .not("wave_invoice_id", "is", null);

  if (error) {
    console.error("[cron/activate-paid] Supabase query failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    console.log("[cron/activate-paid] No invoiced orders to check");
    return NextResponse.json({ ok: true, checked: 0 });
  }

  console.log(`[cron/activate-paid] Checking ${orders.length} invoiced order(s)`);

  const activated = [];
  const skipped   = [];
  const failed    = [];

  for (const order of orders) {
    try {
      const invoice = await getWaveInvoiceStatus(order.wave_invoice_id);
      const isPaid  = invoice?.status === "PAID" || parseFloat(invoice?.amountDue?.value) === 0;

      if (!isPaid) {
        skipped.push({ orderId: order.id, status: invoice?.status });
        continue;
      }

      console.log("[cron/activate-paid] Paid — activating order:", order.id);

      const startDate   = new Date().toISOString().split("T")[0];
      const credentials = await createResellerLine({
        planName:    order.plan_name,
        planTerm:    order.plan_term,
        connections: order.connections,
        startDate,
        description: `${order.plan_name} · ${order.plan_term} — ${order.user_email}`,
      });

      const { iptvServerUrl, iptvUsername, iptvPassword, expiryDate } = credentials;

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

      await supabase.from("orders").update({ status: "active" }).eq("id", order.id);

      // Email customer
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
    Hi ${order.user_name || order.user_email}, your <strong style="color:#e8e8f0">${planLabel}</strong> subscription is now active. Here are your streaming credentials:
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:10px;margin-bottom:1.25rem">
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06);width:35%">Server URL</td>
        <td style="padding:10px 1rem;color:#a78bfa;font-family:monospace;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvServerUrl}</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.06)">Username</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-family:monospace;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvUsername}</td></tr>
    <tr><td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase">Password</td>
        <td style="padding:10px 1rem;color:#e8e8f0;font-family:monospace;font-size:13px">${iptvPassword}</td></tr>
  </table>
  <table cellpadding="0" cellspacing="0" style="margin-bottom:1.5rem">
    <tr><td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:9px">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none">View My Account →</a>
    </td></tr>
  </table>
</td></tr>
<tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:1.25rem 0 0;text-align:center">
  <p style="font-size:12px;color:#374151;margin:0">© ${new Date().getFullYear()} North Hill Systems LLC.</p>
</td></tr>
</table></td></tr></table></body></html>`,
        }),
      });

      activated.push({ orderId: order.id, iptvUsername });
      console.log("[cron/activate-paid] ✅ Activated:", iptvUsername);

    } catch (err) {
      console.error("[cron/activate-paid] Failed for order", order.id, ":", err.message);
      failed.push({ orderId: order.id, error: err.message });
    }
  }

  console.log(`[cron/activate-paid] Done — activated: ${activated.length}, skipped: ${skipped.length}, failed: ${failed.length}`);
  return NextResponse.json({ ok: true, activated: activated.length, skipped: skipped.length, failed: failed.length });
}
