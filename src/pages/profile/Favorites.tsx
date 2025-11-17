import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

const Favorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading, error: queryError } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('🔍 Fetching favorites for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_favorite_sites')
        .select(`
          id,
          site_id,
          created_at,
          notes,
          betting_sites (
            id,
            name,
            slug,
            logo_url,
            rating,
            bonus,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      console.log('📊 Favorites query result:', { data, error, count: data?.length });
      
      if (error) {
        console.error('❌ Favorites query error:', error);
        throw error;
      }
      
      // Filter out favorites where betting_sites is null (inactive sites)
      const validFavorites = data?.filter(fav => fav.betting_sites) || [];
      console.log('✅ Valid favorites (with active sites):', validFavorites.length);
      
      return validFavorites;
    },
    enabled: !!user,
  });

  // Log query error if exists
  if (queryError) {
    console.error('❌ Query Error:', queryError);
  }

  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from('user_favorite_sites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user?.id || ''); // Extra security check
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] }); // Also refresh stats
      toast({
        title: 'Başarılı',
        description: 'Site favorilerden kaldırıldı',
      });
    },
    onError: (error) => {
      console.error('❌ Remove favorite error:', error);
      toast({
        title: 'Hata',
        description: 'Site favorilerden kaldırılırken bir hata oluştu',
        variant: 'destructive'
      });
    }
  });

  if (!user) {
    return (
      <ProfileLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Favorilerinizi görmek için giriş yapın</p>
          </CardContent>
        </Card>
      </ProfileLayout>
    );
  }

  return (
    <>
      <SEO 
        title="Favori Sitelerim"
        description="Favori bahis sitelerinizi görüntüleyin ve yönetin"
      />
      <ProfileLayout>
        {isLoading ? (
          <ProfileSkeleton />
        ) : queryError ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-destructive mb-4">
                Favoriler yüklenirken bir hata oluştu
              </p>
              <pre className="text-xs text-left bg-muted p-4 rounded mb-4 overflow-auto">
                {JSON.stringify(queryError, null, 2)}
              </pre>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['user-favorites'] })}>
                Tekrar Dene
              </Button>
            </CardContent>
          </Card>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav: any) => (
              <Card key={fav.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {fav.betting_sites.logo_url && (
                      <img
                        src={fav.betting_sites.logo_url}
                        alt={fav.betting_sites.name}
                        className="w-16 h-16 object-contain rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {fav.betting_sites.name}
                      </h3>
                      {fav.betting_sites.rating && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <span>⭐</span>
                          <span>{fav.betting_sites.rating}/5</span>
                        </div>
                      )}
                      {fav.betting_sites.bonus && (
                        <p className="text-sm text-primary font-medium mb-3">
                          {fav.betting_sites.bonus}
                        </p>
                      )}
                      {fav.notes && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {fav.notes}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1"
                        >
                          <Link to={`/sites/${fav.betting_sites.slug}`}>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Detay
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFavoriteMutation.mutate(fav.id)}
                          disabled={removeFavoriteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Henüz favori siteniz yok
              </p>
              <Button asChild>
                <Link to="/">Siteleri Keşfet</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </ProfileLayout>
    </>
  );
};

export default Favorites;