import { test, expect } from '@playwright/test';

test.describe('Производительность', () => {
  // Определяем страницы для проверки
  const pages = ['/', '/services/', '/portfolio/', '/about/'];

  // Пороги для LCP (в мс)
  const LCP_THRESHOLD = 2500;

  test('LCP (Largest Contentful Paint) < 2.5 секунды на всех страницах', async ({ page }) => {
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('LCP timeout')), 10000);
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1];
              clearTimeout(timeout);
              resolve(lastEntry.startTime);
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        });
      });

      expect(lcp, `LCP на ${url} превышает порог`).toBeLessThan(LCP_THRESHOLD);
    }
  });

  test('CLS (Cumulative Layout Shift) < 0.1 на всех страницах', async ({ page }) => {
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      // Дополнительное ожидание для возможных смещений после загрузки
      await page.waitForTimeout(2000);

      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve(clsValue), 3000);
        });
      });

      expect(cls, `CLS на ${url} превышает порог`).toBeLessThan(0.1);
    }
  });

  test('размер HTML главной страницы < 50 КБ', async ({ page }) => {
    const response = await page.goto('/');
    const html = await response!.text();
    const sizeInKB = Buffer.byteLength(html, 'utf-8') / 1024;
    expect(sizeInKB).toBeLessThan(50);
  });

  test('нет ошибок в консоли браузера', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const relevantErrors = errors.filter(
      (e) =>
        !e.includes('chrome-extension') &&
        !e.includes('favicon.ico') &&
        !e.includes('Failed to load resource')
    );
    expect(relevantErrors).toEqual([]);
  });

  test('сайт работает без JavaScript (прогрессивное улучшение)', async ({ browser }) => {
    // Создаём новый контекст с отключенным JS
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Проверяем, что базовый контент виден
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // Контакты доступны
    const phoneLink = page.locator('a[href^="tel:"]').first();
    await expect(phoneLink).toBeAttached();

    // Навигация работает (переход по ссылке)
    await page.locator('a[href="/services/"]').first().click();
    await expect(page).toHaveURL(/\/services\/?$/);
    await expect(page.locator('h1')).toContainText('Услуги');

    await context.close();
  });
});
