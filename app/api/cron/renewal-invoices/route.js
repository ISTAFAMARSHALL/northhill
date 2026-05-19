// app/api/cron/renewal-invoices/route.js
//
// Runs daily via Vercel cron (see vercel.json).
// Finds subscriptions expiring in exactly 7 or 2 days
// and creates + sends a renewal Wave invoice for each one.
//
// Protected by CRON_SECRET so only Vercel can trigger it.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createWaveInvoice } from "@/lib/wave";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );
}

// Return a YYYY-MM-DD date string offset by `days` from today
function offsetDate(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

export async function GET(req) {
  // Verify this was called by Vercel cron, not a random visitor
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase   = adminClient();
  const targetDays = [7, 2];
  const results    = [];

  for (const days of targetDays) {
    const targetDate = offsetDate(days);
    console.log(`[cron] Checking subscriptions expiring on ${targetDate} (${days} days out)`);

    // Fetch active subscriptions expiring on exactly this date
    // Join with users table to get email + name for the invoice
    const { data: subs, error } = await supabase
      .from("subscriptions")
      .select(`
        id,
        plan_name,
        plan_term,
        connections,
        price,
        end_date,
        user_id,
        users (
          email,
          raw_user_meta_data
        )
      `)
      .eq("status", "active")
      .eq("end_date", targetDate);

    if (error) {
      console.error(`[cron] Supabase query failed for ${days}-day check:`, error.message);
      results.push({ days, error: error.message });
      continue;
    }

    if (!subs || subs.length === 0) {
      console.log(`[cron] No subscriptions expiring in ${days} days`);
      results.push({ days, sent: 0 });
      continue;
    }

    console.log(`[cron] Found ${subs.length} subscription(s) expiring in ${days} days`);

    const sent   = [];
    const failed = [];

    for (const sub of subs) {
      const userEmail = sub.users?.email;
      const userName  = sub.users?.raw_user_meta_data?.full_name
                     || sub.users?.raw_user_meta_data?.name
                     || userEmail;

      if (!userEmail) {
        console.warn(`[cron] Skipping sub ${sub.id} — no email found`);
        failed.push({ subId: sub.id, reason: "no email" });
        continue;
      }

      // Use the subscription's stored price if available,
      // otherwise fall back to looking it up from the orders table
      let price = sub.price;
      if (!price) {
        const { data: order } = await supabase
          .from("orders")
          .select("price")
          .eq("user_id", sub.user_id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        price = order?.price;
      }

      if (!price || parseFloat(price) <= 0) {
        console.warn(`[cron] Skipping sub ${sub.id} — price is ${price}`);
        failed.push({ subId: sub.id, reason: "no price" });
        continue;
      }

      try {
        console.log(`[cron] Creating renewal invoice for ${userEmail} (${days} days out)`);

        const wave = await createWaveInvoice({
          userName,
          userEmail,
          planName:  sub.plan_name,
          planTerm:  sub.plan_term,
          price,
          // Invoice due date = subscription end date (renew before it lapses)
          startDate: sub.end_date,
        });

        // Log the renewal invoice against the subscription for audit trail
        await supabase
          .from("renewal_invoices")
          .insert({
            subscription_id:  sub.id,
            user_id:          sub.user_id,
            wave_invoice_id:  wave.invoiceId,
            wave_invoice_url: wave.invoiceUrl,
            days_before_expiry: days,
            sent_at:          new Date().toISOString(),
          })
          .throwOnError();

        sent.push({ subId: sub.id, userEmail, invoiceUrl: wave.invoiceUrl });
        console.log(`[cron] ✅ Renewal invoice sent to ${userEmail}`);

      } catch (err) {
        console.error(`[cron] ❌ Failed for ${userEmail}:`, err.message);
        failed.push({ subId: sub.id, userEmail, reason: err.message });
      }
    }

    results.push({ days, sent: sent.length, failed: failed.length, detail: { sent, failed } });
  }

  console.log("[cron] Renewal invoice run complete:", JSON.stringify(results, null, 2));

  return NextResponse.json({ ok: true, results });
}