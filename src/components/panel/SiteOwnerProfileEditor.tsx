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
import { Loader2, Save, MessageCircle, Users } from 'lucide-react';

const profileSchema = z.object({
  contact_teams: z.string().optional(),
  contact_telegram: z.string().optional(),
  contact_whatsapp: z.string().optional(),
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
          <CardTitle>Yetkili Kişi İletişim Bilgileri</CardTitle>
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
              <MessageCircle className="inline-block w-4 h-4 mr-2" />
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
              Kaydet
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
