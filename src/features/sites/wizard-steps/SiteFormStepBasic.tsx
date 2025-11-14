import { UseFormReturn } from 'react-hook-form';
import { SiteFormData, validateLogoFile } from '@/schemas/siteValidation';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormFieldWrapper } from '@/components/forms/FormFieldWrapper';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface SiteFormStepBasicProps {
  form: UseFormReturn<SiteFormData>;
  logoFile: File | null;
  logoPreview: string | null;
  onLogoFileChange: (file: File | null) => void;
  onLogoPreviewChange: (preview: string | null) => void;
}

export function SiteFormStepBasic({
  form,
  logoFile,
  logoPreview,
  onLogoFileChange,
  onLogoPreviewChange,
}: SiteFormStepBasicProps) {
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateLogoFile(file);
      if (validationError) {
        toast.error(validationError);
        e.target.value = '';
        return;
      }
      onLogoFileChange(file);
      const reader = new FileReader();
      reader.onloadend = () => onLogoPreviewChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClearLogo = () => {
    onLogoFileChange(null);
    onLogoPreviewChange(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormFieldWrapper
              label="Site Adı"
              required
              helpText="Bahis sitesinin tam adı"
            >
              <Input placeholder="Örn: Betist" {...field} />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormFieldWrapper
              label="Slug"
              required
              helpText="URL'de kullanılacak benzersiz tanımlayıcı"
              description="Otomatik oluşturulur, gerekirse düzenleyebilirsiniz"
            >
              <Input placeholder="betist" {...field} />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormFieldWrapper
              label="Değerlendirme"
              required
              helpText="1 ile 5 arasında bir puan verin"
            >
              <Input
                type="number"
                step="0.1"
                min="1"
                max="5"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="affiliate_link"
          render={({ field }) => (
            <FormFieldWrapper
              label="Affiliate Link"
              required
              helpText="Site için özel affiliate bağlantınız"
            >
              <Input type="url" placeholder="https://example.com" {...field} />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="bonus"
          render={({ field }) => (
            <FormFieldWrapper
              label="Bonus"
              helpText="Sitenin sunduğu hoşgeldin bonusu"
            >
              <Input placeholder="%100 Hoşgeldin Bonusu" {...field} />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormFieldWrapper
              label="Özellikler"
              helpText="Virgülle ayırarak ekleyin"
              description="Örn: Canlı bahis, Casino, Slots"
            >
              <Input placeholder="Canlı bahis, Casino" {...field} />
            </FormFieldWrapper>
          )}
        />
      </div>

      {/* Logo Upload */}
      <div className="border-t pt-6">
        <FormFieldWrapper
          label="Site Logosu"
          helpText="JPG, PNG, SVG veya WebP formatında, maksimum 5MB"
        >
          <div className="space-y-4">
            {logoPreview && (
              <div className="relative inline-block">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-20 w-auto rounded-lg border bg-muted"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={handleClearLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/svg+xml,image/webp"
                onChange={handleLogoChange}
                className="cursor-pointer"
              />
            </div>
          </div>
        </FormFieldWrapper>
      </div>
    </div>
  );
}
