// src/utils/images.ts
import type { ImageMetadata } from 'astro';
import defaultFallback from '@/images/fallback.svg';

const defaultModules = import.meta.glob<{ default: ImageMetadata }>(
  '@/images/**/*.{webp,jpg,png,svg}'
);

/**
 * Загружает метаданные изображения по пути.
 * @param imagePath – путь из JSON (например, '@/images/services/electric-main.jpg') или null/undefined
 * @param modules – объект для подмены в тестах (опционально)
 */
export async function getImage(
  imagePath: string | null | undefined,
  modules: Record<string, () => Promise<{ default: ImageMetadata }>> = defaultModules
): Promise<ImageMetadata> {
  // Если путь отсутствует (null, undefined, пустая строка) — возвращаем fallback
  if (!imagePath) {
    console.warn('⚠️ Путь к изображению пуст, возвращаем fallback');
    return defaultFallback;
  }

  // Нормализуем: заменяем @/ на /src/
  const normalized = imagePath.replace(/^@\//, '/src/');

  if (!modules[normalized]) {
    console.warn(`⚠️ Изображение не найдено: ${imagePath} (искали как ${normalized})`);
    return defaultFallback;
  }

  try {
    const mod = await modules[normalized]();
    return mod.default;
  } catch (error) {
    console.error(`❌ Ошибка загрузки: ${imagePath}`, error);
    return defaultFallback;
  }
}
