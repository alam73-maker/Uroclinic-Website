const { chromium } = require(process.env.PW || 'playwright');
const assert = require('node:assert/strict');
const BASE = process.env.BASE || 'http://localhost:4500';
const OUT = process.env.OUT || '.';
let passed = 0;
const ok = (n) => { passed++; console.log('  ok', n); };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  const errors = [];
  const watch = (p) => {
    p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); if (m.type() === 'warning') console.log('    warn:', m.text()); });
    p.on('pageerror', (e) => errors.push(e.message));
  };

  const routes = ['/', '/about/', '/treatments/', '/treatments/prostate-health/', '/international-patients/', '/research/', '/videos/', '/patient-stories/', '/appointments/', '/clinic/', '/privacy/', '/terms/', '/cookies/', '/refunds/', '/admin/'];
  for (const w of [1440, 390, 320]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await ctx.newPage(); watch(p);
    for (const r of routes) for (const pre of ['', '/en']) {
      const res = await p.goto(BASE + pre + r);
      assert.equal(res.status(), 200, pre + r);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(sw <= w + 1, `${pre + r} overflows at ${w}: ${sw}`);
    }
    await ctx.close();
  }
  ok(`all ${routes.length * 2} pages load without sideways scrolling at 1440, 390 and 320px`);

  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); watch(p);
  await p.goto(BASE + '/');
  assert.equal(await p.getAttribute('html', 'dir'), 'rtl');
  await p.click('.topbar .lang');
  await p.waitForURL(BASE + '/en/');
  assert.equal(await p.getAttribute('html', 'dir'), 'ltr');
  ok('Arabic is the default (RTL) and the language switch goes to English');

  await p.goto(BASE + '/en/appointments/?utm_source=meta&utm_medium=paid&utm_campaign=oct_test');
  await p.waitForSelector('.loc');
  assert.ok(await p.isVisible('[data-demo]'));
  const locCount = await p.locator('.loc').count();
  assert.ok(locCount >= 2);
  await p.locator('.loc').first().click();
  await p.waitForSelector('[data-panel="1"]:not([hidden])');
  assert.ok(await p.locator('.day.is-selected').count() === 1);
  const firstTime = p.locator('.time').first();
  const timeText = (await firstTime.textContent()).trim();
  await firstTime.click();
  await p.waitForSelector('[data-panel="2"]:not([hidden])');
  assert.equal((await p.textContent('[data-sum="time"]')).trim(), timeText);
  ok('choose location → day → time, summary updates');

  await p.fill('#bk-name', 'Test Patient');
  await p.fill('#bk-phone', '123');
  await p.check('input[name="consent"]');
  await p.click('[data-submit]');
  assert.ok(await p.isVisible('[data-error]'));
  ok('rejects an invalid phone number with a clear message');

  await p.fill('#bk-phone', '01001234567');
  await p.selectOption('#bk-heard', 'instagram');
  await p.click('[data-submit]');
  await p.waitForSelector('[data-panel="3"]:not([hidden])');
  const ref = (await p.textContent('[data-ref]')).trim();
  assert.match(ref, /^UC-[0-9A-F]{6}$/);
  const ics = await p.getAttribute('[data-ics]', 'href');
  assert.ok(ics.startsWith('blob:'));
  await p.screenshot({ path: `${OUT}/booking-done-en.png` });
  ok(`booking completes with reference ${ref} and calendar file`);

  await p.click('[data-restart]');
  await p.locator('.loc').first().click();
  await p.waitForSelector('[data-panel="1"]:not([hidden])');
  const times = await p.locator('.time').allTextContents();
  const sameDay = (await p.textContent('[data-sum="date"]'));
  assert.ok(!times.map((x) => x.trim()).includes(timeText) || !sameDay, 'booked time should be gone');
  ok('the booked time disappears from availability');

  await p.goto(BASE + '/en/admin/');
  await p.click('[data-demo-signin]');
  await p.waitForSelector('.adm-row');
  const row = p.locator('.adm-row', { hasText: ref });
  assert.equal(await row.count(), 1);
  const rowText = await row.textContent();
  assert.ok(rowText.includes('+201001234567'));
  assert.ok(rowText.includes('Instagram') && rowText.includes('meta / paid / oct_test'));
  ok('admin sees the booking with normalised phone and source (Instagram · meta / paid / oct_test)');

  await row.locator('select').selectOption('confirmed');
  await p.waitForSelector('.toast:not([hidden])');
  assert.equal((await p.textContent('.toast')).trim(), 'Saved');
  await p.waitForSelector('.toast', { state: 'hidden', timeout: 5000 });
  assert.equal(await p.locator('.adm-row', { hasText: ref }).locator('select').inputValue(), 'confirmed');
  ok('reception can confirm a booking');

  await p.click('[data-tab="availability"]');
  await p.waitForSelector('.cal');
  const form = p.locator('[data-view="availability"] form');
  await form.locator('input[name="from"]').fill(new Date(Date.now() + 70 * 864e5).toISOString().slice(0, 10));
  await form.locator('input[name="to"]').fill(new Date(Date.now() + 76 * 864e5).toISOString().slice(0, 10));
  await form.locator('input[name="wd"][value="5"]').check({ force: true });
  await form.locator('input[name="start"]').fill('10:00');
  await form.locator('input[name="end"]').fill('12:00');
  await form.locator('select[name="minutes"]').selectOption('30');
  assert.match(await form.locator('.adm-preview').textContent(), /4/);
  await form.locator('button[type="submit"]').click();
  await p.waitForSelector('.toast:not([hidden])');
  assert.match(await p.textContent('.toast'), /Created 4/);
  await p.waitForFunction(() => document.querySelectorAll('.chip').length === 4);
  ok('reception can add 4 Friday slots (10:00–12:00, 30 min) for a location');

  const chips = await p.locator('.chip.c-open').count();
  await p.locator('.chip.c-open').first().locator('.chip-acts button').first().click();
  await p.waitForTimeout(300);
  assert.equal(await p.locator('.chip.c-blocked').count(), 1);
  assert.equal(await p.locator('.chip.c-open').count(), chips - 1);
  ok('reception can block a slot');

  await p.screenshot({ path: `${OUT}/admin-availability-en.png`, fullPage: true });
  await p.click('[data-tab="bookings"]');
  await p.screenshot({ path: `${OUT}/admin-bookings-en.png`, fullPage: true });

  const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await m.newPage(); watch(mp);
  await mp.goto(BASE + '/appointments/');
  await mp.waitForSelector('.loc');
  await mp.screenshot({ path: `${OUT}/booking-1-ar-mobile.png` });
  await mp.locator('.loc').nth(1).tap();
  await mp.waitForSelector('[data-panel="1"]:not([hidden])');
  await mp.screenshot({ path: `${OUT}/booking-2-ar-mobile.png` });
  await mp.locator('.time').first().tap();
  await mp.fill('#bk-name', 'أحمد علي');
  await mp.fill('#bk-phone', '+971501234567');
  await mp.check('input[name="consent"]');
  await mp.screenshot({ path: `${OUT}/booking-3-ar-mobile.png` });
  await mp.tap('[data-submit]');
  await mp.waitForSelector('[data-panel="3"]:not([hidden])');
  await mp.screenshot({ path: `${OUT}/booking-4-ar-mobile.png` });
  ok('Arabic mobile booking works end to end with an international number');

  const csp = errors.filter((e) => /Content Security Policy|Refused/.test(e));
  assert.deepEqual(csp, [], 'CSP violations: ' + csp.join('\n'));
  assert.deepEqual(errors, [], 'console errors: ' + errors.join('\n'));
  ok('no console errors and no security-policy violations');

  await b.close();
  console.log(`\n${passed} browser checks passed`);
})().catch((e) => { console.error(e); process.exit(1); });
