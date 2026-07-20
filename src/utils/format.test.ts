// src/utils/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, formatDuration, truncate } from './format';

describe('formatPrice', () => {
  it('форматирует обычные цены с пробелами', () => {
    expect(formatPrice(1500)).toMatch('1 500 ₽');
    expect(formatPrice(120000)).toBe('120 000 ₽');
    expect(formatPrice(1500000)).toBe('1 500 000 ₽');
  });

  it('обрабатывает маленькие цены', () => {
    expect(formatPrice(0)).toBe('0 ₽');
    expect(formatPrice(1)).toBe('1 ₽');
    expect(formatPrice(100)).toBe('100 ₽');
  });

  it('выбрасывает ошибку для отрицательных цен', () => {
    expect(() => formatPrice(-100)).toThrow('не может быть отрицательной');
  });

  it('выбрасывает ошибку для не-чисел', () => {
    // @ts-expect-error: тестируем некорректные входные данные
    expect(() => formatPrice('1500')).toThrow('должна быть числом');
    // @ts-expect-error
    expect(() => formatPrice(null)).toThrow('должна быть числом');
  });
});

describe('formatDate', () => {
  it('превращает ISO-дату в "месяц год"', () => {
    expect(formatDate('2024-10-15')).toBe('октябрь 2024 г.');
    expect(formatDate('2024-01-01')).toBe('январь 2024 г.');
    expect(formatDate('2023-12-31')).toBe('декабрь 2023 г.');
  });

  it('выбрасывает ошибку для некорректных дат', () => {
    expect(() => formatDate('not-a-date')).toThrow('некорректная дата');
    expect(() => formatDate('2024-13-01')).toThrow('некорректная дата');
  });
});

describe('formatDuration', () => {
  it('возвращает переданную строку как есть', () => {
    expect(formatDuration('5 дней')).toBe('5 дней');
    expect(formatDuration('1 день')).toBe('1 день');
  });

  it('обрезает пробелы', () => {
    expect(formatDuration('  3 дня  ')).toBe('3 дня');
  });

  it('возвращает "Срок уточняется" для пустых значений', () => {
    expect(formatDuration('')).toBe('Срок уточняется');
    // @ts-expect-error
    expect(formatDuration(null)).toBe('Срок уточняется');
    // @ts-expect-error
    expect(formatDuration(undefined)).toBe('Срок уточняется');
  });
});

describe('truncate', () => {
  it('не обрезает короткие строки', () => {
    expect(truncate('Короткий текст', 50)).toBe('Короткий текст');
  });

  it('обрезает длинные строки с многоточием', () => {
    const long = 'Это очень длинный текст, который нужно обрезать';
    const result = truncate(long, 20);
    expect(result.length).toBeLessThanOrEqual(21); // 20 + "…"
    expect(result.endsWith('…')).toBe(true);
  });

  it('обрезает по границе слова', () => {
    const text = 'Один два три четыре пять';
    const result = truncate(text, 15);
    expect(result).toBe('Один два три…');
  });

  it('обрабатывает пустые строки', () => {
    expect(truncate('', 10)).toBe('');
  });
});