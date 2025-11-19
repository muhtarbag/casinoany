import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Send, Info, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const TelegramSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [notifyOnReview, setNotifyOnReview] = useState(true);
  const [notifyOnComplaint, setNotifyOnComplaint] = useState(true);
  const [notifyOnSystem, setNotifyOnSystem] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  // Telegram ayarlarını getir
  const { data: settings, isLoading } = useQuery({
    queryKey: ['telegram-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('site_owner_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (settings) {
      setTelegramChatId(settings.telegram_chat_id || '');
      setTelegramEnabled(settings.telegram_enabled || false);
      setNotifyOnReview(settings.notify_on_review ?? true);
      setNotifyOnComplaint(settings.notify_on_complaint ?? true);
      setNotifyOnSystem(settings.notify_on_system_message ?? true);
    }
  }, [settings]);

  // Ayarları kaydet
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not found');

      const payload = {
        user_id: user.id,
        telegram_chat_id: telegramChatId || null,
        telegram_enabled: telegramEnabled,
        notify_on_review: notifyOnReview,
        notify_on_complaint: notifyOnComplaint,
        notify_on_system_message: notifyOnSystem,
      };

      const { error } = await supabase
        .from('site_owner_notification_settings')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings', user?.id] });
      toast.success('Telegram ayarları kaydedildi');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Ayarlar kaydedilemedi');
    },
  });

  // Test bildirimi gönder
  const testMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase.functions.invoke('telegram-notify', {
        body: {
          userId: user.id,
          message: '🎉 <b>Test Bildirimi</b>\n\nTelegram bağlantınız başarıyla kuruldu!',
          notificationType: 'system',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Test bildirimi gönderildi! Telegram\'ı kontrol edin.');
    },
    onError: (error) => {
      console.error('Test error:', error);
      toast.error('Test bildirimi gönderilemedi');
    },
  });

  const handleTest = async () => {
    if (!telegramChatId) {
      toast.error('Lütfen önce Chat ID girin');
      return;
    }

    setIsTesting(true);
    try {
      // Önce ayarları kaydet
      await saveMutation.mutateAsync();
      // Sonra test bildirimini gönder
      await testMutation.mutateAsync();
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Telegram Bildirimleri</CardTitle>
          <CardDescription>Yükleniyor...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Telegram Bildirimleri
        </CardTitle>
        <CardDescription>
          Sitenizle ilgili bildirimleri Telegram üzerinden anında alın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Kurulum Talimatları */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Telegram Bot Kurulumu</AlertTitle>
          <AlertDescription className="mt-2 space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-1">
              <li>Telegram'da <strong>@BettingPlatformBot</strong> botunu bulun ve başlatın</li>
              <li><code>/start</code> komutunu gönderin</li>
              <li>Bot size özel Chat ID'nizi gönderecek</li>
              <li>Chat ID'yi aşağıdaki alana yapıştırın</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Chat ID Girişi */}
        <div className="space-y-2">
          <Label htmlFor="chat-id">Chat ID</Label>
          <div className="flex gap-2">
            <Input
              id="chat-id"
              placeholder="Örn: 123456789"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!telegramChatId || isTesting}
            >
              {isTesting ? 'Gönderiliyor...' : 'Test Et'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Telegram botunuzdan aldığınız Chat ID'yi girin
          </p>
        </div>

        {/* Telegram'ı Aktifleştir */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="telegram-enabled">Telegram Bildirimlerini Aktifleştir</Label>
            <p className="text-sm text-muted-foreground">
              Bildirimleri Telegram'dan almaya başlayın
            </p>
          </div>
          <Switch
            id="telegram-enabled"
            checked={telegramEnabled}
            onCheckedChange={setTelegramEnabled}
          />
        </div>

        {/* Bildirim Türleri */}
        {telegramEnabled && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Bildirim Türleri</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-review">Yeni Yorumlar</Label>
                <p className="text-sm text-muted-foreground">
                  Sitenize yeni yorum geldiğinde bildirim al
                </p>
              </div>
              <Switch
                id="notify-review"
                checked={notifyOnReview}
                onCheckedChange={setNotifyOnReview}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-complaint">Yeni Şikayetler</Label>
                <p className="text-sm text-muted-foreground">
                  Sitenize şikayet geldiğinde bildirim al
                </p>
              </div>
              <Switch
                id="notify-complaint"
                checked={notifyOnComplaint}
                onCheckedChange={setNotifyOnComplaint}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-system">Sistem Mesajları</Label>
                <p className="text-sm text-muted-foreground">
                  Önemli sistem bildirimlerini al
                </p>
              </div>
              <Switch
                id="notify-system"
                checked={notifyOnSystem}
                onCheckedChange={setNotifyOnSystem}
              />
            </div>
          </div>
        )}

        {/* Kaydet Butonu */}
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </Button>

        {/* Durum Göstergesi */}
        {telegramChatId && telegramEnabled && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Telegram Bağlantısı Aktif</AlertTitle>
            <AlertDescription>
              Bildirimler Telegram hesabınıza gönderilecek
            </AlertDescription>
          </Alert>
        )}

        {!telegramEnabled && telegramChatId && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Telegram Bağlantısı Pasif</AlertTitle>
            <AlertDescription>
              Bildirimleri almak için Telegram'ı aktifleştirin
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
