import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, Link as LinkIcon, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface SiteBasicInfoEditorProps {
  siteId: string;
  siteData: any;
}

export const SiteBasicInfoEditor = ({ siteId, siteData }: SiteBasicInfoEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Basic info state
  const [bonus, setBonus] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // Social media state
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');

  // Load initial data
  useEffect(() => {
    if (siteData) {
      setBonus(siteData.bonus || '');
      setFeatures(siteData.features || []);
      setLogoPreview(siteData.logo_url || '');
      setEmail(siteData.email || '');
      setWhatsapp(siteData.whatsapp || '');
      setTelegram(siteData.telegram || '');
      setTwitter(siteData.twitter || '');
      setInstagram(siteData.instagram || '');
      setFacebook(siteData.facebook || '');
      setYoutube(siteData.youtube || '');
    }
  }, [siteData]);

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owned-site-full'] });
      setLogoFile(null);
      toast({
        title: 'Başarılı',
        description: 'Site bilgileri güncellendi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Bilgiler güncellenemedi',
        variant: 'destructive',
      });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Bilgilerini Düzenle</h2>
          <p className="text-muted-foreground">
            Logo, bonus bilgileri, özellikler ve sosyal medya hesaplarınızı yönetin
          </p>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Değişiklikleri Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>
            Sitenizin logosunu yükleyin veya değiştirin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {logoPreview && (
              <div className="relative">
                <img 
                  src={logoPreview} 
                  alt="Site Logo" 
                  className="w-32 h-32 object-contain rounded-lg border"
                />
              </div>
            )}
            <div className="flex-1">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors w-fit">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {logoPreview ? 'Logoyu Değiştir' : 'Logo Yükle'}
                  </span>
                </div>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG veya SVG formatında, maksimum 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
          <CardDescription>
            Site adı ve affiliate link değiştirilemez (admin yetkisi gerekir)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site-name">Site Adı</Label>
            <Input
              id="site-name"
              value={siteData.name}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="affiliate-link">Affiliate Link</Label>
            <Input
              id="affiliate-link"
              value={siteData.affiliate_link}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="bonus">Bonus Bilgisi</Label>
            <Textarea
              id="bonus"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              placeholder="Örn: %100 Hoşgeldin Bonusu + 200 Freespin"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Site Özellikleri</CardTitle>
          <CardDescription>
            Sitenizin sunduğu oyunlar ve özellikler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Yeni özellik ekle (örn: Canlı Casino)"
              onKeyPress={(e) => e.key === 'Enter' && addFeature()}
            />
            <Button onClick={addFeature} type="button">
              Ekle
            </Button>
          </div>
          
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {feature}
                  <button
                    onClick={() => removeFeature(feature)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Sosyal Medya Hesapları</CardTitle>
          <CardDescription>
            Sosyal medya hesaplarınızın linklerini ekleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <LinkIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@site.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="flex gap-2">
                <LinkIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="https://wa.me/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="telegram">Telegram</Label>
              <div className="flex gap-2">
                <LinkIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="https://t.me/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="twitter">Twitter (X)</Label>
              <div className="flex gap-2">
                <LinkIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <div className="flex gap-2">
                <LinkIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <div className="flex gap-2">
                <LinkIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="youtube">YouTube</Label>
              <div className="flex gap-2">
                <LinkIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="youtube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Info (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Bilgileri</CardTitle>
          <CardDescription>
            Bu bilgiler sadece görüntüleme amaçlıdır. Değişiklik için admin ile iletişime geçin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Komisyon Oranı</Label>
              <Input
                value={siteData.affiliate_commission_percentage ? `%${siteData.affiliate_commission_percentage}` : 'Belirlenmemiş'}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Aylık Sabit Ödeme</Label>
              <Input
                value={siteData.affiliate_has_monthly_payment 
                  ? `${siteData.affiliate_monthly_payment || 0} ₺`
                  : 'Yok'}
                disabled
                className="bg-muted"
              />
            </div>
            {siteData.affiliate_contract_date && (
              <div>
                <Label>Sözleşme Tarihi</Label>
                <Input
                  value={new Date(siteData.affiliate_contract_date).toLocaleDateString('tr-TR')}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
