// src/validators/schemas.ts
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// Общие переиспользуемые валидаторы
// ═══════════════════════════════════════════════════════════

// Путь к изображению портфолио
const portfolioImagePath = z.string();
// .startsWith('/images/portfolio/', '❌ Путь должен начинаться с /images/portfolio/')
//.endsWith('.webp', '❌ Изображение должно быть в формате .webp');

const imagePath = z
  .string()
  .regex(
    /^@\/images\/services\/.+\.(webp|jpg|png)$/,
    '❌ Путь должен быть в формате @/images/services/...'
  )
  .optional()
  .nullable();

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
      '❌ Telegram username: латиница, цифры, подчёркивание, 5–32 символа (без @)'
    ),

  vk: z.string().url('❌ VK: укажите полный URL (https://vk.me/...)'),

  preferredMessenger: z.enum(['whatsapp', 'telegram', 'vkontakte']).optional().default('whatsapp'),

  email: z
    .string()
    .email('❌ Некорректный формат email')
    .transform((val) => val.toLowerCase()),

  city: nonEmptyString.min(2, '❌ Название города слишком короткое (минимум 2 символа)'),
  city_dative_case: nonEmptyString.min(2, '❌ Название в дательном падеже обязательно'),
  city_latitude: z.string().regex(/^-?\d+(\.\d+)?$/, '❌ Широта должна быть числом в строке'),
  city_longitude: z.string().regex(/^-?\d+(\.\d+)?$/, '❌ Долгота должна быть числом в строке'),

  workingHours: nonEmptyString.min(3, '❌ Часы работы не могут быть пустыми'),

  socialMedia: z.object({
    vk: z.string().url('❌ VK: укажите полный URL').default(''),
    instagram: z.string().url('❌ Instagram: укажите полный URL').default(''),
  }),
});

// ═══════════════════════════════════════════════════════════
// 2. Схема для services.json (массив)
// ═══════════════════════════════════════════════════════════
const ServiceFaqItemSchema = z.object({
  question: z.string().min(5, '❌ Вопрос слишком короткий'),
  answer: z.string().min(10, '❌ Ответ слишком короткий'),
});

export const ServiceSchema = z.object({
  // ─── обязательные поля ──────────────────────────────────
  id: z
    .string()
    .min(2, '❌ ID услуги слишком короткий')
    .regex(/^[a-z0-9-]+$/, '❌ Только латиница, цифры и дефисы'),

  icon: nonEmptyString,

  title: z
    .string()
    .min(3, '❌ Название минимум 3 символа')
    .max(60, '❌ Название максимум 60 символов'),

  description: z
    .string()
    .min(10, '❌ Описание минимум 10 символов')
    .max(200, '❌ Описание максимум 200 символов'),

  priceFrom: z
    .number()
    .min(0, '❌ Цена не может быть отрицательной')
    .max(9999999, '❌ Слишком большая цена'),

  priceUnit: nonEmptyString,

  features: z
    .array(z.string().min(3, '❌ Пункт features минимум 3 символа'))
    .min(1, '❌ Хотя бы один пункт')
    .max(10, '❌ Максимум 10 пунктов'),

  // ─── опциональные поля ──────────────────────────────────
  detailedDescription: z.string().min(20, '❌ Полное описание минимум 20 символов').optional(),

  image: imagePath,

  gallery: z.array(imagePath).max(10, '❌ Не более 10 изображений в галерее').optional(),

  benefits: z
    .array(z.string().min(5, '❌ Преимущество минимум 5 символов'))
    .max(10, '❌ Не более 10 преимуществ')
    .optional(),

  serviceFaq: z.array(ServiceFaqItemSchema).max(20, '❌ Не более 20 FAQ').optional(),

  metaTitle: z.string().max(70, '❌ Meta title максимум 70 символов').optional(),
  metaDescription: z.string().max(160, '❌ Meta description максимум 160 символов').optional(),
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
      message: '❌ ID работы должен быть числом (без кавычек)',
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
      message: '❌ Значение статистики должно быть числом (без кавычек)',
    })
    .positive('❌ Значение должно быть положительным'),

  suffix: z.string(), // может быть пустой, но разрешим

  label: z.string().min(2, '❌ Подпись к статистике слишком короткая'),
});

export const StatsArraySchema = z
  .array(StatItemSchema)
  .min(1, '❌ Должен быть хотя бы один элемент статистики');

// ═══════════════════════════════════════════════════════════
// 7. Схема для about.json
// ═══════════════════════════════════════════════════════════

const StatItemAboutSchema = z.object({
  value: z.string().min(1, '❌ Значение статистики не может быть пустым'),
  label: z.string().min(1, '❌ Подпись статистики не может быть пустой'),
});

export const AboutSchema = z.object({
  title: nonEmptyString.min(2, '❌ Заголовок слишком короткий'),
  subtitle: nonEmptyString.min(2, '❌ Подзаголовок слишком короткий'),

  photo: nonEmptyString
    .regex(/\.(jpg|jpeg|png|webp)$/i, '❌ Фото должно иметь расширение .jpg, .png или .webp')
    .optional(), // если фото может отсутствовать, но в вашем JSON оно есть — можно оставить обязательным

  photoAlt: nonEmptyString.min(3, '❌ Альтернативный текст слишком короткий'),

  intro: nonEmptyString.min(20, '❌ Вступление слишком короткое (минимум 20 символов)'),
  about: nonEmptyString.min(40, '❌ Основной текст слишком короткий (минимум 40 символов)'),

  stats: z.array(StatItemAboutSchema).min(1, '❌ Должна быть хотя бы одна статистика'),

  signature: nonEmptyString.min(2, '❌ Подпись слишком короткая'),
});

// ═══════════════════════════════════════════════════════════
// (Опционально) Экспорт типов для использования в коде
// ═══════════════════════════════════════════════════════════
export type Contact = z.infer<typeof ContactSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type FAQItem = z.infer<typeof FAQItemSchema>;
export type StatItem = z.infer<typeof StatItemSchema>;
export type About = z.infer<typeof AboutSchema>;
