// src/utils/format.ts

/**
 * Форматирует число в цену с пробелами и символом рубля
 * @example formatPrice(1500) => "1 500 ₽"
 * @example formatPrice(120000) => "120 000 ₽"
 */
export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) {
    throw new Error('formatPrice: цена должна быть числом');
  }
  if (price < 0) {
    throw new Error('formatPrice: цена не может быть отрицательной');
  }

  const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} ₽`;
}

/**
 * Форматирует ISO-дату в читаемый русский вид
 * @example formatDate('2024-10-15') => "октябрь 2024 г."
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (isNaN(date.getTime())) {
    throw new Error(`formatDate: некорректная дата "${isoDate}"`);
  }

  return date.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Форматирует длительность работы в человеко-читаемый вид
 * @example formatDuration("5 дней") => "5 дней"
 * @example formatDuration("1 день") => "1 день"
 */
export function formatDuration(duration: string): string {
  if (!duration || typeof duration !== 'string') {
    return 'Срок уточняется';
  }
  return duration.trim();
}

/**
 * Обрезает текст для SEO description с многоточием
 * @example truncate('Очень длинный текст...', 20) => "Очень длинный текст…"
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  // Обрезаем и находим последнее слово
  const truncated = text.substring(0, maxLength).trim();
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '…';
  }

  return truncated + '…';
}
