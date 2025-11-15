import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Star, Check, X, Trash2, Edit2, Search, TrendingUp, Sparkles, Loader2, CheckSquare, Square } from "lucide-react";
import { EnhancedTablePagination } from "@/components/table/EnhancedTablePagination";
import { EnhancedTableToolbar } from "@/components/table/EnhancedTableToolbar";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [editForm, setEditForm] = useState({
    rating: 5,
    title: "",
    comment: ""
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  
  // AI Generation States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSelectedSite, setAiSelectedSite] = useState<string>("");
  const [aiReviewCount, setAiReviewCount] = useState<string>("3");
  const [aiReviewTone, setAiReviewTone] = useState<"positive" | "negative" | "neutral">("neutral");
  const [aiRatingMin, setAiRatingMin] = useState<string>("3");
  const [aiRatingMax, setAiRatingMax] = useState<string>("5");
  const [aiLanguage, setAiLanguage] = useState<"tr" | "en">("tr");
  const [aiAutoPublish, setAiAutoPublish] = useState(false);
  
  // Bulk actions
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Fetch betting sites for AI generation
  const { data: bettingSites = [] } = useQuery({
    queryKey: ["betting-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("betting_sites")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all reviews with site and user data (with pagination)
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["enhanced-reviews", currentPage, pageSize],
    queryFn: async () => {
      // First, get total count
      const { count } = await supabase
        .from("site_reviews")
        .select("*", { count: 'exact', head: true });
      
      if (count !== null) {
        setTotalCount(count);
      }

      // Then get paginated data
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data: reviewsData, error } = await supabase
        .from("site_reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const siteIds = [...new Set(reviewsData.map(r => r.site_id))];
      const userIds = reviewsData
        .map(r => r.user_id)
        .filter((id): id is string => id !== null);

      const [sitesResult, profilesResult] = await Promise.all([
        supabase.from("betting_sites").select("id, name").in("id", siteIds),
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
  }, [reviews]);

  // Type-safe helper functions
  const getSiteName = (review: Review): string => {
    return hasValidSiteInfo(review) ? review.betting_sites.name : "Bilinmeyen Site";
  };

  const getUserDisplayName = (review: Review): string => {
    if (hasValidUserInfo(review)) {
      return review.profiles.username;
    }
    return review.name || "Anonim";
  };

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
    onError: () => toast.error("Yorum onaylanırken hata oluştu")
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
    onError: () => toast.error("Yorum reddedilirken hata oluştu")
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
    onError: () => toast.error("Yorum silinirken hata oluştu")
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
    onError: () => toast.error("Yorum güncellenirken hata oluştu")
  });

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    });
  };

  const handleSaveEdit = () => {
    if (!editingReview) return;
    updateMutation.mutate({
      id: editingReview.id,
      updates: editForm
    });
  };

  // Bulk actions handlers
  const toggleReviewSelection = (reviewId: string) => {
    const newSelection = new Set(selectedReviews);
    if (newSelection.has(reviewId)) {
      newSelection.delete(reviewId);
    } else {
      newSelection.add(reviewId);
    }
    setSelectedReviews(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedReviews.size === filteredReviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(filteredReviews.map(r => r.id)));
    }
  };

  const handleBulkApprove = async () => {
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
  };

  const handleBulkReject = async () => {
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
  };

  const handleBulkDelete = async () => {
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
  };

  // Handle export
  const handleExport = () => {
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
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSite("all");
    setSelectedStatus("all");
    setSelectedRating("all");
  };

  // AI Review Generation Handler
  const handleAiGenerateReviews = async () => {
    if (!aiSelectedSite) {
      toast.error("Lütfen bir site seçin");
      return;
    }

    setIsAiLoading(true);
    try {
      const selectedSite = bettingSites.find(s => s.id === aiSelectedSite);
      
      const { data: aiData, error: aiError } = await supabase.functions.invoke('admin-ai-assistant', {
        body: { 
          type: 'generate-reviews',
          data: {
            siteName: selectedSite?.name,
            count: parseInt(aiReviewCount),
            tone: aiReviewTone,
            ratingMin: parseInt(aiRatingMin),
            ratingMax: parseInt(aiRatingMax),
            language: aiLanguage
          }
        }
      });

      if (aiError) throw aiError;
      if (!aiData?.success) throw new Error(aiData?.error || 'AI yanıtı alınamadı');

      const reviews = aiData.data.reviews;
      
      const reviewsToInsert = reviews.map((review: any) => ({
        site_id: aiSelectedSite,
        name: review.name,
        rating: Math.round(review.rating),
        title: review.title,
        comment: review.comment,
        is_approved: aiAutoPublish,
        user_id: null,
        email: null
      }));

      const { error: insertError } = await supabase
        .from('site_reviews')
        .insert(reviewsToInsert);

      if (insertError) throw insertError;

      const message = aiAutoPublish 
        ? `${reviews.length} yorum başarıyla oluşturuldu ve yayınlandı`
        : `${reviews.length} yorum başarıyla oluşturuldu ve onay için eklendi`;
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
      
      setAiSelectedSite("");
      setAiReviewCount("3");
      setAiReviewTone("neutral");
      setAiRatingMin("3");
      setAiRatingMax("5");
      setAiLanguage("tr");
      setAiAutoPublish(false);
    } catch (error) {
      console.error('AI yorum oluşturma hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Yorumlar oluşturulurken hata oluştu');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Render star rating (type-safe)
  const renderStars = (rating: number): JSX.Element[] => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
        }`}
      />
    ));
  };

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* AI Review Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI ile Otomatik Yorum Oluştur
          </CardTitle>
          <CardDescription>
            AI her yorum için benzersiz isimler ve farklı kullanıcı profilleri oluşturur. Organik ve gerçekçi yorumlar üretilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Site Seçin</label>
              <Select value={aiSelectedSite} onValueChange={setAiSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Bir site seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {bettingSites.map(site => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Yorum Tonu</label>
              <Select value={aiReviewTone} onValueChange={(value: "positive" | "negative" | "neutral") => setAiReviewTone(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">👍 Pozitif</SelectItem>
                  <SelectItem value="neutral">😐 Nötr</SelectItem>
                  <SelectItem value="negative">👎 Negatif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Puan Aralığı</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={aiRatingMin}
                  onChange={(e) => setAiRatingMin(e.target.value)}
                  className="w-20"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={aiRatingMax}
                  onChange={(e) => setAiRatingMax(e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">⭐</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Dil</label>
              <Select value={aiLanguage} onValueChange={(value: "tr" | "en") => setAiLanguage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                  <SelectItem value="en">🇬🇧 İngilizce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Yorum Sayısı</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={aiReviewCount}
                onChange={(e) => setAiReviewCount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="auto-publish"
              checked={aiAutoPublish}
              onCheckedChange={(checked) => setAiAutoPublish(checked as boolean)}
            />
            <label
              htmlFor="auto-publish"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Yorumları otomatik yayınla (onay beklemeden)
            </label>
          </div>

          <Button 
            onClick={handleAiGenerateReviews} 
            disabled={isAiLoading || !aiSelectedSite}
            className="w-full gap-2"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Yorumları Oluştur
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Site Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Site İstatistikleri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {siteStats.slice(0, 6).map(stat => (
            <Card key={stat.site_id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {stat.site_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Toplam:</span>
                  <span className="font-semibold">{stat.total_reviews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Onaylı:</span>
                  <span className="text-green-600">{stat.approved_reviews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bekleyen:</span>
                  <span className="text-yellow-600">{stat.pending_reviews}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Ort. Puan:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{stat.avg_rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Toplam {filteredReviews.length} yorum gösteriliyor
              {selectedReviews.size > 0 && (
                <span className="ml-2 text-primary font-medium">
                  ({selectedReviews.size} seçili)
                </span>
              )}
            </div>

            {selectedReviews.size > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkApprove}
                  disabled={isBulkActionLoading}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Onayla ({selectedReviews.size})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkReject}
                  disabled={isBulkActionLoading}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Reddet ({selectedReviews.size})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isBulkActionLoading}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Sil ({selectedReviews.size})
                </Button>
              </div>
            )}
          </div>

          {/* Reviews Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedReviews.size === filteredReviews.length && filteredReviews.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Puan</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Yorum bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map(review => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReviews.has(review.id)}
                          onCheckedChange={() => toggleReviewSelection(review.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {getSiteName(review)}
                      </TableCell>
                      <TableCell>
                        {getUserDisplayName(review)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {review.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.is_approved ? "default" : "secondary"}>
                          {review.is_approved ? "Onaylı" : "Beklemede"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(review.created_at), "dd MMM yyyy", { locale: tr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(review)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {!review.is_approved && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => approveMutation.mutate(review.id)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {review.is_approved && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => rejectMutation.mutate(review.id)}
                            >
                              <X className="h-4 w-4 text-yellow-600" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteReviewId(review.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <EnhancedTablePagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / pageSize)}
            pageSize={pageSize}
            totalItems={totalCount}
            onPageChange={(page) => {
              setCurrentPage(page);
              setSelectedReviews(new Set()); // Clear selection on page change
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1); // Reset to first page when changing page size
              setSelectedReviews(new Set());
            }}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yorumu Düzenle</DialogTitle>
            <DialogDescription>
              {editingReview ? getSiteName(editingReview) : 'Site'} için yapılan yorumu düzenleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Puan</label>
              <Select
                value={editForm.rating.toString()}
                onValueChange={(value) => setEditForm({ ...editForm, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Yıldız
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Başlık</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Yorum başlığı"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Yorum</label>
              <Textarea
                value={editForm.comment}
                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                placeholder="Yorum içeriği"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReview(null)}>
              İptal
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yorumu sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu yorumu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteReviewId && deleteMutation.mutate(deleteReviewId)}
              className="bg-destructive text-destructive-foreground"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
