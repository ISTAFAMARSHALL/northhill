// app/api/admin/orders/route.js
// Returns all orders. Admin-only — verifies the caller is the admin email.

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

export async function GET(req) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await adminClient()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
