import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Star, User, Check, X, Trash2, Clock, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { VirtualList } from "@/components/VirtualList";

interface Review {
  id: string;
  site_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export default function ReviewManagement() {
  const queryClient = useQueryClient();
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSelectedSite, setAiSelectedSite] = useState<string>("");
  const [aiReviewCount, setAiReviewCount] = useState<string>("3");

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

  // Fetch pending reviews
  const { data: pendingReviews, isLoading: pendingLoading } = useQuery({
    queryKey: ["admin-reviews", "pending"],
    queryFn: async () => {
      const { data: reviewsData, error: reviewsError } = await (supabase as any)
        .from("site_reviews")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      const siteIds = reviewsData.map((r: any) => r.site_id);
      const userIds = reviewsData
        .map((r: any) => r.user_id)
        .filter((id: string | null) => id !== null);

      const { data: sites } = await (supabase as any)
        .from("betting_sites")
        .select("id, name")
        .in("id", siteIds);

      let profiles = [];
      if (userIds.length > 0) {
        const { data } = await (supabase as any)
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);
        profiles = data || [];
      }

      return reviewsData.map((review: any) => ({
        ...review,
        betting_sites: sites?.find((s: any) => s.id === review.site_id),
        profiles: profiles?.find((p: any) => p.id === review.user_id),
      }));
    },
  });

  // Fetch approved reviews
  const { data: approvedReviews, isLoading: approvedLoading } = useQuery({
    queryKey: ["admin-reviews", "approved"],
    queryFn: async () => {
      const { data: reviewsData, error: reviewsError } = await (supabase as any)
        .from("site_reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (reviewsError) throw reviewsError;

      const siteIds = reviewsData.map((r: any) => r.site_id);
      const userIds = reviewsData
        .map((r: any) => r.user_id)
        .filter((id: string | null) => id !== null);

      const { data: sites } = await (supabase as any)
        .from("betting_sites")
        .select("id, name")
        .in("id", siteIds);

      let profiles = [];
      if (userIds.length > 0) {
        const { data } = await (supabase as any)
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);
        profiles = data || [];
      }

      return reviewsData.map((review: any) => ({
        ...review,
        betting_sites: sites?.find((s: any) => s.id === review.site_id),
        profiles: profiles?.find((p: any) => p.id === review.user_id),
      }));
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await (supabase as any)
        .from("site_reviews")
        .update({ is_approved: true })
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({
        title: "Başarılı",
        description: "Yorum onaylandı",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "Yorum onaylanırken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await (supabase as any)
        .from("site_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({
        title: "Başarılı",
        description: "Yorum reddedildi ve silindi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "Yorum silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (reviewIds: string[]) => {
      const { error } = await (supabase as any)
        .from("site_reviews")
        .update({ is_approved: true })
        .in("id", reviewIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({
        title: "Başarılı",
        description: `${selectedReviews.length} yorum onaylandı`,
      });
      setSelectedReviews([]);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "Yorumlar onaylanırken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async (reviewIds: string[]) => {
      const { error } = await (supabase as any)
        .from("site_reviews")
        .delete()
        .in("id", reviewIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({
        title: "Başarılı",
        description: `${selectedReviews.length} yorum silindi`,
      });
      setSelectedReviews([]);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "Yorumlar silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const toggleReviewSelection = useCallback((reviewId: string) => {
    setSelectedReviews((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    );
  }, []);

  const toggleSelectAll = useCallback((reviews: any[]) => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map((r) => r.id));
    }
  }, [selectedReviews.length]);

  const handleAiGenerateReviews = useCallback(async () => {
    if (!aiSelectedSite) {
      toast({
        title: "Hata",
        description: "Lütfen bir site seçin",
        variant: "destructive",
      });
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
            count: parseInt(aiReviewCount)
          }
        }
      });

      if (aiError) throw aiError;
      if (!aiData?.success) throw new Error(aiData?.error || 'AI yanıtı alınamadı');

      const reviews = aiData.data.reviews;
      
      const reviewsToInsert = reviews.map((review: any) => ({
        site_id: aiSelectedSite,
        name: review.name,
        rating: Math.round(review.rating), // Convert to integer
        title: review.title,
        comment: review.comment,
        is_approved: false,
        user_id: null,
        email: null
      }));

      const { error: insertError } = await (supabase as any)
        .from('site_reviews')
        .insert(reviewsToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Başarılı",
        description: `${reviews.length} yorum başarıyla oluşturuldu ve onay için eklendi`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      
      setAiSelectedSite("");
      setAiReviewCount("3");
    } catch (error) {
      console.error('AI yorum oluşturma hatası:', error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : 'Yorumlar oluşturulurken hata oluştu',
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [aiSelectedSite, aiReviewCount, bettingSites, toast, queryClient]);

  const ReviewCard = ({ review, showActions = true }: { review: any; showActions?: boolean }) => {
    const username = review.name || review.profiles?.username || "Anonim";
    const avatarUrl = review.profiles?.avatar_url;
    const siteName = review.betting_sites?.name || "Bilinmeyen Site";
    const date = new Date(review.created_at).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Card className={selectedReviews.includes(review.id) ? "border-primary" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {showActions && (
                <Checkbox
                  checked={selectedReviews.includes(review.id)}
                  onCheckedChange={() => toggleReviewSelection(review.id)}
                />
              )}
              <Avatar>
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{username}</p>
                  <Badge variant="outline">{siteName}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{date}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold mb-2">{review.title}</h4>
          <p className="text-muted-foreground mb-4">{review.comment}</p>

          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => approveMutation.mutate(review.id)}
                disabled={approveMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                Onayla
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <X className="w-4 h-4 mr-2" />
                    Reddet
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Yorumu reddetmek istediğinize emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem geri alınamaz. Yorum kalıcı olarak silinecektir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => rejectMutation.mutate(review.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Reddet ve Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Yorum Yönetimi</h2>
        <p className="text-muted-foreground">
          Kullanıcı yorumlarını görüntüleyin, onaylayın veya silin.
        </p>
      </div>

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
          <div className="flex items-end gap-4">
            <div className="flex-1">
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
            
            <div className="w-32">
              <label className="text-sm font-medium mb-2 block">Yorum Sayısı</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={aiReviewCount}
                onChange={(e) => setAiReviewCount(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleAiGenerateReviews} 
              disabled={isAiLoading || !aiSelectedSite}
              className="gap-2"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Oluştur
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Onay Bekleyenler
            {pendingReviews && pendingReviews.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingReviews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Onaylananlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {selectedReviews.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedReviews.length === (pendingReviews?.length || 0)}
                      onCheckedChange={() => toggleSelectAll(pendingReviews || [])}
                    />
                    <span className="text-sm font-medium">
                      {selectedReviews.length} yorum seçildi
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => bulkApproveMutation.mutate(selectedReviews)}
                      disabled={bulkApproveMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Toplu Onayla
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Toplu Sil
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {selectedReviews.length} yorumu silmek istediğinize emin misiniz?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem geri alınamaz. Seçili yorumlar kalıcı olarak silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => bulkRejectMutation.mutate(selectedReviews)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {pendingLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-12 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !pendingReviews || pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Onay bekleyen yorum bulunmuyor</p>
              </CardContent>
            </Card>
          ) : (
            <VirtualList
              items={pendingReviews}
              height={600}
              estimateSize={200}
              renderItem={(review: any) => <ReviewCard key={review.id} review={review} />}
              className="rounded-lg space-y-4"
            />
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-12 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !approvedReviews || approvedReviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Onaylanmış yorum bulunmuyor</p>
              </CardContent>
            </Card>
          ) : (
            <VirtualList
              items={approvedReviews}
              height={600}
              estimateSize={200}
              renderItem={(review: any) => <ReviewCard key={review.id} review={review} showActions={false} />}
              className="rounded-lg space-y-4"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
