// src/utils/contacts.ts

import type { MessengerType } from '@/types';
import type { Contact } from '@/validators/schemas';

/**
 * Генерирует кликабельную ссылку для звонка
 * @example buildPhoneLink('+7 999 888-77-66') => "tel:+79998887766"
 */
export function buildPhoneLink(phone: string): string {
  // Убираем всё кроме цифр и плюса
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (!cleaned.startsWith('+')) {
    throw new Error('buildPhoneLink: телефон должен начинаться с +');
  }

  return `tel:${cleaned}`;
}

/**
 * Генерирует ссылку на WhatsApp с предзаполненным сообщением
 * @example buildWhatsAppUrl('79998887766', 'Привет') => "https://wa.me/79998887766?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82"
 */
export function buildWhatsAppUrl(whatsapp: string, message?: string): string {
  // Строгий формат: 11 цифр, начинается с 7
  if (!/^7\d{10}$/.test(whatsapp)) {
    throw new Error(
      'buildWhatsAppUrl: номер должен быть в формате 79998887766 (11 цифр, начинается с 7)'
    );
  }

  const baseUrl = `https://wa.me/${whatsapp}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

/**
 * Нормализует телефон для отображения: +7 (999) 888-77-66
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');

  if (digits.length !== 11) {
    return phone; // Возвращаем как есть, если не можем отформатировать
  }

  // +7 (XXX) XXX-XX-XX
  return `+${digits[0]} (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
}

/**
 * Генерирует ссылку для выбранного мессенджера.
 * @param type - тип мессенджера ('whatsapp', 'telegram', 'vkontakte')
 * @param contacts - объект с контактами (должен содержать соответствующие поля)
 * @param message - опциональное сообщение (поддерживается только для WhatsApp)
 * @returns URL для перехода в мессенджер
 * @throws {Error} если тип не поддерживается или отсутствуют данные
 */
export function getMessengerLink(type: MessengerType, contacts: Contact, message?: string): string {
  switch (type) {
    case 'whatsapp':
      return buildWhatsAppUrl(contacts.whatsapp, message);

    case 'telegram': {
      const tg = contacts.telegram;
      if (!tg) throw new Error('Telegram контакт не указан в contacts.json');
      // Если уже полная ссылка — возвращаем как есть
      if (tg.startsWith('http://') || tg.startsWith('https://')) {
        return tg;
      }
      // Иначе считаем, что это username (убираем @, если есть)
      const username = tg.replace(/^@/, '');
      return `https://t.me/${username}`;
    }

    case 'vkontakte': {
      const vk = contacts.vk;
      if (!vk) throw new Error('VK контакт не указан в contacts.json');
      return vk; // ожидается полная ссылка
    }

    default:
      throw new Error(`Неподдерживаемый тип мессенджера: ${type}`);
  }
}

/**
 * Возвращает конфигурацию для мессенджера: иконку, цвет, дефолтный текст.
 */
export function getMessengerConfig(type: MessengerType): {
  icon: string;
  color: string;
  defaultText: string;
} {
  const configs = {
    whatsapp: {
      icon: 'bi-whatsapp',
      color: '#25D366',
      defaultText: 'Написать в WhatsApp',
    },
    telegram: {
      icon: 'bi-telegram',
      color: '#0088cc',
      defaultText: 'Написать в Telegram',
    },
    vkontakte: {
      icon: 'bi-vk',
      color: '#4C75A3',
      defaultText: 'Написать в ВКонтакте',
    },
  };
  return configs[type] || configs.whatsapp; // fallback
}
