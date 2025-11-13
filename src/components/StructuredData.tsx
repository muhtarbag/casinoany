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
    name: 'BahisSiteleri',
    url: window.location.origin,
    logo: `${window.location.origin}/logos/logo.png`,
    description: 'Türkiye\'nin en güvenilir bahis siteleri karşılaştırma platformu',
    sameAs: [
      // Sosyal medya linklerinizi buraya ekleyin
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      areaServed: 'TR',
      availableLanguage: 'Turkish'
    }
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
