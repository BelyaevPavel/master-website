import { test, expect } from '@playwright/test';

test.describe('FAQ аккордеон', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  const FAQ_ITEM = '[data-testid="faq-item"]';
  const FAQ_QUESTION = '[data-testid="faq-question"]';
  const FAQ_ANSWER = '[data-testid="faq-answer"]';

  test('FAQ секция присутствует', async ({ page }) => {
    const faqItems = page.locator(FAQ_ITEM);
    await expect(faqItems.first()).toBeVisible();
  });

  test('все вопросы изначально свёрнуты (ответы скрыты)', async ({ page }) => {
    const answers = page.locator(FAQ_ANSWER);
    const count = await answers.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(answers.nth(i)).toBeHidden();
    }
  });

  test('клик на вопрос раскрывает ответ', async ({ page }) => {
    const firstQuestion = page.locator(FAQ_QUESTION).first();
    const firstAnswer = page.locator(FAQ_ANSWER).first();

    await expect(firstAnswer).toBeHidden();
    await firstQuestion.click();
    await expect(firstAnswer).toBeVisible();
  });

  test('одновременно раскрыт только один ответ (аккордеонное поведение)', async ({ page }) => {
    const questions = page.locator(FAQ_QUESTION);
    const answers = page.locator(FAQ_ANSWER);

    // Открываем первый
    await questions.nth(0).click();
    await expect(answers.nth(0)).toBeVisible();

    // Открываем второй
    await questions.nth(1).click();
    await expect(answers.nth(1)).toBeVisible();
    await expect(answers.nth(0)).toBeHidden();
  });

  test('кнопки аккордеона имеют корректные ARIA-атрибуты и обновляют их состояние', async ({
    page,
  }) => {
    const firstQuestion = page.locator(FAQ_QUESTION).first();
    const firstAnswer = page.locator(FAQ_ANSWER).first();

    // Изначально aria-expanded должно быть "false"
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
    await expect(firstQuestion).toHaveAttribute('aria-controls');

    const controlsId = await firstQuestion.getAttribute('aria-controls');
    const target = page.locator(`#${controlsId}`);
    await expect(target).toBeAttached();

    // Кликаем – состояние меняется
    await firstQuestion.click();
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
    await expect(firstAnswer).toBeVisible();
  });

  test('FAQ содержит минимум 3 вопроса', async ({ page }) => {
    const itemsCount = await page.locator(FAQ_ITEM).count();
    expect(itemsCount).toBeGreaterThanOrEqual(3);
  });

  test('каждый ответ содержит непустой текст', async ({ page }) => {
    const answers = page.locator(FAQ_ANSWER);
    const count = await answers.count();
    for (let i = 0; i < count; i++) {
      const text = await answers.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('повторный клик на уже открытый вопрос не закрывает его (если так задумано)', async ({
    page,
  }) => {
    const question = page.locator(FAQ_QUESTION).first();
    const answer = page.locator(FAQ_ANSWER).first();

    await question.click();
    await expect(answer).toBeVisible();

    // Повторный клик
    await question.click();
    // В Bootstrap с data-bs-parent ответ остаётся открытым
    await expect(answer).toBeVisible();
  });
});
