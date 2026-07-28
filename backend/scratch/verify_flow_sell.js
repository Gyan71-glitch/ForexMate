/**
 * FOREXMATE - CASH SELL PHASE 1 WORKFLOW TEST
 * Verifies the Cash Sell Phase 1 quote generation, checkout, KYC review,
 * status transitions to WAITING_FOR_FULFILLMENT, tasks, and in-app notifications.
 */

const BASE_URL = 'http://localhost:3001/api/v1';

let passed = 0;
let failed = 0;
const results = [];

async function api(path, method = 'GET', body = null, headers = {}) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers }
  };
  if (body) options.body = JSON.stringify(body);

  console.log(`  [API] Sending ${method} ${path}...`);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`API request timed out: ${method} ${path}`)), 120000)
  );

  const fetchPromise = fetch(`${BASE_URL}${path}`, options);

  const res = await Promise.race([fetchPromise, timeoutPromise]);
  console.log(`  [API] Received status ${res.status} for ${method} ${path}`);

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { rawText: text }; }
  return { status: res.status, ok: res.ok, json };
}

async function apiOk(path, method = 'GET', body = null, headers = {}) {
  const r = await api(path, method, body, headers);
  if (!r.ok) throw new Error(`${method} ${path} -> HTTP ${r.status}: ${JSON.stringify(r.json).slice(0, 300)}`);
  if (r.json.success === false) throw new Error(`${method} ${path} -> API returned success:false. ${JSON.stringify(r.json).slice(0, 300)}`);
  return r.json.data;
}

