import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCheck, ExternalLink, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { SiteAdditionRequestDialog } from '@/components/SiteAdditionRequestDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Memberships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSiteRequestOpen, setIsSiteRequestOpen] = useState(false);
  const [isSiteSelectionOpen, setIsSiteSelectionOpen] = useState(false);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [username, setUsername] = useState('');
  const [notes, setNotes] = useState('');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: memberships, isLoading } = useQuery({
    queryKey: ['user-memberships', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('user_site_memberships')
        .select(`
          *,
          betting_sites (
            id,
            name,
            slug,
            logo_url,
            affiliate_link
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch all active sites for dropdown
  const { data: allSites } = useQuery({
    queryKey: ['active-betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, slug, logo_url')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const addMembershipMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedSiteId || !username.trim()) {
        throw new Error('Kullanıcı, site veya kullanıcı adı eksik');
      }

      const { error } = await (supabase as any)
        .from('user_site_memberships')
        .insert({
          user_id: user.id,
          site_id: selectedSiteId,
          username: username.trim(),
          notes: notes.trim() || null,
          registration_date: registrationDate,
          is_active: true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      setIsDialogOpen(false);
      setSelectedSiteId('');
      setUsername('');
      setNotes('');
      setRegistrationDate(new Date().toISOString().split('T')[0]);
      toast({
        title: 'Başarılı',
        description: 'Site kaydınız eklendi',
      });
    },
    onError: (error: any) => {
      console.error('Add membership error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Site eklenirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await (supabase as any)
        .from('user_site_memberships')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      toast({
        title: 'Başarılı',
        description: 'Üyelik durumu güncellendi',
      });
    },
  });

  const deleteMembershipMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await (supabase as any)
        .from('user_site_memberships')
        .delete()
        .eq('id', membershipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      toast({
        title: 'Başarılı',
        description: 'Üyelik kaydı silindi',
      });
    },
  });

  const addBulkMembershipsMutation = useMutation({
    mutationFn: async (siteIds: string[]) => {
      if (!user || siteIds.length === 0) {
        throw new Error('Kullanıcı veya site seçimi eksik');
      }

      const memberships = siteIds.map(siteId => ({
        user_id: user.id,
        site_id: siteId,
        username: '', // Empty for bulk add
        is_active: true,
        registration_date: new Date().toISOString().split('T')[0],
      }));

      const { error } = await (supabase as any)
        .from('user_site_memberships')
        .insert(memberships);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      setIsSiteSelectionOpen(false);
      setSelectedSiteIds([]);
      toast({
        title: 'Başarılı',
        description: `${selectedSiteIds.length} site başarıyla eklendi`,
      });
    },
    onError: (error: any) => {
      console.error('Bulk add membership error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Siteler eklenirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const toggleSiteSelection = (siteId: string) => {
    setSelectedSiteIds(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  if (!user) {
    return (
      <ProfileLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Üyeliklerinizi görmek için giriş yapın</p>
          </CardContent>
        </Card>
      </ProfileLayout>
    );
  }

  return (
    <>
      <SEO 
        title="Kayıtlı Olduğum Siteler"
        description="Kayıt olduğunuz bahis sitelerinizi görüntüleyin ve yönetin"
      />
      <ProfileLayout>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Kayıtlı Olduğum Siteler</h1>
            <p className="text-muted-foreground">
              Üye olduğunuz bahis sitelerini takip edin
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Site Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Site Kaydı</DialogTitle>
                <DialogDescription>
                  Kayıtlı olduğunuz bahis sitesini ekleyin
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="site">Site Seçin *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSiteRequestOpen(true)}
                      className="gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Site Ekle
                    </Button>
                  </div>
                  <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                    <SelectTrigger id="site">
                      <SelectValue placeholder="Bir site seçin..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {allSites?.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          <div className="flex items-center gap-2">
                            {site.logo_url && (
                              <img 
                                src={site.logo_url} 
                                alt={site.name}
                                className="w-5 h-5 object-contain"
                                loading="lazy"
                              />
                            )}
                            <span>{site.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Kullanıcı Adı *</Label>
                  <Input
                    id="username"
                    placeholder="Sitedeki kullanıcı adınız"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="registration-date">Kayıt Tarihi</Label>
                  <Input
                    id="registration-date"
                    type="date"
                    value={registrationDate}
                    onChange={(e) => setRegistrationDate(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notlar</Label>
                  <Textarea
                    id="notes"
                    placeholder="İsteğe bağlı notlarınız..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  onClick={() => addMembershipMutation.mutate()}
                  disabled={!selectedSiteId || !username.trim() || addMembershipMutation.isPending}
                >
                  {addMembershipMutation.isPending ? 'Ekleniyor...' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <ProfileSkeleton />
        ) : memberships && memberships.length > 0 ? (
          <div className="grid gap-4">
            {memberships.map((membership: any) => (
              <Card key={membership.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {membership.betting_sites.logo_url && (
                      <img
                        src={membership.betting_sites.logo_url}
                        alt={membership.betting_sites.name}
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded mx-auto sm:mx-0"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {membership.betting_sites.name}
                          </h3>
                          {membership.username && (
                            <p className="text-sm text-muted-foreground break-all">
                              Kullanıcı adı: <span className="font-medium">{membership.username}</span>
                            </p>
                          )}
                        </div>
                        <Badge variant={membership.is_active ? 'default' : 'secondary'} className="w-fit">
                          {membership.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        Kayıt tarihi: {membership.registration_date ? format(new Date(membership.registration_date), 'dd MMMM yyyy', { locale: tr }) : 'Belirtilmemiş'}
                      </p>

                      {membership.notes && (
                        <p className="text-sm bg-muted p-3 rounded mb-3">
                          {membership.notes}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          asChild
                          className="w-full sm:w-auto"
                        >
                          <a 
                            href={membership.betting_sites.affiliate_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Oynamaya Başla
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActiveMutation.mutate({
                            id: membership.id,
                            isActive: !membership.is_active
                          })}
                          disabled={toggleActiveMutation.isPending}
                          className="w-full sm:w-auto"
                        >
                          {membership.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMembershipMutation.mutate(membership.id)}
                          disabled={deleteMembershipMutation.isPending}
                          className="w-full sm:w-auto"
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
              <UserCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Henüz kayıtlı olduğunuz site yok
              </p>
              <Button onClick={() => setIsSiteSelectionOpen(true)}>
                Siteleri Keşfet
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Bulk Site Selection Dialog */}
        <Dialog open={isSiteSelectionOpen} onOpenChange={setIsSiteSelectionOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Kayıtlı Olduğunuz Siteleri Seçin</DialogTitle>
              <DialogDescription>
                Sistemdeki tüm sitelerden kayıtlı olduklarınızı seçin
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto py-4">
              {allSites && allSites.length > 0 ? (
                <div className="grid gap-3">
                  {allSites.map((site) => {
                    const isAlreadyMember = memberships?.some(
                      (m: any) => m.betting_sites.id === site.id
                    );
                    const isSelected = selectedSiteIds.includes(site.id);
                    
                    return (
                      <div
                        key={site.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          isAlreadyMember
                            ? 'opacity-50 cursor-not-allowed bg-muted'
                            : isSelected
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => !isAlreadyMember && toggleSiteSelection(site.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isAlreadyMember}
                          onCheckedChange={() => toggleSiteSelection(site.id)}
                          className="pointer-events-none"
                        />
                        {site.logo_url && (
                          <img
                            src={site.logo_url}
                            alt={site.name}
                            className="w-12 h-12 object-contain rounded"
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{site.name}</p>
                          {isAlreadyMember && (
                            <p className="text-xs text-muted-foreground">Zaten kayıtlısınız</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Site bulunamadı
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSiteSelectionOpen(false);
                  setSelectedSiteIds([]);
                }}
              >
                İptal
              </Button>
              <Button
                onClick={() => addBulkMembershipsMutation.mutate(selectedSiteIds)}
                disabled={selectedSiteIds.length === 0 || addBulkMembershipsMutation.isPending}
              >
                {addBulkMembershipsMutation.isPending
                  ? 'Ekleniyor...'
                  : `${selectedSiteIds.length} Siteyi Ekle`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <SiteAdditionRequestDialog
          open={isSiteRequestOpen} 
          onOpenChange={setIsSiteRequestOpen}
        />
      </ProfileLayout>
    </>
  );
};

export default Memberships;