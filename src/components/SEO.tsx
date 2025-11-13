import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  structuredData?: any;
}

export const SEO = ({
  title,
  description,
  keywords = [],
  canonical,
  ogType = 'website',
  ogImage = '/og-image.jpg',
  article,
  structuredData,
}: SEOProps) => {
  const siteUrl = window.location.origin;
  const currentUrl = canonical || window.location.href;
  const fullTitle = `${title} | BahisSiteleri`;
  
  // Default structured data - Organization
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BahisSiteleri',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      // Sosyal medya linklerinizi buraya ekleyin
    ],
  };

  // Article structured data
  const articleStructuredData = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: ogImage,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime,
    author: {
      '@type': 'Person',
      name: article.author || 'BahisSiteleri',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BahisSiteleri',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    keywords: article.tags?.join(', '),
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="tr" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="BahisSiteleri" />
      <meta property="og:locale" content="tr_TR" />

      {/* Article specific OG tags */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta httpEquiv="content-language" content="tr" />
      
      {/* Structured Data */}
      {!structuredData && !articleStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(defaultStructuredData)}
        </script>
      )}
      {articleStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(articleStructuredData)}
        </script>
      )}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
