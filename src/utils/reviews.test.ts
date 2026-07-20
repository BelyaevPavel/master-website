// src/utils/reviews.test.ts
import { describe, it, expect } from 'vitest';
import { 
  getInitials, 
  sortReviewsByDate, 
  groupReviewsByService 
} from './reviews';

describe('getInitials', () => {
  it('берёт первые буквы имени и фамилии', () => {
    expect(getInitials('Иван Иванов')).toBe('ИИ');
    expect(getInitials('Анна Петрова')).toBe('АП');
  });

  it('работает с именем из одного слова', () => {
    expect(getInitials('Анна')).toBe('А');
  });

  it('берёт первую и последнюю букву для 3+ слов', () => {
    expect(getInitials('Мария Ивановна Петрова')).toBe('МП');
  });

  it('обрабатывает латиницу', () => {
    expect(getInitials('John Smith')).toBe('JS');
    expect(getInitials('Mary Jane Watson')).toBe('MW');
  });

  it('обрабатывает лишние пробелы', () => {
    expect(getInitials('  Иван   Иванов  ')).toBe('ИИ');
  });

  it('возвращает "?" для пустых значений', () => {
    expect(getInitials('')).toBe('?');
    // @ts-expect-error
    expect(getInitials(null)).toBe('?');
  });
});

describe('sortReviewsByDate', () => {
  const reviews = [
    { name: 'А', text: '1', date: '2024-01-15', photo: null, service: 'Электрика' },
    { name: 'Б', text: '2', date: '2024-10-20', photo: null, service: 'Плитка' },
    { name: 'В', text: '3', date: '2024-06-01', photo: null, service: 'Электрика' },
  ];

  it('сортирует от новых к старым', () => {
    const sorted = sortReviewsByDate(reviews);
    expect(sorted[0].name).toBe('Б'); // октябрь
    expect(sorted[1].name).toBe('В'); // июнь
    expect(sorted[2].name).toBe('А'); // январь
  });

  it('не мутирует исходный массив', () => {
    const original = [...reviews];
    sortReviewsByDate(reviews);
    expect(reviews).toEqual(original);
  });
});

describe('groupReviewsByService', () => {
  const reviews = [
    { name: 'А', text: '1', date: '2024-01-01', photo: null, service: 'Электрика' },
    { name: 'Б', text: '2', date: '2024-02-01', photo: null, service: 'Плитка' },
    { name: 'В', text: '3', date: '2024-03-01', photo: null, service: 'Электрика' },
  ];

  it('группирует отзывы по услугам', () => {
    const grouped = groupReviewsByService(reviews);
    
    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped['Электрика']).toHaveLength(2);
    expect(grouped['Плитка']).toHaveLength(1);
  });

  it('использует "Другое" для отзывов без услуги', () => {
    const withEmpty = [...reviews, {
      name: 'Г', text: '4', date: '2024-04-01', photo: null, service: '',
    }];
    
    const grouped = groupReviewsByService(withEmpty);
    expect(grouped['Другое']).toHaveLength(1);
  });
});