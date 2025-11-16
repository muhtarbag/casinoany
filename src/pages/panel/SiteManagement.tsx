import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Loader2, ExternalLink } from 'lucide-react';

const SiteManagement = () => {
  const { user, isSiteOwner, ownedSites } = useAuth();
  const navigate = useNavigate();

  const { data: sites, isLoading } = useQuery({
    queryKey: ['owned-sites', user?.id],
    queryFn: async () => {
      if (!user || ownedSites.length === 0) return [];
      
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .in('id', ownedSites);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && isSiteOwner && ownedSites.length > 0,
  });

  if (!user || !isSiteOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz yok</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Site Yönetimi"
        description="Sitelerinizi yönetin"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Site Yönetimi</h1>
          <p className="text-muted-foreground">
            Sitelerinizi buradan yönetebilirsiniz
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : sites && sites.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site: any) => (
              <Card key={site.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {site.logo_url && (
                      <img src={site.logo_url} alt={site.name} className="w-8 h-8 object-contain" />
                    )}
                    {site.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Rating: {site.rating || 'N/A'}/5
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Yorumlar: {site.review_count || 0}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="flex-1"
                      >
                        <a href={`/sites/${site.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Görüntüle
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin/sites?edit=${site.id}`)}
                        className="flex-1"
                      >
                        Düzenle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">
                Henüz onaylanmış siteniz bulunmuyor. Admin onayı bekleniyor.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default SiteManagement;
