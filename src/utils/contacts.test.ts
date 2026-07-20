// src/utils/contacts.test.ts
import { describe, it, expect } from 'vitest';
import { buildPhoneLink, buildWhatsAppUrl, formatPhoneDisplay } from './contacts';

describe('buildPhoneLink', () => {
  it('убирает форматирование из телефона', () => {
    expect(buildPhoneLink('+7 (999) 888-77-66')).toBe('tel:+79998887766');
    expect(buildPhoneLink('+7 999 888 77 66')).toBe('tel:+79998887766');
  });

  it('работает с уже чистым номером', () => {
    expect(buildPhoneLink('+79998887766')).toBe('tel:+79998887766');
  });

  it('выбрасывает ошибку, если нет плюса', () => {
    expect(() => buildPhoneLink('79998887766')).toThrow('должен начинаться с +');
    expect(() => buildPhoneLink('89998887766')).toThrow('должен начинаться с +');
  });
});

describe('buildWhatsAppUrl', () => {
  it('строит базовую ссылку без сообщения', () => {
    expect(buildWhatsAppUrl('79998887766')).toBe('https://wa.me/79998887766');
  });

  it('добавляет предзаполненное сообщение', () => {
    const url = buildWhatsAppUrl('79998887766', 'Привет');
    expect(url).toContain('https://wa.me/79998887766');
    expect(url).toContain('?text=');
    expect(url).toContain(encodeURIComponent('Привет'));
  });

  it('кодирует кириллицу в сообщении', () => {
    const url = buildWhatsAppUrl('79998887766', 'Здравствуйте!');
    expect(url).toContain('%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!');
  });

  it('выбрасывает ошибку для неправильного формата', () => {
    expect(() => buildWhatsAppUrl('+79998887766')).toThrow();
    expect(() => buildWhatsAppUrl('89998887766')).toThrow();
    expect(() => buildWhatsAppUrl('12345')).toThrow();
  });
});

describe('formatPhoneDisplay', () => {
  it('форматирует номер в красивый вид', () => {
    expect(formatPhoneDisplay('+79998887766')).toBe('+7 (999) 888-77-66');
    expect(formatPhoneDisplay('79998887766')).toBe('+7 (999) 888-77-66');
  });

  it('возвращает как есть, если длина неправильная', () => {
    expect(formatPhoneDisplay('12345')).toBe('12345');
  });
});