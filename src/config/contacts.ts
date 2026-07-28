// src/config/contacts.ts
import rawContacts from '@/data/contacts.json';
import { ContactSchema } from '@/validators/schemas';
import type { Contact } from '@/validators/schemas';

// Парсим с проверкой — если невалидно, выбросит ошибку при старте
const parsed = ContactSchema.safeParse(rawContacts);

if (!parsed.success) {
  console.error('❌ Ошибка валидации contacts.json:');
  parsed.error.issues.forEach((err) => {
    console.error(`  ${err.path.join('.')}: ${err.message}`);
  });
  throw new Error('Неверная структура contacts.json');
}

export const contacts: Contact = parsed.data;
export default contacts;
