// lib/reseller.js
//
// Automates IPTV line creation on thexpanel.xyz using Puppeteer
// Uses a real headless Chrome browser to bypass SSL/session issues
//
// Required env vars:
//   RESELLER_USERNAME   — thexpanel.xyz login username
//   RESELLER_PASSWORD   — thexpanel.xyz login password
//   RESELLER_SERVER_URL — streaming server (e.g. http://proxpanel.cc:8080)

// Dynamic imports to prevent bundler from relocating these packages
const getPuppeteer = () => import('puppeteer-core');
const getChromium  = () => import('@sparticuz/chromium-min');

// Hosted Chromium binary for serverless — x64 pack for version 148
const CHROMIUM_REMOTE_URL = "https://github.com/Sparticuz/chromium/releases/download/v148.0.0/chromium-v148.0.0-pack.x64.tar";

const PANEL_URL = "https://thexpanel.xyz";

const BOUQUETS = "4,15,23,24,25,26,27,28,29,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,55,56,57,58,59,60,61,62,68,69,70,71,73,74,75,76,78,79,77,80,81,66,82,84,85,86,90,100,63,64,65,89,92,93,94,95,96,99,102,106,101,105,107,109,110,67,111";
const PACKAGE_MAP = {
  "trial":       "2",
  "1-monthly":   "5",  "1-quarterly":  "6",  "1-annual":  "8",
  "2-monthly":   "9",  "2-quarterly":  "10", "2-annual":  "12",
  "3-monthly":   "13", "3-quarterly":  "14", "3-annual":  "16",
  "4-monthly":   "17", "4-quarterly":  "18", "4-annual":  "20",
  "5-monthly":   "21", "5-quarterly":  "22", "5-annual":  "24",
};

function getPackageId(connections, planTerm) {
  const term = planTerm?.toLowerCase();
  if (term === "trial") return PACKAGE_MAP["trial"];
  const key = `${connections}-${term}`;
  const pkg  = PACKAGE_MAP[key];
  if (!pkg) throw new Error(`No package for ${connections} connections, ${planTerm}`);
  return pkg;
}

function generateUsername() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return "nh_" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function calcExpiryDate(planTerm, startDate) {
  const start = new Date(startDate);
  const term  = planTerm?.toLowerCase();
  if (term === "trial") {
    const d = new Date(start);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }
  const months = { monthly: 1, quarterly: 3, annual: 12 }[term] || 1;
  start.setMonth(start.getMonth() + months);
  return start.toISOString().split("T")[0];
}

