import { UseFormReturn } from 'react-hook-form';
import { SiteFormData, validateLogoFile } from '@/schemas/siteValidation';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormFieldWrapper } from '@/components/forms/FormFieldWrapper';
import { Button } from '@/components/ui/button';
import { X, Upload, FolderTree } from 'lucide-react';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/queries/useCategoryQueries';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { memo } from 'react';

interface SiteFormStepBasicProps {
  form: UseFormReturn<SiteFormData>;
  logoFile: File | null;
  logoPreview: string | null;
  onLogoFileChange: (file: File | null, preview?: string) => void;
  onLogoPreviewChange: (preview: string | null) => void;
}

const SiteFormStepBasicComponent = (props: SiteFormStepBasicProps) => {
  const {
    form,
    logoFile,
    logoPreview,
    onLogoFileChange,
    onLogoPreviewChange,
  } = props;
  const { data: categories } = useCategories({ isActive: true });
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('🔍 SiteFormStepBasic - handleLogoChange:', { 
      file: file?.name,
      type: file?.type 
    });
    
    if (file) {
      const validationError = validateLogoFile(file);
      if (validationError) {
        toast.error(validationError);
        e.target.value = '';
        console.error('❌ Validation failed:', validationError);
        return;
      }
      
      console.log('📖 Reading file...');
      // Önce dosyayı oku ve preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        console.log('✅ FileReader completed:', {
          previewLength: preview?.length,
          previewStart: preview?.substring(0, 50)
        });
        onLogoFileChange(file, preview);
        onLogoPreviewChange(preview);
      };
      reader.onerror = (err) => {
        console.error('❌ FileReader error:', err);
      };
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
              <div className="space-y-1">
                <Input placeholder="%100 Hoşgeldin Bonusu" maxLength={50} {...field} />
                <p className="text-xs text-muted-foreground text-right">
                  {field.value?.length || 0}/50 karakter
                </p>
              </div>
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

      {/* Categories Selection */}
      <FormField
        control={form.control}
        name="category_ids"
        render={({ field }) => (
          <FormFieldWrapper 
            label="Kategoriler"
            helpText="Bu sitenin hangi kategorilerde görüneceğini seçin"
          >
            <div className="border rounded-md p-4">
              {categories && categories.length > 0 ? (
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={field.value?.includes(category.id)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            const newValue = checked
                              ? [...currentValue, category.id]
                              : currentValue.filter((id) => id !== category.id);
                            field.onChange(newValue);
                          }}
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <FolderTree className="h-4 w-4" style={{ color: category.color || '#3b82f6' }} />
                          <span>{category.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground">Henüz kategori eklenmemiş</p>
              )}
            </div>
          </FormFieldWrapper>
        )}
      />

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
                  className="h-20 w-auto rounded-lg border bg-muted p-2"
                  onLoad={() => {
                    console.log('✅ SiteFormStepBasic - Logo preview loaded successfully');
                  }}
                  onError={(e) => {
                    console.error('❌ SiteFormStepBasic - Logo preview failed:', {
                      src: logoPreview?.substring(0, 100),
                      error: e
                    });
                  }}
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
};

export const SiteFormStepBasic = memo(SiteFormStepBasicComponent);
