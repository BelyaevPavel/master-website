// src/utils/navigation.ts

interface MenuItem {
    label: string;
    href: string;
  }
  
  /**
   * Определяет, является ли ссылка активной по текущему URL
   * @example isActive('/services/', '/services/') => true
   * @example isActive('/services/', '/services/electric/') => true (родительский пункт)
   * @example isActive('/', '/services/') => false
   */
  export function isActive(currentPath: string, menuHref: string): boolean {
    // Главная страница активна только на главной
    if (menuHref === '/') {
      return currentPath === '/';
    }
    
    // Остальные пункты активны, если текущий путь начинается с них
    return currentPath.startsWith(menuHref);
  }
  
  /**
   * Строит хлебные крошки из URL
   * @example buildBreadcrumbs('/services/electric/') => [
   *   { label: 'Главная', href: '/' },
   *   { label: 'Услуги', href: '/services/' },
   *   { label: 'Электромонтаж', href: '/services/electric/' }
   * ]
   */
  export function buildBreadcrumbs(
    currentPath: string,
    labelMap: Record<string, string>
  ): MenuItem[] {
    const crumbs: MenuItem[] = [{ label: 'Главная', href: '/' }];
    
    if (currentPath === '/') {
      return crumbs;
    }
    
    const segments = currentPath.split('/').filter(Boolean);
    let currentHref = '';
    
    segments.forEach((segment) => {
      currentHref += `/${segment}/`;
      const label = labelMap[currentHref] || segment;
      crumbs.push({ label, href: currentHref });
    });
    
    return crumbs;
  }