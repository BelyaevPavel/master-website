// tests/cta.spec.ts
import { test, expect } from '@playwright/test';
import { SITE_CONFIG } from './config';

test.describe('CTA-кнопки и контакты', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('все телефонные ссылки имеют правильный формат tel:', async ({ page }) => {
    const phoneLinks = page.locator('[data-testid="phone-link"]');
    const count = await phoneLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await phoneLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^tel:\+7\d{10}$/);
    }
  });

  test('все WhatsApp ссылки имеют безопасные атрибуты', async ({ page }) => {
    const waLinks = page.locator('[data-testid="whatsapp-link"]');
    const count = await waLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = waLinks.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener.*noreferrer|noreferrer.*noopener/);
    }
  });

  test('WhatsApp ссылки содержат предзаполненное сообщение', async ({ page }) => {
    const waLink = page.locator('[data-testid="whatsapp-link"]').first();
    const href = await waLink.getAttribute('href');
    expect(href).toContain('?text=');
    expect(href).toMatch(/text=.+/);
  });

  // Группа тестов для мобильного вьюпорта
  test.describe('мобильные устройства', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('Sticky CTA видна на мобильных', async ({ page }) => {
      const stickyCta = page.locator('[data-testid="sticky-cta"]');
      await expect(stickyCta).toBeVisible();
      await expect(stickyCta).toHaveAttribute('href', /^tel:/);
    });

    test('Sticky CTA имеет достаточный размер (≥ 48px)', async ({ page }) => {
      const stickyCta = page.locator('[data-testid="sticky-cta"]');
      const box = await stickyCta.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(48);
      expect(box?.height).toBeGreaterThanOrEqual(48);
    });

    test('Sticky CTA закреплена внизу экрана', async ({ page }) => {
      const stickyCta = page.locator('[data-testid="sticky-cta"]');
      const box = await stickyCta.boundingBox();
      const viewportHeight = page.viewportSize()?.height || 0;
      // Проверяем, что нижняя граница кнопки близка к нижней части вьюпорта
      expect(box?.y).toBeGreaterThan(viewportHeight - box!.height - 10);
    });
  });

  test.describe('десктопные устройства', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('Sticky CTA скрыта на десктопе', async ({ page }) => {
      await expect(page.locator('[data-testid="sticky-cta"]')).toBeHidden();
    });
  });

  test('клик по телефону не перезагружает страницу', async ({ page }) => {
    const phoneLink = page.locator('[data-testid="phone-link"]').first();
    // Кликаем и проверяем, что URL остался тем же (не произошло перехода)
    await phoneLink.click();
    await expect(page).toHaveURL('/');
  });
});
