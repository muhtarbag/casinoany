/**
 * Virtualized Site List Component
 * Optimized for rendering large lists of betting sites
 * Uses React Virtual for efficient memory usage
 */

import { memo } from 'react';
import { VirtualizedList } from './VirtualizedList';
import { BettingSiteCard } from '@/components/BettingSiteCard';

interface Site {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  rating: number;
  bonus?: string;
  features?: string[];
  affiliate_link: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  views?: number;
  clicks?: number;
  review_count?: number;
  avg_rating?: number;
}

interface VirtualizedSiteListProps {
  sites: Site[];
  stats?: Record<string, { views: number; clicks: number }>;
  className?: string;
}

function VirtualizedSiteListComponent({ sites, stats, className }: VirtualizedSiteListProps) {
  return (
    <VirtualizedList
      items={sites}
      estimateSize={400} // Approximate card height
      overscan={3}
      className={className}
      renderItem={(site) => {
        const siteStats = stats?.[site.id];
        
        return (
          <BettingSiteCard
            key={site.id}
            id={site.id}
            slug={site.slug}
            name={site.name}
            logo={site.logo_url}
            rating={site.rating}
            bonus={site.bonus}
            features={site.features}
            affiliateUrl={site.affiliate_link}
            email={site.email}
            whatsapp={site.whatsapp}
            telegram={site.telegram}
            twitter={site.twitter}
            instagram={site.instagram}
            facebook={site.facebook}
            youtube={site.youtube}
            views={siteStats?.views || site.views || 0}
            clicks={siteStats?.clicks || site.clicks || 0}
            reviewCount={site.review_count || 0}
            avgRating={site.avg_rating || 0}
          />
        );
      }}
    />
  );
}

export const VirtualizedSiteList = memo(VirtualizedSiteListComponent);
