import { Selector, ClientFunction } from 'testcafe';

// =========================================================
// Student Performance Tracker – TestCafe Test Suite
// Prerequisites:
//   1. API running: cd API && npm start  (port 3000)
//   2. Client served: cd CLIENT && npx serve . -p 8080
// =========================================================

const APP_URL = 'http://localhost:8080';

fixture('Student Performance Tracker')
  .page(APP_URL)
  .beforeEach(async t => {
    // Give the page a moment to load and connect to the API
    await t.wait(800);
  });

// ─── 1. PAGE LOADS ──────────────────────────────────────
test('Page loads with correct title', async t => {
  await t
    .expect(Selector('.logo-text').innerText).contains('SPTracker');
});

// ─── 2. DASHBOARD VIEW ──────────────────────────────────
test('Dashboard shows statistics cards', async t => {
  await t
    .expect(Selector('#stat-total').exists).ok()
    .expect(Selector('#stat-avg').exists).ok()
    .expect(Selector('#stat-top').exists).ok()
    .expect(Selector('#stat-courses').exists).ok();
});

test('Dashboard loads student count from API', async t => {
  // Wait for data to load
  await t.wait(1500);
  const totalVal = await Selector('#statTotal').innerText;
  await t.expect(parseInt(totalVal)).gt(0, 'Total students should be > 0');
});

test('Dashboard shows top performers table', async t => {
  await t.wait(1500);
  const rows = Selector('#topTableBody tr');
  await t.expect(rows.count).gt(0, 'Top performers table should have rows');
});

// ─── 3. NAVIGATION ──────────────────────────────────────
test('Clicking All Students nav shows students view', async t => {
  await t
    .click(Selector('.nav-btn').withText('All Students'))
    .expect(Selector('#view-students').hasClass('active')).ok();
});

test('Clicking Add Student nav shows add form', async t => {
  await t
    .click(Selector('.nav-btn').withText('Add Student'))
    .expect(Selector('#view-add').hasClass('active')).ok();
});

// ─── 4. GET – LOAD STUDENTS ─────────────────────────────
test('Students table loads data from API (GET /api/students)', async t => {
  await t
    .click(Selector('.nav-btn').withText('All Students'))
    .wait(1500);

  const rows = Selector('#studentTableBody tr');
  await t.expect(rows.count).gt(0, 'Should load at least one student row');
});

test('Student table has correct column headers', async t => {
  await t.click(Selector('.nav-btn').withText('All Students'));
  const headers = Selector('#studentTable thead th');
  await t
    .expect(headers.nth(1).innerText).contains('NAME')
    .expect(headers.nth(3).innerText).contains('COURSE')
    .expect(headers.nth(4).innerText).contains('GRADE');
});

// ─── 5. SEARCH & FILTER ─────────────────────────────────
test('Search by name filters the table', async t => {
  await t
    .click(Selector('.nav-btn').withText('All Students'))
    .wait(1200)
    .typeText('#searchInput', 'John')
    .wait(400);

  const rows = Selector('#studentTableBody tr');
  // Every visible row should contain "John"
  const firstRowText = await rows.nth(0).innerText;
  await t.expect(firstRowText.toLowerCase()).contains('john');
});

test('Course filter narrows results to selected course', async t => {
  await t
    .click(Selector('.nav-btn').withText('All Students'))
    .wait(1200)
    .click('#courseFilter')
    .click(Selector('#courseFilter option').withText('Computing'))
    .wait(400);

  const rows = Selector('#studentTableBody tr');
  const count = await rows.count;
  await t.expect(count).gt(0, 'Should show Computing students');

  // Spot-check first row has Computing
  const firstRowText = await rows.nth(0).innerText;
  await t.expect(firstRowText).contains('Computing');
});

// ─── 6. POST – CREATE STUDENT ───────────────────────────
test('Add student form shows validation error for empty submit', async t => {
  await t
    .click(Selector('.nav-btn').withText('Add Student'))
    .click('#submitBtn');

  const msg = await Selector('#formMsg').innerText;
  await t.expect(msg.toLowerCase()).contains('required');
});

test('Add student form creates a new student (POST)', async t => {
  const timestamp = Date.now();
  const testEmail = `test.${timestamp}@uni.ac.uk`;

  await t
    .click(Selector('.nav-btn').withText('Add Student'))
    .typeText('#f-name',  'Test Student')
    .typeText('#f-age',   '20')
    .click('#f-course')
    .click(Selector('#f-course option').withText('Computing'))
    .typeText('#f-grade', '75')
    .typeText('#f-email', testEmail)
    .typeText('#f-year',  '2024')
    .click('#submitBtn')
    .wait(1000);

  const msg = await Selector('#formMsg').innerText;
  await t.expect(msg.toLowerCase()).contains('added');
});

// ─── 7. PUT – EDIT STUDENT ──────────────────────────────
test('Edit button opens the edit modal', async t => {
  await t
    .click(Selector('.nav-btn').withText('All Students'))
    .wait(1500);

  const firstEditBtn = Selector('.btn-edit').nth(0);
  await t
    .click(firstEditBtn)
    .expect(Selector('#editModal').hasClass('open')).ok();
});

test('Edit modal can be closed with cancel button', async t => {
  await t
    .click(Selector('.nav-btn').withText('All Students'))
    .wait(1500)
    .click(Selector('.btn-edit').nth(0))
    .expect(Selector('#editModal').hasClass('open')).ok()
    .click(Selector('.btn-secondary').withText('Cancel'))
    .expect(Selector('#editModal').hasClass('open')).notOk();
});

// ─── 8. DELETE – DELETE STUDENT ─────────────────────────
test('Delete button opens confirmation modal', async t => {
  await t
    .click(Selector('.nav-btn').withText('All Students'))
    .wait(1500);

  const firstDeleteBtn = Selector('.btn-delete').nth(0);
  await t
    .click(firstDeleteBtn)
    .expect(Selector('#deleteModal').hasClass('open')).ok();
});

test('Delete confirmation modal can be cancelled', async t => {
  await t
    .click(Selector('.nav-btn').withText('All Students'))
    .wait(1500)
    .click(Selector('.btn-delete').nth(0))
    .click(Selector('#deleteModal .btn-secondary'))
    .expect(Selector('#deleteModal').hasClass('open')).notOk();
});

// ─── 9. API STATUS ──────────────────────────────────────
test('API status indicator is visible', async t => {
  await t
    .wait(1200)
    .expect(Selector('.api-status').exists).ok();
});

test('API status shows online when API is running', async t => {
  await t.wait(1500);
  const statusText = await Selector('#statusText').innerText;
  await t.expect(statusText).contains('Online');
});