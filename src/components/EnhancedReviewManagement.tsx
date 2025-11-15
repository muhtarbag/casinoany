import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Trash2 } from "lucide-react";
import { EnhancedTablePagination } from "@/components/table/EnhancedTablePagination";
import { EnhancedTableToolbar } from "@/components/table/EnhancedTableToolbar";
import { AIGenerationPanel } from "@/components/reviews/AIGenerationPanel";
import { SiteStatsGrid } from "@/components/reviews/SiteStatsGrid";
import { ReviewEditDialog } from "@/components/reviews/ReviewEditDialog";
import { ReviewDeleteDialog } from "@/components/reviews/ReviewDeleteDialog";
import { ReviewsTable } from "@/components/reviews/ReviewsTable";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Type for review updates
interface ReviewUpdate {
  rating?: number;
  title?: string;
  comment?: string;
  is_approved?: boolean;
}

// Database site type
interface BettingSite {
  id: string;
  name: string;
}

// Database profile type
interface Profile {
  id: string;
  username: string;
}

// Enhanced Review interface with proper typing
interface Review {
  id: string;
  site_id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
  // Related data (loaded via joins)
  betting_sites?: BettingSite | null;
  profiles?: Profile | null;
}

// Type guard to check if review has site info
function hasValidSiteInfo(review: Review): review is Review & { betting_sites: BettingSite } {
  return !!review.betting_sites && !!review.betting_sites.name;
}

// Type guard to check if review has user info
function hasValidUserInfo(review: Review): review is Review & { profiles: Profile } {
  return !!review.profiles && !!review.profiles.username;
}

interface SiteStats {
  site_id: string;
  site_name: string;
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  avg_rating: number;
}

