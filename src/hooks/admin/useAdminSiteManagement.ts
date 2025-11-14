import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SiteFormData, validateLogoFile } from '@/schemas/siteValidation';

export const useAdminSiteManagement = () => {
  const queryClient = useQueryClient();
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

  // Create site mutation
  const createSiteMutation = useMutation({
    mutationFn: async ({ formData, logoFile }: { formData: SiteFormData; logoFile: File | null }) => {
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, formData.name);
      }

      const { error } = await (supabase as any).from('betting_sites').insert([{
        ...formData,
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
        logo_url: logoUrl,
        is_active: true,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast.success('Site başarıyla eklendi!');
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message);
    },
  });

  // Update site mutation
  const updateSiteMutation = useMutation({
    mutationFn: async ({ id, formData, logoFile }: { id: string; formData: SiteFormData; logoFile: File | null }) => {
      let logoUrl;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, formData.name);
      }

      const updateData: any = {
        ...formData,
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
      };

      if (logoUrl) {
        updateData.logo_url = logoUrl;
      }

      const { error } = await supabase.from('betting_sites').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast.success('Site başarıyla güncellendi!');
      setEditingId(null);
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message);
    },
  });

  // Delete site mutation
  const deleteSiteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      const { error } = await supabase.from('betting_sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast.success('Site silindi');
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message);
      setDeletingId(null);
    },
  });

  // Bulk operations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (siteIds: string[]) => {
      const { error } = await supabase.from('betting_sites').delete().in('id', siteIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast.success(`${selectedSites.length} site silindi`);
      setSelectedSites([]);
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message);
    },
  });

  const bulkToggleActiveMutation = useMutation({
    mutationFn: async ({ siteIds, isActive }: { siteIds: string[]; isActive: boolean }) => {
      const { error } = await supabase.from('betting_sites').update({ is_active: isActive }).in('id', siteIds);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast.success(`${selectedSites.length} site ${variables.isActive ? 'aktif' : 'pasif'} yapıldı`);
      setSelectedSites([]);
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message);
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
      toast.success('Sıra güncellendi');
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
