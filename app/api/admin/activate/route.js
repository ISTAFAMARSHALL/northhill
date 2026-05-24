// app/api/admin/activate/route.js
// Activates a paid order — creates subscription and emails credentials.
// Wave invoice is already created at order time, so nothing to do here.

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

const LOGO_HTML = `
  <table cellpadding="0" cellspacing="0" style="margin-bottom:1.5rem">
    <tr>

      <td style="padding-left:10px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#ffffff;vertical-align:middle;font-weight:normal">
        North Hill Systems
      </td>
    </tr>
  </table>`;

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

    const planLabel = planName.toLowerCase().includes(planTerm.toLowerCase())
      ? planName
      : `${planName} · ${planTerm}`;

    // ── 1. Create subscription ─────────────────────────────────
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
        reseller_line_id: iptvUsername,
      });

    if (subError) throw new Error(subError.message);

    // ── 2. Mark order as active ────────────────────────────────
    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "active" })
      .eq("id", orderId);

    if (orderError) throw new Error(orderError.message);

    // ── 3. Email customer their credentials ───────────────────
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to:      userEmail,
        subject: `✅ Your North Hill Systems service is active!`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:2rem 1rem">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

    <tr><td style="padding-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,0.08)">
      ${LOGO_HTML}
    </td></tr>

    <tr><td style="padding:2rem 0">
      <h2 style="color:#10b981;margin:0 0 0.5rem;font-family:Georgia,serif;font-size:22px">Your service is live!</h2>
      <p style="color:#6b7280;margin:0 0 1.5rem;font-size:15px;line-height:1.6">
        Hi ${userName || userEmail}, your <strong style="color:#e8e8f0">${planLabel}</strong> subscription is now active. Here are your streaming credentials:
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:10px;margin-bottom:1.25rem">
        <tr>
          <td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.06);width:35%">Server URL</td>
          <td style="padding:10px 1rem;color:#a78bfa;font-family:monospace;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvServerUrl}</td>
        </tr>
        <tr>
          <td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.06)">Username</td>
          <td style="padding:10px 1rem;color:#e8e8f0;font-family:monospace;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${iptvUsername}</td>
        </tr>
        <tr>
          <td style="padding:10px 1rem;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em">Password</td>
          <td style="padding:10px 1rem;color:#e8e8f0;font-family:monospace;font-size:13px">${iptvPassword}</td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;margin-bottom:1.5rem">
        <tr>
          <td style="padding:10px 1rem;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);width:40%">Plan</td>
          <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.06)">${planLabel}</td>
        </tr>
        <tr>
          <td style="padding:10px 1rem;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">Connections</td>
          <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${connections} simultaneous stream${connections > 1 ? "s" : ""}</td>
        </tr>
        <tr>
          <td style="padding:10px 1rem;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">Active From</td>
          <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${startDate}</td>
        </tr>
        <tr>
          <td style="padding:10px 1rem;color:#6b7280;font-size:13px">Expires</td>
          <td style="padding:10px 1rem;color:#e8e8f0;font-size:13px">${endDate}</td>
        </tr>
      </table>

      <table cellpadding="0" cellspacing="0" style="margin-bottom:1.5rem">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:9px">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none">
              View My Account Portal →
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 0.5rem">
        <strong style="color:#e8e8f0">Compatible apps:</strong> TiviMate, IPTV Smarters Pro, Perfect Player, GSE Smart IPTV — available on Firestick, Android TV, Smart TV, iOS, and Android.
      </p>
      <p style="font-size:13px;color:#4b5563;margin:1rem 0 0">
        Questions? Contact us at <a href="mailto:northhillsystems@gmail.com" style="color:#a78bfa">northhillsystems@gmail.com</a>
      </p>
    </td></tr>

    <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding:1.25rem 0 0;text-align:center">
      <p style="font-size:12px;color:#374151;margin:0 0 4px">&copy; ${new Date().getFullYear()} North Hill Systems LLC. All rights reserved.</p>
      <p style="font-size:12px;margin:0">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms" style="color:#4b5563;text-decoration:none">Terms of Service</a>
        &nbsp;&middot;&nbsp;
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal" style="color:#4b5563;text-decoration:none">My Account</a>
      </p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>`,
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