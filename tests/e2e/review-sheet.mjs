import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://quranific.com';
const OUT_DIR = 'D:\\Live Web\\quranific-review';
const IMG_DIR = path.join(OUT_DIR, 'img');

if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

const AD_ANALYTICS_PATTERNS = [
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com',
  'googleadservices.com',
  'doubleclick.net',
  'facebook.com',
  'cloudflareinsights.com',
];

const ROUTES = [
  { id: 'home', title: 'Home', path: '/' },
  { id: 'courses', title: 'Courses Hub', path: '/courses' },
  { id: 'course-basics', title: 'Course: Quran Reading Basics', path: '/courses/quran-reading-basics' },
  { id: 'course-tajweed', title: 'Course: Tajweed Rules', path: '/courses/tajweed-rules' },
  { id: 'course-memorization', title: 'Course: Quran Memorization', path: '/courses/quran-memorization' },
  { id: 'course-islamic', title: 'Course: Islamic Studies', path: '/courses/islamic-studies' },
  { id: 'course-arabic', title: 'Course: Arabic Language', path: '/courses/arabic-language' },
  { id: 'faq', title: 'FAQ', path: '/faq' },
  { id: 'tuition-fee', title: 'Tuition Fee & Calculator', path: '/tuition-fee' },
  { id: 'about', title: 'About Us', path: '/about' },
  { id: 'contact', title: 'Contact', path: '/contact' },
  { id: 'apply-teacher', title: 'Apply as Teacher', path: '/apply-teacher' },
  { id: 'signup', title: 'Signup - Step 1', path: '/getting-started/signup' },
  { id: 'complete', title: 'Signup - Complete', path: '/getting-started/complete' },
  { id: 'success', title: 'Signup - Success', path: '/getting-started/success' },
  { id: 'privacy', title: 'Privacy Policy', path: '/legal/privacy' },
  { id: 'terms', title: 'Terms of Service', path: '/legal/terms' },
  { id: 'cookies', title: 'Cookie Policy', path: '/legal/cookies' },
  { id: 'refund', title: 'Refund Policy', path: '/legal/refund' },
  { id: 'impressum', title: 'Impressum', path: '/legal/impressum' },
  { id: 'portals', title: 'Portals Hub', path: '/portals' },
  { id: 'classes-kids', title: 'Intent: Classes for Kids', path: '/quran-classes/for-kids' },
  { id: 'classes-adults', title: 'Intent: Classes for Adults', path: '/quran-classes/for-adults' },
  { id: 'classes-women', title: 'Intent: Classes for Women', path: '/quran-classes/for-women' },
  { id: 'teacher-kids', title: 'Intent: Teacher for Kids', path: '/quran-teacher/for-kids' },
  { id: 'teacher-adults', title: 'Intent: Teacher for Adults', path: '/quran-teacher/for-adults' },
  { id: 'teacher-women', title: 'Intent: Teacher for Women', path: '/quran-teacher/for-women' },
  { id: 'blog', title: 'Blog Hub', path: '/blog' },
  { id: 'blog-post', title: 'Blog Post', path: '/blog/how-to-teach-kids-quran-at-home' },
  { id: 'not-found', title: '404 Page', path: '/404' },
];

