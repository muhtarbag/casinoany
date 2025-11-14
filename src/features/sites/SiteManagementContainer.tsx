import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAdminSiteManagement } from '@/hooks/admin/useAdminSiteManagement';
import { useSiteStats } from '@/hooks/queries/useSiteQueries';
import { SiteFormWrapper } from './SiteFormWrapper';
import { EnhancedSiteList } from './EnhancedSiteList';
import { SiteBulkActions } from './SiteBulkActions';

export function SiteManagementContainer() {
  const queryClient = useQueryClient();
  const [orderedSites, setOrderedSites] = useState<any[]>([]);

  // Use the centralized hook
  const {
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
  } = useAdminSiteManagement();

  // Fetch sites
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: siteStats } = useSiteStats();

  // Update ordered sites when sites data changes
  useMemo(() => {
    if (sites) {
      setOrderedSites(sites);
    }
  }, [sites]);

  // Handlers
  const handleEdit = useCallback((site: any) => {
    setEditingId(site.id);
  }, [setEditingId]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedSites((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  }, [setSelectedSites]);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedSites.length === orderedSites.length && orderedSites.length > 0) {
      setSelectedSites([]);
    } else {
      setSelectedSites(orderedSites.map(s => s.id));
    }
  }, [orderedSites, selectedSites, setSelectedSites]);

  const handleDelete = useCallback((id: string) => {
    deleteSiteMutation.mutate(id);
  }, [deleteSiteMutation]);

  const handleBulkDelete = useCallback(() => {
    bulkDeleteMutation.mutate(selectedSites, {
      onSuccess: () => {
        setSelectedSites([]);
      },
    });
  }, [bulkDeleteMutation, selectedSites, setSelectedSites]);

  const handleBulkActivate = useCallback(() => {
    bulkToggleActiveMutation.mutate(
      { siteIds: selectedSites, isActive: true },
      {
        onSuccess: () => {
          setSelectedSites([]);
        },
      }
    );
  }, [bulkToggleActiveMutation, selectedSites, setSelectedSites]);

  const handleBulkDeactivate = useCallback(() => {
    bulkToggleActiveMutation.mutate(
      { siteIds: selectedSites, isActive: false },
      {
        onSuccess: () => {
          setSelectedSites([]);
        },
      }
    );
  }, [bulkToggleActiveMutation, selectedSites, setSelectedSites]);

  const handleReorder = useCallback((newOrder: any[]) => {
    setOrderedSites(newOrder);
    updateOrderMutation.mutate(newOrder);
  }, [updateOrderMutation]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Yönetimi</CardTitle>
        <CardDescription>Bahis sitelerini ekleyin, düzenleyin ve yönetin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Site Form */}
        <SiteFormWrapper
          editingId={editingId}
          onEditingIdChange={setEditingId}
          sites={orderedSites}
          logoFile={logoFile}
          logoPreview={logoPreview}
          onLogoFileChange={setLogoFile}
          onLogoPreviewChange={setLogoPreview}
          createSiteMutation={createSiteMutation}
          updateSiteMutation={updateSiteMutation}
        />

        {/* Bulk Actions */}
        <SiteBulkActions
          selectedCount={selectedSites.length}
          onBulkDelete={handleBulkDelete}
          onBulkActivate={handleBulkActivate}
          onBulkDeactivate={handleBulkDeactivate}
          isLoading={
            bulkDeleteMutation.isPending || bulkToggleActiveMutation.isPending
          }
        />

        {/* Site List */}
        <EnhancedSiteList
          sites={orderedSites}
          stats={siteStats || {}}
          selectedSites={selectedSites}
          editingId={editingId}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReorder={handleReorder}
          isDeleting={deletingId}
          isLoading={sitesLoading}
        />
      </CardContent>
    </Card>
  );
}
