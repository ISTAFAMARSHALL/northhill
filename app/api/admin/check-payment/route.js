// app/api/admin/check-payment/route.js
// Checks Wave for the current payment status of an invoice.
// Called from the admin dashboard "Check Payment" button.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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
              id
              status
              amountDue {
                value
              }
              amountPaid {
                value
              }
              total {
                value
              }
              lastViewedAt
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

  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join(", "));
  }

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

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found in Wave" }, { status: 404 });
    }

    const isPaid = invoice.status === "PAID" || parseFloat(invoice.amountDue?.value) === 0;

    // If paid, update the order status to "paid" in Supabase so the
    // dashboard reflects it without needing to check Wave again
    if (isPaid) {
      await adminClient()
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId);
    }

    return NextResponse.json({
      status:     invoice.status,
      isPaid,
      amountPaid: invoice.amountPaid?.value,
      amountDue:  invoice.amountDue?.value,
      total:      invoice.total?.value,
      lastViewed: invoice.lastViewedAt,
    });

  } catch (err) {
    console.error("check-payment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}