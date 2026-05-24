import puppeteer from 'puppeteer';

const PANEL_URL = 'https://thexpanel.xyz';
const USERNAME  = 'NorthHIll';
const PASSWORD  = 'dovzar-4dabMi-zektuw';

const browser = await puppeteer.launch({
  headless: true,
  ignoreHTTPSErrors: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--ignore-certificate-errors',
    '--allow-running-insecure-content',
    '--disable-web-security',
    '--unsafely-treat-insecure-origin-as-secure=http://thexpanel.xyz',
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const client = await page.createCDPSession();
  await client.send('Security.setIgnoreCertificateErrors', { ignore: true });

  // Intercept all requests and force HTTPS
  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.startsWith('http://thexpanel.xyz')) {
      const httpsUrl = url.replace('http://', 'https://');
      console.log(`[intercept] Redirecting ${url} → ${httpsUrl}`);
      req.continue({ url: httpsUrl });
    } else {
      req.continue();
    }
  });

  page.on('response', res => {
    if (res.url().includes('thexpanel')) {
      console.log(`[net] ${res.status()} ${res.url()}`);
    }
  });

  console.log('[puppeteer] Going to login page...');
  await page.goto(`${PANEL_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('[puppeteer] Login URL:', page.url());
  console.log('[puppeteer] Login title:', await page.title());

  await page.type('input[name="username"]', USERNAME);
  await page.type('input[name="password"]', PASSWORD);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 })
      .catch(e => console.log('[nav timeout]', e.message)),
    page.click('button[type="submit"]'),
  ]);

  console.log('[puppeteer] Post-login URL:', page.url());
  console.log('[puppeteer] Post-login title:', await page.title());

  const csrfToken = await page.evaluate(() => {
    const meta  = document.querySelector('meta[name="csrf-token"]');
    const input = document.querySelector('input[name="_token"]');
    return meta?.getAttribute('content') || input?.value || null;
  });
  console.log('[puppeteer] CSRF token:', csrfToken ? csrfToken.slice(0, 20) + '...' : 'NOT FOUND');

  if (!csrfToken) {
    // Dump page content for debugging
    const html = await page.content();
    console.log('[puppeteer] Page HTML preview:', html.slice(0, 500));
    throw new Error('No CSRF token found');
  }

  // Create line via fetch inside browser (uses browser session cookies automatically)
  const result = await page.evaluate(async (panelUrl, csrf) => {
    const body = new URLSearchParams({
      _token:           csrf,
      current_bouquets: '4,15,23,24,25,26,27,28,29,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,55,56,57,58,59,60,61,62,68,69,70,71,73,74,75,76,78,79,77,80,81,66,82,84,85,86,90,100,63,64,65,67,83,89,92,93,94,95,96,99,101,102,106,107,109,110,111,112,113',
      line_type:        'line',
      username:         'nh_puptest2',
      password:         'TestPass456x',
      mac:              '',
      package:          '2',
      package_id:       '2',
      trial:            '1',
      q:                '',
      description:      'Puppeteer test',
    });

    const res = await fetch(`${panelUrl}/lines/create/1`, {
      method:  'POST',
      headers: {
        'Content-Type':     'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-TOKEN':     csrf,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept':           '*/*',
        'Referer':          `${panelUrl}/`,
        'Origin':           panelUrl,
      },
      body: body.toString(),
    });

    const text = await res.text();
    return { status: res.status, url: res.url, body: text.slice(0, 400) };
  }, PANEL_URL, csrfToken);

  console.log('[puppeteer] Create status:', result.status);
  console.log('[puppeteer] Create response:', result.body);

} catch (err) {
  console.error('[puppeteer] ❌', err.message);
} finally {
  await browser.close();
}