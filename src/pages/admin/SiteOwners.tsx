import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Building2, 
  User, 
  Mail, 
  Phone,
  Globe,
  FileText,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SiteOwners = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');

  // Tüm siteleri çek
  const { data: allSites } = useQuery({
    queryKey: ['all-betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, slug, logo_url')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ['site-owner-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_owners')
        .select(`
          *,
          betting_sites (id, name, slug, logo_url),
          profiles (
            email,
            username,
            first_name,
            last_name,
            phone,
            company_name,
            company_tax_number,
            company_type,
            company_phone,
            company_email,
            company_address,
            company_website,
            contact_person_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ ownerId, userId, siteId }: { ownerId: string; userId: string; siteId: string }) => {
      // Site Owner kaydını güncelle
      const { error: ownerError } = await supabase
        .from('site_owners')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          site_id: siteId
        })
        .eq('id', ownerId);
      
      if (ownerError) throw ownerError;

      // User role'ü onayla
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ status: 'approved' })
        .eq('user_id', userId)
        .eq('role', 'site_owner');
      
      if (roleError) throw roleError;

      // Betting site'ın owner_id'sini güncelle
      const { error: siteError } = await supabase
        .from('betting_sites')
        .update({ owner_id: userId })
        .eq('id', siteId);
      
      if (siteError) throw siteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-owner-applications'] });
      setSelectedApplication(null);
      setSelectedSiteId('');
      toast({
        title: 'Başarılı',
        description: 'Site sahibi başvurusu onaylandı',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İşlem sırasında bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ ownerId, userId }: { ownerId: string; userId: string }) => {
      const { error: ownerError } = await (supabase as any)
        .from('site_owners')
        .update({ status: 'rejected' })
        .eq('id', ownerId);
      
      if (ownerError) throw ownerError;

      // Update user_roles status
      const { error: roleError } = await (supabase as any)
        .from('user_roles')
        .update({ status: 'rejected' })
        .eq('user_id', userId)
        .eq('role', 'site_owner' as any);
      
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-owner-applications'] });
      toast({
        title: 'Başarılı',
        description: 'Site sahibi başvurusu reddedildi',
      });
    },
  });

  if (!isAdmin) {
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
        title="Site Sahipleri Yönetimi"
        description="Site sahibi başvurularını yönetin"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Site Sahipleri</h1>
          <p className="text-muted-foreground">
            Site sahibi başvurularını yönetin
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {app.betting_sites?.logo_url && (
                        <img 
                          src={app.betting_sites.logo_url} 
                          alt={app.betting_sites.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      {app.betting_sites?.name}
                    </CardTitle>
                    <Badge variant={
                      app.status === 'approved' ? 'default' :
                      app.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {app.status === 'approved' ? 'Onaylandı' :
                       app.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {app.profiles?.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Başvuru Tarihi:</span>{' '}
                      {new Date(app.created_at).toLocaleDateString('tr-TR')}
                    </p>
                    
                    {app.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => setSelectedApplication(app)}
                          disabled={approveMutation.isPending}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate({ ownerId: app.id, userId: app.user_id })}
                          disabled={rejectMutation.isPending}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reddet
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Henüz başvuru bulunmuyor</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Site Sahibi Başvurusunu Onayla</DialogTitle>
            <DialogDescription>
              Başvuruyu onaylamak için bir site seçin veya yeni site oluşturun.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Firma</p>
                  <p className="font-medium">{selectedApplication.profiles?.company_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yetkili Kişi</p>
                  <p className="font-medium">{selectedApplication.profiles?.contact_person_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedApplication.profiles?.company_email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{selectedApplication.profiles?.company_phone || '-'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Site Seç</label>
                <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir site seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSites?.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        <div className="flex items-center gap-2">
                          {site.logo_url && (
                            <img src={site.logo_url} alt={site.name} className="w-4 h-4 object-contain" />
                          )}
                          <span>{site.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApplication(null)}>
              İptal
            </Button>
            <Button
              onClick={() => {
                if (selectedSiteId && selectedApplication) {
                  approveMutation.mutate({
                    ownerId: selectedApplication.id,
                    userId: selectedApplication.user_id,
                    siteId: selectedSiteId
                  });
                }
              }}
              disabled={!selectedSiteId || approveMutation.isPending}
            >
              {approveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SiteOwners;
