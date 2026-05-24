import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) return new NextResponse(`Wave OAuth error: ${error}`, { status: 400 });
  if (!code)  return new NextResponse("No code provided", { status: 400 });

  const tokenRes = await fetch("https://api.waveapps.com/oauth2/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     process.env.WAVE_CLIENT_ID,
      client_secret: process.env.WAVE_CLIENT_SECRET,
      code,
      grant_type:    "authorization_code",
      redirect_uri:  `${process.env.NEXT_PUBLIC_SITE_URL}/api/wave/callback`,
    }).toString(),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok) return new NextResponse(`Token exchange failed: ${JSON.stringify(tokens)}`, { status: 400 });

  return new NextResponse(`<!DOCTYPE html><html><head><title>Wave Connected!</title>
<style>body{font-family:sans-serif;background:#0a0a0f;color:#e8e8f0;padding:2rem;max-width:700px;margin:0 auto}</style>
</head><body>
<h2 style="color:#10b981">✅ Wave Business Connected!</h2>
<p style="color:#9ca3af">Add these to Vercel environment variables:</p>
<br/>
<p style="color:#6b7280;font-size:13px">WAVE_OAUTH_ACCESS_TOKEN</p>
<p style="color:#a78bfa;font-family:monospace;font-size:12px;word-break:break-all">${tokens.access_token}</p>
<br/>
<p style="color:#6b7280;font-size:13px">WAVE_OAUTH_REFRESH_TOKEN</p>
<p style="color:#a78bfa;font-family:monospace;font-size:12px;word-break:break-all">${tokens.refresh_token}</p>
<br/>
<p style="color:#6b7280;font-size:13px">WAVE_OAUTH_BUSINESS_ID</p>
<p style="color:#a78bfa;font-family:monospace">${tokens.businessId || "not returned"}</p>
<br/>
<p style="color:#6b7280;font-size:13px">Scope: ${tokens.scope}</p>
<p style="color:#6b7280;font-size:13px">Expires in: ${tokens.expires_in} seconds</p>
</body></html>`, { status: 200, headers: { "Content-Type": "text/html" } });
}