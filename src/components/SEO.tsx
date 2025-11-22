import { Helmet } from 'react-helmet-async';
import { buildCanonical, getRobotsMetaTag, shouldNoIndex } from '@/lib/seo/canonical';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
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
  ogImage,
  ogImageAlt,
  article,
  structuredData,
}: SEOProps) => {
  // Always use https://casinoany.com as primary domain for canonical and OG
  const siteUrl = 'https://casinoany.com';
  const currentPath = window.location.pathname;
  
  // Use canonical engine for clean URLs - always absolute URLs
  const currentUrl = canonical || buildCanonical(currentPath, { baseUrl: siteUrl });
  
  // Determine if page should be noindexed
  const robotsTag = getRobotsMetaTag(currentPath);
  const isNoIndex = shouldNoIndex(currentPath);
  
  // Title optimization: Keep under 60 chars for SERP display
  const fullTitle = title.length > 50 
    ? `${title} | CasinoAny` 
    : `${title} | CasinoAny - İGaming Rehberi`;
  
  const defaultOgImage = `${siteUrl}/og-default.jpg`;
  const finalOgImage = ogImage || defaultOgImage;
  
  // Default structured data - Organization
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CasinoAny.com',
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
    image: finalOgImage,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime,
    author: {
      '@type': 'Person',
      name: article.author || 'CasinoAny.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CasinoAny.com',
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
      <meta property="og:image" content={finalOgImage} />
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="CasinoAny.com" />
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
      <meta name="twitter:image" content={finalOgImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content={robotsTag} />
      <meta name="googlebot" content={
        isNoIndex 
          ? "noindex, follow" 
          : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      } />
      <meta name="bingbot" content="index, follow, max-image-preview:large" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      
      {/* Google-Specific Optimizations */}
      <meta name="google" content="notranslate" />
      
      {/* Mobile Optimization for Google */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="CasinoAny" />
      
      {/* Geo-Targeting for Turkey */}
      <meta name="geo.region" content="TR" />
      <meta name="geo.placename" content="Turkey" />
      <meta name="geo.position" content="39;35" />
      <meta name="ICBM" content="39, 35" />
      
      {/* Content Classification */}
      <meta name="rating" content="general" />
      <meta name="audience" content="all" />
      <meta name="distribution" content="global" />
      
      {/* Language */}
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
        Array.isArray(structuredData) 
          ? structuredData.map((data, index) => (
              <script key={index} type="application/ld+json">
                {JSON.stringify(data)}
              </script>
            ))
          : <script type="application/ld+json">
              {JSON.stringify(structuredData)}
            </script>
      )}
    </Helmet>
  );
};
