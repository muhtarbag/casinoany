import { useState } from 'react';
import { useBettingSites } from '@/hooks/queries/useBettingSitesQueries';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TieredSitesGridProps {
  searchTerm?: string;
}

const TIER_CONFIG = {
  gold: {
    name: 'Gold Casino Siteleri',
    description: 'Yüksek bonus oranları ve hızlı ödeme sunan siteler',
    range: [4, 18],
    initialShow: 6,
    cardSize: 'medium',
    gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    badge: '🥇',
    color: 'from-yellow-600/20 to-amber-600/20'
  },
  silver: {
    name: 'Silver Casino Siteleri',
    description: 'Güvenilir ve popüler casino platformları',
    range: [19, 48],
    initialShow: 6,
    cardSize: 'compact',
    gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    badge: '🥈',
    color: 'from-slate-600/20 to-gray-600/20'
  },
  bronze: {
    name: 'Bronze Casino Siteleri',
    description: 'Kaliteli alternatif casino seçenekleri',
    range: [49, 98],
    initialShow: 8,
    cardSize: 'mini',
    gridCols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    badge: '🥉',
    color: 'from-orange-800/20 to-amber-900/20'
  },
  basic: {
    name: 'Diğer Casino Siteleri',
    description: 'Tüm lisanslı casino seçenekleri',
    range: [99, Infinity],
    initialShow: 10,
    cardSize: 'list',
    gridCols: 'grid-cols-1',
    badge: '🎰',
    color: 'from-primary/10 to-primary/5'
  }
};

export const TieredSitesGrid = ({ searchTerm = '' }: TieredSitesGridProps) => {
  const { data: sites, isLoading } = useBettingSites();
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    gold: true,
    silver: false,
    bronze: false,
    basic: false
  });
  const [showMoreCounts, setShowMoreCounts] = useState<Record<string, number>>({
    gold: TIER_CONFIG.gold.initialShow,
    silver: TIER_CONFIG.silver.initialShow,
    bronze: TIER_CONFIG.bronze.initialShow,
    basic: TIER_CONFIG.basic.initialShow
  });

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  const showMore = (tier: string) => {
    const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
    setShowMoreCounts(prev => ({
      ...prev,
      [tier]: prev[tier] + config.initialShow
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Object.entries(TIER_CONFIG).map(([tier]) => (
          <div key={tier} className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter and sort sites
  const filteredSites = sites?.filter(site => {
    if (!searchTerm) return true;
    return site.name.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => (a.display_order || 999) - (b.display_order || 999)) || [];

  // Group sites by tier based on display_order
  const tierGroups = Object.entries(TIER_CONFIG).reduce((acc, [tier, config]) => {
    const tierSites = filteredSites.filter(site => {
      const order = site.display_order || 999;
      return order >= config.range[0] && order <= config.range[1];
    });
    if (tierSites.length > 0) {
      acc[tier] = tierSites;
    }
    return acc;
  }, {} as Record<string, typeof filteredSites>);

  return (
    <div className="space-y-6">
      {Object.entries(tierGroups).map(([tier, tierSites]) => {
        const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
        const isExpanded = expandedTiers[tier];
        const showCount = showMoreCounts[tier];
        const displayedSites = isExpanded ? tierSites.slice(0, showCount) : [];
        const hasMore = displayedSites.length < tierSites.length;

        return (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-gradient-to-br overflow-hidden"
            style={{ backgroundImage: `linear-gradient(to bottom right, ${config.color})` }}
          >
            {/* Tier Header */}
            <button
              onClick={() => toggleTier(tier)}
              className="w-full p-6 flex items-center justify-between hover:bg-background/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{config.badge}</span>
                <div className="text-left">
                  <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    {config.name}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({tierSites.length} site)
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronUp className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
              </div>
            </button>

            {/* Tier Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0">
                    {/* Sites Grid */}
                    <div className={`grid ${config.gridCols} gap-4 mb-4`}>
                      {displayedSites.map((site) => (
                        <motion.div
                          key={site.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={config.cardSize === 'mini' ? 'h-auto' : ''}
                        >
                          <BettingSiteCard 
                            id={site.id}
                            name={site.name}
                            logo={site.logo_url}
                            rating={site.rating || 0}
                            bonus={site.bonus}
                            features={site.features || []}
                            slug={site.slug}
                            affiliateUrl={site.affiliate_link}
                            email={site.email}
                            whatsapp={site.whatsapp}
                            telegram={site.telegram}
                            twitter={site.twitter}
                            instagram={site.instagram}
                            facebook={site.facebook}
                            youtube={site.youtube}
                            reviewCount={site.review_count}
                            avgRating={site.avg_rating}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Show More Button */}
                    {hasMore && (
                      <div className="text-center">
                        <Button
                          onClick={() => showMore(tier)}
                          variant="outline"
                          className="gap-2"
                        >
                          Daha Fazla Göster
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'Arama sonucu bulunamadı.' : 'Site bulunamadı.'}
          </p>
        </div>
      )}
    </div>
  );
};
