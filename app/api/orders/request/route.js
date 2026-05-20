// app/api/orders/request/route.js
// Fires when a customer selects a plan and confirms.
// 1. Saves a pending order to Supabase
// 2. Creates Wave customer + invoice and sends it to the customer
// 3. Updates order to "invoiced" with wave_invoice_url + wave_invoice_id
// 4. Emails admin with order details (invoice already sent to customer)

import { createClient }       from "@supabase/supabase-js";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse }        from "next/server";
import { createWaveInvoice }   from "@/lib/wave";

function adminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );
}

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth:   { persistSession: false },
      }
    );

    const body = await req.json();
    const {
      planId, planName, planTerm, price,
      connections, userEmail, userName, userId,
    } = body;

    // Only append planTerm if it isn't already part of planName
    const planLabel = planName.toLowerCase().includes(planTerm.toLowerCase())
      ? planName
      : `${planName} · ${planTerm}`;

    // ── 1. Save pending order to Supabase ──────────────────────
    const { data: order, error: dbError } = await supabaseUser
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
      })
      .select("id")
      .single();

    if (dbError) throw new Error(dbError.message);

    const orderId = order.id;

    // ── 2. Create Wave invoice (skip for free trials) ──────────
    let waveInvoiceUrl = null;
    let waveInvoiceId  = null;
    let waveError      = null;

    if (parseFloat(price) > 0) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const wave  = await createWaveInvoice({
          userName,
          userEmail,
          planName:  planLabel,
          planTerm,
          price,
          startDate: today,
        });

        waveInvoiceUrl = wave.invoiceUrl;
        waveInvoiceId  = wave.invoiceId;

        // ── 3. Update order: invoiced + wave details ───────────
        await adminSupabase()
          .from("orders")
          .update({
            status:           "invoiced",
            wave_invoice_url: waveInvoiceUrl,
            wave_invoice_id:  waveInvoiceId,
          })
          .eq("id", orderId);

        console.log(`[orders/request] Wave invoice created for ${userEmail}:`, waveInvoiceUrl);

      } catch (waveErr) {
        // Wave failure is non-blocking — order is still saved
        waveError = waveErr.message;
        console.error("[orders/request] Wave invoice failed:", waveErr.message);
      }
    }

    // ── 4. Notify admin ────────────────────────────────────────
    const invoiceStatus = waveInvoiceUrl
      ? `✅ Invoice sent to customer automatically via Wave ($${price})`
      : waveError
        ? `⚠️ Wave invoice failed: ${waveError} — please send manually`
        : `ℹ️ Free trial — no invoice needed`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to:      process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL,
        subject: `🆕 New Order — ${userName || userEmail} · ${planLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#e8e8f0;padding:2rem;border-radius:12px">
            <h2 style="color:#a78bfa;margin-bottom:0.5rem">New Service Order</h2>
            <p style="color:#6b7280;margin-bottom:1.5rem">A customer has placed an order. Invoice has been sent automatically.</p>

            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Name</td>        <td style="padding:8px 0;color:#fff;font-weight:600">${userName || "Not provided"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Email</td>       <td style="padding:8px 0;color:#a78bfa">${userEmail}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Plan</td>        <td style="padding:8px 0;color:#fff;font-weight:600">${planLabel}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Connections</td> <td style="padding:8px 0;color:#fff">${connections}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Amount</td>      <td style="padding:8px 0;color:#10b981;font-size:18px;font-weight:700">$${price}</td></tr>
            </table>

            <div style="margin-top:1.5rem;padding:1rem;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:8px">
              <p style="margin:0 0 0.5rem;font-size:13px;color:#fff;font-weight:600">Invoice Status</p>
              <p style="margin:0;font-size:13px;color:#9ca3af">${invoiceStatus}</p>
              ${waveInvoiceUrl ? `<a href="${waveInvoiceUrl}" style="display:inline-block;margin-top:0.75rem;color:#a78bfa;font-size:13px">View Invoice in Wave →</a>` : ""}
            </div>

            <div style="margin-top:1rem;padding:1rem;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:8px">
              <p style="margin:0;font-size:13px;color:#9ca3af">
                <strong style="color:#fff">Next step:</strong> Wait for payment confirmation from Wave, 
                then activate the account in your 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="color:#a78bfa">Admin Panel</a>.
              </p>
            </div>
          </div>
        `,
      }),
    });

    return NextResponse.json({
      success: true,
      waveInvoiceUrl,
      waveError: waveError ?? undefined,
    });

  } catch (err) {
    console.error("Order request error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}