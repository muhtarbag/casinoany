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
import { Star, Check, X, Trash2, Edit2, Search, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
  betting_sites?: { name: string };
  profiles?: { username: string };
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
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    rating: 5,
    title: "",
    comment: ""
  });
  
  // AI Generation States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSelectedSite, setAiSelectedSite] = useState<string>("");
  const [aiReviewCount, setAiReviewCount] = useState<string>("3");
  const [aiReviewTone, setAiReviewTone] = useState<"positive" | "negative" | "neutral">("neutral");
  const [aiRatingMin, setAiRatingMin] = useState<string>("3");
  const [aiRatingMax, setAiRatingMax] = useState<string>("5");
  const [aiLanguage, setAiLanguage] = useState<"tr" | "en">("tr");

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

  // Fetch all reviews with site and user data
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["enhanced-reviews"],
    queryFn: async () => {
      const { data: reviewsData, error } = await supabase
        .from("site_reviews")
        .select("*")
        .order("created_at", { ascending: false });

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
      const siteName = review.betting_sites?.name || "Bilinmeyen Site";

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

  // Filter reviews
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];

    return reviews.filter(review => {
      const matchesSearch = 
        searchTerm === "" ||
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.betting_sites?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesSite = selectedSite === "all" || review.site_id === selectedSite;
      
      const matchesStatus = 
        selectedStatus === "all" ||
        (selectedStatus === "pending" && !review.is_approved) ||
        (selectedStatus === "approved" && review.is_approved);

      return matchesSearch && matchesSite && matchesStatus;
    });
  }, [reviews, searchTerm, selectedSite, selectedStatus]);

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
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
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
        is_approved: false,
        user_id: null,
        email: null
      }));

      const { error: insertError } = await supabase
        .from('site_reviews')
        .insert(reviewsToInsert);

      if (insertError) throw insertError;

      toast.success(`${reviews.length} yorum başarıyla oluşturuldu ve onay için eklendi`);
      queryClient.invalidateQueries({ queryKey: ["enhanced-reviews"] });
      
      setAiSelectedSite("");
      setAiReviewCount("3");
      setAiReviewTone("neutral");
      setAiRatingMin("3");
      setAiRatingMax("5");
      setAiLanguage("tr");
    } catch (error) {
      console.error('AI yorum oluşturma hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Yorumlar oluşturulurken hata oluştu');
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderStars = (rating: number) => {
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
          <CardTitle>Yorum Yönetimi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Yorum ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="w-full md:w-[200px]">
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Onay Bekleyen</SelectItem>
                <SelectItem value="approved">Onaylanmış</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Toplam {filteredReviews.length} yorum gösteriliyor
          </div>

          {/* Reviews Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Yorum bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map(review => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {review.betting_sites?.name || "Bilinmeyen"}
                      </TableCell>
                      <TableCell>
                        {review.profiles?.username || review.name || "Anonim"}
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yorumu Düzenle</DialogTitle>
            <DialogDescription>
              {editingReview?.betting_sites?.name} için yapılan yorumu düzenleyin
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
