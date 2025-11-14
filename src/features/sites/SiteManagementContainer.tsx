import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAdminSiteManagement } from '@/hooks/admin/useAdminSiteManagement';
import { useSiteStats } from '@/hooks/queries/useSiteQueries';
import { SiteFormWrapper } from './SiteFormWrapper';
import { SiteList } from './SiteList';
import { SiteBulkActions } from './SiteBulkActions';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';

export function SiteManagementContainer() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
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
    const filteredSites = orderedSites.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (selectedSites.length === filteredSites.length && filteredSites.length > 0) {
      setSelectedSites([]);
    } else {
      setSelectedSites(filteredSites.map(s => s.id));
    }
  }, [orderedSites, searchQuery, selectedSites, setSelectedSites]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedSites((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);

      // Update display order in database
      updateOrderMutation.mutate(newOrder);

      return newOrder;
    });
  }, [updateOrderMutation]);

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

  if (sitesLoading) {
    return <div>Yükleniyor...</div>;
  }

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
        <SiteList
          sites={orderedSites}
          siteStats={siteStats}
          selectedSites={selectedSites}
          editingId={editingId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDragEnd={handleDragEnd}
          isDeleting={deletingId}
        />
      </CardContent>
    </Card>
  );
}
