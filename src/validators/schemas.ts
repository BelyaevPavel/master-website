// src/validators/schemas.ts
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// Общие переиспользуемые валидаторы
// ═══════════════════════════════════════════════════════════

// Путь к изображению портфолио
const portfolioImagePath = z
  .string()
  .startsWith('/images/portfolio/', '❌ Путь должен начинаться с /images/portfolio/')
  .endsWith('.webp', '❌ Изображение должно быть в формате .webp');

// Путь к фото клиента (отзыв)
const testimonialPhotoPath = z
  .string()
  .startsWith('/images/testimonials/', '❌ Путь должен начинаться с /images/testimonials/')
  .endsWith('.webp', '❌ Фото должно быть в формате .webp');

// Формат даты YYYY-MM-DD (строгий)
const dateString = z
  .string()
  .date('❌ Дата должна быть в формате YYYY-MM-DD и существовать (например, 2024-10-15)');

// Непустая строка после обрезки пробелов (для nullable полей)
const nonEmptyString = z.string().trim().min(1, '❌ Поле не может быть пустым');

// ═══════════════════════════════════════════════════════════
// 1. Схема для contacts.json
// ═══════════════════════════════════════════════════════════
export const ContactSchema = z.object({
  phone: z
    .string()
    .regex(
      /^\+7\d{10}$/,
      '❌ Телефон должен быть в формате +79998887766 (плюс, 7, 10 цифр без пробелов)'
    ),

  whatsapp: z
    .string()
    .regex(/^7\d{10}$/, '❌ WhatsApp должен быть без плюса: 79998887766 (7 + 10 цифр)'),

  telegram: z
    .string()
    .regex(
      /^[a-zA-Z0-9_]{5,32}$/,
      '❌ Telegram username: латиница, цифры, подчёркивание, 5-32 символа (без @)'
    ),

  email: z
    .string()
    .email('❌ Некорректный формат email')
    .transform((val) => val.toLowerCase()), // нормализация email

  city: nonEmptyString.min(2, '❌ Название города слишком короткое (минимум 2 символа)'),

  workingHours: nonEmptyString.min(3, '❌ Часы работы не могут быть пустыми'),

  socialMedia: z.object({
    // Разрешаем либо URL, либо пустую строку (как значение по умолчанию)
    vk: z.string().url('❌ VK: укажите полный URL (https://vk.com/...)').default(''),
    instagram: z
      .string()
      .url('❌ Instagram: укажите полный URL (https://instagram.com/...)')
      .default(''),
  }),
});

// ═══════════════════════════════════════════════════════════
// 2. Схема для services.json (массив)
// ═══════════════════════════════════════════════════════════
export const ServiceSchema = z.object({
  id: z
    .string()
    .min(2, '❌ ID услуги слишком короткий')
    .regex(
      /^[a-z0-9-]+$/,
      '❌ ID услуги: только латинские буквы, цифры и дефисы (например, "electric")'
    ),

  icon: nonEmptyString,

  title: z
    .string()
    .min(3, '❌ Название услуги слишком короткое (минимум 3 символа)')
    .max(60, '❌ Название услуги слишком длинное (максимум 60 символов)'),

  description: z
    .string()
    .min(10, '❌ Описание услуги слишком короткое (минимум 10 символов)')
    .max(200, '❌ Описание услуги слишком длинное (максимум 200 символов)'),

  priceFrom: z
    .number({
      invalid_type_error:
        '❌ Цена (priceFrom) должна быть ЧИСЛОМ без кавычек! Например: 1500, а не "1500"',
    })
    .min(0, '❌ Цена не может быть отрицательной')
    .max(9999999, '❌ Цена подозрительно большая, проверьте'),

  priceUnit: nonEmptyString,

  features: z
    .array(z.string().min(3, '❌ Каждый пункт в списке возможностей минимум 3 символа'))
    .min(1, '❌ У услуги должна быть хотя бы одна возможность (features)')
    .max(10, '❌ Слишком много пунктов в features (максимум 10)'),
});

export const ServicesArraySchema = z
  .array(ServiceSchema)
  .min(1, '❌ Должна быть хотя бы одна услуга');

