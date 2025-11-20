import { useReducer, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { SiteFormData, validateLogoFile } from '@/schemas/siteValidation';
import { useLogChange } from '@/hooks/useChangeHistory';
import { adminSiteManagementReducer, createInitialState } from '@/reducers/adminSiteManagementReducer';

export const useAdminSiteManagement = () => {
  const queryClient = useQueryClient();
  const logChange = useLogChange();
  const [state, dispatch] = useReducer(adminSiteManagementReducer, createInitialState());

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

      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        // 🔧 Memory leak fix: cleanup object URL
        URL.revokeObjectURL(objectUrl);

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
      
      img.onerror = () => {
        // 🔧 Memory leak fix: cleanup on error too
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Resim yüklenemedi'));
      };
      
      img.src = objectUrl;
    });
  };

  // Upload logo to storage
  const uploadLogo = async (file: File, siteName: string): Promise<string> => {
    const optimizedFile = await optimizeLogo(file);
    const fileExt = optimizedFile.name.split('.').pop();
    
    // Sanitize filename: remove Turkish and special characters
    const sanitizedName = siteName
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/İ/g, 'i')
      .replace(/Ğ/g, 'g')
      .replace(/Ü/g, 'u')
      .replace(/Ş/g, 's')
      .replace(/Ö/g, 'o')
      .replace(/Ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const fileName = `${sanitizedName}-${Date.now()}.${fileExt}`;
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
          features: (formData.features as string) ? (formData.features as string).split(',').map(f => f.trim()) : [],
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
    onSuccess: (newSite) => {
      // Log the change for history
      logChange.mutateAsync({
        actionType: 'create',
        tableName: 'betting_sites',
        recordId: newSite.id,
        newData: newSite,
        metadata: {
          description: `${newSite.name} oluşturuldu`,
        },
      }).catch(() => {
        // Silently ignore logging errors - don't block user success
      });

      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      queryClient.invalidateQueries({ queryKey: ['betting-sites-active'] });
      queryClient.invalidateQueries({ queryKey: ['featured-sites'] });
      queryClient.invalidateQueries({ queryKey: ['change-history'] });
      showSuccessToast('Site başarıyla eklendi!');
      dispatch({ type: 'CLEAR_LOGO' });
    },
    onError: (error) => {
      showErrorToast(error, 'Site eklenirken bir hata oluştu');
    },
  });

  // Update site mutation - NORMALIZED SCHEMA
  const updateSiteMutation = useMutation({
    mutationFn: async ({ id, formData, logoFile }: { id: string; formData: SiteFormData; logoFile: File | null }) => {
      // Get previous data for change history
      const { data: previousData } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('id', id)
        .single();

      let logoUrl;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, formData.name);
      }

      // Update all site data including social media and affiliate info
      // NOTE: slug is NOT included in updates as it's unique and should never change
      const updateData: {
        name: string;
        affiliate_link: string;
        bonus: string;
        rating: number;
        features: string[];
        email: string | null;
        whatsapp: string | null;
        telegram: string | null;
        twitter: string | null;
        instagram: string | null;
        facebook: string | null;
        youtube: string | null;
        affiliate_contract_date: string | null;
        affiliate_contract_terms: string | null;
        affiliate_has_monthly_payment: boolean;
        affiliate_monthly_payment: number | null;
        affiliate_commission_percentage: number | null;
        affiliate_panel_url: string | null;
        affiliate_panel_username: string | null;
        affiliate_panel_password: string | null;
        affiliate_notes: string | null;
        logo_url?: string;
      } = {
        name: formData.name,
        affiliate_link: formData.affiliate_link,
        bonus: formData.bonus,
        rating: formData.rating,
        features: typeof formData.features === 'string' 
          ? formData.features.split(',').map(f => f.trim()) 
          : formData.features || [],
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

      const { data: updatedData, error: siteError } = await supabase
        .from('betting_sites')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (siteError) throw siteError;

      // Log the change for history
      if (previousData && updatedData) {
        await logChange.mutateAsync({
          actionType: 'update',
          tableName: 'betting_sites',
          recordId: updatedData.id,
          previousData,
          newData: updatedData,
          metadata: {
            description: `${updatedData.name} güncellendi`,
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      queryClient.invalidateQueries({ queryKey: ['betting-sites-active'] });
      queryClient.invalidateQueries({ queryKey: ['featured-sites'] });
      queryClient.invalidateQueries({ queryKey: ['change-history'] });
      showSuccessToast('Site başarıyla güncellendi!');
      dispatch({ type: 'RESET_FORM' });
    },
    onError: (error) => {
      showErrorToast(error, 'Site güncellenirken bir hata oluştu');
    },
  });

  // Delete site mutation
  const deleteSiteMutation = useMutation({
    mutationFn: async (id: string) => {
      dispatch({ type: 'SET_DELETING_ID', id });
      
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
      
      dispatch({ type: 'SET_DELETING_ID', id: null });
    },
    onError: (error: any) => {
      showErrorToast(error, 'Site silinirken bir hata oluştu');
      dispatch({ type: 'SET_DELETING_ID', id: null });
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
      
      showSuccessToast(`${state.selectedSites.length} site silindi`, {
        duration: 10000,
        onUndo: () => {
          window.open('#history', '_blank');
        },
        undoLabel: 'Geçmişi Gör',
      });
      
      dispatch({ type: 'CLEAR_SELECTIONS' });
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
      showSuccessToast(`${state.selectedSites.length} site ${variables.isActive ? 'aktif' : 'pasif'} yapıldı`);
      dispatch({ type: 'CLEAR_SELECTIONS' });
    },
    onError: (error: any) => {
      showErrorToast(error, 'İşlem sırasında bir hata oluştu');
    },
  });

  // Update display order - FIX RACE CONDITION
  const updateOrderMutation = useMutation({
    mutationFn: async (sites: any[]) => {
      // Serial execution to prevent race conditions
      for (let index = 0; index < sites.length; index++) {
        const { error } = await supabase
          .from('betting_sites')
          .update({ display_order: index })
          .eq('id', sites[index].id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      showSuccessToast('Sıra güncellendi');
    },
  });

  // Wrapper functions to maintain API compatibility
  const setEditingId = useCallback((id: string | null) => {
    dispatch({ type: 'SET_EDITING_ID', id });
  }, []);

  const setSelectedSites = useCallback((ids: string[] | ((prev: string[]) => string[])) => {
    if (typeof ids === 'function') {
      dispatch({ type: 'SET_SELECTED_SITES', ids: ids(state.selectedSites) });
    } else {
      dispatch({ type: 'SET_SELECTED_SITES', ids });
    }
  }, [state.selectedSites]);

  const setLogoFile = useCallback((file: File | null, preview?: string) => {
    if (file) {
      if (preview) {
        // Eğer preview zaten varsa direkt kullan
        dispatch({ type: 'SET_LOGO', file, preview });
      } else {
        // Preview yoksa oluştur (fallback)
        const reader = new FileReader();
        reader.onloadend = () => {
          dispatch({ type: 'SET_LOGO', file, preview: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    } else {
      dispatch({ type: 'CLEAR_LOGO' });
    }
  }, []);

  const setLogoPreview = useCallback((preview: string | null) => {
    if (preview && state.logoFile) {
      dispatch({ type: 'SET_LOGO', file: state.logoFile, preview });
    }
  }, [state.logoFile]);

  return {
    editingId: state.editingId,
    setEditingId,
    deletingId: state.deletingId,
    selectedSites: state.selectedSites,
    setSelectedSites,
    logoFile: state.logoFile,
    setLogoFile,
    logoPreview: state.logoPreview,
    setLogoPreview,
    createSiteMutation,
    updateSiteMutation,
    deleteSiteMutation,
    bulkDeleteMutation,
    bulkToggleActiveMutation,
    updateOrderMutation,
  };
};
