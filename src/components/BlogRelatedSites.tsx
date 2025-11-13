import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Sparkles } from 'lucide-react';

interface BlogRelatedSitesProps {
  postId: string;
}

export const BlogRelatedSites = ({ postId }: BlogRelatedSitesProps) => {
  const navigate = useNavigate();

  const { data: relatedSites, isLoading } = useQuery({
    queryKey: ['blog-related-sites', postId],
    queryFn: async () => {
      const { data: relations, error: relError } = await (supabase as any)
        .from('blog_post_related_sites')
        .select('site_id, display_order')
        .eq('post_id', postId)
        .order('display_order', { ascending: true });

      if (relError) throw relError;
      if (!relations || relations.length === 0) return [];

      const siteIds = relations.map((r: any) => r.site_id);
      const { data: sites, error: sitesError } = await supabase
        .from('betting_sites')
        .select('id, name, slug, logo_url, rating, bonus, features, affiliate_link, is_active')
        .in('id', siteIds)
        .eq('is_active', true);

      if (sitesError) throw sitesError;

      // Sort sites according to display_order
      const sortedSites = sites?.sort((a, b) => {
        const orderA = (relations as any[]).find((r: any) => r.site_id === a.id)?.display_order || 0;
        const orderB = (relations as any[]).find((r: any) => r.site_id === b.id)?.display_order || 0;
        return orderA - orderB;
      });

      return sortedSites || [];
    },
  });

  if (isLoading) {
    return null;
  }

  if (!relatedSites || relatedSites.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          İlgili Bahis Siteleri
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedSites.map((site: any) => (
            <Card
              key={site.id}
              className="group cursor-pointer hover:border-primary/50 transition-all duration-300"
              onClick={() => navigate(site.slug ? `/${site.slug}` : `/site/${site.id}`)}
            >
              <CardContent className="p-4 space-y-3">
                {/* Logo */}
                <div className="flex items-center justify-center w-full h-16 bg-muted rounded-lg overflow-hidden border border-border">
                  {site.logo_url ? (
                    <img
                      src={site.logo_url}
                      alt={site.name}
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">
                      {site.name[0]}
                    </span>
                  )}
                </div>

                {/* Site Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-center group-hover:text-primary transition-colors">
                    {site.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(site.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-semibold ml-1">{site.rating}</span>
                  </div>

                  {/* Bonus */}
                  {site.bonus && (
                    <div className="bg-primary/10 rounded-lg p-2 text-center">
                      <p className="text-xs font-semibold line-clamp-2">{site.bonus}</p>
                    </div>
                  )}

                  {/* Features */}
                  {site.features && site.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {site.features.slice(0, 2).map((feature: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(site.slug ? `/${site.slug}` : `/site/${site.id}`);
                    }}
                  >
                    Detaylar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(site.affiliate_link, '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Git
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
