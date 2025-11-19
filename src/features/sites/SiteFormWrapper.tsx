import { useEffect, useCallback, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteFormSchema, SiteFormData, generateSlug } from '@/schemas/siteValidation';
import { Form } from '@/components/ui/form';
import { UseMutationResult } from '@tanstack/react-query';
import { SiteFormWizard } from './SiteFormWizard';
import { useUpdateSiteCategories } from '@/hooks/queries/useCategoryQueries';
import { supabase } from '@/integrations/supabase/client';

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
  const updateCategoriesMutation = useUpdateSiteCategories();
  const [isFormReady, setIsFormReady] = useState(false);
  const lastSuccessTimestampRef = useRef<number>(0);

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
      category_ids: [],
    },
  });

  const nameValue = form.watch('name');

  useEffect(() => {
    if (nameValue && !editingId) {
      form.setValue('slug', generateSlug(nameValue), { shouldValidate: false });
    }
  }, [nameValue, editingId, form]);

  useEffect(() => {
    const loadSiteData = async () => {
      setIsFormReady(false);
      
      if (editingSite) {
        // Load site categories
        let categoryIds: string[] = [];
        try {
          const { data: siteCategories } = await supabase
            .from('site_categories')
            .select('category_id')
            .eq('site_id', editingSite.id);
          
          if (siteCategories) {
            categoryIds = siteCategories.map((sc: any) => sc.category_id);
          }
        } catch (error) {
          // Silent fail
        }

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
          category_ids: categoryIds,
        });
        if (editingSite.logo_url) onLogoPreviewChange(editingSite.logo_url);
      } else {
        form.reset();
        onLogoFileChange(null);
        onLogoPreviewChange(null);
      }
      
      // Mark form as ready after data is loaded
      setTimeout(() => setIsFormReady(true), 100);
    };

    loadSiteData();
  }, [editingSite, form, onLogoFileChange, onLogoPreviewChange]);

  useEffect(() => {
    const currentTimestamp = Date.now();
    const isNewSuccess = (createSiteMutation.isSuccess || updateSiteMutation.isSuccess) && 
                         currentTimestamp > lastSuccessTimestampRef.current;
    
    if (isNewSuccess) {
      lastSuccessTimestampRef.current = currentTimestamp;
      form.reset();
      onLogoFileChange(null);
      onLogoPreviewChange(null);
      onEditingIdChange(null);
    }
  }, [createSiteMutation.isSuccess, updateSiteMutation.isSuccess, form, onLogoFileChange, onLogoPreviewChange, onEditingIdChange]);

  const onSubmit = useCallback(async (data: SiteFormData) => {
    try {
      const categoryIds = (data.category_ids || []) as string[];
      
      if (editingId) {
        // Update site
        await updateSiteMutation.mutateAsync({ id: editingId, formData: data, logoFile });
        
        // Update categories
        await updateCategoriesMutation.mutateAsync({
          siteId: editingId,
          categoryIds,
        });
      } else {
        // Create site and get the result
        const result: any = await createSiteMutation.mutateAsync({ formData: data, logoFile });
        
        // Update categories for new site
        if (result?.id && categoryIds.length > 0) {
          await updateCategoriesMutation.mutateAsync({
            siteId: result.id,
            categoryIds,
          });
        }
      }
    } catch (error) {
      // Error will be handled by mutation onError
    }
  }, [editingId, logoFile, createSiteMutation, updateSiteMutation, updateCategoriesMutation]);

  const handleCancel = useCallback(() => {
    form.reset();
    onEditingIdChange(null);
    onLogoFileChange(null);
    onLogoPreviewChange(null);
  }, [form, onEditingIdChange, onLogoFileChange, onLogoPreviewChange]);

  const isLoading = createSiteMutation.isPending || updateSiteMutation.isPending;

  // Don't render form until data is loaded (prevents validation errors on edit)
  if (editingId && !isFormReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Form verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

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