async function captureRoute(page, item, isMobile) {
  const width = isMobile ? 390 : 1440;
  const height = isMobile ? 844 : 900;
  await page.setViewportSize({ width, height });

  const url = `${BASE_URL}${item.path}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  const scrollHeight = await page.evaluate(
    () => document.documentElement.scrollHeight || document.body.scrollHeight
  );
  const clipHeight = Math.min(scrollHeight, 5000);

  const filename = `${item.id}-${isMobile ? 'mobile' : 'desktop'}.jpg`;
  const filePath = path.join(IMG_DIR, filename);

  await page.screenshot({
    path: filePath,
    type: 'jpeg',
    quality: 70,
    clip: { x: 0, y: 0, width, height: clipHeight },
  });

  return filename;
}

async function captureExtraStates(browser) {
  const extraItems = [];

  // Helper context setup
  async function createContext(withConsent = true, isMobile = false) {
    const context = await browser.newContext({
      viewport: isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      isMobile,
      userAgent: isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1 QuranificReview/1.0'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 QuranificReview/1.0',
    });

    if (withConsent) {
      await context.addCookies([
        {
          name: 'cf_consent_v1',
          value: 'STRICT:accepted',
          domain: 'quranific.com',
          path: '/',
        },
      ]);
    }

    const page = await context.newPage();
    await page.route('**/*', (route) => {
      const u = route.request().url();
      if (AD_ANALYTICS_PATTERNS.some((p) => u.includes(p))) {
        return route.abort();
      }
      route.continue();
    });

    return { context, page };
  }

  // 1. Home with Consent Banner
  for (const isMobile of [false, true]) {
    const { context, page } = await createContext(false, isMobile);
    await page.route('**/api/consent-bucket', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ bucket: 'STRICT', hasGPC: false }) })
    );
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const filename = `extra-home-banner-${isMobile ? 'mobile' : 'desktop'}.jpg`;
    await page.screenshot({
      path: path.join(IMG_DIR, filename),
      type: 'jpeg',
      quality: 70,
      clip: { x: 0, y: 0, width: isMobile ? 390 : 1440, height: isMobile ? 844 : 900 },
    });
    await context.close();
  }
  extraItems.push({
    id: 'extra-home-banner',
    title: 'Extra State: Home with Consent Banner',
    path: '/',
    desktopImg: 'extra-home-banner-desktop.jpg',
    mobileImg: 'extra-home-banner-mobile.jpg',
  });

  // 2. Home with Customize Panel Open
  for (const isMobile of [false, true]) {
    const { context, page } = await createContext(false, isMobile);
    await page.route('**/api/consent-bucket', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ bucket: 'STRICT', hasGPC: false }) })
    );
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const manageBtn = page.locator('button:has-text("Manage preferences")').first();
    if (await manageBtn.isVisible()) {
      await manageBtn.click();
      await page.waitForTimeout(400);
    }
    const filename = `extra-home-customize-${isMobile ? 'mobile' : 'desktop'}.jpg`;
    await page.screenshot({
      path: path.join(IMG_DIR, filename),
      type: 'jpeg',
      quality: 70,
      clip: { x: 0, y: 0, width: isMobile ? 390 : 1440, height: isMobile ? 844 : 900 },
    });
    await context.close();
  }
  extraItems.push({
    id: 'extra-home-customize',
    title: 'Extra State: Home with Consent Customize Panel',
    path: '/',
    desktopImg: 'extra-home-customize-desktop.jpg',
    mobileImg: 'extra-home-customize-mobile.jpg',
  });

  // 3. Mobile menu open (captured on mobile and tablet/desktop)
  for (const isMobile of [false, true]) {
    const { context, page } = await createContext(true, isMobile);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const menuBtn = page.locator('button[aria-label*="menu" i], button[aria-expanded]').first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(400);
    }
    const filename = `extra-mobile-menu-${isMobile ? 'mobile' : 'desktop'}.jpg`;
    await page.screenshot({
      path: path.join(IMG_DIR, filename),
      type: 'jpeg',
      quality: 70,
      clip: { x: 0, y: 0, width: isMobile ? 390 : 1440, height: isMobile ? 844 : 900 },
    });
    await context.close();
  }
  extraItems.push({
    id: 'extra-mobile-menu',
    title: 'Extra State: Mobile Menu Open',
    path: '/',
    desktopImg: 'extra-mobile-menu-desktop.jpg',
    mobileImg: 'extra-mobile-menu-mobile.jpg',
  });

  // 4. One FAQ item open
  for (const isMobile of [false, true]) {
    const { context, page } = await createContext(true, isMobile);
    await page.goto(`${BASE_URL}/faq`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const faqItem = page.locator('button[aria-controls], details summary, [data-accordion-trigger]').first();
    if (await faqItem.isVisible()) {
      await faqItem.click();
      await page.waitForTimeout(400);
    }
    const filename = `extra-faq-open-${isMobile ? 'mobile' : 'desktop'}.jpg`;
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight || document.body.scrollHeight);
    await page.screenshot({
      path: path.join(IMG_DIR, filename),
      type: 'jpeg',
      quality: 70,
      clip: { x: 0, y: 0, width: isMobile ? 390 : 1440, height: Math.min(scrollHeight, 4000) },
    });
    await context.close();
  }
  extraItems.push({
    id: 'extra-faq-open',
    title: 'Extra State: FAQ with Item Expanded',
    path: '/faq',
    desktopImg: 'extra-faq-open-desktop.jpg',
    mobileImg: 'extra-faq-open-mobile.jpg',
  });

  // 5. /tuition-fee with calculator selection
  for (const isMobile of [false, true]) {
    const { context, page } = await createContext(true, isMobile);
    await page.goto(`${BASE_URL}/tuition-fee`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const radioBtn = page.locator('input[type="radio"], button:has-text("4 Days"), button:has-text("3 Days")').first();
    if (await radioBtn.isVisible()) {
      await radioBtn.click();
      await page.waitForTimeout(400);
    }
    const filename = `extra-tuition-calc-${isMobile ? 'mobile' : 'desktop'}.jpg`;
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight || document.body.scrollHeight);
    await page.screenshot({
      path: path.join(IMG_DIR, filename),
      type: 'jpeg',
      quality: 70,
      clip: { x: 0, y: 0, width: isMobile ? 390 : 1440, height: Math.min(scrollHeight, 4000) },
    });
    await context.close();
  }
  extraItems.push({
    id: 'extra-tuition-calc',
    title: 'Extra State: Tuition Fee Calculator Selection',
    path: '/tuition-fee',
    desktopImg: 'extra-tuition-calc-desktop.jpg',
    mobileImg: 'extra-tuition-calc-mobile.jpg',
  });

  // 6. /contact submitted empty (validation messages)
  for (const isMobile of [false, true]) {
    const { context, page } = await createContext(true, isMobile);
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(400);
    }
    const filename = `extra-contact-empty-${isMobile ? 'mobile' : 'desktop'}.jpg`;
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight || document.body.scrollHeight);
    await page.screenshot({
      path: path.join(IMG_DIR, filename),
      type: 'jpeg',
      quality: 70,
      clip: { x: 0, y: 0, width: isMobile ? 390 : 1440, height: Math.min(scrollHeight, 4000) },
    });
    await context.close();
  }
  extraItems.push({
    id: 'extra-contact-empty',
    title: 'Extra State: Contact Submitted Empty (Validation)',
    path: '/contact',
    desktopImg: 'extra-contact-empty-desktop.jpg',
    mobileImg: 'extra-contact-empty-mobile.jpg',
  });

  // 7. Footer newsletter with invalid email
  for (const isMobile of [false, true]) {
    const { context, page } = await createContext(true, isMobile);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const emailInput = page.locator('footer input[type="email"]').first();
    const submitBtn = page.locator('footer button[type="submit"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.scrollIntoViewIfNeeded();
      await emailInput.fill('invalid-email-address');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(400);
      }
    }
    const filename = `extra-footer-invalid-${isMobile ? 'mobile' : 'desktop'}.jpg`;
    const footer = page.locator('footer').first();
    if (await footer.isVisible()) {
      await footer.screenshot({
        path: path.join(IMG_DIR, filename),
        type: 'jpeg',
        quality: 70,
      });
    } else {
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight || document.body.scrollHeight);
      await page.screenshot({
        path: path.join(IMG_DIR, filename),
        type: 'jpeg',
        quality: 70,
        clip: { x: 0, y: 0, width: isMobile ? 390 : 1440, height: Math.min(scrollHeight, 4000) },
      });
    }
    await context.close();
  }
  extraItems.push({
    id: 'extra-footer-invalid',
    title: 'Extra State: Footer Newsletter Invalid Email',
    path: '/',
    desktopImg: 'extra-footer-invalid-desktop.jpg',
    mobileImg: 'extra-footer-invalid-mobile.jpg',
  });

  // 8. Signup Step 1 with validation errors
  for (const isMobile of [false, true]) {
    const { context, page } = await createContext(true, isMobile);
    await page.goto(`${BASE_URL}/getting-started/signup`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(400);
    }
    const filename = `extra-signup-validation-${isMobile ? 'mobile' : 'desktop'}.jpg`;
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight || document.body.scrollHeight);
    await page.screenshot({
      path: path.join(IMG_DIR, filename),
      type: 'jpeg',
      quality: 70,
      clip: { x: 0, y: 0, width: isMobile ? 390 : 1440, height: Math.min(scrollHeight, 4000) },
    });
    await context.close();
  }
  extraItems.push({
    id: 'extra-signup-validation',
    title: 'Extra State: Signup Step 1 with Validation Errors',
    path: '/getting-started/signup',
    desktopImg: 'extra-signup-validation-desktop.jpg',
    mobileImg: 'extra-signup-validation-mobile.jpg',
  });

  return extraItems;
}

function generateHtml(sections) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quranific Production Visual Review Sheet</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #090d16;
      color: #e2e8f0;
      line-height: 1.5;
      padding-bottom: 80px;
    }
    header.sticky-top {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #1e293b;
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: #0284c7;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .issues-panel {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .issues-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .issues-box {
      width: 100%;
      height: 70px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #f8fafc;
      font-family: monospace;
      font-size: 0.85rem;
      padding: 8px 12px;
      resize: vertical;
    }
    .btn {
      background: #10b981;
      color: #fff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: background 0.15s ease;
    }
    .btn:hover { background: #059669; }
    .btn-secondary { background: #475569; }
    .btn-secondary:hover { background: #334155; }
    main {
      max-width: 1560px;
      margin: 24px auto;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .section-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f1f5f9;
    }
    .section-link {
      color: #38bdf8;
      text-decoration: none;
      font-size: 0.85rem;
      word-break: break-all;
    }
    .section-link:hover { text-decoration: underline; }
    .thumbs-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .thumbs-grid { grid-template-columns: 1fr; }
    }
    .thumb-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .thumb-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: #cbd5e1;
    }
    .thumb-img-wrapper {
      position: relative;
      background: #000;
      border-radius: 4px;
      overflow: hidden;
      max-height: 480px;
      cursor: zoom-in;
    }
    .thumb-img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      object-position: top;
    }
    .btn-issue {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-issue:hover { background: #d97706; }
    /* Modal */
    #modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    #modal.open { display: flex; }
    #modal-img {
      max-width: 95vw;
      max-height: 95vh;
      object-fit: contain;
      border-radius: 6px;
      box-shadow: 0 0 40px rgba(0,0,0,0.8);
    }
    #modal-close {
      position: absolute;
      top: 20px;
      right: 25px;
      font-size: 2rem;
      color: #fff;
      cursor: pointer;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <header class="sticky-top">
    <div class="top-row">
      <h1>
        Quranific Production Visual Review Sheet
        <span class="badge">${sections.length} States / Routes</span>
      </h1>
      <div style="display:flex; gap:10px;">
        <button class="btn" id="btn-copy">Copy All Issues</button>
        <button class="btn btn-secondary" id="btn-clear">Clear</button>
      </div>
    </div>
    <div class="issues-panel">
      <div class="issues-header">
        <span>Issues Log (auto-saved to localStorage; format: URL | desktop or mobile | what I see | what I expected)</span>
        <span id="issue-count">0 items logged</span>
      </div>
      <textarea id="issues-box" class="issues-box" placeholder="No issues reported yet. Click '+ issue' below any screenshot to record one."></textarea>
    </div>
  </header>

  <main>
    ${sections.map((sec) => `
      <section class="section-card" id="${sec.id}">
        <div class="section-header">
          <div class="section-title">${sec.title}</div>
          <a class="section-link" href="${BASE_URL}${sec.path}" target="_blank" rel="noopener noreferrer">${BASE_URL}${sec.path} ↗</a>
        </div>
        <div class="thumbs-grid">
          <div class="thumb-card">
            <div class="thumb-meta">
              <strong>Desktop (1440px)</strong>
              <button class="btn-issue" onclick="addIssue('${sec.path}', 'desktop')">+ issue</button>
            </div>
            <div class="thumb-img-wrapper" onclick="openModal('img/${sec.desktopImg}')">
              <img class="thumb-img" src="img/${sec.desktopImg}" alt="${sec.title} Desktop" loading="lazy" />
            </div>
          </div>
          <div class="thumb-card">
            <div class="thumb-meta">
              <strong>Mobile (390px)</strong>
              <button class="btn-issue" onclick="addIssue('${sec.path}', 'mobile')">+ issue</button>
            </div>
            <div class="thumb-img-wrapper" onclick="openModal('img/${sec.mobileImg}')">
              <img class="thumb-img" src="img/${sec.mobileImg}" alt="${sec.title} Mobile" loading="lazy" />
            </div>
          </div>
        </div>
      </section>
    `).join('')}
  </main>

  <div id="modal" onclick="closeModal()">
    <span id="modal-close">&times;</span>
    <img id="modal-img" src="" alt="Full view" onclick="event.stopPropagation()" />
  </div>

  <script>
    const box = document.getElementById('issues-box');
    const countEl = document.getElementById('issue-count');
    const STORAGE_KEY = 'quranific_review_issues_v1';

    function updateCount() {
      const lines = box.value.split('\\n').filter(l => l.trim().length > 0);
      countEl.innerText = lines.length + ' item' + (lines.length === 1 ? '' : 's') + ' logged';
    }

    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      box.value = saved;
      updateCount();
    }

    box.addEventListener('input', () => {
      localStorage.setItem(STORAGE_KEY, box.value);
      updateCount();
    });

    function addIssue(path, device) {
      const see = window.prompt("What do you see?");
      if (see === null || see.trim() === '') return;
      const exp = window.prompt("What did you expect?");
      if (exp === null || exp.trim() === '') return;
      const line = path + ' | ' + device + ' | ' + see.trim() + ' | ' + exp.trim();
      if (box.value.trim().length > 0) {
        box.value = box.value.trim() + '\\n' + line;
      } else {
        box.value = line;
      }
      localStorage.setItem(STORAGE_KEY, box.value);
      updateCount();
    }

    document.getElementById('btn-copy').addEventListener('click', () => {
      if (!box.value.trim()) {
        alert('Issues box is empty.');
        return;
      }
      navigator.clipboard.writeText(box.value).then(() => {
        alert('Copied all issues to clipboard!');
      });
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      if (confirm('Clear all recorded issues?')) {
        box.value = '';
        localStorage.removeItem(STORAGE_KEY);
        updateCount();
      }
    });

    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    function openModal(src) {
      modalImg.src = src;
      modal.classList.add('open');
    }
    function closeModal() {
      modal.classList.remove('open');
      modalImg.src = '';
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>`;
}

