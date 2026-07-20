import { test, expect } from '@playwright/test';

test.describe('SEO — мета-теги', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('длина title в оптимальном диапазоне (30–70 символов)', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThanOrEqual(30);
    expect(title.length).toBeLessThanOrEqual(70);
  });

  test('description имеет оптимальную длину (120–170 символов)', async ({ page }) => {
    const desc = page.locator('meta[name="description"]');
    const content = await desc.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThanOrEqual(120);
    expect(content!.length).toBeLessThanOrEqual(170);
  });

  test('canonical URL соответствует текущей странице', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute('href');
    const currentUrl = page.url().replace(/\/$/, ''); // убираем трейлинговый слеш
    expect(href).toBe(currentUrl);
  });

  test('Open Graph теги присутствуют и содержат валидные данные', async ({ page }) => {
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /^https?:\/\/.+/);
    const imageUrl = await ogImage.getAttribute('content');
    const response = await page.request.get(imageUrl!);
    expect(response.status()).toBe(200);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  });

  test('robots разрешает индексацию (если присутствует)', async ({ page }) => {
    const robots = page.locator('meta[name="robots"]');
    if ((await robots.count()) > 0) {
      const content = await robots.getAttribute('content');
      expect(content).toContain('index');
      expect(content).toContain('follow');
      expect(content).not.toContain('noindex');
    }
    // Если robots отсутствует – это допустимо (по умолчанию разрешено)
  });
});

test.describe('Schema.org JSON-LD разметка', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Вспомогательная функция для поиска объекта по @type
  async function findSchemaByType(page, type) {
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    for (let i = 0; i < count; i++) {
      const content = await scripts.nth(i).innerText();
      const data = JSON.parse(content);
      // Поиск в объекте или массиве (рекурсивно, но для простоты – плоский)
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === type) return item;
        // Если есть @graph – проверим и там
        if (item['@graph']) {
          for (const sub of item['@graph']) {
            if (sub['@type'] === type) return sub;
          }
        }
      }
    }
    return null;
  }

  test('LocalBusiness schema валидна и содержит обязательные поля', async ({ page }) => {
    const localBusiness = await findSchemaByType(page, 'LocalBusiness');
    expect(localBusiness).not.toBeNull();

    expect(localBusiness.name).toBeTruthy();
    expect(localBusiness.telephone).toMatch(/^\+7\d{10}$/);
    expect(localBusiness.address).toBeDefined();
    expect(localBusiness.address['@type']).toBe('PostalAddress');
    expect(localBusiness.address.streetAddress).toBeTruthy();
    expect(localBusiness.address.addressLocality).toBeTruthy();
    expect(localBusiness.address.postalCode).toBeTruthy();
    expect(localBusiness['@context']).toBe('https://schema.org');
  });

  test('LocalBusiness содержит aggregateRating с корректными значениями', async ({ page }) => {
    const localBusiness = await findSchemaByType(page, 'LocalBusiness');
    expect(localBusiness).not.toBeNull();
    expect(localBusiness.aggregateRating).toBeDefined();

    const rating = localBusiness.aggregateRating;
    expect(rating['@type']).toBe('AggregateRating');
    const ratingValue = Number(rating.ratingValue);
    expect(ratingValue).not.toBeNaN();
    expect(ratingValue).toBeGreaterThanOrEqual(4);
    const reviewCount = Number(rating.reviewCount);
    expect(reviewCount).not.toBeNaN();
    expect(reviewCount).toBeGreaterThan(0);
  });

  test('FAQ schema валидна', async ({ page }) => {
    const faqSchema = await findSchemaByType(page, 'FAQPage');
    expect(faqSchema).not.toBeNull();
    expect(faqSchema.mainEntity).toBeInstanceOf(Array);
    expect(faqSchema.mainEntity.length).toBeGreaterThanOrEqual(3);

    faqSchema.mainEntity.forEach((item) => {
      expect(item['@type']).toBe('Question');
      expect(item.name).toBeTruthy();
      expect(item.acceptedAnswer).toBeDefined();
      expect(item.acceptedAnswer['@type']).toBe('Answer');
      expect(item.acceptedAnswer.text).toBeTruthy();
    });
  });

  test('все изображения в портфолио имеют осмысленные alt', async ({ page }) => {
    // Уточняем селектор: только изображения внутри секции портфолио
    const portfolioImages = page.locator('section.portfolio img, [data-testid="portfolio-image"]');
    const count = await portfolioImages.count();
    for (let i = 0; i < count; i++) {
      const alt = await portfolioImages.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt!.length).toBeGreaterThan(5);
      expect(alt!.toLowerCase()).not.toBe('image');
      expect(alt!.toLowerCase()).not.toBe('photo');
      expect(alt!.toLowerCase()).not.toMatch(/^img_?\d+$/i);
    }
  });
});
