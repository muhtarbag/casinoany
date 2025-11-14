import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteFormSchema, SiteFormData, generateSlug } from '@/schemas/siteValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';

interface SiteFormWrapperProps {
  editingId: string | null;
  onEditingIdChange: (id: string | null) => void;
  sites: any[];
  logoFile: File | null;
  logoPreview: string | null;
  onLogoFileChange: (file: File | null) => void;
  onLogoPreviewChange: (preview: string | null) => void;
  createSiteMutation: UseMutationResult<void, Error, { formData: SiteFormData; logoFile: File | null }>;
  updateSiteMutation: UseMutationResult<void, Error, { id: string; formData: SiteFormData; logoFile: File | null }>;
}

export function SiteFormWrapper({
  editingId,
  onEditingIdChange,
  sites,
  logoFile,
  logoPreview,
  onLogoFileChange,
  onLogoPreviewChange,
  createSiteMutation,
  updateSiteMutation,
}: SiteFormWrapperProps) {
  const editingSite = sites.find((s) => s.id === editingId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: editingSite
      ? {
          name: editingSite.name,
          slug: editingSite.slug,
          rating: editingSite.rating,
          bonus: editingSite.bonus || '',
          features: Array.isArray(editingSite.features)
            ? editingSite.features.join(', ')
            : '',
          affiliate_link: editingSite.affiliate_link,
          email: editingSite.email || '',
          whatsapp: editingSite.whatsapp || '',
          telegram: editingSite.telegram || '',
          twitter: editingSite.twitter || '',
          instagram: editingSite.instagram || '',
          facebook: editingSite.facebook || '',
          youtube: editingSite.youtube || '',
        }
      : {
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
        },
  });

  const nameValue = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue && !editingId) {
      setValue('slug', generateSlug(nameValue));
    }
  }, [nameValue, editingId, setValue]);

  // Update form when editing site changes
  useEffect(() => {
    if (editingSite) {
      reset({
        name: editingSite.name,
        slug: editingSite.slug,
        rating: editingSite.rating,
        bonus: editingSite.bonus || '',
        features: Array.isArray(editingSite.features)
          ? editingSite.features.join(', ')
          : '',
        affiliate_link: editingSite.affiliate_link,
        email: editingSite.email || '',
        whatsapp: editingSite.whatsapp || '',
        telegram: editingSite.telegram || '',
        twitter: editingSite.twitter || '',
        instagram: editingSite.instagram || '',
        facebook: editingSite.facebook || '',
        youtube: editingSite.youtube || '',
      });
      if (editingSite.logo_url) {
        onLogoPreviewChange(editingSite.logo_url);
      }
    } else {
      reset();
      onLogoFileChange(null);
      onLogoPreviewChange(null);
    }
  }, [editingSite, reset, onLogoFileChange, onLogoPreviewChange]);

  const onSubmit = (data: SiteFormData) => {
    if (editingId) {
      updateSiteMutation.mutate({ id: editingId, formData: data, logoFile });
    } else {
      createSiteMutation.mutate({ formData: data, logoFile });
    }
  };

  const handleCancel = () => {
    reset();
    onEditingIdChange(null);
    onLogoFileChange(null);
    onLogoPreviewChange(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoFileChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoPreviewChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearLogo = () => {
    onLogoFileChange(null);
    onLogoPreviewChange(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Site Adı*</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="slug">Slug*</Label>
          <Input id="slug" {...register('slug')} />
          {errors.slug && (
            <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="rating">Rating (1-5)*</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="1"
            max="5"
            {...register('rating', { valueAsNumber: true })}
          />
          {errors.rating && (
            <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="affiliate_link">Affiliate Link*</Label>
          <Input id="affiliate_link" type="url" {...register('affiliate_link')} />
          {errors.affiliate_link && (
            <p className="text-sm text-destructive mt-1">
              {errors.affiliate_link.message}
            </p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="bonus">Bonus</Label>
          <Input id="bonus" {...register('bonus')} />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
          <Input id="features" {...register('features')} />
        </div>
        
        <div>
          <Label htmlFor="logo">Logo</Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
          {logoPreview && (
            <div className="mt-2 relative inline-block">
              <img
                src={logoPreview}
                alt="Preview"
                className="w-20 h-20 object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={handleClearLogo}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={createSiteMutation.isPending || updateSiteMutation.isPending}
        >
          {editingId ? 'Güncelle' : 'Ekle'}
        </Button>
        {editingId && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            İptal
          </Button>
        )}
      </div>
    </form>
  );
}
