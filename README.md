# North Hill Systems — IPTV Reseller Platform

A full-stack IPTV reseller business platform built with **Next.js 16**, **Supabase**, **Wave**, and **Puppeteer**. Handles everything from customer sign-up and plan selection through automated provisioning, invoicing, renewal reminders, and a self-service customer portal.

![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ecf8e?style=flat-square&logo=supabase)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## What it does

| Capability | Details |
|---|---|
| **Customer auth** | Supabase email/password sign-up and sign-in |
| **Plan selection** | Monthly / Quarterly / Annual toggle across Solo, Duo, and Family tiers |
| **Free trials** | 24-hour trial auto-provisioned instantly via reseller panel (1 per account) |
| **Invoicing** | Wave invoice created automatically and emailed to the customer on order |
| **Payment detection** | Portal polls Wave on return; cron sweeps every 5 min as a fallback |
| **Line provisioning** | Puppeteer automates the reseller panel to create or extend IPTV credentials |
| **Admin dashboard** | GitHub OAuth–protected view of all orders with Check Payment / Activate actions |
| **Customer portal** | Self-service view of active subscriptions with credentials, expiry, and renewal links |
| **Renewal invoices** | Daily cron sends Wave invoices 7 and 2 days before each subscription expires |
| **Webhook handler** | Wave payment webhook extends the reseller line and emails new credentials on renewal |
| **Setup guide** | `/setup` page with device-specific IPTV app setup instructions |
| **Email notifications** | Transactional emails via Resend for trial activation, invoices, and renewals |

---

## Tech stack

- **Next.js 16** (App Router) — React framework
- **Supabase** — Auth (email + GitHub OAuth) and Postgres database
- **Wave** — Invoicing and payment tracking via GraphQL API + webhooks
- **Puppeteer / @sparticuz/chromium** — Headless browser automation of the reseller panel
- **Resend** — Transactional email delivery
- **Vercel** — Hosting, cron jobs, and serverless functions
- **DM Sans / DM Serif Display** — Typography (Google Fonts)

---

## Project structure

```
app/
├── page.tsx                         # Landing page
├── plans/page.js                    # Plan selection (auth-gated)
├── portal/page.tsx                  # Customer portal
├── admin/page.jsx                   # Admin dashboard (GitHub OAuth)
├── signup/page.jsx                  # Sign-up
├── setup/page.jsx                   # Device setup guide
├── terms/page.tsx                   # Terms of service
├── auth/callback/route.js           # Wave OAuth callback
│
├── api/
│   ├── orders/
│   │   ├── request/route.js         # New order — creates invoice or activates trial
│   │   └── activate-if-paid/route.js # Portal fast-path payment check
│   ├── trial/request/route.js       # Trial request entrypoint
│   ├── admin/
│   │   ├── orders/route.js          # Fetch all orders (admin-only)
│   │   ├── activate/route.js        # Manually activate a paid order
│   │   └── check-payment/route.js   # Check Wave payment status for an order
│   ├── cron/
│   │   ├── activate-paid-orders/route.js  # Every 5 min — sweep invoiced orders
│   │   └── renewal-invoices/route.js      # Daily — send renewal invoices (7d & 2d out)
│   ├── webhooks/wave/route.js       # Wave payment webhook — extends line on renewal
│   └── dev/cleanup/route.js        # Dev-only data wipe
│
└── components/
    ├── NorthHillLanding.jsx         # Marketing landing page
    ├── CustomerPortal.jsx           # Subscription management UI
    ├── AdminDashboard.jsx           # Order management UI
    └── TermsPage.jsx

lib/
├── supabase.js                      # Supabase client factory
├── wave.js                          # Wave GraphQL helpers (create invoice, check status)
├── reseller.js                      # Puppeteer reseller panel automation
├── plans.js                         # Shared plan definitions
└── feature-list.js                  # Landing page feature copy
```

---

## Order lifecycle

```
Customer selects plan
        │
        ▼
POST /api/orders/request
        │
        ├─ Trial? ──► Auto-provision via Puppeteer ──► Email credentials ──► Done
        │
        └─ Paid?  ──► Create Wave invoice ──► Email invoice link
                             │
                   Customer pays invoice
                             │
              ┌──────────────┴──────────────┐
              │ (fast path)                  │ (fallback)
     Portal visits /activate-if-paid    Cron polls every 5 min
              │                              │
              └──────────────┬──────────────┘
                             ▼
                  Admin activates in dashboard
                  POST /api/admin/activate
                             │
                  Puppeteer creates reseller line
                  Email credentials to customer

Renewal (near expiry):
  Daily cron ──► Wave renewal invoice sent (at 7d and 2d)
  Customer pays ──► Wave webhook ──► Puppeteer extends line ──► Email new credentials
```

---

## Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=

# Wave (invoicing)
WAVE_CLIENT_ID=
WAVE_CLIENT_SECRET=
WAVE_FULL_ACCESS_TOKEN=
WAVE_BUSINESS_ID=
WAVE_PRODUCT_ID=
WAVE_WEBHOOK_SECRET=

# Reseller panel (Puppeteer automation)
RESELLER_SERVER_URL=
RESELLER_USERNAME=
RESELLER_PASSWORD=
RESELLER_API_KEY=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ADMIN_EMAIL=you@example.com
ADMIN_EMAIL=you@example.com
ADMIN_NOTIFY_EMAIL=you@example.com

# Cron protection
CRON_SECRET=
```

---

## Local development

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/northhill.git
cd northhill
npm install

# 2. Copy and fill in env vars
cp .env.local.example .env.local

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Supabase redirect URLs:** Add `http://localhost:3000/**` and your production URL to the allowed redirect list in your Supabase project → Authentication → URL Configuration.

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

The `vercel.json` at the repo root configures two cron jobs automatically:

| Cron | Schedule | Purpose |
|---|---|---|
| `/api/cron/activate-paid-orders` | Every 5 minutes | Sweep invoiced orders and activate paid ones |
| `/api/cron/renewal-invoices` | Daily at 13:00 UTC | Send renewal invoices 7 and 2 days before expiry |

Cron jobs require **Vercel Pro**. Set `CRON_SECRET` in your Vercel environment and the routes will reject any requests that don't carry it.

---

## Admin access

The admin dashboard at `/admin` is protected by **GitHub OAuth via Supabase**. Only the account whose email matches `ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_EMAIL` can proceed past the login screen.

Add your production domain to Supabase → Authentication → URL Configuration → Redirect URLs so OAuth works from any device.

---

## License

MIT — free to use, modify, and distribute for personal or commercial projects.
