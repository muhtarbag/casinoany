// SEO Configuration and Snippets for CasinoAny
export const seoConfig = {
  siteName: 'CasinoAny',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://casinoany.com',
  defaultTitle: 'CasinoAny - Türkiye\'nin En Güvenilir Bahis ve Casino Siteleri',
  defaultDescription: 'En iyi bahis ve casino sitelerini karşılaştırın. Yüksek bonuslar, güvenilir ödeme yöntemleri ve detaylı site incelemeleri.',
  defaultKeywords: ['bahis siteleri', 'casino siteleri', 'deneme bonusu', 'online bahis', 'canlı casino', 'güvenilir bahis'],
  twitterHandle: '@casinoany',
  fbAppId: '',
  
  // Google Analytics
  gaTrackingId: 'G-XXXXXXXXXX', // Değiştirin
  
  // Google Tag Manager
  gtmId: 'GTM-XXXXXXX', // Değiştirin
  
  // Facebook Pixel
  fbPixelId: '', // Değiştirin
  
  // Google Search Console verification
  googleSiteVerification: '', // Değiştirin
  
  // Yandex verification
  yandexVerification: '', // Değiştirin
};

// Google Analytics Snippet
export const getGoogleAnalyticsSnippet = (trackingId: string = seoConfig.gaTrackingId) => `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${trackingId}', {
    page_path: window.location.pathname,
    cookie_flags: 'SameSite=None;Secure'
  });
</script>
`;

// Google Tag Manager Snippet (Head)
export const getGTMHeadSnippet = (gtmId: string = seoConfig.gtmId) => `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->
`;

// Google Tag Manager Snippet (Body)
export const getGTMBodySnippet = (gtmId: string = seoConfig.gtmId) => `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;

// Facebook Pixel Snippet
export const getFacebookPixelSnippet = (pixelId: string = seoConfig.fbPixelId) => `
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->
`;

// Organization Schema
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: seoConfig.siteName,
  url: seoConfig.siteUrl,
  logo: `${seoConfig.siteUrl}/logos/casinodoo-logo.svg`,
  description: seoConfig.defaultDescription,
  sameAs: [
    'https://twitter.com/casinoany',
    'https://facebook.com/casinoany',
    'https://instagram.com/casinoany',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'info@casinoany.com',
    areaServed: 'TR',
    availableLanguage: ['Turkish'],
  },
});

// WebSite Schema with SearchAction
export const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: seoConfig.siteName,
  url: seoConfig.siteUrl,
  description: seoConfig.defaultDescription,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${seoConfig.siteUrl}/?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

// Casino Site Schema (for detail pages)
export const getCasinoSiteSchema = (site: {
  name: string;
  slug: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  bonus?: string;
  logo?: string;
  features?: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: site.name,
  description: site.description || `${site.name} bahis ve casino sitesi detaylı inceleme`,
  image: site.logo || `${seoConfig.siteUrl}/og-default.jpg`,
  brand: {
    '@type': 'Brand',
    name: site.name,
  },
  offers: {
    '@type': 'Offer',
    description: site.bonus || 'Hoş geldin bonusu',
    priceCurrency: 'TRY',
    availability: 'https://schema.org/InStock',
    url: `${seoConfig.siteUrl}/casino/${site.slug}`,
  },
  aggregateRating: site.rating && site.reviewCount ? {
    '@type': 'AggregateRating',
    ratingValue: site.rating,
    reviewCount: site.reviewCount,
    bestRating: 5,
    worstRating: 1,
  } : undefined,
  additionalProperty: site.features?.map(feature => ({
    '@type': 'PropertyValue',
    name: 'Feature',
    value: feature,
  })),
});

// Article Schema (for blog posts)
export const getArticleSchema = (article: {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  image: article.image || `${seoConfig.siteUrl}/og-default.jpg`,
  datePublished: article.publishedDate,
  dateModified: article.modifiedDate || article.publishedDate,
  author: {
    '@type': 'Person',
    name: article.author,
  },
  publisher: {
    '@type': 'Organization',
    name: seoConfig.siteName,
    logo: {
      '@type': 'ImageObject',
      url: `${seoConfig.siteUrl}/logos/casinodoo-logo.svg`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

// FAQ Schema
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Breadcrumb Schema
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Helper function to generate all meta tags
export const generateMetaTags = (options: {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}) => {
  const {
    title = seoConfig.defaultTitle,
    description = seoConfig.defaultDescription,
    keywords = seoConfig.defaultKeywords,
    canonical,
    image = `${seoConfig.siteUrl}/og-default.jpg`,
    type = 'website',
    noindex = false,
  } = options;

  return {
    title,
    description,
    keywords,
    canonical,
    image,
    type,
    robots: noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large',
  };
};
