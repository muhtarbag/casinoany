import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  data: object;
}

export const StructuredData = ({ data }: StructuredDataProps) => {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
};

// Organization Schema
export const OrganizationSchema = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CasinoAny.com',
    url: window.location.origin,
    logo: `${window.location.origin}/logos/casinodoo-logo.svg`,
    description: 'Türkiye\'nin en güvenilir casino ve bahis siteleri karşılaştırma platformu. 50+ lisanslı site, yüksek bonuslar ve detaylı incelemeleri.',
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
      availableLanguage: 'Turkish',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1000',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'TRY',
      lowPrice: '0',
      highPrice: '50000',
      offerCount: '50',
    },
  };

  return <StructuredData data={data} />;
};

// WebSite Schema with Search
export const WebSiteSchema = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BahisSiteleri',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return <StructuredData data={data} />;
};

// Breadcrumb Schema
export const BreadcrumbSchema = ({ items }: { items: Array<{ name: string; url: string }> }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return <StructuredData data={data} />;
};

// ItemList Schema (for listing pages)
export const ItemListSchema = ({ items, title }: { items: Array<{ name: string; url: string; image?: string }>, title: string }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.image && { image: item.image })
    }))
  };

  return <StructuredData data={data} />;
};

// FAQ Schema
export const FAQSchema = ({ faqs }: { faqs: Array<{ question: string; answer: string }> }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return <StructuredData data={data} />;
};

// Review Schema
export const ReviewSchema = ({ reviews, itemName, itemType = 'Product' }: { 
  reviews: Array<{ author: string; rating: number; text: string; date: string }>, 
  itemName: string,
  itemType?: string 
}) => {
  if (!reviews.length) return null;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const data = {
    '@context': 'https://schema.org',
    '@type': itemType,
    name: itemName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1
    },
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author
      },
      datePublished: review.date,
      reviewBody: review.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      }
    }))
  };

  return <StructuredData data={data} />;
};

// Casino Product Schema - Google Rich Results için özel schema
export const CasinoProductSchema = ({ 
  site,
  logoUrl,
  reviews
}: {
  site: {
    name: string;
    slug: string;
    bonus?: string | null;
    rating?: number | null;
    avg_rating?: number | null;
    review_count?: number | null;
    features?: string[] | null;
  };
  logoUrl?: string;
  reviews?: Array<{ rating: number }>;
}) => {
  const avgRating = site.avg_rating || site.rating || 
    (reviews && reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0);
  
  const reviewCount = site.review_count || reviews?.length || 0;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: site.name,
    image: logoUrl || `${window.location.origin}/logos/${site.slug}-logo.png`,
    description: site.bonus || `${site.name} - Güvenilir online casino ve bahis sitesi`,
    brand: {
      '@type': 'Brand',
      name: site.name
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'TRY',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: `${window.location.origin}/site/${site.slug}`
    },
    ...(avgRating > 0 && reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviewCount,
        bestRating: 5,
        worstRating: 1
      }
    }),
    ...(site.features && site.features.length > 0 && {
      additionalProperty: site.features.map(feature => ({
        '@type': 'PropertyValue',
        name: 'Özellik',
        value: feature
      }))
    })
  };

  return <StructuredData data={data} />;
};
