import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { OptimizedImage } from './OptimizedImage';
import { Star, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const PremiumSitesCarousel = () => {
  const { data: premiumSites, isLoading } = useQuery({
    queryKey: ['premium-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, logo_url, rating, bonus, features, affiliate_link, slug, review_count, avg_rating')
        .eq('is_active', true)
        .lte('display_order', 5)
        .gte('display_order', 1)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading || !premiumSites || premiumSites.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Premium Siteler
              </h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              En yüksek bonus ve güvenilirlik garantisi
            </p>
          </div>
          <Badge variant="secondary" className="hidden md:flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Top 5
          </Badge>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {premiumSites.map((site) => (
              <CarouselItem key={site.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <div className="group relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card/95 to-primary/5 hover:border-primary/40 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary/20">
                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-3 py-1 shadow-lg animate-pulse">
                        ⭐ PREMIUM
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                      {/* Logo & Name */}
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-xl overflow-hidden bg-background/50 border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          {site.logo_url ? (
                            <OptimizedImage
                              src={site.logo_url}
                              alt={`${site.name} logo`}
                              className="w-full h-full object-contain p-2"
                              width={96}
                              height={96}
                            />
                          ) : (
                            <div className="text-3xl font-bold text-primary">
                              {site.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {site.name}
                          </h3>
                          {site.rating && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="text-lg font-semibold text-primary">
                                  {site.rating}
                                </span>
                              </div>
                              {site.review_count > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({site.review_count} değerlendirme)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bonus */}
                      {site.bonus && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
                          <p className="text-sm text-muted-foreground mb-1">Hoş Geldin Bonusu</p>
                          <p className="text-lg md:text-xl font-bold text-primary">
                            {site.bonus}
                          </p>
                        </div>
                      )}

                      {/* Features */}
                      {site.features && site.features.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {site.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {site.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{site.features.length - 3} daha
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          asChild
                          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          <a
                            href={site.affiliate_link}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                          >
                            Hemen Katıl
                          </a>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="flex-1"
                          size="lg"
                        >
                          <Link to={`/casino/${site.slug}`}>
                            İncele
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        {/* Bottom Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Premium siteler en yüksek güvenlik standartlarına sahiptir ve özel bonus avantajları sunar
          </p>
        </div>
      </div>
    </section>
  );
};
