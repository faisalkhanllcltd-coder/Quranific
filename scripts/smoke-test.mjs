const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

async function checkStatus(url, expectedStatus = 200) {
  let res = await fetch(url, { redirect: 'manual' });
  if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
    const location = res.headers.get('location');
    if (location) {
      const redirectUrl = new URL(location, url).toString();
      res = await fetch(redirectUrl, { redirect: 'manual' });
    }
  }
  if (res.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} for ${url}, got ${res.status}`);
  }
  return res;
}

async function run() {
  console.log('Running smoke tests...');

  // 1. HTTP 200 checks
  await checkStatus(`${BASE_URL}/`);
  await checkStatus(`${BASE_URL}/tuition-fee`);

  // 2. Apex edge redirects (middleware handles www -> apex)
  const apexRes = await fetch(`${BASE_URL}/`, {
    headers: {
      Host: 'www.quranific.com',
      'X-Forwarded-Host': 'www.quranific.com',
    },
    redirect: 'manual',
  });
  if (apexRes.status !== 301) {
    throw new Error(`Expected 301 for www apex redirect, got ${apexRes.status}`);
  }
  console.log('Apex redirect verified.');

  // 3. Security headers on HTML page
  const homeRes = await checkStatus(`${BASE_URL}/`);
  const csp = homeRes.headers.get('content-security-policy');
  if (!csp) {
    throw new Error('Missing Content-Security-Policy header');
  }
  console.log('Security headers verified.');

  // 4. Programmable checks against /api/geo-currency by mocking CF-IPCountry / X-Debug-Country
  const geoResUK = await fetch(`${BASE_URL}/api/geo-currency`, {
    headers: { 'CF-IPCountry': 'GB', 'X-Debug-Country': 'GB' },
  });
  if (geoResUK.status !== 200) {
    throw new Error(`Expected 200 for geo-currency UK, got ${geoResUK.status}`);
  }
  const geoDataUK = await geoResUK.json();
  if (geoDataUK.currency !== 'GBP') {
    throw new Error(`Expected GBP for GB country, got ${geoDataUK.currency}`);
  }
  console.log('Geo-currency UK verified.');

  // 5. Programmable checks against /api/consent-bucket by mocking CF-IPCountry / X-Debug-Country
  const consentResEU = await fetch(`${BASE_URL}/api/consent-bucket`, {
    headers: { 'CF-IPCountry': 'FR', 'X-Debug-Country': 'FR' },
  });
  if (consentResEU.status !== 200) {
    throw new Error(`Expected 200 for consent-bucket EU, got ${consentResEU.status}`);
  }
  const consentDataEU = await consentResEU.json();
  if (consentDataEU.bucket !== 'STRICT') {
    throw new Error(`Expected STRICT for FR country, got ${consentDataEU.bucket}`);
  }
  console.log('Consent bucket EU verified.');

  console.log('Smoke tests passed!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
