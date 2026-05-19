// app/api/trial/request/route.js
// Sends admin a notification when someone requests a free trial.

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to:      process.env.ADMIN_EMAIL,
        subject: `🆓 Free Trial Request — ${email}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#e8e8f0;padding:2rem;border-radius:12px">
            <h2 style="color:#10b981;margin-bottom:0.5rem">Free Trial Request</h2>
            <p style="color:#6b7280;margin-bottom:1.5rem">Someone has requested a 24-hour free trial.</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:8px 0;color:#a78bfa">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Plan</td><td style="padding:8px 0;color:#fff">Free Trial · 24 Hours · 1 Connection</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Amount</td><td style="padding:8px 0;color:#10b981;font-weight:700">Free</td></tr>
            </table>
            <div style="margin-top:1.5rem;padding:1rem;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px">
              <p style="margin:0;font-size:13px;color:#9ca3af"><strong style="color:#fff">Next steps:</strong></p>
              <ol style="margin:0.5rem 0 0;padding-left:1.25rem;font-size:13px;color:#9ca3af;line-height:1.8">
                <li>Create a 24-hour trial account in your reseller panel</li>
                <li>Go to your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="color:#a78bfa">Admin Panel</a> and activate the trial</li>
                <li>Customer will receive their credentials automatically</li>
              </ol>
            </div>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      console.error("Trial email failed:", await emailRes.text());
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Trial request error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