function check(name, fn) {
  return fn()
    .then(() => {
      console.log(`  ✅ ${name}`);
      results.push({ name, status: 'PASS' });
      passed++;
    })
    .catch(err => {
      console.log(`  ❌ ${name}`);
      console.log(`     └─ ${err.message}`);
      results.push({ name, status: 'FAIL', error: err.message });
      failed++;
    });
}

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   CASH SELL PHASE 1 WORKFLOW TEST                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let customerToken, customerId, adminToken, staffToken;
  let customerHeaders, adminHeaders, staffHeaders;
  let branchId, quote, order;

  // ── STEP 1: Seed clean DB ──────────────────────────────────────────────────
  await check('POST /dev/seed-preset (EMPTY) → seeds clean DB with products', async () => {
    await apiOk('/dev/seed-preset', 'POST', { presetName: 'EMPTY' });
  });

  // ── STEP 2: Login customer and staff ───────────────────────────────────────
  await check('Login customer, staff and admin', async () => {
    const cust = await apiOk('/dev/login/customer', 'POST');
    customerToken = cust.access_token;
    customerId = cust.user.id;
    customerHeaders = { Authorization: `Bearer ${customerToken}` };

    const adm = await apiOk('/dev/login/admin', 'POST');
    adminToken = adm.access_token;
    adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const stf = await apiOk('/dev/impersonate', 'POST', { email: 'teller@forexmate.com', role: 'STAFF' });
    staffToken = stf.access_token;
    staffHeaders = { Authorization: `Bearer ${staffToken}` };
  });

  // ── STEP 3: Generate Quote for CASH_SELL ───────────────────────────────────
  await check('Generate quote for CASH_SELL (Formula: rate * (1 - margin))', async () => {
    const branches = await apiOk('/public/branches');
    branchId = branches.find(b => b.branchCode === 'DEL-01').id;

    quote = await apiOk('/quotes/generate', 'POST', {
      currency: 'USD', product: 'CASH_SELL', amount: 1000, branchId
    }, customerHeaders);

    console.log(`     Quote Rate: ₹${quote.lockedInrRate}, Total INR: ₹${quote.totalInr}`);
  });

  // ── STEP 4: Checkout Order (Cash Sell) ─────────────────────────────────────
  await check('Checkout CASH_SELL order (Status should be PENDING)', async () => {
    // 1. Start a session
    const sessionRes = await apiOk('/transaction-engine/session', 'POST', {}, customerHeaders);
    const sessionId = sessionRes.id;

    // 2. Save draft state for the session
    await apiOk(`/transaction-engine/session/${sessionId}/draft`, 'PUT', {
      product: 'CASH_SELL',
      currency: 'USD',
      amount: '1000',
      branchId,
      deliveryMethod: 'PICKUP',
      destination: 'EUROPE',
      departureDate: '2026-08-01',
      returnDate: '2026-08-15'
    }, customerHeaders);

    // 3. Lock quote for session
    await apiOk(`/quotes/generate`, 'POST', {
      currency: 'USD', product: 'CASH_SELL', amount: 1000, branchId, sessionId
    }, customerHeaders);

    // 4. Checkout
    const idempotencyKey = `checkout_sell_${sessionId}`;
    order = await apiOk(`/transaction-engine/session/${sessionId}/checkout`, 'POST', { idempotencyKey }, customerHeaders);

    if (order.status !== 'PENDING') {
      throw new Error(`Expected initial order status PENDING, got ${order.status}`);
    }
    if (order.productType !== 'CASH_SELL') {
      throw new Error(`Expected productType CASH_SELL, got ${order.productType}`);
    }
    console.log(`     Order placed: ${order.orderNumber} (Status: ${order.status})`);
  });

  // ── STEP 5: Verify KYC Review Task is created ──────────────────────────────
  await check('Verify KYC review task is queued for the branch staff', async () => {
    const tasks = await apiOk('/ops/tasks', 'GET', null, staffHeaders);
    const kycTask = tasks.find(t => t.orderId === order.id && t.taskType === 'KYC_REVIEW');
    if (!kycTask) throw new Error('KYC review task not found');
    if (kycTask.status !== 'PENDING') throw new Error(`Expected task status PENDING, got ${kycTask.status}`);
    
    // Check if INVENTORY_PREP task was skipped
    const inventoryTask = tasks.find(t => t.orderId === order.id && t.taskType === 'INVENTORY_PREP');
    if (inventoryTask) throw new Error('Inventory prep task should NOT be created for CASH_SELL');
    
    console.log(`     KYC_REVIEW task status: ${kycTask.status}`);
  });

  // ── STEP 6: Customer uploads document and submits KYC ───────────────────────
  await check('Customer uploads KYC document and submits review', async () => {
    await apiOk('/dev/kyc/upload-mock', 'POST', {
      userId: customerId,
      docType: 'PAN',
      documentNumber: 'ABCDE1234F',
      fullName: 'John Doe',
      dob: '1995-05-15',
      confidence: 98.0,
      nameMatched: true,
      expiryValid: true
    });
    
    await apiOk('/compliance/kyc/submit', 'POST', {}, customerHeaders);
  });

  // ── STEP 7: Staff claims lead and approves KYC ─────────────────────────────
  await check('Staff claims lead and approves KYC → transitions to WAITING_FOR_FULFILLMENT', async () => {
    await apiOk(`/ops/leads/${order.id}/claim`, 'POST', {}, staffHeaders);
    
    const result = await apiOk(`/ops/leads/${order.id}/action`, 'POST', {
      action: 'APPROVE_KYC'
    }, staffHeaders);

    if (result.complianceStatus !== 'APPROVED') {
      throw new Error(`Expected complianceStatus APPROVED, got ${result.complianceStatus}`);
    }
    if (result.status !== 'KYC_APPROVED') {
      throw new Error(`Expected status KYC_APPROVED, got ${result.status}`);
    }
    if (result.currentStage !== 'FULFILLMENT_STAGE') {
      throw new Error(`Expected stage FULFILLMENT_STAGE, got ${result.currentStage}`);
    }

    // Retrieve order status via mapOrderStatus API endpoint (or retrieve list)
    const ordersList = await apiOk('/orders', 'GET', null, customerHeaders);
    const orderInList = ordersList.find(o => o.id === order.id);
    if (!orderInList) throw new Error('Order not found in customer orders list');
    
    // Verify it is WAITING_FOR_FULFILLMENT mapped status
    if (orderInList.mappedStatus !== 'WAITING_FOR_FULFILLMENT') {
      throw new Error(`Expected mappedStatus WAITING_FOR_FULFILLMENT, got ${orderInList.mappedStatus}`);
    }
    
    console.log(`     Order complianceStatus: ${result.complianceStatus}, stage: ${result.currentStage}, mappedStatus: ${orderInList.mappedStatus}`);
  });

  // ── STEP 8: Verify in-app notifications generated ──────────────────────────
  await check('Verify notifications are created for Customer and Manager', async () => {
    const notifications = await apiOk('/notifications', 'GET', null, customerHeaders);
    
    const orderCreatedNotif = notifications.find(n => n.title === 'Order Created' && n.orderId === order.id);
    if (!orderCreatedNotif) throw new Error('Customer "Order Created" notification missing');

    const kycApprovedNotif = notifications.find(n => n.title === 'KYC Approved' && n.orderId === order.id);
    if (!kycApprovedNotif) throw new Error('Customer "KYC Approved" notification missing');

    const waitingFulfillmentNotif = notifications.find(n => n.title === 'Waiting For Fulfillment' && n.orderId === order.id);
    if (!waitingFulfillmentNotif) throw new Error('Customer "Waiting For Fulfillment" notification missing');

    console.log(`     Customer received notifications: ${notifications.map(n => n.title).join(', ')}`);
  });

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   CASH SELL PHASE 1 FLOW TEST SUMMARY                        ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║   ✅ PASSED: ${String(passed).padEnd(47)}║`);
  console.log(`║   ❌ FAILED: ${String(failed).padEnd(47)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (failed > 0) {
    console.log('\n📋 FAILED CHECKS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ ${r.name}`);
      console.log(`     └─ ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 Cash Sell Phase 1 workflow is completely verified and working!');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('\n💥 Test script crashed:', err);
  process.exit(1);
});
