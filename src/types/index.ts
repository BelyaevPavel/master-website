export type MessengerType = 'whatsapp' | 'telegram' | 'vkontakte';

// export interface Contact {
//   phone: string;
//   whatsapp: string;
//   telegram: string; // может быть username или полная ссылка
//   vk: string; // полная ссылка на страницу/группу
//   preferredMessenger?: MessengerType;
//   email: string;
//   city: string;
//   city_dative_case: string;
//   workingHours: string;
//   socialMedia: {
//     vk: string;
//     instagram: string;
//   };
// }

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  priceFrom: number;
  priceUnit: string;
  features: string[];
  detailedDescription?: string;
  image?: string;
  gallery?: string[];
  benefits?: string[];
  serviceFaq?: { question: string; answer: string }[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  duration: string;
  area: string | null;
  tags: string[];
}

export interface Testimonial {
  name: string;
  text: string;
  date: string;
  photo: string | null;
  service: string;
}

export interface FAQ {
  question: string;
  answer: string;
}
