/**
 * SEO Helper Utilities for iGaming Platform
 * Generate meta descriptions, titles, keywords, slugs
 */

/**
 * Generate SEO-optimized title (max 60 chars)
 */
export const generateSEOTitle = (
  pageName: string,
  siteName: string = 'CasinoAny',
  includeYear: boolean = true
): string => {
  const year = includeYear ? ` ${new Date().getFullYear()}` : '';
  const title = `${pageName}${year} | ${siteName}`;
  
  // Truncate if too long (Google displays ~60 chars)
  if (title.length > 60) {
    return `${pageName}${year} | ${siteName.substring(0, 10)}`;
  }
  
  return title;
};

/**
 * Generate SEO-optimized meta description (max 160 chars)
 */
export const generateMetaDescription = (
  content: string,
  maxLength: number = 155
): string => {
  // Remove HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, '');
  
  // Truncate and add ellipsis
  if (cleanContent.length > maxLength) {
    return cleanContent.substring(0, maxLength - 3) + '...';
  }
  
  return cleanContent;
};

/**
 * Generate URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };

  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate gambling-specific keywords
 */
export const generateGamblingKeywords = (
  casinoName: string,
  bonusAmount?: string,
  features: string[] = []
): string[] => {
  const baseKeywords = [
    `${casinoName} casino`,
    `${casinoName} inceleme`,
    `${casinoName} güvenilir mi`,
    'casino siteleri',
    'güvenilir casino',
    'online casino',
    'canlı casino'
  ];

  if (bonusAmount) {
    baseKeywords.push(
      `${casinoName} bonus`,
      'casino bonusu',
      'hoşgeldin bonusu',
      'deneme bonusu'
    );
  }

  // Add feature-based keywords
  features.forEach(feature => {
    const featureLower = feature.toLowerCase();
    if (featureLower.includes('slot')) {
      baseKeywords.push('slot siteleri', 'slot oyunları');
    }
    if (featureLower.includes('canlı')) {
      baseKeywords.push('canlı bahis', 'canlı casino');
    }
    if (featureLower.includes('spor')) {
      baseKeywords.push('spor bahisleri', 'bahis siteleri');
    }
  });

  return [...new Set(baseKeywords)]; // Remove duplicates
};

/**
 * Generate long-tail keywords for content
 */
export const generateLongTailKeywords = (
  mainKeyword: string,
  category: 'casino' | 'bonus' | 'slot' | 'bahis'
): string[] => {
  const modifiers = {
    casino: [
      'güvenilir',
      'yüksek bonus veren',
      'hızlı para çeken',
      'lisanslı',
      'türkçe',
      'canlı destek'
    ],
    bonus: [
      'yatırımsız',
      'deneme',
      'çevrimsiz',
      'free spin',
      'hoşgeldin',
      'kayıp bonusu'
    ],
    slot: [
      'yüksek rtp',
      'pragmatic play',
      'netent',
      'megaways',
      'free spin',
      'jackpot'
    ],
    bahis: [
      'yüksek oran',
      'canlı bahis',
      'mobil bahis',
      'hızlı kayıt',
      'güvenilir',
      'bonus veren'
    ]
  };

  return modifiers[category].map(modifier => 
    `${modifier} ${mainKeyword}`
  );
};

/**
 * Generate FAQ schema-ready Q&A pairs
 */
export const generateCasinoFAQs = (casinoName: string): Array<{
  question: string;
  answer: string;
}> => {
  return [
    {
      question: `${casinoName} güvenilir mi?`,
      answer: `${casinoName}, Curacao lisansı altında faaliyet gösteren güvenilir bir casino sitesidir. SSL şifrelemesi ve güvenli ödeme yöntemleri kullanmaktadır.`
    },
    {
      question: `${casinoName} bonus nasıl alınır?`,
      answer: `${casinoName} bonusu almak için siteye kayıt olun, ilk yatırımınızı yapın ve bonus otomatik olarak hesabınıza tanımlanacaktır. Bazı bonuslar için promosyon kodu gerekebilir.`
    },
    {
      question: `${casinoName} çekim süresi ne kadar?`,
      answer: `${casinoName}'da para çekme işlemleri genellikle 24-48 saat içinde tamamlanır. Papara ve Cepbank gibi hızlı yöntemlerde bu süre daha kısa olabilir.`
    },
    {
      question: `${casinoName} hangi oyunları sunuyor?`,
      answer: `${casinoName}'da slot oyunları, canlı casino, masa oyunları, jackpot slotlar ve daha fazlası bulunmaktadır. Pragmatic Play, Evolution Gaming gibi önde gelen sağlayıcıların oyunları mevcuttur.`
    },
    {
      question: `${casinoName} mobil uyumlu mu?`,
      answer: `Evet, ${casinoName} hem mobil tarayıcı hem de mobil uygulama üzerinden kullanılabilir. iOS ve Android cihazlarda sorunsuz çalışmaktadır.`
    }
  ];
};

/**
 * Generate breadcrumb items for SEO
 */
export const generateBreadcrumbs = (
  path: string,
  siteName: string = 'CasinoAny'
): Array<{ name: string; url: string }> => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const segments = path.split('/').filter(Boolean);
  
  const breadcrumbs = [
    { name: 'Ana Sayfa', url: origin }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      name,
      url: `${origin}${currentPath}`
    });
  });

  return breadcrumbs;
};

/**
 * Calculate reading time (for blog posts)
 */
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Generate canonical URL
 */
export const generateCanonicalURL = (path: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${path}`.replace(/\/$/, ''); // Remove trailing slash
};

/**
 * Validate and clean URL for affiliate links
 */
export const cleanAffiliateLink = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.href;
  } catch {
    return url.startsWith('http') ? url : `https://${url}`;
  }
};

/**
 * Generate Open Graph image URL
 */
export const generateOGImage = (
  imagePath: string,
  width: number = 1200,
  height: number = 630
): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // If already absolute URL, return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Make relative path absolute
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${origin}${cleanPath}`;
};

/**
 * Extract keywords from content (for auto-tagging)
 */
export const extractKeywords = (
  content: string,
  maxKeywords: number = 10
): string[] => {
  // Common iGaming keywords
  const gamblingTerms = [
    'casino', 'bonus', 'slot', 'bahis', 'oyun', 'para', 'çekim',
    'yatırım', 'deneme', 'free spin', 'jackpot', 'canlı', 'lisans'
  ];

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const wordFreq = new Map<string, number>();
  
  words.forEach(word => {
    if (gamblingTerms.some(term => word.includes(term))) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
};
