const PANEL_URL = "https://thexpanel.xyz";

const loginPageRes = await fetch(`${PANEL_URL}/login`, {
  headers: { "User-Agent": "Mozilla/5.0" }
});
const cookies = loginPageRes.headers.getSetCookie?.() || [];
const jar = {};
cookies.forEach(c => {
  const [p] = c.split(";");
  const idx = p.indexOf("=");
  jar[p.slice(0, idx).trim()] = p.slice(idx + 1);
});
const html  = await loginPageRes.text();
const token = html.match(/name="_token"\s+value="([^"]+)"/)?.[1];
console.log("CSRF token:", token?.slice(0, 20));

const loginRes = await fetch(`${PANEL_URL}/login`, {
  method: "POST", redirect: "manual",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Cookie":     Object.entries(jar).map(([k,v]) => `${k}=${v}`).join("; "),
    "Origin":     PANEL_URL,
    "Referer":    `${PANEL_URL}/login`,
    "User-Agent": "Mozilla/5.0",
  },
  body: new URLSearchParams({
    _token:   token,
    username: "NorthHIll",
    password: "dovzar-4dabMi-zektuw",
  }).toString(),
});

const sessionCookies = loginRes.headers.getSetCookie?.() || [];
sessionCookies.forEach(c => {
  const [p] = c.split(";");
  const idx = p.indexOf("=");
  jar[p.slice(0, idx).trim()] = p.slice(idx + 1);
});

// Send cookies URL-decoded — Laravel expects decoded values
const cookieStr = Object.entries(jar)
  .map(([k,v]) => `${k}=${decodeURIComponent(v)}`)
  .join("; ");

console.log("Login status:", loginRes.status);
console.log("Has laravel_session:", !!jar["laravel_session"]);

for (const path of ["/lines", "/dashboard", "/dashboard/expired/week"]) {
  const res = await fetch(`${PANEL_URL}${path}`, {
    redirect: "manual",
    headers: { "Cookie": cookieStr, "User-Agent": "Mozilla/5.0", "Accept": "text/html" }
  });
  console.log(`${path} → ${res.status} ${res.headers.get("location") || "(no redirect)"}`);
}