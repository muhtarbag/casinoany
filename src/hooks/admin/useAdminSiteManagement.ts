import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { SiteFormData, validateLogoFile } from '@/schemas/siteValidation';
import { useLogChange } from '@/hooks/useChangeHistory';

export const useAdminSiteManagement = () => {
  const queryClient = useQueryClient();
  const logChange = useLogChange();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Logo optimization
  const optimizeLogo = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const validation = validateLogoFile(file);
      if (validation) {
        reject(new Error(validation));
        return;
      }

      if (file.type === 'image/svg+xml') {
        resolve(file);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context alınamadı'));
          return;
        }

        const maxWidth = 400;
        const maxHeight = 200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            reject(new Error('Blob oluşturulamadı'));
          }
        }, 'image/webp', 0.85);
      };
      img.onerror = () => reject(new Error('Resim yüklenemedi'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload logo to storage
  const uploadLogo = async (file: File, siteName: string): Promise<string> => {
    const optimizedFile = await optimizeLogo(file);
    const fileExt = optimizedFile.name.split('.').pop();
    const fileName = `${siteName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-logos')
      .upload(filePath, optimizedFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('site-logos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  // Create site mutation - NORMALIZED SCHEMA
  const createSiteMutation = useMutation({
    mutationFn: async ({ formData, logoFile }: { formData: SiteFormData; logoFile: File | null }) => {
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, formData.name);
      }

      // Insert all site data including social media and affiliate info
      const { data: siteData, error: siteError } = await (supabase as any)
        .from('betting_sites')
        .insert([{
          name: formData.name,
          slug: formData.slug,
          affiliate_link: formData.affiliate_link,
          bonus: formData.bonus,
          rating: formData.rating,
          is_featured: false,
          is_active: true,
          logo_url: logoUrl,
          features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
          // Social media
          email: formData.email || null,
          whatsapp: formData.whatsapp || null,
          telegram: formData.telegram || null,
          twitter: formData.twitter || null,
          instagram: formData.instagram || null,
          facebook: formData.facebook || null,
          youtube: formData.youtube || null,
          // Affiliate data
          affiliate_contract_date: formData.affiliate_contract_date || null,
          affiliate_contract_terms: formData.affiliate_contract_terms || null,
          affiliate_has_monthly_payment: formData.affiliate_has_monthly_payment || false,
          affiliate_monthly_payment: formData.affiliate_monthly_payment || null,
          affiliate_commission_percentage: formData.affiliate_commission_percentage || null,
          affiliate_panel_url: formData.affiliate_panel_url || null,
          affiliate_panel_username: formData.affiliate_panel_username || null,
          affiliate_panel_password: formData.affiliate_panel_password || null,
          affiliate_notes: formData.affiliate_notes || null,
        }])
        .select()
        .single();

      if (siteError) throw siteError;

      return siteData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      showSuccessToast('Site başarıyla eklendi!');
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error: any) => {
      showErrorToast(error, 'Site eklenirken bir hata oluştu');
    },
  });

  // Update site mutation - NORMALIZED SCHEMA
  const updateSiteMutation = useMutation({
    mutationFn: async ({ id, formData, logoFile }: { id: string; formData: SiteFormData; logoFile: File | null }) => {
      let logoUrl;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, formData.name);
      }

      // Update all site data including social media and affiliate info
      const updateData: any = {
        name: formData.name,
        slug: formData.slug,
        affiliate_link: formData.affiliate_link,
        bonus: formData.bonus,
        rating: formData.rating,
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
        // Social media
        email: formData.email || null,
        whatsapp: formData.whatsapp || null,
        telegram: formData.telegram || null,
        twitter: formData.twitter || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        youtube: formData.youtube || null,
        // Affiliate data
        affiliate_contract_date: formData.affiliate_contract_date || null,
        affiliate_contract_terms: formData.affiliate_contract_terms || null,
        affiliate_has_monthly_payment: formData.affiliate_has_monthly_payment || false,
        affiliate_monthly_payment: formData.affiliate_monthly_payment || null,
        affiliate_commission_percentage: formData.affiliate_commission_percentage || null,
        affiliate_panel_url: formData.affiliate_panel_url || null,
        affiliate_panel_username: formData.affiliate_panel_username || null,
        affiliate_panel_password: formData.affiliate_panel_password || null,
        affiliate_notes: formData.affiliate_notes || null,
      };

      if (logoUrl) {
        updateData.logo_url = logoUrl;
      }

      const { error: siteError } = await (supabase as any)
        .from('betting_sites')
        .update(updateData)
        .eq('id', id);
      
      if (siteError) throw siteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      showSuccessToast('Site başarıyla güncellendi!');
      setEditingId(null);
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error: any) => {
      showErrorToast(error, 'Site güncellenirken bir hata oluştu');
    },
  });

  // Delete site mutation
  const deleteSiteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      
      // Get site data before deleting for undo
      const { data: siteData } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('id', id)
        .single();
      
      const { error } = await supabase.from('betting_sites').delete().eq('id', id);
      if (error) throw error;
      
      // Log the change for undo
      if (siteData) {
        await logChange.mutateAsync({
          actionType: 'delete',
          tableName: 'betting_sites',
          recordId: id,
          previousData: siteData,
          metadata: {
            description: `${siteData.name} silindi`,
          },
        });
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      
      // Show success with undo option
      showSuccessToast('Site silindi', {
        duration: 10000, // 10 seconds to give time for undo
        onUndo: () => {
          // Note: Undo functionality requires change history system
          // User can undo via History tab
          window.open('#history', '_blank');
        },
        undoLabel: 'Geçmişi Gör',
      });
      
      setDeletingId(null);
    },
    onError: (error: any) => {
      showErrorToast(error, 'Site silinirken bir hata oluştu');
      setDeletingId(null);
    },
  });

  // Bulk operations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (siteIds: string[]) => {
      // Get sites data before deleting for undo
      const { data: sitesData } = await supabase
        .from('betting_sites')
        .select('*')
        .in('id', siteIds);
      
      const { error } = await supabase.from('betting_sites').delete().in('id', siteIds);
      if (error) throw error;
      
      // Log the bulk change for undo
      if (sitesData && sitesData.length > 0) {
        await logChange.mutateAsync({
          actionType: 'bulk_delete',
          tableName: 'betting_sites',
          recordIds: siteIds,
          previousData: sitesData,
          metadata: {
            description: `${sitesData.length} site toplu silme`,
          },
        });
      }
    },
    onSuccess: (_, siteIds) => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      queryClient.invalidateQueries({ queryKey: ['change-history'] });
      
      showSuccessToast(`${selectedSites.length} site silindi`, {
        duration: 10000,
        onUndo: () => {
          window.open('#history', '_blank');
        },
        undoLabel: 'Geçmişi Gör',
      });
      
      setSelectedSites([]);
    },
    onError: (error: any) => {
      showErrorToast(error, 'Siteler silinirken bir hata oluştu');
    },
  });

  const bulkToggleActiveMutation = useMutation({
    mutationFn: async ({ siteIds, isActive }: { siteIds: string[]; isActive: boolean }) => {
      const { error } = await supabase.from('betting_sites').update({ is_active: isActive }).in('id', siteIds);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      showSuccessToast(`${selectedSites.length} site ${variables.isActive ? 'aktif' : 'pasif'} yapıldı`);
      setSelectedSites([]);
    },
    onError: (error: any) => {
      showErrorToast(error, 'İşlem sırasında bir hata oluştu');
    },
  });

  // Update display order
  const updateOrderMutation = useMutation({
    mutationFn: async (sites: any[]) => {
      const updates = sites.map((site, index) =>
        supabase.from('betting_sites').update({ display_order: index }).eq('id', site.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      showSuccessToast('Sıra güncellendi');
    },
  });

  return {
    editingId,
    setEditingId,
    deletingId,
    selectedSites,
    setSelectedSites,
    logoFile,
    setLogoFile,
    logoPreview,
    setLogoPreview,
    createSiteMutation,
    updateSiteMutation,
    deleteSiteMutation,
    bulkDeleteMutation,
    bulkToggleActiveMutation,
    updateOrderMutation,
  };
};
