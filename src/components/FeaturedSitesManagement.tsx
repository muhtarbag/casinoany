import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2, Eye } from 'lucide-react';

export const FeaturedSitesManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch all sites
  const { data: sites, isLoading } = useQuery({
    queryKey: ['all-sites-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Toggle featured status
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      setUpdatingId(id);
      const { error } = await supabase
        .from('betting_sites')
        .update({ is_featured: isFeatured })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-sites-featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured-sites'] });
      toast({
        title: 'Başarılı',
        description: 'Öne çıkan site durumu güncellendi.',
      });
      setUpdatingId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu.',
        variant: 'destructive',
      });
      setUpdatingId(null);
    },
  });

  const handleToggleFeatured = (id: string, currentStatus: boolean) => {
    toggleFeaturedMutation.mutate({ id, isFeatured: !currentStatus });
  };

  const featuredSites = sites?.filter(site => site.is_featured) || [];
  const nonFeaturedSites = sites?.filter(site => !site.is_featured) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Öne Çıkan Siteler Yönetimi
          </CardTitle>
          <CardDescription>
            Ana sayfanın hero bölümünde gösterilecek siteleri seçin (maksimum 3 site önerilir)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Featured Sites */}
          {featuredSites.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Aktif Öne Çıkanlar ({featuredSites.length})
              </h3>
              <div className="space-y-2">
                {featuredSites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border-2 border-primary/30"
                  >
                    <div className="flex items-center gap-3">
                      {site.logo_url && (
                        <img
                          src={site.logo_url}
                          alt={site.name}
                          className="w-10 h-10 object-contain rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{site.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ⭐ {site.rating} | {site.bonus || 'Bonus belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={true}
                      onCheckedChange={() => handleToggleFeatured(site.id, true)}
                      disabled={updatingId === site.id}
                    />
                  </div>
                ))}
              </div>
              {featuredSites.length > 3 && (
                <p className="text-sm text-yellow-500 mt-2">
                  ⚠️ 3'ten fazla öne çıkan site seçildi. Sadece ilk 3 tanesi gösterilecek.
                </p>
              )}
            </div>
          )}

          {/* Available Sites */}
          <div>
            <h3 className="font-semibold mb-3">Diğer Siteler ({nonFeaturedSites.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {nonFeaturedSites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {site.logo_url && (
                      <img
                        src={site.logo_url}
                        alt={site.name}
                        className="w-10 h-10 object-contain rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{site.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ⭐ {site.rating} | {site.bonus || 'Bonus belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={false}
                    onCheckedChange={() => handleToggleFeatured(site.id, false)}
                    disabled={updatingId === site.id}
                  />
                </div>
              ))}
            </div>
          </div>

          {featuredSites.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Henüz öne çıkan site seçilmedi.</p>
              <p className="text-sm">Yukarıdaki listeden siteleri öne çıkan olarak işaretleyin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
