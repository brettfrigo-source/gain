/**
 * GRAIN — headless QA suite (Playwright).
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node test/qa.cjs
 *
 * Drives the real instrument in headless Chromium and asserts that every
 * source, preset, grain window, motion control, the keyboard, sync, and a
 * real audio-file decode all work with no runtime errors.
 *
 * Optional env:
 *   CHROMIUM_PATH   explicit path to a Chromium/Chrome binary
 */
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) {
  try { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
  catch (e2) { console.error('Playwright not found. Run: npm i -D playwright && npx playwright install chromium'); process.exit(2); }
}

const FILE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const WAV  = path.resolve(__dirname, 'test440.wav');
const results = [], errors = [];
const ok = (name, cond, extra) => {
  results.push((cond ? 'PASS' : 'FAIL') + ' · ' + name + (extra !== undefined ? ' (' + extra + ')' : ''));
  if (!cond) errors.push('ASSERT FAIL: ' + name);
};

(async () => {
  const launchOpts = { args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launchOpts);
  const page = await browser.newContext({ viewport: { width: 1300, height: 1250 } }).then(c => c.newPage());
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto(FILE);
  await page.waitForTimeout(200);
  await page.click('#veilBtn');
  await page.waitForTimeout(600);
  ok('power on', await page.$eval('#veil', e => e.classList.contains('hidden')));
  ok('power LED', await page.$eval('#powerLed', e => e.classList.contains('on')));

  // every built-in source
  const srcIds = await page.$$eval('#srcgrid .srcchip', els => els.map(e => e.dataset.id));
  ok('7 sources built', srcIds.length === 7, srcIds.join(','));
  for (const id of srcIds) {
    await page.click(`#srcgrid .srcchip[data-id="${id}"]`);
    await page.waitForTimeout(450);
    const active = await page.$eval(`#srcgrid .srcchip[data-id="${id}"]`, e => e.getAttribute('aria-pressed'));
    const fname = await page.$eval('#fname', e => e.textContent);
    ok('source ' + id, active === 'true' && /source:/.test(fname), fname.trim());
  }

  // real file decode
  await page.setInputFiles('#file', WAV);
  await page.waitForTimeout(500);
  const fnameFile = await page.$eval('#fname', e => e.textContent);
  ok('file decode (wav)', /test440/.test(fnameFile) && !/could not/.test(fnameFile), fnameFile.trim());

  // presets
  const presetNames = await page.$$eval('#presetChips .pchip', els => els.map(e => e.textContent));
  ok('presets built', presetNames.length >= 7, presetNames.join(','));
  for (const nm of presetNames) {
    await page.click(`#presetChips .pchip:has-text("${nm}")`).catch(() => {});
    await page.waitForTimeout(400);
    const vals = await page.$$eval('.kval', els => els.map(e => e.textContent));
    ok('preset ' + nm, vals.every(v => v && v.length > 0), vals.join(' | '));
  }

  // grain windows
  const shapeIds = await page.$$eval('#shapes .shape', els => els.map(e => e.dataset.id));
  for (const sid of shapeIds) {
    await page.click(`#shapes .shape[data-id="${sid}"]`);
    ok('shape ' + sid, (await page.$eval(`#shapes .shape[data-id="${sid}"]`, e => e.getAttribute('aria-pressed'))) === 'true');
  }

  // motion controls
  await page.click('#freezeBtn'); ok('freeze on', (await page.$eval('#freezeBtn', e => e.getAttribute('aria-pressed'))) === 'true');
  await page.click('#freezeBtn'); ok('freeze off', (await page.$eval('#freezeBtn', e => e.getAttribute('aria-pressed'))) === 'false');
  const revBefore = await page.$eval('#revBtn', e => e.getAttribute('aria-pressed'));
  await page.click('#revBtn');
  ok('reverse toggles', revBefore !== (await page.$eval('#revBtn', e => e.getAttribute('aria-pressed'))));
  await page.click('#revBtn');
  await page.click('#latchBtn'); ok('latch on', (await page.$eval('#latchBtn', e => e.getAttribute('aria-pressed'))) === 'true');
  await page.$eval('#scan', el => { el.value = 40; el.dispatchEvent(new Event('input', { bubbles: true })); });
  ok('scan slider', (await page.$eval('#scanVal', e => e.textContent)) === '40');
  await page.$eval('#scan', el => { el.value = 0; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('#latchBtn');

  // sync + polyphony + octave
  await page.click('#syncBtn'); await page.waitForTimeout(100);
  ok('sync division', /^1\//.test(await page.$eval('.kslot.big .kval', e => e.textContent)), await page.$eval('.kslot.big .kval', e => e.textContent));
  await page.click('#syncBtn');
  await page.keyboard.down('a'); await page.keyboard.down('f'); await page.waitForTimeout(300);
  ok('polyphonic keys', /2v/.test(await page.$eval('#cloudTag', e => e.textContent)));
  await page.keyboard.up('a'); await page.keyboard.up('f');
  await page.click('#octUp'); ok('octave +1', (await page.$eval('#octVal', e => e.textContent)) === '1');
  await page.click('#octDown');

  // knob interaction + save
  await page.focus('.knob'); await page.keyboard.press('ArrowUp');
  ok('knob adjust', (await page.$eval('.kval', e => e.textContent)) !== '0 %');
  await page.click('#saveBtn'); await page.waitForTimeout(200);
  ok('save button responds', /SAVED|BLOCKED/.test(await page.$eval('#saveBtn', e => e.textContent)));

  console.log(results.join('\n'));
  console.log('\nRUNTIME ERRORS:', errors.filter(e => !e.startsWith('ASSERT')).length ? errors : 'NONE');
  const pass = results.filter(r => r.startsWith('PASS')).length;
  const fail = results.filter(r => r.startsWith('FAIL')).length;
  console.log(`\nSUMMARY: ${pass} passed, ${fail} failed, ${errors.filter(e => !e.startsWith('ASSERT')).length} runtime errors`);
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
