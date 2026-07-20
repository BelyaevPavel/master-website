// src/utils/contacts.test.ts
import { describe, it, expect } from 'vitest';
import {
  buildPhoneLink,
  buildWhatsAppUrl,
  formatPhoneDisplay,
  getMessengerLink,
  getMessengerConfig,
} from './contacts';
import type { MessengerType } from '@/types';
import type { Contact } from '@/validators/schemas';

export const mockContacts: Contact = {
  phone: '+79998887766', // строгий формат
  whatsapp: '79998887766', // только цифры
  telegram: 'master_remont',
  vk: 'https://vk.com/master_remont',
  preferredMessenger: 'whatsapp',
  email: 'info@master-website.ru',
  city: 'Белорецк',
  city_dative_case: 'Белорецке',
  city_latitude: '58.24', // добавлено
  city_longitude: '53.58', // добавлено
  workingHours: 'Ежедневно с 9:00 до 21:00',
  socialMedia: {
    vk: 'https://vk.com/master_service',
    instagram: 'https://instagram.com/master_service',
  },
};

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
    expect(url).toContain(
      '%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!'
    );
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
describe('getMessengerLink', () => {
  it('генерирует ссылку для WhatsApp через buildWhatsAppUrl', () => {
    const link = getMessengerLink('whatsapp', mockContacts, 'Привет');
    expect(link).toBe('https://wa.me/79998887766?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82');
  });

  it('генерирует ссылку для Telegram из username', () => {
    const link = getMessengerLink('telegram', mockContacts);
    expect(link).toBe('https://t.me/master_remont');
  });

  it('генерирует ссылку для Telegram из полного URL', () => {
    const contactsWithFullUrl = { ...mockContacts, telegram: 'https://t.me/master_remont' };
    const link = getMessengerLink('telegram', contactsWithFullUrl);
    expect(link).toBe('https://t.me/master_remont');
  });

  it('генерирует ссылку для Telegram, убирая @ из username', () => {
    const contactsWithAt = { ...mockContacts, telegram: '@master_remont' };
    const link = getMessengerLink('telegram', contactsWithAt);
    expect(link).toBe('https://t.me/master_remont');
  });

  it('генерирует ссылку для VK (возвращает как есть)', () => {
    const link = getMessengerLink('vkontakte', mockContacts);
    expect(link).toBe('https://vk.com/master_remont');
  });

  it('выбрасывает ошибку для неподдерживаемого типа', () => {
    // @ts-expect-error – передаём заведомо невалидный тип
    expect(() => getMessengerLink('viber', mockContacts)).toThrow(
      'Неподдерживаемый тип мессенджера'
    );
  });

  it('выбрасывает ошибку, если для Telegram отсутствует контакт', () => {
    const contactsWithoutTg = { ...mockContacts, telegram: '' };
    expect(() => getMessengerLink('telegram', contactsWithoutTg)).toThrow(
      'Telegram контакт не указан'
    );
  });

  it('выбрасывает ошибку, если для VK отсутствует контакт', () => {
    const contactsWithoutVk = { ...mockContacts, vk: '' };
    expect(() => getMessengerLink('vkontakte', contactsWithoutVk)).toThrow('VK контакт не указан');
  });

  it('работает без сообщения (только для WhatsApp)', () => {
    const link = getMessengerLink('whatsapp', mockContacts);
    expect(link).toBe('https://wa.me/79998887766');
  });
});

describe('getMessengerConfig', () => {
  it('возвращает правильную конфигурацию для WhatsApp', () => {
    const config = getMessengerConfig('whatsapp');
    expect(config).toEqual({
      icon: 'bi-whatsapp',
      color: '#25D366',
      defaultText: 'Написать в WhatsApp',
    });
  });

  it('возвращает правильную конфигурацию для Telegram', () => {
    const config = getMessengerConfig('telegram');
    expect(config).toEqual({
      icon: 'bi-telegram',
      color: '#0088cc',
      defaultText: 'Написать в Telegram',
    });
  });

  it('возвращает правильную конфигурацию для VK', () => {
    const config = getMessengerConfig('vkontakte');
    expect(config).toEqual({
      icon: 'bi-vk',
      color: '#4C75A3',
      defaultText: 'Написать в ВКонтакте',
    });
  });

  it('возвращает конфигурацию WhatsApp как fallback для неизвестного типа', () => {
    // @ts-expect-error – передаём заведомо невалидный тип
    const config = getMessengerConfig('unknown');
    expect(config).toEqual({
      icon: 'bi-whatsapp',
      color: '#25D366',
      defaultText: 'Написать в WhatsApp',
    });
  });
});
