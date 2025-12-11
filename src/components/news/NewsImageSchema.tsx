import { Helmet } from 'react-helmet-async';

interface NewsImageSchemaProps {
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  articleTitle: string;
  articleUrl: string;
}

/**
 * Image Schema for news articles
 * Helps images appear in Google Image Search with proper context
 */
export function NewsImageSchema({ images, articleTitle, articleUrl }: NewsImageSchemaProps) {
  if (!images || images.length === 0) return null;

  const imageSchemas = images.map((image, index) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: image.url,
    url: image.url,
    name: image.alt || `${articleTitle} - Görsel ${index + 1}`,
    description: image.caption || image.alt || articleTitle,
    author: {
      '@type': 'Organization',
      name: 'CasinoAny.com',
    },
    copyrightHolder: {
      '@type': 'Organization',
      name: 'CasinoAny.com',
    },
    creditText: 'CasinoAny.com',
    isPartOf: {
      '@type': 'WebPage',
      url: articleUrl,
    },
  }));

  return (
    <Helmet>
      {imageSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
