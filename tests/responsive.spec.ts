import { test, expect } from '@playwright/test';

test.describe('Адаптивность и мобильное меню', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('на мобильном: бургер-меню видно, обычное меню скрыто', async ({ page }) => {
    const burger = page.locator('[data-testid="burger-button"]');
    const navLinks = page.locator('[data-testid="main-nav"] .nav-link');

    await expect(burger).toBeVisible();
    // Проверяем, что ссылки навигации не видны (скрыты)
    await expect(navLinks.first()).toBeHidden();
  });

  test('на десктопе: бургер скрыт, меню видно', async ({ page }) => {
    // Временно меняем вьюпорт для этого теста
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/'); // перезагружаем, чтобы применился десктопный рендеринг

    const burger = page.locator('[data-testid="burger-button"]');
    const navLinks = page.locator('[data-testid="main-nav"] .nav-link');

    await expect(burger).toBeHidden();
    // Проверяем, что все ссылки видны
    const count = await navLinks.count();
    for (let i = 0; i < count; i++) {
      await expect(navLinks.nth(i)).toBeVisible();
    }
  });

  test('бургер-меню открывается и закрывается по клику', async ({ page }) => {
    const burger = page.locator('[data-testid="burger-button"]');
    const navLinks = page.locator('[data-testid="main-nav"] .nav-link');

    // Изначально скрыто
    await expect(navLinks.first()).toBeHidden();

    // Открываем
    await burger.click();
    // Ожидаем, что первая ссылка станет видимой
    await expect(navLinks.first()).toBeVisible({ timeout: 5000 });

    // Закрываем
    await burger.click();
    await expect(navLinks.first()).toBeHidden({ timeout: 5000 });
  });

  test('навигация работает на мобильном', async ({ page }) => {
    // Открываем меню
    await page.locator('[data-testid="burger-button"]').click();
    // Кликаем по пункту "Услуги"
    await page.locator('[data-testid="main-nav"] a[href="/services/"]').click();

    // Проверяем URL и наличие заголовка на странице услуг
    await expect(page).toHaveURL(/\/services\/?$/);
    await expect(page.locator('h1')).toContainText('Услуги');
  });

  test('нет горизонтального скролла на мобильных', async ({ page }) => {
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('на мобильном текст читается без масштабирования (≥ 16px)', async ({ page }) => {
    // Проверяем размер шрифта у body и у нескольких ключевых элементов
    const fonts = await page.evaluate(() => {
      const bodyFont = parseFloat(getComputedStyle(document.body).fontSize);
      const pFont = parseFloat(getComputedStyle(document.querySelector('p')!).fontSize);
      const h1Font = parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize);
      return { bodyFont, pFont, h1Font };
    });

    expect(fonts.bodyFont).toBeGreaterThanOrEqual(16);
    expect(fonts.pFont).toBeGreaterThanOrEqual(16);
    expect(fonts.h1Font).toBeGreaterThanOrEqual(16);
  });
});
