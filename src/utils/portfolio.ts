// src/utils/portfolio.ts

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  duration: string;
  area: string | null;
  tags: string[];
}

/**
 * Извлекает уникальные теги из всех работ портфолио
 */
export function extractUniqueTags(items: PortfolioItem[]): string[] {
  const tagSet = new Set<string>();

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      tagSet.add(tag.toLowerCase().trim());
    });
  });

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'ru'));
}

/**
 * Фильтрует портфолио по тегу
 */
export function filterByTag(items: PortfolioItem[], tag: string | null): PortfolioItem[] {
  if (!tag || tag === 'all') {
    return items;
  }

  const normalizedTag = tag.toLowerCase().trim();
  return items.filter((item) => item.tags.some((t) => t.toLowerCase().trim() === normalizedTag));
}

/**
 * Генерирует SEO-friendly slug из заголовка
 * @example generateSlug('Ванная комната 4м²') => 'vannaya-komnata-4m2'
 */
export function generateSlug(title: string): string {
  // Транслитерация кириллицы
  const translitMap: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    ' ': '-',
    '²': '2',
    '³': '3',
    '×': 'x',
  };

  return title
    .toLowerCase()
    .split('')
    .map((char) => translitMap[char] ?? char)
    .join('')
    .replace(/[^a-z0-9-]/g, '') // Только латиница, цифры, дефисы
    .replace(/-+/g, '-') // Убираем двойные дефисы
    .replace(/^-|-$/g, ''); // Убираем дефисы по краям
}
