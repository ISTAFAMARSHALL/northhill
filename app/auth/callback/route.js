// app/auth/callback/route.js
//
// Supabase Auth callback for:
//   1. OAuth social logins (Google, Apple, Facebook)
//   2. Email confirmation links
//
// Supabase redirects here after the provider exchange. We forward all query
// params to /auth/done which runs client-side and finishes the PKCE exchange.

import { NextResponse } from "next/server";

export async function GET(req) {
  const url  = new URL(req.url);
  const dest = new URL("/auth/done", url.origin);

  // Forward every param Supabase sends (code, state, error, next, trial, …)
  url.searchParams.forEach((v, k) => dest.searchParams.set(k, v));

  return NextResponse.redirect(dest);
}
