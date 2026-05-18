# IPTV Reseller Landing Page — Next.js Template

A free, open-source, production-ready landing page built with **Next.js** for IPTV resellers. Download, configure with your own branding and pricing, and deploy in minutes. No backend required to get started.

![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

---

## Preview

> Dark, premium aesthetic with gradient accents — designed to convert visitors into paying subscribers.

Features visible in the template:
- Hero section with uptime badge and dual CTAs
- Features grid (uptime, EPG, VOD, trial, etc.)
- Pricing section with Monthly / Quarterly / Annual toggle
- Plan cards with "Most Popular" highlight
- 24-hour free trial modal with email capture
- Collapsible FAQ section
- Sticky navigation and footer

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/northhill.git
cd northhill

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see it live.

---

## Configuration

All reseller-specific content lives in a single file. Open `components/NorthHillLanding.jsx` and update the following sections:

### Business Name & Branding

```jsx
// Find this near the top of the component
<span>Your Business Name</span>
```

Update the logo text, colors, and any brand references throughout the file. The primary accent color is defined inline as `#7c3aed` (purple) — do a find-and-replace to swap it for your brand color.

### Pricing Plans

Edit the `PLANS` array at the top of the file:

```jsx
const PLANS = [
  {
    id: "solo-monthly",
    name: "Solo",
    connections: 1,
    term: "monthly",         // "monthly" | "quarterly" | "annual"
    termLabel: "1 Month",
    price: 13,               // Your price
    badge: null,             // e.g. "Most Popular" or null
    highlight: false,        // true = purple highlight card
    perMonth: 13,            // Displayed $/mo rate
    description: "Perfect for a single screen",
  },
  // ... add or remove plans as needed
];
```

### Features Section

Edit the `FEATURES` array:

```jsx
const FEATURES = [
  { icon: "📡", title: "99.9% Uptime", desc: "Your description here" },
  // ...
];
```

### FAQ

Update the FAQ items inside the JSX:

```jsx
{[
  ["Your question here?", "Your answer here."],
  // ...
].map(([q, a]) => (
  <FAQItem key={q} question={q} answer={a} />
))}
```

### Trial Modal

The trial modal currently captures an email address. To connect it to your fulfillment system, replace the `handleTrialSubmit` function with your own API call or form handler:

```jsx
const handleTrialSubmit = async (e) => {
  e.preventDefault();
  // Add your logic here — POST to your API, send to email service, etc.
  await fetch("/api/trial", {
    method: "POST",
    body: JSON.stringify({ email: trialEmail }),
  });
  setTrialSubmitted(true);
};
```

---

## Project Structure

```
/
├── app/
│   ├── page.js               # Entry point — imports the landing page
│   └── layout.js             # Root layout
├── components/
│   └── NorthHillLanding.jsx  # ← All landing page content lives here
├── public/                   # Static assets (add your logo here)
├── package.json
└── README.md
```

---

## Deployment

### Vercel (Recommended — Free Tier Available)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Your site will be live at a `.vercel.app` URL instantly. Connect a custom domain in the Vercel dashboard.

### Netlify

```bash
npm run build
# Upload the .next folder or connect your GitHub repo in the Netlify dashboard
```

### Self-Hosted (VPS / DigitalOcean / Linode)

```bash
npm run build
npm start
# Point your domain's DNS to your server IP and use nginx as a reverse proxy
```

---

## Connecting a Payment System

The "Get Started" buttons are currently unstyled placeholders. To connect payments:

- **Stripe** — recommended. Add a Stripe Checkout session in `/app/api/checkout/route.js` and point each plan button to it with the correct price ID.
- **PayPal** — use the PayPal JS SDK and render PayPal buttons inside the plan cards.
- **CashApp / Venmo / manual** — replace the button `onClick` with a link to your payment handle or a contact form.

---

## Customization Ideas

- Add a **live channel count** badge pulled from your panel's API
- Integrate **Crisp** or **Tawk.to** for live chat support
- Add a **device compatibility** section with icons (Firestick, Android, iOS, Smart TV)
- Build a `/activate` page for customers to enter their credentials after purchase
- Add **Google Analytics** or **Plausible** for conversion tracking

---

## Contributing

Pull requests are welcome. If you've added a useful section (payment integration, activation flow, admin dashboard, etc.) and want to share it back with the community, open a PR.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push and open a pull request

---

## License

MIT — free to use, modify, and distribute for personal or commercial projects. Attribution appreciated but not required.

---

## Built With

- [Next.js](https://nextjs.org/) — React framework
- [DM Sans + DM Serif Display](https://fonts.google.com/) — Typography
- No UI library dependencies — pure React + inline styles

---

*Template originally developed for the IPTV reseller community. If this saves you time, consider starring the repo ⭐*
