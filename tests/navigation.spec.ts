import { test, expect } from '@playwright/test';

test.describe('Навигация и внутренние ссылки', () => {
  const BASE_URL = 'http://localhost:4321'; // или взять из конфига

  test('все внутренние ссылки в навигации ведут на существующие страницы (статус 200)', async ({
    page,
  }) => {
    await page.goto('/');
    const navLinks = page.locator('[data-testid="main-nav"] a[href^="/"]');
    const count = await navLinks.count();

    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute('href');
      const response = await page.request.get(href!);
      expect(response.status(), `Ссылка ${href} вернула статус ${response.status()}`).toBe(200);
    }
  });

  test('футер содержит телефон, email и ссылки на соцсети', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('[data-testid="footer"]');

    await expect(footer.locator('a[href^="tel:"]')).toBeAttached();
    await expect(footer.locator('a[href^="mailto:"]')).toBeAttached();
    await expect(footer.locator('a[href*="vk.com"]')).toBeAttached();
    await expect(footer.locator('a[href*="instagram.com"]')).toBeAttached();
  });

  test('все внешние ссылки открываются в новой вкладке с правильными атрибутами безопасности', async ({
    page,
  }) => {
    await page.goto('/');
    // Ищем все ссылки, ведущие на внешние ресурсы (не на свой домен)
    const externalLinks = page.locator('a:not([href^="/"]):not([href^="#"])');
    const count = await externalLinks.count();

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const href = await link.getAttribute('href');
      // Пропускаем ссылки mailto: tel: и т.п.
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

      // Проверяем, что это внешняя ссылка (не localhost)
      const url = new URL(href);
      if (url.hostname === new URL(BASE_URL).hostname) continue;

      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener.*noreferrer|noreferrer.*noopener/);
    }
  });

  test('ссылка "Смотреть все работы" ведёт на страницу портфолио', async ({ page }) => {
    await page.goto('/');
    const portfolioLink = page.locator('a[href="/portfolio/"]').first();
    await expect(portfolioLink).toBeAttached();
    await portfolioLink.click();
    await expect(page).toHaveURL(/\/portfolio\/?$/);
    // Дополнительно проверяем, что страница загрузилась
    await expect(page.locator('h1')).toContainText('Портфолио');
  });

  test('логотип ведёт на главную страницу', async ({ page }) => {
    await page.goto('/portfolio/'); // идём на другую страницу
    const logo = page.locator('[data-testid="logo"]');
    await expect(logo).toHaveAttribute('href', '/');
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('хлебные крошки корректно отображаются на странице услуг', async ({ page }) => {
    await page.goto('/services/');
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.locator('a[href="/"]')).toHaveText('Главная');
    await expect(breadcrumb.locator('a[href="/services/"]')).toHaveText('Услуги');
    // Текущая страница без ссылки
    await expect(breadcrumb.locator('.active')).toHaveText('Услуги');
  });
});
