// src/scripts/validate-data.ts
import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import type { ZodSchema } from 'zod';

import {
  ContactSchema,
  ServicesArraySchema,
  PortfolioArraySchema,
  TestimonialsArraySchema,
  FAQArraySchema,
  StatsArraySchema,
  AboutSchema,
} from '../validators/schemas.js';

// ═══════════════════════════════════════════════════════════
// Определение корня проекта (работает и в ESM)
// ═══════════════════════════════════════════════════════════
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..'); // на уровень выше src/scripts
const DATA_DIR = resolve(PROJECT_ROOT, 'src', 'data');

// ═══════════════════════════════════════════════════════════
// Конфигурация проверяемых файлов
// ═══════════════════════════════════════════════════════════
interface DataFile {
  filename: string;
  schema: ZodSchema;
  label: string;
}

const filesToValidate: DataFile[] = [
  { filename: 'contacts.json', schema: ContactSchema, label: '📞 Контакты' },
  { filename: 'services.json', schema: ServicesArraySchema, label: '🔧 Услуги' },
  { filename: 'portfolio.json', schema: PortfolioArraySchema, label: '📸 Портфолио' },
  { filename: 'testimonials.json', schema: TestimonialsArraySchema, label: '⭐ Отзывы' },
  { filename: 'faq.json', schema: FAQArraySchema, label: '❓ FAQ' },
  { filename: 'stats.json', schema: StatsArraySchema, label: '📊 Статистика' },
  { filename: 'about.json', schema: AboutSchema, label: '📄 Обо мне' },
];

// ═══════════════════════════════════════════════════════════
// Вспомогательные функции форматирования (цветной вывод)
// ═══════════════════════════════════════════════════════════
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
} as const;

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

// ═══════════════════════════════════════════════════════════
// Дополнительные бизнес-правила (асинхронные)
// ═══════════════════════════════════════════════════════════
async function runBusinessRules(): Promise<string[]> {
  const warnings: string[] = [];

  // 1. Уникальность id в услугах
  try {
    const content = await readFile(resolve(DATA_DIR, 'services.json'), 'utf-8');
    const services = JSON.parse(content);
    const ids = services.map((s: any) => s.id);
    if (ids.length !== new Set(ids).size) {
      warnings.push('⚠️ services.json: есть повторяющиеся id услуг');
    }
  } catch {
    // Если файл не читается – ошибка уже будет показана на этапе схемы
  }

  // 2. Уникальность id в портфолио и порядок
  try {
    const content = await readFile(resolve(DATA_DIR, 'portfolio.json'), 'utf-8');
    const portfolio = JSON.parse(content);
    const ids = portfolio.map((p: any) => p.id);
    if (ids.length !== new Set(ids).size) {
      warnings.push('⚠️ portfolio.json: есть повторяющиеся id работ');
    }
    const sorted = [...ids].sort((a: number, b: number) => a - b);
    if (JSON.stringify(ids) !== JSON.stringify(sorted)) {
      warnings.push('⚠️ portfolio.json: id работ идут не по порядку (рекомендуется исправить)');
    }
  } catch {
    // Игнорируем, ошибка будет в схеме
  }

  // 3. Даты отзывов не в будущем
  try {
    const content = await readFile(resolve(DATA_DIR, 'testimonials.json'), 'utf-8');
    const testimonials = JSON.parse(content);
    const now = new Date();
    for (const t of testimonials) {
      const reviewDate = new Date(t.date);
      if (reviewDate > now) {
        warnings.push(
          `⚠️ testimonials.json: отзыв от "${t.name}" имеет дату из будущего (${t.date})`
        );
      }
    }
  } catch {
    // Игнорируем
  }

  return warnings;
}

