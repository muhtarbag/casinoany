import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Mail, MessageCircle, Send, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { siteBasicInfoSchema, type SiteBasicInfoFormData } from '@/lib/validation/siteInfoSchema';
import { FloatingActionBar } from './forms/FloatingActionBar';
import { FormFieldError } from './forms/FormFieldError';
import { FormLoadingState } from './forms/FormLoadingState';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { z } from 'zod';

interface SiteBasicInfoEditorProps {
  siteId: string;
  siteData: any;
}

export const SiteBasicInfoEditor = ({ siteId, siteData }: SiteBasicInfoEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [bonus, setBonus] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Dirty tracking
  const [initialData, setInitialData] = useState<any>(null);
  const [lastSaved, setLastSaved] = useState<Date>();

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
        youtube: siteData.youtube || ''
      };
      
      setBonus(data.bonus);
      setFeatures(data.features);
      setEmail(data.email);
      setWhatsapp(data.whatsapp);
      setTelegram(data.telegram);
      setTwitter(data.twitter);
      setInstagram(data.instagram);
      setFacebook(data.facebook);
      setYoutube(data.youtube);
      setLogoPreview(siteData.logo_url || '');
      setInitialData(data);
    }
  }, [siteData]);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    
    return (
      bonus !== initialData.bonus ||
      JSON.stringify(features) !== JSON.stringify(initialData.features) ||
      email !== initialData.email ||
      whatsapp !== initialData.whatsapp ||
      telegram !== initialData.telegram ||
      twitter !== initialData.twitter ||
      instagram !== initialData.instagram ||
      facebook !== initialData.facebook ||
      youtube !== initialData.youtube ||
      logoFile !== null
    );
  }, [bonus, features, email, whatsapp, telegram, twitter, instagram, facebook, youtube, logoFile, initialData]);

  // Unsaved changes warning
  useUnsavedChanges({
    isDirty,
    message: 'Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinizden emin misiniz?'
  });

  // Validate form
  const validateForm = (): boolean => {
    try {
      const formData: SiteBasicInfoFormData = {
        bonus,
        features,
        email,
        whatsapp,
        telegram,
        twitter,
        instagram,
        facebook,
        youtube
      };

      siteBasicInfoSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

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

      let logoUrl = logoPreview;

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadLogoMutation.mutateAsync(logoFile);
      }

      // Update betting_sites table
      const { error: siteError } = await supabase
        .from('betting_sites')
        .update({
          bonus,
          features,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', siteId);

      if (siteError) throw siteError;

      // Update betting_sites_social table (upsert)
      const { error: socialError } = await supabase
        .from('betting_sites_social')
        .upsert({
          site_id: siteId,
          email,
          whatsapp,
          telegram,
          twitter,
          instagram,
          facebook,
          youtube,
        }, {
          onConflict: 'site_id'
        });

      if (socialError) throw socialError;

      return { logoUrl };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-site-full'] });
      setLogoFile(null);
      if (data.logoUrl) {
        setLogoPreview(data.logoUrl);
      }
      
      // Update initial data to match saved state
      setInitialData({
        bonus,
        features,
        email,
        whatsapp,
        telegram,
        twitter,
        instagram,
        facebook,
        youtube
      });
      
      setLastSaved(new Date());
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

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleCancel = () => {
    if (initialData) {
      setBonus(initialData.bonus);
      setFeatures(initialData.features);
      setEmail(initialData.email);
      setWhatsapp(initialData.whatsapp);
      setTelegram(initialData.telegram);
      setTwitter(initialData.twitter);
      setInstagram(initialData.instagram);
      setFacebook(initialData.facebook);
      setYoutube(initialData.youtube);
      setLogoFile(null);
      setErrors({});
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (trimmed && !features.includes(trimmed)) {
      if (features.length >= 20) {
        toast({
          title: 'Limit',
          description: 'En fazla 20 özellik ekleyebilirsiniz',
          variant: 'destructive',
        });
        return;
      }
      setFeatures([...features, trimmed]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

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
            {logoPreview && (
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-lg border-2 border-border bg-muted flex items-center justify-center p-3 shadow-sm">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                {logoFile && (
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
          <CardDescription>Bonus ve özellikler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bonus">Bonus Bilgisi *</Label>
            <Input
              id="bonus"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              placeholder="Örn: %100 İlk Yatırım Bonusu 1000 TL'ye Kadar"
              maxLength={500}
            />
            <FormFieldError error={errors.bonus} />
          </div>

          <div className="space-y-2">
            <Label>Özellikler</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
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
              {features.map((feature, index) => (
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
            <FormFieldError error={errors.features} />
            <p className="text-xs text-muted-foreground">
              {features.length}/20 özellik
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@site.com"
                  className="pl-10"
                  maxLength={255}
                />
              </div>
              <FormFieldError error={errors.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+90 555 123 4567"
                  className="pl-10"
                  maxLength={50}
                />
              </div>
              <FormFieldError error={errors.whatsapp} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <div className="relative">
                <Send className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="https://t.me/username"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={errors.telegram} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/username"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={errors.twitter} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={errors.instagram} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/page"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={errors.facebook} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="youtube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@channel"
                  className="pl-10"
                />
              </div>
              <FormFieldError error={errors.youtube} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Bar */}
      <FloatingActionBar
        isDirty={isDirty}
        isLoading={saveMutation.isPending}
        lastSaved={lastSaved}
        onSave={handleSave}
        onCancel={handleCancel}
        variant="fixed"
      />
    </div>
  );
};