async function main() {
  console.log(`Starting review sheet generation against ${BASE_URL}...`);
  const browser = await chromium.launch();

  // Context for regular routes
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QuranificReview/1.0',
  });

  await context.addCookies([
    {
      name: 'cf_consent_v1',
      value: 'STRICT:accepted',
      domain: new URL(BASE_URL).hostname,
      path: '/',
    },
  ]);

  const page = await context.newPage();
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (AD_ANALYTICS_PATTERNS.some((p) => u.includes(p))) {
      return route.abort();
    }
    route.continue();
  });

  const sections = [];

  for (let i = 0; i < ROUTES.length; i++) {
    const routeItem = ROUTES[i];
    console.log(`[${i + 1}/${ROUTES.length}] Capturing ${routeItem.title} (${routeItem.path})...`);
    try {
      const desktopImg = await captureRoute(page, routeItem, false);
      const mobileImg = await captureRoute(page, routeItem, true);
      sections.push({
        ...routeItem,
        desktopImg,
        mobileImg,
      });
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`Failed to capture ${routeItem.path}:`, err);
    }
  }

  await context.close();

  console.log('Capturing extra states...');
  const extraSections = await captureExtraStates(browser);
  sections.push(...extraSections);

  await browser.close();

  // Generate HTML
  const html = generateHtml(sections);
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html, 'utf-8');

  // Compute stats
  const imgFiles = fs.readdirSync(IMG_DIR);
  let totalBytes = 0;
  for (const f of imgFiles) {
    totalBytes += fs.statSync(path.join(IMG_DIR, f)).size;
  }
  const htmlSize = fs.statSync(path.join(OUT_DIR, 'index.html')).size;
  totalBytes += htmlSize;
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log(`\nReview sheet generated at: ${path.join(OUT_DIR, 'index.html')}`);
  console.log(`Total sections/routes: ${sections.length}`);
  console.log(`Total images: ${imgFiles.length}`);
  console.log(`Total folder size: ${totalMB} MB (< 60 MB limit)`);
}

main().catch((err) => {
  console.error('Fatal in review-sheet.mjs:', err);
  process.exit(1);
});
