
// lib/plans.js
// Single source of truth for all plan data.
// Import this wherever plans are needed:
//   import { PLANS } from "@/lib/plans";
 
export const PLANS = [
  { id: "solo-monthly",       name: "Solo",     connections: 1, term: "monthly",   termLabel: "1 Month",   price: 20,  perMonth: 20,    badge: null,           highlight: false, description: "Perfect for a single screen",  months: 1  },
  { id: "solo-quarterly",     name: "Solo",     connections: 1, term: "quarterly", termLabel: "3 Months",  price: 50,  perMonth: 16.67, badge: "Save $10",     highlight: false, description: "Best solo value",              months: 3  },
  { id: "solo-annual",        name: "Solo",     connections: 1, term: "annual",    termLabel: "12 Months", price: 150, perMonth: 12.50, badge: "Save $90",     highlight: false, description: "Lowest price per month",       months: 12 },
  { id: "standard-monthly",   name: "Standard", connections: 2, term: "monthly",   termLabel: "1 Month",   price: 30,  perMonth: 30,    badge: null,           highlight: false, description: "Share with a partner",         months: 1  },
  { id: "standard-quarterly", name: "Standard", connections: 2, term: "quarterly", termLabel: "3 Months",  price: 75,  perMonth: 25,    badge: "Most Popular", highlight: true,  description: "Best overall value",           months: 3  },
  { id: "standard-annual",    name: "Standard", connections: 2, term: "annual",    termLabel: "12 Months", price: 240, perMonth: 20,    badge: "Best Deal",    highlight: false, description: "Maximum savings",              months: 12 },
  { id: "family-monthly",     name: "Family",   connections: 3, term: "monthly",   termLabel: "1 Month",   price: 40,  perMonth: 40,    badge: null,           highlight: false, description: "Three simultaneous streams",   months: 1  },
  { id: "family-quarterly",   name: "Family",   connections: 3, term: "quarterly", termLabel: "3 Months",  price: 100, perMonth: 33.33, badge: null,           highlight: false, description: "Family savings",               months: 3  },
  { id: "family-annual",      name: "Family",   connections: 3, term: "annual",    termLabel: "12 Months", price: 300, perMonth: 25,    badge: null,           highlight: false, description: "Best family rate",             months: 12 },
  { id: "premium-monthly",    name: "Premium",  connections: 4, term: "monthly",   termLabel: "1 Month",   price: 50,  perMonth: 50,    badge: null,           highlight: false, description: "Power user setup",             months: 1  },
  { id: "premium-quarterly",  name: "Premium",  connections: 4, term: "quarterly", termLabel: "3 Months",  price: 120, perMonth: 40,    badge: null,           highlight: false, description: "Quarterly premium value",      months: 3  },
  { id: "max-monthly",        name: "Max",      connections: 5, term: "monthly",   termLabel: "1 Month",   price: 60,  perMonth: 60,    badge: null,           highlight: false, description: "Full household coverage",      months: 1  },
  { id: "max-quarterly",      name: "Max",      connections: 5, term: "quarterly", termLabel: "3 Months",  price: 150, perMonth: 50,    badge: null,           highlight: false, description: "Max streams, max savings",     months: 3  },
];