async function launchAndLogin() {
  const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  // Resolve puppeteer and chromium via dynamic imports
  const { default: puppeteer } = await getPuppeteer();
  const chromiumMod            = await getChromium();
  const chromium               = chromiumMod.default || chromiumMod;

  // Local Chrome path
  const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  let execPath;
  if (isVercel) {
    chromium.setGraphicsMode = false;
    execPath = await chromium.executablePath(CHROMIUM_REMOTE_URL);
  } else {
    execPath = localChrome;
  }

  const baseArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--ignore-certificate-errors",
    "--ignore-ssl-errors",
    "--allow-running-insecure-content",
    "--disable-web-security",
    "--unsafely-treat-insecure-origin-as-secure=http://thexpanel.xyz",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--single-process",
  ];

  const browser = await puppeteer.launch({
    headless:          isVercel ? chromium.headless : true,
    ignoreHTTPSErrors: true,
    executablePath:    execPath,
    args:              isVercel ? [...chromium.args, ...baseArgs] : baseArgs,
    pipe:              !isVercel,
  });

  const page = await browser.newPage();

  // Must set up interception BEFORE any navigation
  await page.setRequestInterception(true);
  page.on("request", req => {
    const url = req.url();
    if (url.startsWith("http://thexpanel.xyz")) {
      req.continue({ url: url.replace("http://", "https://") });
    } else {
      req.continue();
    }
  });

  const client = await page.createCDPSession();
  await client.send("Security.setIgnoreCertificateErrors", { ignore: true });

  // Navigate to login — if already logged in, panel redirects to /
  // so we navigate to / first to check, then to /login
  console.log("[reseller] Logging in... execPath:", execPath);
  try {
    await page.goto(`${PANEL_URL}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  } catch (e) {
    console.log("[reseller] Nav error on login page (may be ok):", e.message.slice(0, 80));
  }
  console.log("[reseller] Login page URL:", page.url(), "| Title:", await page.title());
  await page.type('input[name="username"]', process.env.RESELLER_USERNAME);
  await page.type('input[name="password"]', process.env.RESELLER_PASSWORD);

  // Click submit and wait for redirect chain to settle
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 4000));

  const postLoginUrl = page.url();
  console.log("[reseller] Post-login URL:", postLoginUrl);

  const loginFailed = postLoginUrl.includes("chrome-error") ||
                      postLoginUrl.includes("/login") ||
                      postLoginUrl === `${PANEL_URL}/`;
  if (loginFailed) {
    // Try navigating to dashboard directly
    try {
      await page.goto(`${PANEL_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 10000 });
    } catch(e) {}
  }

  const finalUrl = page.url();
  console.log("[reseller] Final URL:", finalUrl);
  if (finalUrl.includes("chrome-error") || finalUrl.includes("/login")) {
    throw new Error(`Login failed — landed at ${finalUrl}`);
  }

  // Get CSRF token from dashboard
  const csrfToken = await page.evaluate(() => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || null;
  });

  if (!csrfToken) throw new Error("No CSRF token found after login");
  console.log("[reseller] Session established ✅");

  return { browser, page, csrfToken };
}

