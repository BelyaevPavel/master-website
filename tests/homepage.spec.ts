// tests/homepage.spec.ts
import { test, expect } from '@playwright/test';
import { SITE_CONFIG } from './config';

test.describe('Главная страница — базовые проверки', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded'); // или networkidle при необходимости
  });

  test('страница загружается с корректным title', async ({ page }) => {
    await expect(page).toHaveTitle(new RegExp(SITE_CONFIG.title));
  });

  test('установлен корректный lang="ru"', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('H1 содержит название города', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    // Если город динамический, лучше брать из данных
    await expect(h1).toContainText(SITE_CONFIG.city);
  });

  test('есть только один H1 на странице', async ({ page }) => {
    expect(await page.locator('h1').count()).toBe(1);
  });

  test('все основные секции присутствуют', async ({ page }) => {
    // Используем data-testid, если они есть, иначе гибкие селекторы
    await expect(page.locator('[data-testid="section-services"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="section-portfolio"]')).toBeVisible();
    await expect(page.locator('[data-testid="section-testimonials"]')).toBeVisible();
  });

  test('favicon доступен и загружается', async ({ page }) => {
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href', /favicon/);
    const href = await favicon.getAttribute('href');
    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image');
  });

  test('мета-описание присутствует', async ({ page }) => {
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);
  });
});
