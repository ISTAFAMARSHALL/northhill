process.env.RESELLER_USERNAME   = 'NorthHIll';
process.env.RESELLER_PASSWORD   = 'dovzar-4dabMi-zektuw';
process.env.RESELLER_SERVER_URL = 'http://proxpanel.cc:8080';

const PANEL_URL = "https://thexpanel.xyz";

// Step 1 - GET login page
const loginPageRes = await fetch(`${PANEL_URL}/login`, {
  method: "GET", redirect: "follow",
  headers: { "User-Agent": "Mozilla/5.0", "Accept": "text/html" },
});
const loginPageCookies = loginPageRes.headers.getSetCookie?.() || [];
console.log("Login page cookies:", loginPageCookies.map(c => c.split(";")[0]));

const loginHtml  = await loginPageRes.text();
const tokenMatch = loginHtml.match(/name="_token"\s+value="([^"]+)"/);
console.log("CSRF token found:", !!tokenMatch, tokenMatch?.[1]?.slice(0,20));

const cookieMap = {};
loginPageCookies.forEach(c => {
  const [pair] = c.split(";");
  const [k, v] = pair.split("=");
  cookieMap[k.trim()] = v?.trim();
});
const initialCookieHeader = Object.entries(cookieMap).map(([k,v]) => `${k}=${v}`).join("; ");

// Step 2 - POST login
const loginRes = await fetch(`${PANEL_URL}/login`, {
  method: "POST", redirect: "manual",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0", "Accept": "text/html",
    "Cookie": initialCookieHeader,
    "Referer": `${PANEL_URL}/login`, "Origin": PANEL_URL,
  },
  body: new URLSearchParams({
    _token: tokenMatch[1],
    username: process.env.RESELLER_USERNAME,
    password: process.env.RESELLER_PASSWORD,
  }).toString(),
});
console.log("Login POST status:", loginRes.status);
console.log("Login redirect location:", loginRes.headers.get("location"));

const sessionCookies = loginRes.headers.getSetCookie?.() || [];
console.log("Session cookies:", sessionCookies.map(c => c.split(";")[0]));

const mergedMap = { ...cookieMap };
sessionCookies.forEach(c => {
  const [pair] = c.split(";");
  const [k, v] = pair.split("=");
  mergedMap[k.trim()] = v?.trim();
});
const sessionHeader = Object.entries(mergedMap).map(([k,v]) => `${k}=${v}`).join("; ");
console.log("Merged cookie header keys:", Object.keys(mergedMap));

// Step 3 - follow redirect
const redirectUrl = loginRes.headers.get("location") || `${PANEL_URL}/dashboard`;
const dashRes = await fetch(redirectUrl, {
  method: "GET", redirect: "follow",
  headers: { "User-Agent": "Mozilla/5.0", "Cookie": sessionHeader },
});
console.log("Dashboard status:", dashRes.status, dashRes.url);

const dashCookies = dashRes.headers.getSetCookie?.() || [];
console.log("Dashboard new cookies:", dashCookies.map(c => c.split(";")[0]));
dashCookies.forEach(c => {
  const [pair] = c.split(";");
  const [k, v] = pair.split("=");
  mergedMap[k.trim()] = v?.trim();
});

const finalHeader = Object.entries(mergedMap).map(([k,v]) => `${k}=${v}`).join("; ");

// Step 4 - get lines page for fresh CSRF
const linesRes = await fetch(`${PANEL_URL}/lines`, {
  method: "GET", redirect: "follow",
  headers: { "User-Agent": "Mozilla/5.0", "Cookie": finalHeader },
});
console.log("Lines page status:", linesRes.status, linesRes.url);
const linesHtml = await linesRes.text();
const freshToken = linesHtml.match(/name="_token"\s+value="([^"]+)"/);
console.log("Fresh CSRF found:", !!freshToken, freshToken?.[1]?.slice(0,20));

// Check if we're actually logged in
console.log("Lines page has 'Create' button:", linesHtml.includes("Create"));
console.log("Lines page has 'Login' title:", linesHtml.includes("<title>\n           Login"));