// ═══════════════════════════════════════════════════════════
// 3. Схема для portfolio.json (массив)
// ═══════════════════════════════════════════════════════════
export const PortfolioItemSchema = z.object({
  id: z
    .number({
      invalid_type_error: '❌ ID работы должен быть числом (без кавычек)',
    })
    .int('❌ ID работы должен быть целым числом')
    .positive('❌ ID работы должен быть положительным числом'),

  title: z
    .string()
    .min(3, '❌ Название работы слишком короткое')
    .max(100, '❌ Название работы слишком длинное (максимум 100 символов)'),

  description: z
    .string()
    .min(10, '❌ Описание работы слишком короткое')
    .max(300, '❌ Описание работы слишком длинное (максимум 300 символов)'),

  beforeImage: portfolioImagePath,
  afterImage: portfolioImagePath,

  duration: nonEmptyString,

  area: z.string().trim().min(1).nullable(), // разрешаем null, но не пустую строку

  tags: z
    .array(
      z
        .string()
        .min(1, '❌ Тег не может быть пустым')
        .regex(/^[a-zа-яё0-9-]+$/i, '❌ Тег: только буквы, цифры и дефисы')
    )
    .min(1, '❌ У работы должен быть хотя бы один тег')
    .max(10, '❌ Слишком много тегов (максимум 10)'),
});

export const PortfolioArraySchema = z.array(PortfolioItemSchema);

// ═══════════════════════════════════════════════════════════
// 4. Схема для testimonials.json (массив)
// ═══════════════════════════════════════════════════════════
export const TestimonialSchema = z.object({
  name: z
    .string()
    .min(2, '❌ Имя клиента слишком короткое (минимум 2 символа)')
    .max(50, '❌ Имя клиента слишком длинное'),

  text: z
    .string()
    .min(20, '❌ Отзыв слишком короткий (минимум 20 символов, иначе выглядит ненастоящим)')
    .max(1000, '❌ Отзыв слишком длинный (максимум 1000 символов)')
    .refine(
      (val) => !val.includes('"'),
      '❌ В тексте отзыва не должно быть кавычек " (используйте одинарные \')'
    ),

  date: dateString, // теперь используем встроенную проверку .date()

  photo: testimonialPhotoPath.nullable(), // теперь проще и понятнее

  service: z.string().min(3, '❌ Название услуги в отзыве слишком короткое'),
});

export const TestimonialsArraySchema = z.array(TestimonialSchema);

// ═══════════════════════════════════════════════════════════
// 5. Схема для faq.json (массив)
// ═══════════════════════════════════════════════════════════
export const FAQItemSchema = z.object({
  question: z
    .string()
    .min(10, '❌ Вопрос слишком короткий (минимум 10 символов)')
    .max(200, '❌ Вопрос слишком длинный (максимум 200 символов)')
    .refine((val) => val.endsWith('?'), '❌ Вопрос должен заканчиваться знаком вопроса "?"'),

  answer: z
    .string()
    .min(20, '❌ Ответ слишком короткий (минимум 20 символов)')
    .max(1000, '❌ Ответ слишком длинный (максимум 1000 символов)'),
});

export const FAQArraySchema = z
  .array(FAQItemSchema)
  .min(3, '❌ Должно быть минимум 3 вопроса в FAQ');

// ═══════════════════════════════════════════════════════════
// 6. Схема для stats.json (массив)
// ═══════════════════════════════════════════════════════════
export const StatItemSchema = z.object({
  id: z
    .string()
    .min(2, '❌ ID статистики слишком короткий')
    .regex(/^[a-z0-9-]+$/, '❌ ID статистики: только латинские буквы, цифры и дефисы'),

  icon: z.string().startsWith('bi-', '❌ Иконка должна начинаться с "bi-" (Bootstrap Icons)'),

  value: z
    .number({
      invalid_type_error: '❌ Значение статистики должно быть числом (без кавычек)',
    })
    .positive('❌ Значение должно быть положительным'),

  suffix: z.string(), // может быть пустой, но разрешим

  label: z.string().min(2, '❌ Подпись к статистике слишком короткая'),
});

export const StatsArraySchema = z
  .array(StatItemSchema)
  .min(1, '❌ Должен быть хотя бы один элемент статистики');

// ═══════════════════════════════════════════════════════════
// (Опционально) Экспорт типов для использования в коде
// ═══════════════════════════════════════════════════════════
export type Contact = z.infer<typeof ContactSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type FAQItem = z.infer<typeof FAQItemSchema>;
export type StatItem = z.infer<typeof StatItemSchema>;
