// lib/wave.js
// Wave GraphQL API integration
// Handles customer creation and invoice generation automatically
// when a customer is activated in the admin panel.

const WAVE_API_URL = "https://gql.waveapps.com/graphql/public";

// ─────────────────────────────────────────
// Core GraphQL request helper
// ─────────────────────────────────────────
async function waveQuery(query, variables = {}) {
  const res = await fetch(WAVE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WAVE_FULL_ACCESS_TOKEN}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  // Log raw HTTP status so we catch auth failures (401, 403) immediately
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wave HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();

  // Log the full response so nothing is hidden
  console.log("[Wave] response:", JSON.stringify(json, null, 2));

  if (json.errors) {
    throw new Error(`Wave API error: ${json.errors.map(e => e.message).join(", ")}`);
  }

  return json.data;
}

// ─────────────────────────────────────────
// Step 1: Find existing customer by email
// ─────────────────────────────────────────
async function findCustomer(email) {
  console.log("[Wave] findCustomer:", email);

  const data = await waveQuery(`
    query($businessId: ID!) {
      business(id: $businessId) {
        customers(pageSize: 50) {
          edges {
            node {
              id
              name
              email
            }
          }
        }
      }
    }
  `, {
    businessId: process.env.WAVE_BUSINESS_ID,
  });

  const customers = data.business.customers.edges;
  const match = customers.find(
    ({ node }) => node.email?.toLowerCase() === email.toLowerCase()
  );

  console.log("[Wave] customer match:", match?.node ?? "none — will create");
  return match ? match.node : null;
}

// ─────────────────────────────────────────
// Step 2: Create customer in Wave
// ─────────────────────────────────────────
async function createCustomer(name, email) {
  console.log("[Wave] createCustomer:", { name, email });

  const data = await waveQuery(`
    mutation($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          name
          email
        }
        didSucceed
        inputErrors {
          message
          code
          path
        }
      }
    }
  `, {
    input: {
      businessId: process.env.WAVE_BUSINESS_ID,
      name:       name || email,
      email,
    },
  });

  if (!data.customerCreate.didSucceed) {
    const errors = data.customerCreate.inputErrors.map(e => `[${e.path}] ${e.message}`).join(", ");
    throw new Error(`Failed to create Wave customer: ${errors}`);
  }

  console.log("[Wave] customer created:", data.customerCreate.customer.id);
  return data.customerCreate.customer;
}

// ─────────────────────────────────────────
// Step 3: Create invoice in Wave
// ─────────────────────────────────────────
async function createInvoice({ customerId, planName, planTerm, price, dueDate }) {
  // Ensure price is a number — Wave rejects strings
  const unitPrice = parseFloat(price);
  if (isNaN(unitPrice) || unitPrice <= 0) {
    throw new Error(`Invalid price for Wave invoice: "${price}" (parsed: ${unitPrice})`);
  }

  const description = `${planName} — ${planTerm} subscription`;

  console.log("[Wave] createInvoice:", {
    businessId:  process.env.WAVE_BUSINESS_ID,
    customerId,
    productId:   process.env.WAVE_PRODUCT_ID,
    description,
    unitPrice,
    dueDate,
  });

  const data = await waveQuery(`
    mutation($input: InvoiceCreateInput!) {
      invoiceCreate(input: $input) {
        invoice {
          id
          viewUrl
        }
        didSucceed
        inputErrors {
          message
          code
          path
        }
      }
    }
  `, {
    input: {
      businessId: process.env.WAVE_BUSINESS_ID,
      customerId,
      status:     "SAVED",
      dueDate,
      memo:       `North Hill Systems LLC — ${description}. All services are prepaid and non-refundable. Terms: https://northhillsystems.com/terms`,
      items: [{
        productId:   process.env.WAVE_PRODUCT_ID,
        description,
        quantity:    1,
        unitPrice,
      }],
    },
  });

  if (!data.invoiceCreate.didSucceed) {
    const errors = data.invoiceCreate.inputErrors.map(e => `[${e.path}] ${e.message} (${e.code})`).join(", ");
    throw new Error(`Failed to create Wave invoice: ${errors}`);
  }

  console.log("[Wave] invoice created:", data.invoiceCreate.invoice.id);
  return data.invoiceCreate.invoice;
}

// ─────────────────────────────────────────
// Step 3b: Approve invoice (draft → approved)
// ─────────────────────────────────────────
async function approveInvoice(invoiceId) {
  console.log("[Wave] approveInvoice:", invoiceId);

  const data = await waveQuery(`
    mutation($input: InvoiceApproveInput!) {
      invoiceApprove(input: $input) {
        didSucceed
        inputErrors {
          message
          code
          path
        }
      }
    }
  `, { input: { invoiceId } });

  if (!data.invoiceApprove.didSucceed) {
    const errors = data.invoiceApprove.inputErrors.map(e => `[${e.path}] ${e.message} (${e.code})`).join(", ");
    throw new Error(`Failed to approve Wave invoice: ${errors}`);
  }

  console.log("[Wave] invoice approved:", invoiceId);
  return true;
}

// ─────────────────────────────────────────
// Step 4: Send invoice to customer email
// ─────────────────────────────────────────
async function sendInvoice(invoiceId, customerEmail) {
  console.log("[Wave] sendInvoice:", invoiceId, "→", customerEmail);

  const data = await waveQuery(`
    mutation($input: InvoiceSendInput!) {
      invoiceSend(input: $input) {
        didSucceed
        inputErrors {
          message
          code
          path
        }
      }
    }
  `, {
    input: {
      invoiceId,
      to:      [customerEmail],  // Must be explicit — empty array silently skips delivery
      subject: "Your North Hill Systems Invoice",
      message: "Thank you for choosing North Hill Systems. Please find your invoice attached. Payment is due upon receipt.",
    },
  });

  if (!data.invoiceSend.didSucceed) {
    // Don't throw — invoice is created, sending is best-effort
    console.error("[Wave] invoice send failed:", JSON.stringify(data.invoiceSend.inputErrors, null, 2));
    return false;
  }

  console.log("[Wave] invoice sent:", invoiceId);
  return true;
}

// ─────────────────────────────────────────
// Main export — called from activate route
// ─────────────────────────────────────────
export async function createWaveInvoice({ userName, userEmail, planName, planTerm, price, startDate }) {
  console.log("[Wave] createWaveInvoice called:", { userName, userEmail, planName, planTerm, price, startDate });

  // Verify env vars are present before making any API calls
  const missing = ["WAVE_FULL_ACCESS_TOKEN", "WAVE_BUSINESS_ID", "WAVE_PRODUCT_ID"].filter(k => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing Wave env vars: ${missing.join(", ")}`);
  }

  const dueDate = new Date(startDate).toISOString().split("T")[0];

  const customer = await findCustomer(userEmail) ?? await createCustomer(userName, userEmail);
  const invoice  = await createInvoice({ customerId: customer.id, planName, planTerm, price, dueDate });

  await approveInvoice(invoice.id);
  await sendInvoice(invoice.id, userEmail);

  return {
    invoiceId:  invoice.id,
    invoiceUrl: invoice.viewUrl,
    customerId: customer.id,
  };
}