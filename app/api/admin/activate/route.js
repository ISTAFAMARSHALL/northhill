// app/api/admin/activate/route.js
// Creates a subscription row, updates order status to "active",
// and emails the customer their credentials.

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

export async function POST(req) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const {
      orderId, userId, userEmail, userName,
      planName, planTerm, connections, price,
      iptvServerUrl, iptvUsername, iptvPassword,
      startDate, endDate,
    } = await req.json();

    const supabase = adminClient();

    // 1. Create subscription
    const { error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id:         userId,
        plan_name:       planName,
        plan_term:       planTerm,
        connections,
        status:          "active",
        start_date:      startDate,
        end_date:        endDate,
        iptv_server_url: iptvServerUrl,
        iptv_username:   iptvUsername,
        iptv_password:   iptvPassword,
      });

    if (subError) throw new Error(subError.message);

    // 2. Mark order as active
    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "active" })
      .eq("id", orderId);

    if (orderError) throw new Error(orderError.message);

    // 3. Email the customer their credentials
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to:      userEmail,
        subject: `✅ Your North Hill Systems service is active!`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#e8e8f0;padding:2rem;border-radius:12px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:1.5rem">
              <div style="width:32px;height:32px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">⬡</div>
              <span style="font-size:18px;font-weight:600;color:#fff">North Hill Systems</span>
            </div>
            <h2 style="color:#10b981;margin-bottom:0.5rem">Your service is live!</h2>
            <p style="color:#6b7280;margin-bottom:1.5rem">Hi ${userName || userEmail}, your <strong style="color:#e8e8f0">${planName} ${planTerm}</strong> subscription is now active. Here are your streaming credentials:</p>

            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">Server URL</td><td style="padding:8px 0;color:#a78bfa;font-family:monospace;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvServerUrl}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">Username</td><td style="padding:8px 0;color:#e8e8f0;font-family:monospace;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvUsername}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Password</td><td style="padding:8px 0;color:#e8e8f0;font-family:monospace">${iptvPassword}</td></tr>
              </table>
            </div>

            <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:8px;padding:1rem;margin-bottom:1.5rem">
              <p style="margin:0;font-size:13px;color:#9ca3af">
                <strong style="color:#fff">Expires:</strong> ${endDate}<br/>
                <strong style="color:#fff">Connections:</strong> ${connections} simultaneous stream${connections > 1 ? "s" : ""}
              </p>
            </div>

            <p style="font-size:13px;color:#6b7280">You can always view your credentials in your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal" style="color:#a78bfa">customer portal</a>.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      console.error("Customer activation email failed:", await emailRes.text());
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Activation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