export default function EnhancedReviewManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  
  // AI Generation States
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Bulk actions
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Fetch betting sites
  const { data: sites = [] } = useQuery({
    queryKey: ["betting-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("betting_sites")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as BettingSite[];
    }
  });

  // Fetch reviews with pagination
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["enhanced-reviews", currentPage, pageSize],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: reviewsData, error, count } = await supabase
        .from("site_reviews")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setTotalCount(count || 0);

      // Fetch related data
      const siteIds = [...new Set(reviewsData?.map(r => r.site_id) || [])];
      const userIds = [...new Set(reviewsData?.map(r => r.user_id).filter(Boolean) || [])];

      const [sitesResult, profilesResult] = await Promise.all([
        siteIds.length > 0
          ? supabase.from("betting_sites").select("id, name").in("id", siteIds)
          : Promise.resolve({ data: [] }),
        userIds.length > 0
          ? supabase.from("profiles").select("id, username").in("id", userIds)
          : Promise.resolve({ data: [] })
      ]);

      return reviewsData.map(review => ({
        ...review,
        betting_sites: sitesResult.data?.find(s => s.id === review.site_id),
        profiles: profilesResult.data?.find(p => p.id === review.user_id)
      }));
    }
  });

  // Type-safe helper functions
  const getSiteName = useCallback((review: Review): string => {
    return hasValidSiteInfo(review) ? review.betting_sites.name : "Bilinmeyen Site";
  }, []);

  const getUserDisplayName = useCallback((review: Review): string => {
    if (hasValidUserInfo(review)) {
      return review.profiles.username;
    }
    return review.name || "Anonim";
  }, []);

  // Calculate site statistics
  const siteStats = useMemo<SiteStats[]>(() => {
    if (!reviews) return [];

    const statsMap = new Map<string, SiteStats>();

    reviews.forEach(review => {
      const siteId = review.site_id;
      const siteName = getSiteName(review);

      if (!statsMap.has(siteId)) {
        statsMap.set(siteId, {
          site_id: siteId,
          site_name: siteName,
          total_reviews: 0,
          pending_reviews: 0,
          approved_reviews: 0,
          avg_rating: 0
        });
      }

      const stats = statsMap.get(siteId)!;
      stats.total_reviews += 1;
      stats.avg_rating += review.rating;
      
      if (review.is_approved) {
        stats.approved_reviews += 1;
      } else {
        stats.pending_reviews += 1;
      }
    });

    return Array.from(statsMap.values())
      .map(stats => ({
        ...stats,
        avg_rating: stats.total_reviews > 0 ? stats.avg_rating / stats.total_reviews : 0
      }))
      .sort((a, b) => b.total_reviews - a.total_reviews);
  }, [reviews, getSiteName]);

  // Filter reviews with type-safe checks
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];

    return reviews.filter(review => {
      const siteName = getSiteName(review);
      const matchesSearch = 
        searchTerm === "" ||
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesSite = selectedSite === "all" || review.site_id === selectedSite;
      
      const matchesStatus = 
        selectedStatus === "all" ||
        (selectedStatus === "pending" && !review.is_approved) ||
        (selectedStatus === "approved" && review.is_approved);

      const matchesRating = selectedRating === "all" || review.rating === parseInt(selectedRating);

      return matchesSearch && matchesSite && matchesStatus && matchesRating;
    });
  }, [reviews, searchTerm, selectedSite, selectedStatus, selectedRating]);

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("site_reviews")
        .update({ is_approved: true })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
      toast.success("Yorum onaylandı");
    },
    onError: () => {
      toast.error("Yorum onaylanırken hata oluştu");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("site_reviews")
        .update({ is_approved: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
      toast.success("Yorum reddedildi");
    },
    onError: () => {
      toast.error("Yorum reddedilirken hata oluştu");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("site_reviews")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
      toast.success("Yorum silindi");
      setDeleteReviewId(null);
    },
    onError: () => {
      toast.error("Yorum silinirken hata oluştu");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ReviewUpdate }) => {
      const { error } = await supabase
        .from("site_reviews")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
      toast.success("Yorum güncellendi");
      setEditingReview(null);
    },
    onError: () => {
      toast.error("Yorum güncellenirken hata oluştu");
    }
  });

  const handleEdit = useCallback((review: Review) => {
    setEditingReview(review);
  }, []);

  const handleSaveEdit = useCallback((reviewId: string, data: { rating: number; title: string; comment: string }) => {
    updateMutation.mutate({
      id: reviewId,
      updates: data
    });
  }, [updateMutation]);

  // Bulk actions handlers
  const toggleReviewSelection = useCallback((reviewId: string) => {
    setSelectedReviews(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(reviewId)) {
        newSelection.delete(reviewId);
      } else {
        newSelection.add(reviewId);
      }
      return newSelection;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedReviews(prev => {
      if (prev.size === filteredReviews.length) {
        return new Set();
      } else {
        return new Set(filteredReviews.map(r => r.id));
      }
    });
  }, [filteredReviews]);

  const handleBulkApprove = useCallback(async () => {
    if (selectedReviews.size === 0) {
      toast.error("Lütfen onaylanacak yorumları seçin");
      return;
    }

    setIsBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("site_reviews")
        .update({ is_approved: true })
        .in("id", Array.from(selectedReviews));

      if (error) throw error;

      toast.success(`${selectedReviews.size} yorum onaylandı`);
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
      setSelectedReviews(new Set());
    } catch (error) {
      toast.error("Yorumlar onaylanırken hata oluştu");
    } finally {
      setIsBulkActionLoading(false);
    }
  }, [selectedReviews, queryClient]);

  const handleBulkReject = useCallback(async () => {
    if (selectedReviews.size === 0) {
      toast.error("Lütfen reddedilecek yorumları seçin");
      return;
    }

    setIsBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("site_reviews")
        .update({ is_approved: false })
        .in("id", Array.from(selectedReviews));

      if (error) throw error;

      toast.success(`${selectedReviews.size} yorum reddedildi`);
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
      setSelectedReviews(new Set());
    } catch (error) {
      toast.error("Yorumlar reddedilirken hata oluştu");
    } finally {
      setIsBulkActionLoading(false);
    }
  }, [selectedReviews, queryClient]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedReviews.size === 0) {
      toast.error("Lütfen silinecek yorumları seçin");
      return;
    }

    if (!confirm(`${selectedReviews.size} yorumu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setIsBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("site_reviews")
        .delete()
        .in("id", Array.from(selectedReviews));

      if (error) throw error;

      toast.success(`${selectedReviews.size} yorum silindi`);
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
      setSelectedReviews(new Set());
    } catch (error) {
      toast.error("Yorumlar silinirken hata oluştu");
    } finally {
      setIsBulkActionLoading(false);
    }
  }, [selectedReviews, queryClient]);

  // AI Generation Handler
  const handleAiGenerate = useCallback(async (params: {
    siteId: string;
    count: string;
    tone: "positive" | "negative" | "neutral";
    ratingMin: string;
    ratingMax: string;
    language: "tr" | "en";
    autoPublish: boolean;
  }) => {
    if (!params.siteId) {
      toast.error("Lütfen bir site seçin");
      return;
    }

    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-reviews-info', {
        body: {
          siteId: params.siteId,
          count: parseInt(params.count),
          tone: params.tone,
          ratingRange: { min: parseInt(params.ratingMin), max: parseInt(params.ratingMax) },
          language: params.language
        }
      });

      if (error) throw error;

      const reviews = data.reviews;
      if (!reviews || reviews.length === 0) {
        throw new Error('AI yorumlar oluşturulamadı');
      }

      const reviewsToInsert = reviews.map((review: any) => ({
        site_id: params.siteId,
        name: review.name,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        is_approved: params.autoPublish,
        user_id: null,
        email: null
      }));

      const { error: insertError } = await supabase
        .from('site_reviews')
        .insert(reviewsToInsert);

      if (insertError) throw insertError;

      const message = params.autoPublish 
        ? `${reviews.length} yorum başarıyla oluşturuldu ve yayınlandı`
        : `${reviews.length} yorum başarıyla oluşturuldu ve onay için eklendi`;
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
    } catch (error) {
      console.error('AI yorum oluşturma hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Yorumlar oluşturulurken hata oluştu');
    } finally {
      setIsAiLoading(false);
    }
  }, [queryClient]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!filteredReviews.length) {
      toast.error("Dışa aktarılacak veri yok");
      return;
    }

    const csvData = filteredReviews.map(review => ({
      "Site": getSiteName(review),
      "Kullanıcı": getUserDisplayName(review),
      "Başlık": review.title,
      "Yorum": review.comment,
      "Puan": review.rating,
      "Durum": review.is_approved ? "Onaylandı" : "Beklemede",
      "Tarih": format(new Date(review.created_at), "dd MMMM yyyy", { locale: tr })
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `yorumlar-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Yorumlar dışa aktarıldı");
  }, [filteredReviews, getSiteName, getUserDisplayName]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedSite("all");
    setSelectedStatus("all");
    setSelectedRating("all");
  }, []);

  // Memoized callbacks for table actions
  const handleApprove = useCallback((id: string) => {
    approveMutation.mutate(id);
  }, [approveMutation]);

  const handleReject = useCallback((id: string) => {
    rejectMutation.mutate(id);
  }, [rejectMutation]);

  const handleDelete = useCallback((id: string) => {
    setDeleteReviewId(id);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* AI Review Generation Section */}
      <AIGenerationPanel
        sites={sites}
        isLoading={isAiLoading}
        onGenerate={handleAiGenerate}
      />

      {/* Site Statistics */}
      <SiteStatsGrid stats={siteStats} maxItems={6} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Yorum Yönetimi</CardTitle>
              <CardDescription>
                Toplam {totalCount} yorum bulundu
              </CardDescription>
            </div>
            {selectedReviews.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedReviews.size} seçili</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkApprove}
                  disabled={isBulkActionLoading}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Toplu Onayla
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkReject}
                  disabled={isBulkActionLoading}
                >
                  <X className="w-4 h-4 mr-1" />
                  Toplu Reddet
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isBulkActionLoading}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Toplu Sil
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enhanced Toolbar */}
          <EnhancedTableToolbar
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={selectedStatus}
            onStatusFilterChange={setSelectedStatus}
            ratingFilter={selectedRating}
            onRatingFilterChange={setSelectedRating}
            totalItems={totalCount}
            filteredItems={filteredReviews.length}
            onExport={handleExport}
            onClearFilters={clearFilters}
            searchPlaceholder="Yorum ara..."
            statusOptions={[
              { value: "all", label: "Tüm Durumlar" },
              { value: "pending", label: "Onay Bekleyen" },
              { value: "approved", label: "Onaylanmış" }
            ]}
            ratingOptions={[
              { value: "all", label: "Tüm Puanlar" },
              { value: "5", label: "⭐ 5 Yıldız" },
              { value: "4", label: "⭐ 4 Yıldız" },
              { value: "3", label: "⭐ 3 Yıldız" },
              { value: "2", label: "⭐ 2 Yıldız" },
              { value: "1", label: "⭐ 1 Yıldız" }
            ]}
          />

          {/* Site Filter - Keep this separate as it's specific to reviews */}
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Tüm Siteler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Siteler</SelectItem>
              {siteStats.map(stat => (
                <SelectItem key={stat.site_id} value={stat.site_id}>
                  {stat.site_name} ({stat.total_reviews})
                </SelectItem>
              ))}</SelectContent>
          </Select>

          {/* Reviews Table */}
          <ReviewsTable
            reviews={filteredReviews}
            selectedReviews={selectedReviews}
            onToggleSelection={toggleReviewSelection}
            onToggleSelectAll={toggleSelectAll}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getSiteName={getSiteName}
            getUserDisplayName={getUserDisplayName}
            isLoading={isLoading}
          />

          {/* Pagination */}
          <EnhancedTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalCount}
            totalPages={Math.ceil(totalCount / pageSize)}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ReviewEditDialog
        review={editingReview}
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
        onSave={handleSaveEdit}
        isSaving={updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <ReviewDeleteDialog
        isOpen={!!deleteReviewId}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={() => deleteReviewId && deleteMutation.mutate(deleteReviewId)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
