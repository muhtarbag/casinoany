import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { Image, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';

interface StorageLogo {
  name: string;
  url: string;
  created_at: string;
}

interface BettingSite {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export default function LogoRestore() {
  const queryClient = useQueryClient();
  const [selectedMappings, setSelectedMappings] = useState<Record<string, string>>({});

  // Fetch all storage logos
  const { data: storageLogos, isLoading: logosLoading } = useQuery({
    queryKey: ['storage-logos'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('site-logos')
        .list();

      if (error) throw error;

      const logos: StorageLogo[] = data.map(file => ({
        name: file.name,
        url: supabase.storage.from('site-logos').getPublicUrl(file.name).data.publicUrl,
        created_at: file.created_at || '',
      }));

      return logos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  // Fetch all sites
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['betting-sites-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, slug, logo_url')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as BettingSite[];
    },
  });

  // Auto-match logos to sites based on filename
  useEffect(() => {
    if (storageLogos && sites) {
      const autoMappings: Record<string, string> = {};
      
      storageLogos.forEach(logo => {
        const logoName = logo.name.toLowerCase().replace(/[-_\d.]+/g, '');
        
        const matchedSite = sites.find(site => {
          const siteName = site.name.toLowerCase().replace(/\s+/g, '');
          const siteSlug = site.slug.toLowerCase();
          return logoName.includes(siteName) || logoName.includes(siteSlug) || siteName.includes(logoName);
        });

        if (matchedSite) {
          autoMappings[logo.name] = matchedSite.id;
        }
      });

      setSelectedMappings(autoMappings);
    }
  }, [storageLogos, sites]);

  // Update site logo mutation
  const updateLogoMutation = useMutation({
    mutationFn: async ({ logoName, logoUrl, siteId }: { logoName: string; logoUrl: string; siteId: string }) => {
      const { error } = await supabase
        .from('betting_sites')
        .update({ logo_url: logoUrl })
        .eq('id', siteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      queryClient.invalidateQueries({ queryKey: ['betting-sites-all'] });
    },
  });

  // Batch update all mapped logos
  const batchUpdateMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(selectedMappings)
        .filter(([logoName, siteId]) => siteId && siteId !== '')
        .map(([logoName, siteId]) => {
          const logo = storageLogos?.find(l => l.name === logoName);
          return logo ? updateLogoMutation.mutateAsync({
            logoName,
            logoUrl: logo.url,
            siteId,
          }) : Promise.resolve();
        });

      await Promise.all(updates);
    },
    onSuccess: () => {
      showSuccessToast('Tüm logolar başarıyla güncellendi!');
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
    },
    onError: (error) => {
      showErrorToast(error, 'Logolar güncellenirken hata oluştu');
    },
  });

  const sitesWithoutLogos = sites?.filter(s => !s.logo_url) || [];
  const sitesWithLogos = sites?.filter(s => s.logo_url) || [];
  const unmappedLogos = storageLogos?.filter(l => !selectedMappings[l.name]) || [];

  if (logosLoading || sitesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Logo Geri Yükleme
          </CardTitle>
          <CardDescription>
            Storage'daki logoları sitelere eşleştirin ve geri yükleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{storageLogos?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Storage'daki Logo</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-success">{sitesWithLogos.length}</div>
                <p className="text-sm text-muted-foreground">Logosu Olan Site</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-destructive">{sitesWithoutLogos.length}</div>
                <p className="text-sm text-muted-foreground">Logosu Eksik Site</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-warning">{unmappedLogos.length}</div>
                <p className="text-sm text-muted-foreground">Eşleşmemiş Logo</p>
              </CardContent>
            </Card>
          </div>

          {/* Batch Update Button */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Toplu Güncelleme</p>
                <p className="text-sm text-muted-foreground">
                  {Object.keys(selectedMappings).length} logo eşleştirildi
                </p>
              </div>
            </div>
            <Button
              onClick={() => batchUpdateMutation.mutate()}
              disabled={batchUpdateMutation.isPending || Object.keys(selectedMappings).length === 0}
              size="lg"
            >
              {batchUpdateMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Tümünü Güncelle
                </>
              )}
            </Button>
          </div>

          {/* Logo Mappings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Logo Eşleştirmeleri</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {storageLogos?.map((logo) => {
                const selectedSite = sites?.find(s => s.id === selectedMappings[logo.name]);
                const hasLogo = selectedSite?.logo_url;

                return (
                  <div key={logo.name} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                    <img
                      src={logo.url}
                      alt={logo.name}
                      className="w-20 h-20 object-contain rounded border bg-background"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{logo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(logo.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="flex-1">
                      <Select
                        value={selectedMappings[logo.name] || ''}
                        onValueChange={(value) => {
                          setSelectedMappings(prev => ({
                            ...prev,
                            [logo.name]: value,
                          }));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Site seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sites?.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                              {site.logo_url && ' ✓'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {hasLogo && (
                      <Badge variant="secondary">
                        Mevcut Logo Var
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
