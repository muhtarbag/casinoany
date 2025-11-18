import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

// Core Web Vitals & Performance hints
export const PerformanceEnhancer = () => {
  return (
    <Helmet>
      {/* Critical Resource Hints */}
      <link rel="preconnect" href="https://cpaukwimbfoembwwtqhj.supabase.co" />
      <link rel="dns-prefetch" href="https://cpaukwimbfoembwwtqhj.supabase.co" />
      
      {/* Image Optimization Hints */}
      <link rel="preload" as="image" href="/og-default.jpg" />
      
      {/* Font Optimization */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

// E-E-A-T Signals for iGaming
interface EEATEnhancerProps {
  authorName?: string;
  authorExpertise?: string;
  lastReviewed?: string;
  factChecked?: boolean;
}

export const EEATEnhancer = ({
  authorName = 'iGaming Experts Team',
  authorExpertise = 'Casino & Betting Industry Specialists',
  lastReviewed,
  factChecked = true
}: EEATEnhancerProps) => {
  return (
    <Helmet>
      {/* Author Expertise */}
      <meta name="author" content={authorName} />
      <meta name="expert-level" content={authorExpertise} />
      
      {/* Content Quality Signals */}
      {lastReviewed && <meta name="last-reviewed" content={lastReviewed} />}
      {factChecked && <meta name="fact-checked" content="true" />}
      
      {/* Trust Signals */}
      <meta name="content-category" content="Editorial" />
      <meta name="content-purpose" content="Information & Comparison" />
    </Helmet>
  );
};

// Grey Market SEO Safety
interface SafetyEnhancerProps {
  isMoneyPage?: boolean;
  complianceLevel?: 'high' | 'medium' | 'low';
}

export const SafetyEnhancer = ({
  isMoneyPage = false,
  complianceLevel = 'high'
}: SafetyEnhancerProps) => {
  return (
    <Helmet>
      {/* Responsible Gaming Meta */}
      <meta name="responsible-gaming" content="18+" />
      <meta name="gambling-disclaimer" content="Gambling can be addictive. Play responsibly." />
      
      {/* Content Classification */}
      <meta name="rating" content="General" />
      <meta name="audience" content="adults" />
      
      {/* Geo-targeting */}
      <meta name="geo.region" content="TR" />
      <meta name="geo.placename" content="Turkey" />
    </Helmet>
  );
};

// Mobile-First Enhancement
export const MobileOptimizer = () => {
  return (
    <Helmet>
      {/* Mobile Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Touch Icons */}
      <meta name="format-detection" content="telephone=no" />
      
      {/* Responsive Images */}
      <meta name="image-optimization" content="webp, lazy-load" />
    </Helmet>
  );
};

// Social Signals & Rich Snippets
interface SocialEnhancerProps {
  twitterHandle?: string;
  facebookAppId?: string;
}

export const SocialEnhancer = ({
  twitterHandle = '@CasinoAny',
  facebookAppId
}: SocialEnhancerProps) => {
  return (
    <Helmet>
      {/* Twitter Card Enhancement */}
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      
      {/* Facebook Enhanced */}
      {facebookAppId && <meta property="fb:app_id" content={facebookAppId} />}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:locale:alternate" content="en_US" />
    </Helmet>
  );
};

// Alternative Languages (for international expansion)
interface HreflangProps {
  currentLang: string;
  alternates?: Array<{ lang: string; url: string }>;
}

export const HreflangEnhancer = ({
  currentLang = 'tr',
  alternates = []
}: HreflangProps) => {
  return (
    <Helmet>
      <link rel="alternate" hrefLang={currentLang} href={window.location.href} />
      {alternates.map(alt => (
        <link key={alt.lang} rel="alternate" hrefLang={alt.lang} href={alt.url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={window.location.origin} />
    </Helmet>
  );
};

// Combined iGaming SEO Enhancer
interface GamblingSEOEnhancerProps {
  isMoneyPage?: boolean;
  authorName?: string;
  lastReviewed?: string;
  enableHreflang?: boolean;
}

export const GamblingSEOEnhancer = ({
  isMoneyPage = false,
  authorName,
  lastReviewed,
  enableHreflang = false
}: GamblingSEOEnhancerProps) => {
  useEffect(() => {
    // Add performance observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Performance tracking
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
      } catch (e) {
        // Performance observer not supported
      }
    }
  }, []);

  return (
    <>
      <PerformanceEnhancer />
      <EEATEnhancer authorName={authorName} lastReviewed={lastReviewed} />
      <SafetyEnhancer isMoneyPage={isMoneyPage} />
      <MobileOptimizer />
      <SocialEnhancer />
      {enableHreflang && <HreflangEnhancer currentLang="tr" />}
    </>
  );
};
