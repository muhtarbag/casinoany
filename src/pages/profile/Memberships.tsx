import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, ExternalLink, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
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
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [registeredAt, setRegisteredAt] = useState(new Date().toISOString().split('T')[0]);

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
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false });
      
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
      if (!user || !selectedSiteId) {
        throw new Error('Kullanıcı veya site seçilmedi');
      }

      const { error } = await (supabase as any)
        .from('user_site_memberships')
        .insert({
          user_id: user.id,
          site_id: selectedSiteId,
          username: username || null,
          password: password || null,
          notes: notes || null,
          registered_at: registeredAt,
          is_active: true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      setIsDialogOpen(false);
      setSelectedSiteId('');
      setUsername('');
      setPassword('');
      setNotes('');
      setRegisteredAt(new Date().toISOString().split('T')[0]);
      toast({
        title: 'Başarılı',
        description: 'Site kaydınız eklendi',
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Site eklenirken bir hata oluştu',
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Üyeliklerinizi görmek için giriş yapın</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Kayıtlı Olduğum Siteler"
        description="Kayıt olduğunuz bahis sitelerinizi görüntüleyin ve yönetin"
      />
      <div className="container mx-auto px-4 py-8">
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
                  <Label htmlFor="site">Site Seçin *</Label>
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
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input
                    id="username"
                    placeholder="Opsiyonel"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Opsiyonel"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="registered-at">Kayıt Tarihi</Label>
                  <Input
                    id="registered-at"
                    type="date"
                    value={registeredAt}
                    onChange={(e) => setRegisteredAt(e.target.value)}
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
                  disabled={!selectedSiteId || addMembershipMutation.isPending}
                >
                  {addMembershipMutation.isPending ? 'Ekleniyor...' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : memberships && memberships.length > 0 ? (
          <div className="grid gap-4">
            {memberships.map((membership: any) => (
              <Card key={membership.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {membership.betting_sites.logo_url && (
                      <img
                        src={membership.betting_sites.logo_url}
                        alt={membership.betting_sites.name}
                        className="w-16 h-16 object-contain rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {membership.betting_sites.name}
                          </h3>
                          {membership.username && (
                            <p className="text-sm text-muted-foreground">
                              Kullanıcı adı: <span className="font-medium">{membership.username}</span>
                            </p>
                          )}
                        </div>
                        <Badge variant={membership.is_active ? 'default' : 'secondary'}>
                          {membership.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        Kayıt tarihi: {format(new Date(membership.registered_at), 'dd MMMM yyyy', { locale: tr })}
                      </p>

                      {membership.notes && (
                        <p className="text-sm bg-muted p-3 rounded mb-3">
                          {membership.notes}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link to={`/sites/${membership.betting_sites.slug}`}>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Detay
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActiveMutation.mutate({
                            id: membership.id,
                            isActive: !membership.is_active
                          })}
                          disabled={toggleActiveMutation.isPending}
                        >
                          {membership.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMembershipMutation.mutate(membership.id)}
                          disabled={deleteMembershipMutation.isPending}
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
              <Button asChild>
                <Link to="/">Siteleri Keşfet</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Memberships;