import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateCategory,
  useUpdateCategory,
  type Category,
} from '@/hooks/queries/useCategoryQueries';
import { Loader2 } from 'lucide-react';

// Lucide icon seçenekleri
const iconOptions = [
  { value: 'gift', label: '🎁 Gift' },
  { value: 'zap', label: '⚡ Zap' },
  { value: 'trophy', label: '🏆 Trophy' },
  { value: 'bitcoin', label: '₿ Bitcoin' },
  { value: 'sparkles', label: '✨ Sparkles' },
  { value: 'flame', label: '🔥 Flame' },
  { value: 'star', label: '⭐ Star' },
  { value: 'crown', label: '👑 Crown' },
  { value: 'target', label: '🎯 Target' },
  { value: 'rocket', label: '🚀 Rocket' },
  { value: 'folder', label: '📁 Folder' },
];

const colorOptions = [
  { value: '#10b981', label: 'Yeşil' },
  { value: '#8b5cf6', label: 'Mor' },
  { value: '#f59e0b', label: 'Turuncu' },
  { value: '#06b6d4', label: 'Mavi' },
  { value: '#ec4899', label: 'Pembe' },
  { value: '#ef4444', label: 'Kırmızı' },
  { value: '#3b82f6', label: 'Lacivert' },
  { value: '#14b8a6', label: 'Turkuaz' },
];

const formSchema = z.object({
  name: z.string().min(3, 'En az 3 karakter olmalı'),
  slug: z.string().min(3, 'En az 3 karakter olmalı'),
  description: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  icon: z.string().default('folder'),
  color: z.string().default('#3b82f6'),
  display_order: z.number().default(0),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          meta_title: category.meta_title || '',
          meta_description: category.meta_description || '',
          icon: category.icon || 'folder',
          color: category.color || '#3b82f6',
          display_order: category.display_order || 0,
          is_active: category.is_active,
        }
      : {
          name: '',
          slug: '',
          description: '',
          meta_title: '',
          meta_description: '',
          icon: 'folder',
          color: '#3b82f6',
          display_order: 0,
          is_active: true,
        },
  });

  const nameValue = watch('name');
  const iconValue = watch('icon');
  const colorValue = watch('color');
  const isActiveValue = watch('is_active');

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!category) {
      const slug = name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          slug: data.slug,
          description: data.description,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          icon: data.icon,
          color: data.color,
          display_order: data.display_order,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sol Kolon */}
        <div className="space-y-4">
          {/* Kategori Adı */}
          <div className="space-y-2">
            <Label htmlFor="name">Kategori Adı *</Label>
            <Input
              id="name"
              {...register('name')}
              onChange={(e) => {
                register('name').onChange(e);
                handleNameChange(e);
              }}
              placeholder="Örn: Deneme Bonusu Veren Siteler"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="deneme-bonusu"
              disabled={!!category}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              URL'de görünecek. Otomatik oluşturulur.
            </p>
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Kategori hakkında kısa açıklama"
              rows={3}
            />
          </div>

          {/* Meta Title */}
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title (SEO)</Label>
            <Input
              id="meta_title"
              {...register('meta_title')}
              placeholder="SEO için başlık"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description (SEO)</Label>
            <Textarea
              id="meta_description"
              {...register('meta_description')}
              placeholder="SEO için açıklama"
              rows={2}
            />
          </div>
        </div>

        {/* Sağ Kolon */}
        <div className="space-y-4">
          {/* İkon */}
          <div className="space-y-2">
            <Label htmlFor="icon">İkon</Label>
            <Select
              value={iconValue}
              onValueChange={(value) => setValue('icon', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Renk */}
          <div className="space-y-2">
            <Label htmlFor="color">Renk</Label>
            <Select
              value={colorValue}
              onValueChange={(value) => setValue('color', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: option.value }}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sıralama */}
          <div className="space-y-2">
            <Label htmlFor="display_order">Sıralama</Label>
            <Input
              id="display_order"
              type="number"
              {...register('display_order', { valueAsNumber: true })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Küçük sayı önce görünür
            </p>
          </div>

          {/* Aktif/Pasif */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Kategori Durumu</Label>
              <p className="text-sm text-muted-foreground">
                {isActiveValue ? 'Aktif' : 'Pasif'}
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActiveValue}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          {/* Önizleme */}
          <div className="rounded-lg border p-4 space-y-2">
            <Label>Önizleme</Label>
            <div
              className="flex items-center gap-3 p-4 rounded-lg"
              style={{ backgroundColor: `${colorValue}20` }}
            >
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colorValue }}
              >
                <span className="text-white text-xl">
                  {iconOptions.find((i) => i.value === iconValue)?.label.split(' ')[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold">{nameValue || 'Kategori Adı'}</p>
                <p className="text-sm text-muted-foreground">
                  /kategori/{watch('slug') || 'slug'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {category ? 'Güncelle' : 'Oluştur'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
      </div>
    </form>
  );
}
