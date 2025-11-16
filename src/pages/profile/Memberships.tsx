import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Memberships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Kayıtlı Olduğum Siteler</h1>
          <p className="text-muted-foreground">
            Üye olduğunuz bahis sitelerini takip edin
          </p>
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