import { useReducer, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Mail, Phone, Send, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { SiDiscord, SiPinterest, SiKick } from 'react-icons/si';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { siteBasicInfoSchema, type SiteBasicInfoFormData } from '@/lib/validation/siteInfoSchema';
import { FloatingActionBar } from './forms/FloatingActionBar';
import { FormFieldError } from './forms/FormFieldError';
import { FormLoadingState } from './forms/FormLoadingState';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { z } from 'zod';
import { SiteData } from '@/types/site';
import { 
  siteBasicInfoReducer, 
  createInitialState, 
  isStateDirty 
} from '@/reducers/siteBasicInfoReducer';

interface SiteBasicInfoEditorProps {
  siteId: string;
  siteData: SiteData;
}

export const SiteBasicInfoEditor = ({ siteId, siteData }: SiteBasicInfoEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Reducer-based state management
  const [state, dispatch] = useReducer(siteBasicInfoReducer, createInitialState());

  // Load initial data
  useEffect(() => {
    if (siteData) {
      const data = {
        bonus: siteData.bonus || '',
        features: siteData.features || [],
        email: siteData.email || '',
        whatsapp: siteData.whatsapp || '',
        telegram: siteData.telegram || '',
        twitter: siteData.twitter || '',
        instagram: siteData.instagram || '',
        facebook: siteData.facebook || '',
        youtube: siteData.youtube || '',
        linkedin: siteData.linkedin || '',
        telegram_channel: siteData.telegram_channel || '',
        kick: siteData.kick || '',
        discord: siteData.discord || '',
        pinterest: siteData.pinterest || ''
      };
      
      dispatch({
        type: 'SET_INITIAL_DATA',
        data,
        logoUrl: siteData.logo_url || ''
      });
    }
  }, [siteData]);

  // ✅ Real-time updates for basic info changes
  useEffect(() => {
    if (!siteId) return;

    const channel = supabase
      .channel('site-basic-info-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'betting_sites',
          filter: `id=eq.${siteId}`
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData) {
            const data = {
              bonus: newData.bonus || '',
              features: newData.features || [],
              email: newData.email || '',
              whatsapp: newData.whatsapp || '',
              telegram: newData.telegram || '',
              twitter: newData.twitter || '',
              instagram: newData.instagram || '',
              facebook: newData.facebook || '',
              youtube: newData.youtube || '',
              linkedin: newData.linkedin || '',
              telegram_channel: newData.telegram_channel || '',
              kick: newData.kick || '',
              discord: newData.discord || '',
              pinterest: newData.pinterest || ''
            };
            
            dispatch({
              type: 'SET_INITIAL_DATA',
              data,
              logoUrl: newData.logo_url || ''
            });
            
            toast({
              title: "Bilgiler Güncellendi",
              description: "Site bilgileri real-time olarak güncellendi.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [siteId, toast]);

  // Check if form is dirty
  const isDirty = useMemo(() => isStateDirty(state), [state]);

  // Unsaved changes warning
  useUnsavedChanges({
    isDirty,
    message: 'Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinizden emin misiniz?'
  });

  // Validate form
  const validateForm = useCallback((): boolean => {
    try {
      const formData: SiteBasicInfoFormData = {
        bonus: state.bonus,
        features: state.features,
        email: state.email,
        whatsapp: state.whatsapp,
        telegram: state.telegram,
        twitter: state.twitter,
        instagram: state.instagram,
        facebook: state.facebook,
        youtube: state.youtube
      };

      siteBasicInfoSchema.parse(formData);
      dispatch({ type: 'SET_ERRORS', errors: {} });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path.join('.')] = err.message;
          }
        });
        dispatch({ type: 'SET_ERRORS', errors: newErrors });
      }
      return false;
    }
  }, [state.bonus, state.features, state.email, state.whatsapp, state.telegram, state.twitter, state.instagram, state.facebook, state.youtube, state.linkedin, state.telegram_channel, state.kick, state.discord, state.pinterest]);

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${siteId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-logos')
        .getPublicUrl(filePath);

      return publicUrl;
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Validate first
      if (!validateForm()) {
        throw new Error('Form validation failed');
      }

      let logoUrl = state.logoPreview;

      // Upload new logo if selected
      if (state.logoFile) {
        logoUrl = await uploadLogoMutation.mutateAsync(state.logoFile);
      }

      // Update betting_sites table
      const { error: siteError } = await supabase
        .from('betting_sites')
        .update({
          bonus: state.bonus,
          features: state.features,
          logo_url: logoUrl,
          linkedin: state.linkedin || null,
          telegram_channel: state.telegram_channel || null,
          kick: state.kick || null,
          discord: state.discord || null,
          pinterest: state.pinterest || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', siteId);

      if (siteError) throw siteError;

      // Update betting_sites_social table (upsert)
      const { error: socialError } = await supabase
        .from('betting_sites_social')
        .upsert({
          site_id: siteId,
          email: state.email,
          whatsapp: state.whatsapp,
          telegram: state.telegram,
          twitter: state.twitter,
          instagram: state.instagram,
          facebook: state.facebook,
          youtube: state.youtube,
        }, {
          onConflict: 'site_id'
        });

      if (socialError) throw socialError;

      return { logoUrl };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-site-full'] });
      
      // Update state after successful save
      dispatch({
        type: 'UPDATE_AFTER_SAVE',
        data: {
          bonus: state.bonus,
          features: state.features,
          email: state.email,
          whatsapp: state.whatsapp,
          telegram: state.telegram,
          twitter: state.twitter,
          instagram: state.instagram,
          facebook: state.facebook,
          youtube: state.youtube,
          linkedin: state.linkedin,
          telegram_channel: state.telegram_channel,
          kick: state.kick,
          discord: state.discord,
          pinterest: state.pinterest
        },
        logoUrl: data.logoUrl
      });
      
      dispatch({ type: 'SET_LAST_SAVED', date: new Date() });
      
      toast({
        title: 'Başarılı',
        description: 'Site bilgileri kaydedildi',
      });
    },
    onError: (error: any) => {
      if (error.message === 'Form validation failed') {
        toast({
          title: 'Doğrulama Hatası',
          description: 'Lütfen formdaki hataları düzeltin',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Hata',
          description: error.message || 'Bilgiler kaydedilemedi',
          variant: 'destructive',
        });
      }
    },
  });

  const handleSave = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);

  const handleCancel = useCallback(() => {
    dispatch({ type: 'RESET_TO_INITIAL' });
  }, []);

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Hata',
          description: 'Logo boyutu en fazla 5MB olabilir',
          variant: 'destructive',
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Hata',
          description: 'Sadece resim dosyaları yüklenebilir',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch({
          type: 'SET_LOGO',
          file,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const addFeature = useCallback(() => {
    const trimmed = state.newFeature.trim();
    if (trimmed && !state.features.includes(trimmed)) {
      if (state.features.length >= 20) {
        toast({
          title: 'Limit',
          description: 'En fazla 20 özellik ekleyebilirsiniz',
          variant: 'destructive',
        });
        return;
      }
      dispatch({ type: 'ADD_FEATURE', feature: trimmed });
    }
  }, [state.newFeature, state.features, toast]);

  const removeFeature = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FEATURE', index });
  }, []);

  if (!siteData) {
    return <FormLoadingState title="Site Bilgileri" fieldCount={8} />;
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Site Bilgileri</h2>
        <p className="text-muted-foreground">
          Sitenizin temel bilgilerini ve sosyal medya hesaplarını düzenleyin
        </p>
      </div>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Site Logosu</CardTitle>
          <CardDescription>Site logonuzu yükleyin (max 5MB, PNG, JPG, SVG)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            {state.logoPreview && (
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-lg border-2 border-border bg-muted flex items-center justify-center p-3 shadow-sm">
                  <img
                    src={state.logoPreview}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                {state.logoFile && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2">
                    Yeni
                  </Badge>
                )}
              </div>
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="max-w-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Önerilen boyut: 200x200px veya daha büyük (şeffaf arka plan önerilir)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
          <CardDescription>Sitenizin bonus ve özelliklerini düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bonus">Hoş Geldin Bonusu</Label>
            <Input
              id="bonus"
              value={state.bonus}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'bonus', value: e.target.value })}
              placeholder="Örn: %100 Hoş Geldin Bonusu + 100 Free Spin"
              maxLength={500}
            />
            <FormFieldError error={state.errors.bonus} />
            <p className="text-xs text-muted-foreground">
              Kullanıcıları cezbedecek şekilde bonus bilgisini yazın
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Özellikler</Label>
            <div className="flex gap-2">
              <Input
                id="features"
                value={state.newFeature}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'newFeature', value: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Yeni özellik ekle..."
                maxLength={100}
              />
              <Button type="button" onClick={addFeature} size="sm">
                Ekle
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {state.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="gap-1 pr-1">
                  {feature}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <FormFieldError error={state.errors.features} />
            <p className="text-xs text-muted-foreground">
              {state.features.length}/20 özellik
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>İletişim & Sosyal Medya</CardTitle>
          <CardDescription>Sosyal medya hesaplarınızı ekleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={state.email}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
                  placeholder="info@site.com"
                  className="pl-10"
                  maxLength={255}
                />
              </div>
              <FormFieldError error={state.errors.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  value={state.whatsapp}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'whatsapp', value: e.target.value })}
                  placeholder="+90 555 123 4567"
                  className="pl-10"
                  maxLength={50}
                />
              </div>
              <FormFieldError error={state.errors.whatsapp} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <div className="relative">
                <Send className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telegram"
                  value={state.telegram}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'telegram', value: e.target.value })}
                  placeholder="https://t.me/username"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.telegram} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twitter"
                  value={state.twitter}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'twitter', value: e.target.value })}
                  placeholder="https://twitter.com/username"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.twitter} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="instagram"
                  value={state.instagram}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'instagram', value: e.target.value })}
                  placeholder="https://instagram.com/username"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.instagram} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="facebook"
                  value={state.facebook}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'facebook', value: e.target.value })}
                  placeholder="https://facebook.com/page"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.facebook} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="youtube"
                  value={state.youtube}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'youtube', value: e.target.value })}
                  placeholder="https://youtube.com/@channel"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.youtube} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedin"
                  value={state.linkedin}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'linkedin', value: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.linkedin} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram_channel">Telegram Kanalı</Label>
              <div className="relative">
                <Send className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telegram_channel"
                  value={state.telegram_channel}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'telegram_channel', value: e.target.value })}
                  placeholder="https://t.me/channel"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.telegram_channel} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kick">Kick</Label>
              <div className="relative">
                <SiKick className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="kick"
                  value={state.kick}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'kick', value: e.target.value })}
                  placeholder="https://kick.com/channel"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.kick} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discord">Discord</Label>
              <div className="relative">
                <SiDiscord className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="discord"
                  value={state.discord}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'discord', value: e.target.value })}
                  placeholder="Discord sunucu davet linki"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.discord} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pinterest">Pinterest</Label>
              <div className="relative">
                <SiPinterest className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pinterest"
                  value={state.pinterest}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'pinterest', value: e.target.value })}
                  placeholder="https://pinterest.com/..."
                  className="pl-10"
                />
              </div>
              <FormFieldError error={state.errors.pinterest} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Bar */}
      <FloatingActionBar
        isDirty={isDirty}
        isLoading={saveMutation.isPending}
        lastSaved={state.lastSaved}
        onSave={handleSave}
        onCancel={handleCancel}
        variant="fixed"
      />
    </div>
  );
};
