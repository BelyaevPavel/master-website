import { test, expect } from '@playwright/test';

test.describe('Изображения', () => {
  // Список ключевых страниц для проверки
  const pages = ['/', '/services/', '/portfolio/', '/about/'];

  test('все изображения (кроме Hero) имеют loading="lazy"', async ({ page }) => {
    // Проверяем только главную, чтобы не дублировать
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img:not([data-testid="hero-image"])');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      // Пропускаем декоративные иконки (маленькие)
      const width = await img.getAttribute('width');
      if (width && parseInt(width) < 30) continue;

      const loading = await img.getAttribute('loading');
      expect(loading, `Image #${i} should have loading="lazy"`).toBe('lazy');
    }
  });

  test('все изображения имеют явные размеры (width/height) для предотвращения CLS', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      // Игнорируем изображения с явным CSS aspect-ratio (но лучше иметь width/height)
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      const hasAttrs = !!(width && height);

      // Проверяем, что либо есть атрибуты, либо CSS aspect-ratio задан
      const hasAspectRatio = await img.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.aspectRatio !== 'auto';
      });

      expect(
        hasAttrs || hasAspectRatio,
        `Image #${i} should have width/height attributes or CSS aspect-ratio`
      ).toBe(true);
    }
  });

  test('все изображения в портфолио загружаются (статус 200)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Используем data-testid, если есть, иначе уточняем селектор
    const portfolioImages = page.locator('[data-testid="portfolio-image"], section.portfolio img');
    const count = await portfolioImages.count();

    for (let i = 0; i < count; i++) {
      const img = portfolioImages.nth(i);
      let src = await img.getAttribute('src');
      if (!src) {
        // Если используется data-src (ленивая загрузка)
        src = await img.getAttribute('data-src');
      }
      if (!src) continue;

      // Если src относительный, строим полный URL
      const fullUrl = src.startsWith('http') ? src : `http://localhost:4321${src}`;
      const response = await page.request.get(fullUrl);
      expect(response.status(), `Image ${src} should be accessible`).toBe(200);
    }
  });

  test('favicon существует и доступен (по указанному в разметке пути)', async ({ page }) => {
    await page.goto('/');
    const faviconLink = page.locator('link[rel="icon"]');
    await expect(faviconLink).toBeAttached();
    const href = await faviconLink.getAttribute('href');
    expect(href).toBeTruthy();

    // Если путь относительный, строим полный
    const fullUrl = href!.startsWith('http') ? href! : `http://localhost:4321${href}`;
    const response = await page.request.get(fullUrl);
    expect(response.status()).toBe(200);
    // Проверяем MIME-тип (опционально)
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(
      /image\/x-icon|image\/vnd.microsoft.icon|image\/svg\+xml|image\/png/
    );
  });

  // (Опционально) Проверка формата изображений (WebP)
  test('все изображения используют современные форматы (webp/avif)', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img:not([data-testid="hero-image"])');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src');
      if (!src) continue;
      expect(src, `Image ${src} should be in webp or avif format`).toMatch(/\.(webp|avif)/);
    }
  });
});
