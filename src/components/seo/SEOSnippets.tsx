import { Helmet } from 'react-helmet-async';
import { seoConfig, getOrganizationSchema, getWebSiteSchema } from '@/lib/seo-config';

interface SEOSnippetsProps {
  includeAnalytics?: boolean;
  includeGTM?: boolean;
  includeFacebookPixel?: boolean;
  includeSchemas?: boolean;
}

/**
 * SEO Snippets Component
 * Adds essential tracking and structured data snippets to the page
 */
export const SEOSnippets = ({
  includeAnalytics = true,
  includeGTM = false,
  includeFacebookPixel = false,
  includeSchemas = true,
}: SEOSnippetsProps) => {
  return (
    <Helmet>
      {/* Site Verification */}
      {seoConfig.googleSiteVerification && (
        <meta name="google-site-verification" content={seoConfig.googleSiteVerification} />
      )}
      {seoConfig.yandexVerification && (
        <meta name="yandex-verification" content={seoConfig.yandexVerification} />
      )}

      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      
      {/* Robots Meta - Removed to avoid conflict with SEO component */}
      
      {/* Language and Regional */}
      <meta httpEquiv="content-language" content="tr" />
      <meta name="geo.region" content="TR" />
      <meta name="geo.placename" content="Turkey" />
      
      {/* Cache Control */}
      <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
      
      {/* Format Detection */}
      <meta name="format-detection" content="telephone=no" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#8b5cf6" />
      <meta name="msapplication-TileColor" content="#8b5cf6" />

      {/* Google Analytics */}
      {includeAnalytics && seoConfig.gaTrackingId && seoConfig.gaTrackingId !== 'G-XXXXXXXXXX' && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${seoConfig.gaTrackingId}`} />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${seoConfig.gaTrackingId}', {
                page_path: window.location.pathname,
                cookie_flags: 'SameSite=None;Secure'
              });
            `}
          </script>
        </>
      )}

      {/* Google Tag Manager */}
      {includeGTM && seoConfig.gtmId && seoConfig.gtmId !== 'GTM-XXXXXXX' && (
        <script>
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${seoConfig.gtmId}');
          `}
        </script>
      )}

      {/* Facebook Pixel */}
      {includeFacebookPixel && seoConfig.fbPixelId && (
        <script>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${seoConfig.fbPixelId}');
            fbq('track', 'PageView');
          `}
        </script>
      )}

      {/* Structured Data Schemas */}
      {includeSchemas && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(getOrganizationSchema())}
          </script>
          <script type="application/ld+json">
            {JSON.stringify(getWebSiteSchema())}
          </script>
        </>
      )}
    </Helmet>
  );
};

/**
 * Google Tag Manager Body Snippet
 * Add this right after opening <body> tag
 */
export const GTMBodySnippet = () => {
  if (!seoConfig.gtmId || seoConfig.gtmId === 'GTM-XXXXXXX') return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${seoConfig.gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
};
