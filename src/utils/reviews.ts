// src/utils/reviews.ts

interface Testimonial {
    name: string;
    text: string;
    date: string;
    photo: string | null;
    service: string;
  }
  
  /**
   * Получает инициалы из имени (для аватара-плейсхолдера)
   * @example getInitials('Иван Иванов') => 'ИИ'
   * @example getInitials('Анна') => 'А'
   * @example getInitials('Mary Jane Watson') => 'MW'
   */
  export function getInitials(name: string): string {
    if (!name || typeof name !== 'string') {
      return '?';
    }
    
    const parts = name.trim().split(/\s+/);
    
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  
  /**
   * Вычисляет средний рейтинг (пока все отзывы = 5 звёзд, но функция готова к расширению)
   */
  export function calculateAverageRating(reviews: Testimonial[]): number {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    
    // Пока все отзывы без явного рейтинга = считаем 5 звёзд
    // В будущем можно добавить поле rating в testimonials.json
    return 5.0;
  }
  
  /**
   * Сортирует отзывы по дате (новые сначала)
   */
  export function sortReviewsByDate(reviews: Testimonial[]): Testimonial[] {
    return [...reviews].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
  
  /**
   * Группирует отзывы по услугам
   * @example
   * groupByService([{service: 'Электрика', ...}, {service: 'Плитка', ...}, {service: 'Электрика', ...}])
   * => { 'Электрика': [...2 отзыва], 'Плитка': [...1 отзыв] }
   */
  export function groupReviewsByService(
    reviews: Testimonial[]
  ): Record<string, Testimonial[]> {
    return reviews.reduce((groups, review) => {
      const service = review.service || 'Другое';
      if (!groups[service]) {
        groups[service] = [];
      }
      groups[service].push(review);
      return groups;
    }, {} as Record<string, Testimonial[]>);
  }