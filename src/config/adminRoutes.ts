/**
 * Admin Panel Route Configuration
 * 
 * This file aims to be the single source of truth for admin routing and sidebar navigation.
 * Instead of manually mapping routes in AdminRoot.tsx, we define them here.
 */

export interface AdminRouteConfig {
    id: string;        // The unique identifier for the tab (e.g., 'manage', 'dashboard')
    path: string;       // The URL path (e.g., '/admin/sites')
    label?: string;     // Optional label for breadcrumbs
    exact?: boolean;    // If true, match exact path only
}

export const ADMIN_ROUTES: AdminRouteConfig[] = [
    // Dashboard
    { id: 'dashboard', path: '/admin/dashboard', label: 'Genel Bakış' },

    // Site Management
    { id: 'manage', path: '/admin/sites', label: 'Siteler' },
    { id: 'featured', path: '/admin/sites/featured', label: 'Öne Çıkanlar' },
    { id: 'site-stats', path: '/admin/sites/stats', label: 'Site İstatistikleri' },
    { id: 'site-requests', path: '/admin/sites/addition-requests', label: 'Site Ekleme Talepleri' },
    { id: 'banners', path: '/admin/sites/banners', label: 'Banner Yönetimi' },

    // Blog Management
    { id: 'blog', path: '/admin/blog', label: 'Blog' },
    { id: 'blog-stats', path: '/admin/blog/stats', label: 'Blog İstatistikleri' },
    { id: 'comments', path: '/admin/blog/comments', label: 'Yorumlar' },

    // Reviews & Complaints
    { id: 'reviews', path: '/admin/reviews', label: 'Değerlendirmeler' },
    { id: 'complaints', path: '/admin/complaints', label: 'Şikayetler' },

    // Analytics
    { id: 'analytics', path: '/admin/analytics', label: 'Analytics' },
    { id: 'keywords', path: '/admin/analytics/keywords', label: 'Anahtar Kelimeler' },

    // Content Management
    { id: 'casino-content', path: '/admin/content/casino', label: 'Casino İçeriği' },
    { id: 'categories', path: '/admin/content/categories', label: 'Kategoriler' },
    { id: 'casino-analytics', path: '/admin/content/casino-analytics', label: 'Casino Analitik' },
    { id: 'content-planner', path: '/admin/content/planner', label: 'İçerik Planlayıcı' },

    // Finance
    { id: 'affiliate', path: '/admin/finance/affiliate', label: 'Affiliate' },
    { id: 'bonus', path: '/admin/finance/bonus', label: 'Bonus Yönetimi' },
    { id: 'bonus-requests', path: '/admin/finance/bonus-requests', label: 'Bonus Talepleri' },

    // General Updates
    { id: 'notifications', path: '/admin/notifications', label: 'Bildirimler' },
    { id: 'news', path: '/admin/news', label: 'Haberler' },

    // System
    { id: 'health', path: '/admin/system/health', label: 'Sistem Sağlığı' },
    { id: 'logs', path: '/admin/system/logs', label: 'Sistem Logları' },
    { id: 'history', path: '/admin/system/history', label: 'Sistem Geçmişi' },
    { id: 'users', path: '/admin/system/users', label: 'Kullanıcılar' },
    { id: 'roles', path: '/admin/system/roles', label: 'Rol Yönetimi' },
    { id: 'build-health', path: '/admin/system/build-health', label: 'Build Sağlığı' },
    { id: 'footer', path: '/admin/system/footer', label: 'Footer Yönetimi' },
];

// Fallback for dynamic/unknown routes
// If a route is not in the list, we try to match it by ID = URL segment
export const getTabIdFromPath = (pathname: string): string => {
    // 1. Try to find exact match in config
    // Remove trailing slashes for comparison
    const cleanPath = pathname.replace(/\/$/, '');
    const configMatch = ADMIN_ROUTES.find(r => r.path === cleanPath);

    if (configMatch) {
        return configMatch.id;
    }

    // 2. Fallback: Parse from URL
    // e.g. /admin/system/logs -> logic needed if not in config
    // Current logic in AdminRoot was: remove /admin/ and use the rest as ID?
    // No, the previous logic had a map. If not in map, it returned the path string.

    const pathWithoutAdmin = pathname.replace('/admin/', '').replace('/admin', '');
    if (!pathWithoutAdmin || pathWithoutAdmin === 'dashboard') return 'dashboard';

    return pathWithoutAdmin;
};

export const getRouteFromTabId = (tabId: string): string => {
    // 1. Try to find in config
    const configMatch = ADMIN_ROUTES.find(r => r.id === tabId);
    if (configMatch) {
        return configMatch.path;
    }

    // 2. Fallback: specific defaults
    if (tabId === 'dashboard') return '/admin/dashboard';

    // 3. Fallback: Assume tabId IS the path segment
    return `/admin/${tabId}`;
};

// Breadcrumb Helper
export const getBreadcrumbLabel = (segment: string): string => {
    // Try to find a route where the ID matches the segment (approximate)
    // or use a predefined map for common segments

    const labelMap: Record<string, string> = {
        'admin': 'Admin',
        'dashboard': 'Genel Bakış',
        'sites': 'Siteler',
        'featured': 'Öne Çıkanlar',
        'stats': 'İstatistikler',
        'blog': 'Blog',
        'comments': 'Yorumlar',
        'reviews': 'Değerlendirmeler',
        'analytics': 'Analytics',
        'realtime': 'Canlı Takip',
        'keywords': 'Anahtar Kelimeler',
        'content': 'İçerik',
        'casino': 'Casino',
        'planner': 'Planlama',
        'finance': 'Finans',
        'system': 'Sistem',
        'users': 'Kullanıcılar',
        'roles': 'Roller',
        // Add missing labels from the original file
        'bonus-requests': 'Bonus Talepleri',
        'build-health': 'Build Sağlığı',
        'footer': 'Footer Yönetimi',
        'addition-requests': 'Ekleme Talepleri',
        'banners': 'Bannerlar'
    };

    // Check config for ID match
    const config = ADMIN_ROUTES.find(r => r.id === segment);
    if (config && config.label) return config.label;

    return labelMap[segment] || segment;
};
