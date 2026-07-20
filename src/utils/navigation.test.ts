// src/utils/navigation.test.ts
import { describe, it, expect } from 'vitest';
import { isActive, buildBreadcrumbs } from './navigation';

describe('isActive', () => {
  it('главная активна только на главной', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/services/', '/')).toBe(false);
  });

  it('пункты меню активны на своих страницах и вложенных', () => {
    expect(isActive('/services/', '/services/')).toBe(true);
    expect(isActive('/services/electric/', '/services/')).toBe(true);
    expect(isActive('/', '/services/')).toBe(false);
  });
});

describe('buildBreadcrumbs', () => {
  const labelMap = {
    '/services/': 'Услуги',
    '/services/electric/': 'Электромонтаж',
    '/portfolio/': 'Портфолио',
  };

  it('возвращает только "Главная" для корня', () => {
    const crumbs = buildBreadcrumbs('/', labelMap);
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0]).toEqual({ label: 'Главная', href: '/' });
  });

  it('строит полную цепочку для вложенных страниц', () => {
    const crumbs = buildBreadcrumbs('/services/electric/', labelMap);
    expect(crumbs).toHaveLength(3);
    expect(crumbs[0]).toEqual({ label: 'Главная', href: '/' });
    expect(crumbs[1]).toEqual({ label: 'Услуги', href: '/services/' });
    expect(crumbs[2]).toEqual({
      label: 'Электромонтаж',
      href: '/services/electric/',
    });
  });

  it('использует сегмент URL как запасной вариант', () => {
    const crumbs = buildBreadcrumbs('/unknown/page/', labelMap);
    expect(crumbs[1].label).toBe('unknown');
    expect(crumbs[2].label).toBe('page');
  });
});
