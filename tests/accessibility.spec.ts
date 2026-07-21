import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Доступность (WCAG 2.1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('главная страница не имеет критических и серьёзных нарушений доступности', async ({
    page,
  }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === 'critical');
    const serious = results.violations.filter((v) => v.impact === 'serious');

    expect(critical).toEqual([]);
    expect(serious).toEqual([]);
  });

  test('все основные страницы проходят аудит доступности (AA)', async ({ page }) => {
    const pages = ['/', '/services/', '/portfolio/', '/about/'];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();

      const violations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(violations, `Страница ${url} имеет серьёзные нарушения`).toEqual([]);
    }
  });

  test('все видимые интерактивные элементы доступны с клавиатуры (можно сфокусировать)', async ({
    page,
  }) => {
    const interactiveElements = page.locator(
      'a:visible, button:visible, input:visible, select:visible, textarea:visible, [tabindex]:visible'
    );
    const count = await interactiveElements.count();

    for (let i = 0; i < count; i++) {
      const el = interactiveElements.nth(i);
      await el.focus();
      const isFocused = await el.evaluate((node) => document.activeElement === node);
      expect(isFocused, `Элемент #${i} не получил фокус`).toBe(true);
    }
  });

  test('есть skip-link для навигации с клавиатуры (ссылка на основной контент)', async ({
    page,
  }) => {
    // Проверяем наличие skip-link (обычно скрыт визуально, но доступен для клавиатуры)
    const skipLink = page.locator('.skip-link, [href="#main"], [href="#main-content"]').first();
    await expect(skipLink).toBeAttached();
    // Проверяем, что у него есть text (не пустой)
    const text = await skipLink.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('все видимые поля формы имеют связанные label или aria-атрибуты', async ({ page }) => {
    const inputs = page.locator(
      'input:not([type="hidden"]):visible, select:visible, textarea:visible'
    );
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      const hasLabel = id || ariaLabel || ariaLabelledBy;
      expect(hasLabel, `Поле #${i} не имеет label или aria-атрибута`).toBeTruthy();

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeAttached();
        // Проверяем, что текст label не пустой
        const labelText = await label.textContent();
        expect(labelText?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('контрастность текста соответствует WCAG AA', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('body')
      .withRules(['color-contrast'])
      .analyze();

    const contrastViolations = results.violations.filter((v) => v.id === 'color-contrast');
    expect(contrastViolations).toEqual([]);
  });

  test('все изображения имеют alt-атрибут (может быть пустым для декоративных)', async ({
    page,
  }) => {
    const images = page.locator('img:visible');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Изображение #${i} не имеет alt`).not.toBeNull();
    }
  });
});
