// app/api/dev/cleanup/route.js
// ⚠️  DEVELOPMENT ONLY — Delete test data from Supabase + Wave
// This route is blocked in production automatically.
// Use the "Wipe Test Data" button in the admin panel during testing.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const WAVE_API_URL = "https://gql.waveapps.com/graphql/public";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );
}

async function waveQuery(query, variables = {}) {
  const res = await fetch(WAVE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WAVE_FULL_ACCESS_TOKEN}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

export async function POST(req) {
  // ── Hard block in production ───────────────────────────────
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is disabled in production." },
      { status: 403 }
    );
  }

  try {
    const results = {
      supabase: { subscriptions: 0, orders: 0 },
      wave:     { invoicesDeleted: 0, customersDeleted: 0, errors: [] },
    };

    const supabase = adminClient();

    // ── 1. Fetch Wave invoice URLs from orders before deleting ─
    const { data: orders } = await supabase
      .from("orders")
      .select("wave_invoice_url")
      .not("wave_invoice_url", "is", null);

    // ── 2. Wipe Supabase subscriptions ────────────────────────
    const { error: subErr } = await supabase
      .from("subscriptions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

    if (subErr) throw new Error(`Subscriptions delete failed: ${subErr.message}`);
    results.supabase.subscriptions = 1; // all cleared

    // ── 3. Wipe Supabase orders ────────────────────────────────
    const { error: orderErr } = await supabase
      .from("orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

    if (orderErr) throw new Error(`Orders delete failed: ${orderErr.message}`);
    results.supabase.orders = 1; // all cleared

    // ── 4. Delete invoices from Wave ───────────────────────────
    // Fetch all invoices from Wave business
    const invoiceQuery = await waveQuery(`
      query($businessId: ID!) {
        business(id: $businessId) {
          invoices(pageSize: 50) {
            edges {
              node {
                id
                status
              }
            }
          }
        }
      }
    `, { businessId: process.env.WAVE_BUSINESS_ID });

    const invoices = invoiceQuery?.data?.business?.invoices?.edges || [];

    for (const { node: invoice } of invoices) {
      try {
        const del = await waveQuery(`
          mutation($input: InvoiceDeleteInput!) {
            invoiceDelete(input: $input) {
              didSucceed
              inputErrors { message }
            }
          }
        `, { input: { invoiceId: invoice.id } });

        if (del?.data?.invoiceDelete?.didSucceed) {
          results.wave.invoicesDeleted++;
        } else {
          const errs = del?.data?.invoiceDelete?.inputErrors?.map(e => e.message) || [];
          results.wave.errors.push(`Invoice ${invoice.id}: ${errs.join(", ")}`);
        }
      } catch (e) {
        results.wave.errors.push(`Invoice ${invoice.id}: ${e.message}`);
      }
    }

    // ── 5. Delete test customers from Wave ─────────────────────
    const customerQuery = await waveQuery(`
      query($businessId: ID!) {
        business(id: $businessId) {
          customers(pageSize: 50) {
            edges {
              node {
                id
                name
                email
              }
            }
          }
        }
      }
    `, { businessId: process.env.WAVE_BUSINESS_ID });

    const customers = customerQuery?.data?.business?.customers?.edges || [];

    for (const { node: customer } of customers) {
      try {
        const del = await waveQuery(`
          mutation($input: CustomerDeleteInput!) {
            customerDelete(input: $input) {
              didSucceed
              inputErrors { message }
            }
          }
        `, { input: { customerId: customer.id } });

        if (del?.data?.customerDelete?.didSucceed) {
          results.wave.customersDeleted++;
        } else {
          const errs = del?.data?.customerDelete?.inputErrors?.map(e => e.message) || [];
          results.wave.errors.push(`Customer ${customer.email}: ${errs.join(", ")}`);
        }
      } catch (e) {
        results.wave.errors.push(`Customer ${customer.email}: ${e.message}`);
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (err) {
    console.error("Cleanup error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}