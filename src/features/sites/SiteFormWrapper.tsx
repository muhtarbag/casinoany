import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteFormSchema, SiteFormData, generateSlug } from '@/schemas/siteValidation';
import { Form } from '@/components/ui/form';
import { UseMutationResult } from '@tanstack/react-query';
import { SiteFormWizard } from './SiteFormWizard';

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
      affiliate_contract_date: '',
      affiliate_contract_terms: '',
      affiliate_has_monthly_payment: false,
      affiliate_monthly_payment: undefined,
      affiliate_panel_url: '',
      affiliate_panel_username: '',
      affiliate_panel_password: '',
      affiliate_notes: '',
      affiliate_commission_percentage: undefined,
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
        affiliate_contract_date: editingSite.affiliate_contract_date || '',
        affiliate_contract_terms: editingSite.affiliate_contract_terms || '',
        affiliate_has_monthly_payment: editingSite.affiliate_has_monthly_payment || false,
        affiliate_monthly_payment: editingSite.affiliate_monthly_payment || undefined,
        affiliate_panel_url: editingSite.affiliate_panel_url || '',
        affiliate_panel_username: editingSite.affiliate_panel_username || '',
        affiliate_panel_password: editingSite.affiliate_panel_password || '',
        affiliate_notes: editingSite.affiliate_notes || '',
        affiliate_commission_percentage: editingSite.affiliate_commission_percentage || undefined,
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

  const isLoading = createSiteMutation.isPending || updateSiteMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
        <SiteFormWizard
          form={form}
          editingId={editingId}
          logoFile={logoFile}
          logoPreview={logoPreview}
          onLogoFileChange={onLogoFileChange}
          onLogoPreviewChange={onLogoPreviewChange}
          onSubmit={form.handleSubmit(onSubmit)}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
}