// ═══════════════════════════════════════════════════════════
// Форматирование ошибок Zod для мастера (понятный язык)
// ═══════════════════════════════════════════════════════════
function formatZodError(error: ZodError, filename: string): string {
  const lines: string[] = [];
  lines.push('');
  lines.push(colorize('╔' + '═'.repeat(54) + '╗', 'red'));
  lines.push(colorize(`║  ❌ ОШИБКА В ФАЙЛЕ: ${filename.padEnd(31)} ║`, 'red'));
  lines.push(colorize('╚' + '═'.repeat(54) + '╝', 'red'));
  lines.push('');

  error.issues.forEach((issue, index) => {
    // Формируем путь к полю
    const path = issue.path.length
      ? issue.path
          .map((p) => (typeof p === 'number' ? `[${p}]` : p))
          .join('.')
          .replace(/\.\[/g, '[')
      : 'корень файла';

    // Безопасное получение значения received (если есть)
    const received = 'received' in issue ? issue.received : undefined;

    lines.push(`  ${index + 1}. Поле: ${colorize(`"${path}"`, 'bold')}`);
    lines.push(`     ${colorize(issue.message, 'yellow')}`);
    lines.push(`     Получено: ${colorize(JSON.stringify(received ?? 'undefined'), 'dim')}`);
    lines.push('');
  });

  lines.push(colorize('  📖 Как исправить:', 'cyan'));
  lines.push(`     1. Откройте файл ${colorize(`src/data/${filename}`, 'bold')} в VS Code`);
  lines.push('     2. Найдите указанное поле');
  lines.push('     3. Исправьте значение согласно ожидаемому типу');
  lines.push('     4. Сохраните файл (Ctrl+S)');
  lines.push('     5. Повторите git commit и git push');
  lines.push('');

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════
// Основная функция валидации
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log('');
  console.log(colorize('🛡️  Начинаю проверку JSON-файлов...', 'bold'));
  console.log(colorize('─'.repeat(56), 'dim'));
  console.log('');

  let totalErrors = 0;
  let totalWarnings = 0;
  const errorMessages: string[] = [];

  // Проверяем каждый файл по очереди (сохраняем порядок вывода)
  for (const { filename, schema, label } of filesToValidate) {
    const filePath = resolve(DATA_DIR, filename);

    // Проверяем, существует ли файл
    try {
      await access(filePath);
    } catch {
      errorMessages.push(colorize(`❌ ${label}: файл ${filename} НЕ НАЙДЕН в src/data/`, 'red'));
      totalErrors++;
      continue;
    }

    // Читаем и парсим JSON
    let rawData: unknown;
    try {
      const content = await readFile(filePath, 'utf-8');
      rawData = JSON.parse(content);
    } catch (parseError: any) {
      errorMessages.push('');
      errorMessages.push(colorize('╔' + '═'.repeat(54) + '╗', 'red'));
      errorMessages.push(colorize(`║  ❌ ОШИБКА ПАРСИНГА: ${filename.padEnd(30)} ║`, 'red'));
      errorMessages.push(colorize('╚' + '═'.repeat(54) + '╝', 'red'));
      errorMessages.push('');
      errorMessages.push(`  Файл содержит синтаксическую ошибку JSON.`);
      errorMessages.push(`  Подробности: ${colorize(parseError.message, 'yellow')}`);
      errorMessages.push('');
      errorMessages.push(colorize('  💡 Частые причины:', 'cyan'));
      errorMessages.push('     - Забыта запятая между полями');
      errorMessages.push('     - Лишняя запятая после последнего элемента');
      errorMessages.push('     - Одинарные кавычки вместо двойных');
      errorMessages.push('     - Незакрытая строка или скобка');
      errorMessages.push('');
      errorMessages.push(
        `  🔧 Проверьте файл на сайте: ${colorize('https://jsonlint.com/', 'blue')}`
      );
      errorMessages.push('');
      totalErrors++;
      continue;
    }

    // Валидация по схеме Zod
    const result = schema.safeParse(rawData);
    if (!result.success) {
      errorMessages.push(formatZodError(result.error, filename));
      totalErrors += result.error.issues.length;
    } else {
      console.log(`  ${colorize('✅', 'green')} ${label} (${filename}) — OK`);
    }
  }

  // Бизнес-правила (дополнительные проверки)
  const warnings = await runBusinessRules();
  totalWarnings = warnings.length;

  if (warnings.length > 0) {
    console.log('');
    console.log(colorize('  ⚠️  Предупреждения:', 'yellow'));
    warnings.forEach((w) => console.log(`    ${colorize(w, 'yellow')}`));
  }

  // Итоговый результат
  console.log('');
  console.log(colorize('─'.repeat(56), 'dim'));

  if (totalErrors > 0) {
    console.log(colorize(`  🔴 НАЙДЕНО ОШИБОК: ${totalErrors}`, 'red'));
    console.log('');
    errorMessages.forEach((msg) => console.log(msg));
    console.log(colorize('─'.repeat(56), 'dim'));
    console.log(colorize('  🚫 СБОРКА ОСТАНОВЛЕНА. Исправьте ошибки и попробуйте снова.', 'red'));
    console.log('');
    process.exit(1);
  } else {
    console.log(
      colorize(`  🟢 Все JSON-файлы валидны! (${totalWarnings} предупреждений)`, 'green')
    );
    console.log('');
  }
}

// Запуск
main().catch((err) => {
  console.error(colorize('❌ Необработанная ошибка:', 'red'), err);
  process.exit(1);
});
