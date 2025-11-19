import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Users, Phone, Send, Circle } from 'lucide-react';
import { SiDiscord, SiPinterest } from 'react-icons/si';

const profileSchema = z.object({
  contact_teams: z.string().optional(),
  contact_telegram: z.string().optional(),
  contact_whatsapp: z.string().optional(),
  social_facebook: z.string().optional(),
  social_twitter: z.string().optional(),
  social_instagram: z.string().optional(),
  social_linkedin: z.string().optional(),
  social_youtube: z.string().optional(),
  social_telegram_channel: z.string().optional(),
  social_kick: z.string().optional(),
  social_discord: z.string().optional(),
  social_pinterest: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function SiteOwnerProfileEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      contact_teams: profile.contact_teams || '',
      contact_telegram: profile.contact_telegram || '',
      contact_whatsapp: profile.contact_whatsapp || '',
      social_facebook: profile.social_facebook || '',
      social_twitter: profile.social_twitter || '',
      social_instagram: profile.social_instagram || '',
      social_linkedin: profile.social_linkedin || '',
      social_youtube: profile.social_youtube || '',
      social_telegram_channel: profile.social_telegram_channel || '',
      social_kick: profile.social_kick || '',
      social_discord: profile.social_discord || '',
      social_pinterest: profile.social_pinterest || '',
    } : undefined,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: 'Başarılı',
        description: 'Profil bilgileriniz güncellendi',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Profil güncellenirken bir hata oluştu',
        variant: 'destructive',
      });
      console.error('Profile update error:', error);
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync(data);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>İletişim Bilgileri</CardTitle>
          <CardDescription>
            İletişim kanallarınızı güncelleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact_teams">
              <Users className="inline-block w-4 h-4 mr-2" />
              Microsoft Teams
            </Label>
            <Input
              id="contact_teams"
              placeholder="Teams kullanıcı adı veya link"
              {...register('contact_teams')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_telegram">
              <MessageCircle className="inline-block w-4 h-4 mr-2" />
              Telegram
            </Label>
            <Input
              id="contact_telegram"
              placeholder="@kullaniciadi"
              {...register('contact_telegram')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_whatsapp">
              <Phone className="inline-block w-4 h-4 mr-2" />
              WhatsApp
            </Label>
            <Input
              id="contact_whatsapp"
              placeholder="+90 5XX XXX XX XX"
              {...register('contact_whatsapp')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sosyal Medya Hesapları</CardTitle>
          <CardDescription>
            Sosyal medya hesaplarınızı güncelleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="social_facebook">
              <Facebook className="inline-block w-4 h-4 mr-2" />
              Facebook
            </Label>
            <Input
              id="social_facebook"
              placeholder="https://facebook.com/kullaniciadi"
              {...register('social_facebook')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_twitter">
              <Twitter className="inline-block w-4 h-4 mr-2" />
              Twitter/X
            </Label>
            <Input
              id="social_twitter"
              placeholder="https://twitter.com/kullaniciadi"
              {...register('social_twitter')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_instagram">
              <Instagram className="inline-block w-4 h-4 mr-2" />
              Instagram
            </Label>
            <Input
              id="social_instagram"
              placeholder="https://instagram.com/kullaniciadi"
              {...register('social_instagram')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_linkedin">
              <Linkedin className="inline-block w-4 h-4 mr-2" />
              LinkedIn
            </Label>
            <Input
              id="social_linkedin"
              placeholder="https://linkedin.com/in/kullaniciadi"
              {...register('social_linkedin')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_youtube">
              <Youtube className="inline-block w-4 h-4 mr-2" />
              YouTube
            </Label>
            <Input
              id="social_youtube"
              placeholder="https://youtube.com/@kullaniciadi"
              {...register('social_youtube')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_telegram_channel">
              <Send className="inline-block w-4 h-4 mr-2" />
              Telegram Kanalı
            </Label>
            <Input
              id="social_telegram_channel"
              placeholder="https://t.me/kanaladı"
              {...register('social_telegram_channel')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_kick" className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-green-500" />
              Kick
            </Label>
            <Input
              id="social_kick"
              placeholder="https://kick.com/kullaniciadi"
              {...register('social_kick')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_discord" className="flex items-center gap-2">
              <SiDiscord className="w-4 h-4 text-[#5865F2]" />
              Discord
            </Label>
            <Input
              id="social_discord"
              placeholder="Discord sunucu davet linki"
              {...register('social_discord')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_pinterest" className="flex items-center gap-2">
              <SiPinterest className="w-4 h-4 text-[#E60023]" />
              Pinterest
            </Label>
            <Input
              id="social_pinterest"
              placeholder="https://pinterest.com/kullaniciadi"
              {...register('social_pinterest')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Değişiklikleri Kaydet
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