// ─────────────────────────────────────────
// Main exports
// ─────────────────────────────────────────
export async function createResellerLine({ planName, planTerm, connections, startDate, description }) {
  const missing = ["RESELLER_USERNAME", "RESELLER_PASSWORD", "RESELLER_SERVER_URL"].filter(k => !process.env[k]);
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(", ")}`);

  const username   = generateUsername();
  const password   = generatePassword();
  const packageId  = getPackageId(connections, planTerm);
  const expiryDate = calcExpiryDate(planTerm, startDate);
  const isTrial    = packageId === "2";

  console.log("[reseller] Creating line:", { username, connections, planTerm, packageId, expiryDate });

  const { browser, page, csrfToken } = await launchAndLogin();

  try {
    // Navigate to the create page so the CSRF token is fresh from that specific form
    try {
      await page.goto(`${PANEL_URL}/lines/create/1`, { waitUntil: "domcontentloaded", timeout: 30000 });
    } catch (e) {
      console.log("[reseller] Nav to create page error (continuing):", e.message.slice(0, 80));
    }
    const freshCsrf = await page.evaluate(() =>
      document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || null
    );
    const tokenToUse = freshCsrf || csrfToken;
    console.log("[reseller] CSRF from create page:", !!freshCsrf, "| token prefix:", tokenToUse?.slice(0, 10));

    const result = await page.evaluate(async (panelUrl, csrf, bouquets, pkg, isTrial, username, password, desc) => {
      // Build body with exact field order matching the panel's form:
      // current_bouquets, _token, line_type, username, password, mac, package, q, q, description
      const body = new URLSearchParams();
      body.append("current_bouquets", bouquets);
      body.append("_token",           csrf);
      body.append("line_type",        "line");
      body.append("username",         username);
      body.append("password",         password);
      body.append("mac",              "");
      body.append("package",          pkg);
      body.append("q",                "");
      body.append("q",                "");  // second q field must come before description
      body.append("description",      desc || "");
      if (isTrial) body.append("trial", "1");

      const res = await fetch(`${panelUrl}/lines/create/1`, {
        method:      "POST",
        credentials: "include",
        headers: {
          "Content-Type":     "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRF-TOKEN":     csrf,
          "X-Requested-With": "XMLHttpRequest",
          "Accept":           "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Referer":          `${panelUrl}/lines/create/1`,
          "Origin":           panelUrl,
        },
        body:     body.toString(),
        redirect: "follow",
      });

      const text = await res.text();
      return {
        status:    res.status,
        url:       res.url,
        body:      text.slice(0, 2000),
        redirected: res.redirected,
        sentBody:  body.toString(),
      };
    }, PANEL_URL, tokenToUse, BOUQUETS, packageId, isTrial, username, password, description || planName);

    console.log("[reseller] Sent body:", result.sentBody);
    console.log("[reseller] Create status:", result.status, "| redirected:", result.redirected, "| url:", result.url);
    console.log("[reseller] Response preview:", result.body.slice(0, 300));

    if (result.status === 422) {
      let parsed;
      try { parsed = JSON.parse(result.body); } catch (_) { parsed = { raw: result.body }; }
      throw new Error(`Panel validation error: ${JSON.stringify(parsed.errors || parsed)}`);
    }

    // Dashboard HTML in response = form was rejected (CSRF mismatch, validation, etc.)
    if (result.body.includes("Dashboard") && !result.url?.includes("/users")) {
      throw new Error(`Line creation returned dashboard HTML — CSRF or validation failure. Status: ${result.status}, URL: ${result.url}`);
    }

    if (result.status !== 200 && result.status !== 302) {
      throw new Error(`Unexpected status ${result.status}: ${result.body.slice(0, 100)}`);
    }

    console.log("[reseller] ✅ Line created:", username);
    return {
      iptvServerUrl: process.env.RESELLER_SERVER_URL,
      iptvUsername:  username,
      iptvPassword:  password,
      expiryDate,
    };

  } finally {
    await browser.close();
  }
}

export async function extendResellerLine({ lineId, connections, planTerm, currentEndDate }) {
  const missing = ["RESELLER_USERNAME", "RESELLER_PASSWORD"].filter(k => !process.env[k]);
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(", ")}`);

  const packageId     = getPackageId(connections, planTerm);
  const newExpiryDate = calcExpiryDate(planTerm, currentEndDate);

  console.log("[reseller] Extending line:", { lineId, connections, planTerm, packageId });

  const { browser, page, csrfToken } = await launchAndLogin();

  try {
      const result = await page.evaluate(async (panelUrl, csrf, bouquets, pkg, isTrial, username, password, desc) => {
        const body = new URLSearchParams({
          current_bouquets: bouquets,
          _token:           csrf,
          line_type:        "line",
          username,
          password,
          mac:              "",
          package:          pkg,
          q:                "",
          description:      desc || "",
        });
        body.append("q", "");
        if (isTrial) body.append("trial", "1");

        // ADD THIS:
        console.log("POSTING BODY:", body.toString());

      const res = await fetch(`${panelUrl}/lines/edit/${lineId}`, {
        method:  "POST",
        headers: {
          "Content-Type":     "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRF-TOKEN":     csrf,
          "X-Requested-With": "XMLHttpRequest",
          "Accept":           "*/*",
          "Referer":          `${panelUrl}/`,
          "Origin":           panelUrl,
        },
        body: body.toString(),
      });

      const text = await res.text();
      return { status: res.status, body: text.slice(0, 500), redirected: res.redirected, sentBody: body.toString() };
      console.log("[reseller] Sent body:", result.sentBody);
    }, PANEL_URL, csrfToken, lineId, packageId);

    console.log("[reseller] Extend status:", result.status);
    if (result.status !== 200 && result.status !== 302) {
      throw new Error(`Extend failed ${result.status}: ${result.body}`);
    }

    console.log("[reseller] ✅ Line extended:", lineId);
    return { newExpiryDate };

  } finally {
    await browser.close();
  }
}