import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { useState } from 'react';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || ''
        });
      }
      
      return data;
    },
    enabled: !!user
  });

  const { data: notificationPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['notification-prefs', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil bilgileriniz güncellendi');
    },
    onError: () => {
      toast.error('Profil güncellenirken bir hata oluştu');
    }
  });

  const updateNotificationPrefsMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user?.id,
          ...data
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-prefs'] });
      toast.success('Bildirim tercihleri güncellendi');
    },
    onError: () => {
      toast.error('Bildirim tercihleri güncellenirken bir hata oluştu');
    }
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Ayarlarınıza erişmek için lütfen giriş yapın.
            </p>
            <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Hesap Ayarları"
        description="Profil bilgilerinizi ve tercihlerinizi yönetin"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/profile/dashboard')}>
              ← Hesabıma Dön
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>
                Kişisel bilgilerinizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>E-posta</Label>
                <Input value={user.email} disabled />
                <p className="text-xs text-muted-foreground mt-1">
                  E-posta adresiniz değiştirilemez
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ad</Label>
                  <Input
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <Label>Soyad</Label>
                  <Input
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    placeholder="Soyadınız"
                  />
                </div>
              </div>
              <div>
                <Label>Telefon</Label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
              <Button
                onClick={() => updateProfileMutation.mutate(profileData)}
                disabled={updateProfileMutation.isPending}
              >
                Profili Güncelle
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bildirim Tercihleri</CardTitle>
              <CardDescription>
                E-posta bildirimlerinizi yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Genel e-posta bildirimlerini alın
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs?.email_notifications ?? true}
                  onCheckedChange={(checked) =>
                    updateNotificationPrefsMutation.mutate({
                      ...notificationPrefs,
                      email_notifications: checked
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bonus Uyarıları</Label>
                  <p className="text-sm text-muted-foreground">
                    Yeni bonus fırsatlarından haberdar olun
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs?.bonus_alerts ?? true}
                  onCheckedChange={(checked) =>
                    updateNotificationPrefsMutation.mutate({
                      ...notificationPrefs,
                      bonus_alerts: checked
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Site Güncellemeleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Favori sitelerinizle ilgili güncellemeler alın
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs?.site_updates ?? true}
                  onCheckedChange={(checked) =>
                    updateNotificationPrefsMutation.mutate({
                      ...notificationPrefs,
                      site_updates: checked
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Şikayet Güncellemeleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Şikayetlerinizle ilgili güncellemeleri alın
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs?.complaint_updates ?? true}
                  onCheckedChange={(checked) =>
                    updateNotificationPrefsMutation.mutate({
                      ...notificationPrefs,
                      complaint_updates: checked
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Tehlikeli Bölge</CardTitle>
              <CardDescription>
                Hesabınızı kalıcı olarak silin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Hesabınızı silmek tüm verilerinizi kalıcı olarak siler. Bu işlem geri alınamaz.
              </p>
              <Button variant="destructive" disabled>
                Hesabı Sil (Yakında)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
