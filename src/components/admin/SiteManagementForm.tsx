import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteFormSchema, SiteFormData } from '@/schemas/siteValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      youtube: ''
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
