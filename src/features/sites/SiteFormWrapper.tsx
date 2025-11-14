import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteFormSchema, SiteFormData, generateSlug, validateLogoFile } from '@/schemas/siteValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { X, Loader2 } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';

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

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      rating: 4.5,
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

  const nameValue = form.watch('name');

  useEffect(() => {
    if (nameValue && !editingId) {
      form.setValue('slug', generateSlug(nameValue), { shouldValidate: false });
    }
  }, [nameValue, editingId, form]);

  useEffect(() => {
    if (editingSite) {
      form.reset({
        name: editingSite.name,
        slug: editingSite.slug,
        rating: editingSite.rating,
        bonus: editingSite.bonus || '',
        features: Array.isArray(editingSite.features) ? editingSite.features.join(', ') : '',
        affiliate_link: editingSite.affiliate_link,
        email: editingSite.email || '',
        whatsapp: editingSite.whatsapp || '',
        telegram: editingSite.telegram || '',
        twitter: editingSite.twitter || '',
        instagram: editingSite.instagram || '',
        facebook: editingSite.facebook || '',
        youtube: editingSite.youtube || '',
      });
      if (editingSite.logo_url) onLogoPreviewChange(editingSite.logo_url);
    } else {
      form.reset();
      onLogoFileChange(null);
      onLogoPreviewChange(null);
    }
  }, [editingSite, form, onLogoFileChange, onLogoPreviewChange]);

  useEffect(() => {
    if (createSiteMutation.isSuccess || updateSiteMutation.isSuccess) {
      form.reset();
      onLogoFileChange(null);
      onLogoPreviewChange(null);
      onEditingIdChange(null);
    }
  }, [createSiteMutation.isSuccess, updateSiteMutation.isSuccess, form, onLogoFileChange, onLogoPreviewChange, onEditingIdChange]);

  const onSubmit = useCallback((data: SiteFormData) => {
    if (editingId) {
      updateSiteMutation.mutate({ id: editingId, formData: data, logoFile });
    } else {
      createSiteMutation.mutate({ formData: data, logoFile });
    }
  }, [editingId, logoFile, createSiteMutation, updateSiteMutation]);

  const handleCancel = useCallback(() => {
    form.reset();
    onEditingIdChange(null);
    onLogoFileChange(null);
    onLogoPreviewChange(null);
  }, [form, onEditingIdChange, onLogoFileChange, onLogoPreviewChange]);

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [onLogoFileChange, onLogoPreviewChange]);

  const handleClearLogo = useCallback(() => {
    onLogoFileChange(null);
    onLogoPreviewChange(null);
  }, [onLogoFileChange, onLogoPreviewChange]);

  const isLoading = createSiteMutation.isPending || updateSiteMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Site Adı *</FormLabel>
              <FormControl><Input placeholder="Örn: Betist" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="slug" render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl><Input placeholder="betist" {...field} /></FormControl>
              <FormDescription>URL için kullanılır</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="rating" render={({ field }) => (
            <FormItem>
              <FormLabel>Rating (1-5) *</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" min="1" max="5" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="affiliate_link" render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliate Link *</FormLabel>
              <FormControl><Input type="url" placeholder="https://example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="bonus" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Bonus</FormLabel>
              <FormControl><Input placeholder="%100 Hoşgeldin Bonusu" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="features" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Özellikler</FormLabel>
              <FormControl><Input placeholder="Canlı bahis, Casino" {...field} /></FormControl>
              <FormDescription>Virgülle ayırın</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <div className="md:col-span-2">
            <FormLabel>Logo</FormLabel>
            <Input type="file" accept="image/*" onChange={handleLogoChange} disabled={isLoading} className="mt-2" />
            {logoPreview && (
              <div className="mt-3 relative inline-block">
                <img src={logoPreview} alt="Preview" className="w-24 h-24 object-contain rounded border p-2" />
                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 w-6 h-6" onClick={handleClearLogo}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingId ? 'Güncelle' : 'Ekle'}
          </Button>
          {editingId && <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>İptal</Button>}
        </div>
      </form>
    </Form>
  );
}
