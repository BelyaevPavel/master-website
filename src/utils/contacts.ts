// src/utils/contacts.ts

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
    const cleaned = whatsapp.replace(/[^\d]/g, '');
    
    if (!cleaned.startsWith('7') || cleaned.length !== 11) {
      throw new Error('buildWhatsAppUrl: номер должен быть в формате 79998887766');
    }
    
    const baseUrl = `https://wa.me/${cleaned}`;
    
    if (!message) {
      return baseUrl;
    }
    
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
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