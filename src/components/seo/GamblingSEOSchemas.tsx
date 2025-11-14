import { Helmet } from 'react-helmet-async';

interface CasinoSchemaProps {
  name: string;
  url: string;
  logo: string;
  rating: number;
  reviewCount: number;
  bonus: string;
  features: string[];
  license?: string;
  paymentMethods?: string[];
  gameProviders?: string[];
}

// iGaming-specific Casino Review Schema (E-E-A-T optimized)
export const CasinoReviewSchema = ({
  name,
  url,
  logo,
  rating,
  reviewCount,
  bonus,
  features,
  license,
  paymentMethods = [],
  gameProviders = []
}: CasinoSchemaProps) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    description: `${name} - ${bonus} | ${features.join(', ')}`,
    image: logo,
    brand: {
      '@type': 'Brand',
      name: name
    },
    offers: {
      '@type': 'Offer',
      url: url,
      priceCurrency: 'TRY',
      price: '0',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1'
    },
    ...(license && {
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'License',
          value: license
        }
      ]
    })
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

// Bonus Offer Schema (Money Keywords)
interface BonusSchemaProps {
  title: string;
  description: string;
  bonusAmount: string;
  wageringRequirement: string;
  validUntil: string;
  eligibility: string[];
  siteName: string;
  siteUrl: string;
}

export const BonusOfferSchema = ({
  title,
  description,
  bonusAmount,
  wageringRequirement,
  validUntil,
  eligibility,
  siteName,
  siteUrl
}: BonusSchemaProps) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SpecialAnnouncement',
    name: title,
    text: description,
    category: 'Casino Bonus',
    datePosted: new Date().toISOString(),
    expires: validUntil,
    spatialCoverage: {
      '@type': 'Country',
      name: 'Turkey'
    },
    provider: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

// Slot Game Provider Schema
interface SlotProviderSchemaProps {
  providerName: string;
  games: Array<{
    name: string;
    rtp: string;
    volatility: string;
    features: string[];
  }>;
  casinosAvailable: string[];
}

export const SlotProviderSchema = ({
  providerName,
  games,
  casinosAvailable
}: SlotProviderSchemaProps) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${providerName} Slot Provider`,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'AggregateOffer',
      offerCount: games.length.toString()
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '100',
      bestRating: '5'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

// E-E-A-T Expert Review Schema
interface ExpertReviewSchemaProps {
  articleTitle: string;
  articleBody: string;
  author: {
    name: string;
    expertise: string;
    experience: string;
  };
  datePublished: string;
  dateModified: string;
  rating: number;
  casinoName: string;
}

export const ExpertReviewSchema = ({
  articleTitle,
  articleBody,
  author,
  datePublished,
  dateModified,
  rating,
  casinoName
}: ExpertReviewSchemaProps) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: casinoName
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating.toString(),
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Person',
      name: author.name,
      jobTitle: 'iGaming Expert',
      description: `${author.expertise} | ${author.experience} deneyim`
    },
    datePublished: datePublished,
    dateModified: dateModified,
    reviewBody: articleBody,
    publisher: {
      '@type': 'Organization',
      name: 'CasinoAny',
      url: window.location.origin
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

// HowTo Schema for Casino Guides
interface HowToSchemaProps {
  title: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
  totalTime?: string;
}

export const CasinoHowToSchema = ({
  title,
  description,
  steps,
  totalTime = 'PT5M'
}: HowToSchemaProps) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: description,
    totalTime: totalTime,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image })
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

// Comparison Table Schema (for site comparison pages)
interface ComparisonSchemaProps {
  title: string;
  sites: Array<{
    name: string;
    rating: number;
    bonus: string;
    features: string[];
  }>;
}

export const CasinoComparisonSchema = ({
  title,
  sites
}: ComparisonSchemaProps) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement: sites.map((site, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: site.name,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: site.rating.toString(),
          bestRating: '5'
        }
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};
