// src/utils/images.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getImage } from './images';
import type { ImageMetadata } from 'astro';

// Мокаем fallback-изображение
vi.mock('@/images/fallback.svg', () => ({
  default: 'fallback-image-mock',
}));

describe('getImage', () => {
  const mockImageMeta: ImageMetadata = {
    src: 'mocked-src',
    width: 100,
    height: 100,
    format: 'webp',
  };

  const mockModules: Record<string, () => Promise<{ default: ImageMetadata }>> = {
    '/src/images/services/electric-main.jpg': vi.fn(() =>
      Promise.resolve({ default: mockImageMeta })
    ),
    '/src/images/portfolio/bathroom-1-after.webp': vi.fn(() =>
      Promise.resolve({ default: { ...mockImageMeta, width: 600 } })
    ),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Перехватываем console.warn и console.error (опционально)
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('должен вернуть fallback, если путь null', async () => {
    const result = await getImage(null, mockModules);
    expect(result).toBe('fallback-image-mock');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Путь к изображению пуст'));
  });

  it('должен вернуть fallback, если путь undefined', async () => {
    const result = await getImage(undefined, mockModules);
    expect(result).toBe('fallback-image-mock');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Путь к изображению пуст'));
  });

  it('должен вернуть fallback, если путь пустой', async () => {
    const result = await getImage('', mockModules);
    expect(result).toBe('fallback-image-mock');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Путь к изображению пуст'));
  });

  it('должен вернуть fallback, если путь не найден в modules', async () => {
    const result = await getImage('@/images/nonexistent.jpg', mockModules);
    expect(result).toBe('fallback-image-mock');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Изображение не найдено'));
  });

  it('должен вернуть метаданные, если путь существует', async () => {
    const result = await getImage('@/images/services/electric-main.jpg', mockModules);
    expect(result).toEqual(mockImageMeta);
    expect(mockModules['/src/images/services/electric-main.jpg']).toHaveBeenCalledTimes(1);
  });

  it('должен обработать ошибку при загрузке модуля и вернуть fallback', async () => {
    // Подменяем функцию для конкретного пути, чтобы она выбрасывала ошибку
    const errorModules = {
      ...mockModules,
      '/src/images/services/electric-main.jpg': vi.fn(() =>
        Promise.reject(new Error('Network error'))
      ),
    };

    const result = await getImage('@/images/services/electric-main.jpg', errorModules);
    expect(result).toBe('fallback-image-mock');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Ошибка загрузки'),
      expect.any(Error)
    );
  });

  it('корректно нормализует путь (замена @/ на /src/)', async () => {
    // Путь уже содержит @/ — нормализуется
    const spyModules = {
      '/src/images/test.jpg': vi.fn(() => Promise.resolve({ default: mockImageMeta })),
    };
    await getImage('@/images/test.jpg', spyModules);
    expect(spyModules['/src/images/test.jpg']).toHaveBeenCalled();

    // Путь уже начинается с /src/ — оставляем как есть
    await getImage('/src/images/test.jpg', spyModules);
    expect(spyModules['/src/images/test.jpg']).toHaveBeenCalledTimes(2);
  });
});
