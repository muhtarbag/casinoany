import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteFormSchema, SiteFormData } from '@/schemas/siteValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, X } from 'lucide-react';
import { AdminLogoInput } from '@/pages/AdminLogoInput';

interface SiteManagementFormProps {
  editingId: string | null;
  initialData?: SiteFormData;
  logoPreview: string | null;
  onLogoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearLogo: () => void;
  onSubmit: (data: SiteFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function SiteManagementForm({
  editingId,
  initialData,
  logoPreview,
  onLogoFileChange,
  onClearLogo,
  onSubmit,
  onCancel,
  isLoading
}: SiteManagementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: initialData || {
      name: '',
      slug: '',
      rating: 0,
      bonus: '',
      features: '',
      affiliate_link: '',
      email: '',
      whatsapp: '',
      telegram: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      affiliate_contract_date: '',
      affiliate_contract_terms: '',
      affiliate_has_monthly_payment: false,
      affiliate_monthly_payment: undefined,
      affiliate_panel_url: '',
      affiliate_panel_username: '',
      affiliate_panel_password: '',
      affiliate_notes: '',
      affiliate_commission_percentage: undefined
    }
  });

  const nameValue = watch('name');

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('slug', slug);
  };

  const handleFormSubmit = (data: SiteFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{editingId ? 'Site Düzenle' : 'Yeni Site Ekle'}</span>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Site Adı *</Label>
              <Input
                id="name"
                {...register('name')}
                onChange={(e) => {
                  register('name').onChange(e);
                  handleNameChange(e);
                }}
                placeholder="Örn: Fanatik Bet"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="otomatik-olusturulur"
                className={errors.slug ? 'border-destructive' : ''}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-10) *</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                {...register('rating', { valueAsNumber: true })}
                placeholder="9.5"
                className={errors.rating ? 'border-destructive' : ''}
              />
              {errors.rating && (
                <p className="text-sm text-destructive">{errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus</Label>
              <Input
                id="bonus"
                {...register('bonus')}
                placeholder="3000 TL + 200 Free Spin"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="features">Özellikler (virgülle ayır)</Label>
              <Input
                id="features"
                {...register('features')}
                placeholder="Canlı Casino, Spor Bahisleri, Canlı Destek"
              />
            </div>
          </div>

          {/* Affiliate Management Section - MOVED HERE TO BE MORE VISIBLE */}
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
            <Accordion type="single" collapsible className="w-full" defaultValue="affiliate">
              <AccordionItem value="affiliate" className="border-none">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  🤝 Affiliate Anlaşma Bilgileri (Opsiyonel)
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-900 dark:text-yellow-200">
                      💡 <strong>ÖNEMLİ:</strong> Anlaşma tarihi doldurduğunuz siteler <strong>"Affiliate Yönetimi"</strong> sekmesinde otomatik görünür. 
                      Buraya komisyon oranı, panel bilgileri ve ödeme detaylarını girebilirsiniz.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="affiliate_contract_date">Anlaşma Tarihi</Label>
                      <Input
                        id="affiliate_contract_date"
                        type="date"
                        {...register('affiliate_contract_date')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliate_commission_percentage">Komisyon Yüzdesi (%)</Label>
                      <Input
                        id="affiliate_commission_percentage"
                        type="number"
                        step="0.01"
                        {...register('affiliate_commission_percentage', { valueAsNumber: true })}
                        placeholder="Örn: 25.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliate_monthly_payment">Aylık Ödeme Tutarı (TL)</Label>
                      <Input
                        id="affiliate_monthly_payment"
                        type="number"
                        step="0.01"
                        {...register('affiliate_monthly_payment', { valueAsNumber: true })}
                        placeholder="Örn: 5000"
                        disabled={!watch('affiliate_has_monthly_payment')}
                      />
                    </div>

                    <div className="space-y-2 flex items-center gap-2 md:col-span-2">
                      <Switch
                        id="affiliate_has_monthly_payment"
                        checked={watch('affiliate_has_monthly_payment')}
                        onCheckedChange={(checked) => setValue('affiliate_has_monthly_payment', checked)}
                      />
                      <Label htmlFor="affiliate_has_monthly_payment" className="cursor-pointer">
                        Aylık sabit ödeme alınıyor
                      </Label>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="affiliate_panel_url">Affiliate Panel URL</Label>
                      <Input
                        id="affiliate_panel_url"
                        {...register('affiliate_panel_url')}
                        placeholder="https://panel.example.com"
                        className={errors.affiliate_panel_url ? 'border-destructive' : ''}
                      />
                      {errors.affiliate_panel_url && (
                        <p className="text-sm text-destructive">{errors.affiliate_panel_url.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliate_panel_username">Panel Kullanıcı Adı</Label>
                      <Input
                        id="affiliate_panel_username"
                        {...register('affiliate_panel_username')}
                        placeholder="kullanici_adi"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliate_panel_password">Panel Şifresi</Label>
                      <Input
                        id="affiliate_panel_password"
                        type="password"
                        {...register('affiliate_panel_password')}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="affiliate_contract_terms">Anlaşma Şartları</Label>
                      <Textarea
                        id="affiliate_contract_terms"
                        {...register('affiliate_contract_terms')}
                        placeholder="Anlaşma detayları, komisyon oranları, özel şartlar vb..."
                        rows={4}
                        className={errors.affiliate_contract_terms ? 'border-destructive' : ''}
                      />
                      {errors.affiliate_contract_terms && (
                        <p className="text-sm text-destructive">{errors.affiliate_contract_terms.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="affiliate_notes">Ek Notlar</Label>
                      <Textarea
                        id="affiliate_notes"
                        {...register('affiliate_notes')}
                        placeholder="Önemli notlar, hatırlatmalar, iletişim bilgileri vb..."
                        rows={3}
                        className={errors.affiliate_notes ? 'border-destructive' : ''}
                      />
                      {errors.affiliate_notes && (
                        <p className="text-sm text-destructive">{errors.affiliate_notes.message}</p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="affiliate_link">Affiliate Link *</Label>
              <Input
                id="affiliate_link"
                type="url"
                {...register('affiliate_link')}
                placeholder="https://..."
                className={errors.affiliate_link ? 'border-destructive' : ''}
              />
              {errors.affiliate_link && (
                <p className="text-sm text-destructive">{errors.affiliate_link.message}</p>
              )}
            </div>

            {/* Social Media Links */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="info@site.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                {...register('whatsapp')}
                placeholder="+90 555 123 45 67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                {...register('telegram')}
                placeholder="@siteadmin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                {...register('twitter')}
                placeholder="@sitename"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                {...register('instagram')}
                placeholder="@sitename"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                {...register('facebook')}
                placeholder="sitename"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                {...register('youtube')}
                placeholder="@sitename"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <AdminLogoInput
              logoPreview={logoPreview}
              onLogoChange={onLogoFileChange}
              onClearLogo={onClearLogo}
            />
          </div>

          <div className="flex gap-2 justify-end">
            {editingId && (
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                editingId ? 'Güncelle' : 'Ekle'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
