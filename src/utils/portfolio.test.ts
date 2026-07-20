// src/utils/portfolio.test.ts
import { describe, it, expect } from 'vitest';
import { extractUniqueTags, filterByTag, generateSlug } from './portfolio';

const mockPortfolio = [
  {
    id: 1,
    title: 'Ванная комната',
    description: 'Плитка',
    beforeImage: '/img/1-before.webp',
    afterImage: '/img/1-after.webp',
    duration: '5 дней',
    area: '4 м²',
    tags: ['плитка', 'ванная'],
  },
  {
    id: 2,
    title: 'Электрощит',
    description: 'Электрика',
    beforeImage: '/img/2-before.webp',
    afterImage: '/img/2-after.webp',
    duration: '1 день',
    area: null,
    tags: ['электрика', 'щит'],
  },
  {
    id: 3,
    title: 'Потолок',
    description: 'Натяжной',
    beforeImage: '/img/3-before.webp',
    afterImage: '/img/3-after.webp',
    duration: '2 дня',
    area: '15 м²',
    tags: ['потолок', 'ванная'],
  },
];

describe('extractUniqueTags', () => {
  it('возвращает уникальные отсортированные теги', () => {
    const tags = extractUniqueTags(mockPortfolio);
    expect(tags).toEqual(['ванная', 'плитка', 'потолок', 'щит', 'электрика']);
  });

  it('убирает дубликаты с разным регистром', () => {
    const withDuplicates = [{ ...mockPortfolio[0], tags: ['Плитка', 'плитка', 'ПЛИТКА'] }];
    const tags = extractUniqueTags(withDuplicates as any);
    expect(tags).toEqual(['плитка']);
  });

  it('работает с пустым массивом', () => {
    expect(extractUniqueTags([])).toEqual([]);
  });
});

describe('filterByTag', () => {
  it('возвращает все работы при tag=null', () => {
    expect(filterByTag(mockPortfolio, null)).toHaveLength(3);
  });

  it('возвращает все работы при tag="all"', () => {
    expect(filterByTag(mockPortfolio, 'all')).toHaveLength(3);
  });

  it('фильтрует по одному тегу', () => {
    const filtered = filterByTag(mockPortfolio, 'ванная');
    expect(filtered).toHaveLength(2);
    expect(filtered.every((item) => item.tags.includes('ванная'))).toBe(true);
  });

  it('регистронезависимый поиск', () => {
    expect(filterByTag(mockPortfolio, 'ВАННАЯ')).toHaveLength(2);
    expect(filterByTag(mockPortfolio, 'Плитка')).toHaveLength(1);
  });

  it('возвращает пустой массив, если тег не найден', () => {
    expect(filterByTag(mockPortfolio, 'несуществующий')).toHaveLength(0);
  });
});

describe('generateSlug', () => {
  it('транслитерирует кириллицу', () => {
    expect(generateSlug('Ванная комната')).toBe('vannaya-komnata');
  });

  it('обрабатывает спецсимволы', () => {
    expect(generateSlug('Ванная 4м²')).toBe('vannaya-4m2');
    expect(generateSlug('Плитка 60×120')).toBe('plitka-60x120');
  });

  it('убирает недопустимые символы', () => {
    expect(generateSlug('Услуга! @#$%')).toBe('usluga');
  });

  it('убирает двойные дефисы', () => {
    expect(generateSlug('Услуга   тест')).toBe('usluga-test');
  });
});
