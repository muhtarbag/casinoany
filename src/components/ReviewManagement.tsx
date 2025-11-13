import { useState } from "react";
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
import { Star, User, Check, X, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

      // Fetch related data
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

      // Combine data
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

      // Fetch related data
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

      // Combine data
      return reviewsData.map((review: any) => ({
        ...review,
        betting_sites: sites?.find((s: any) => s.id === review.site_id),
        profiles: profiles?.find((p: any) => p.id === review.user_id),
      }));
    },
  });

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("site_reviews" as any)
        .update({ is_approved: true })
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["site-reviews"] });
      toast({ title: "Başarılı", description: "Yorum onaylandı" });
    },
    onError: (error: Error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  // Reject (delete) review mutation
  const rejectMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("site_reviews" as any)
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({ title: "Başarılı", description: "Yorum reddedildi" });
    },
    onError: (error: Error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async (reviewIds: string[]) => {
      const { error } = await supabase
        .from("site_reviews" as any)
        .update({ is_approved: true })
        .in("id", reviewIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["site-reviews"] });
      setSelectedReviews([]);
      toast({ title: "Başarılı", description: `${selectedReviews.length} yorum onaylandı` });
    },
    onError: (error: Error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  // Bulk reject mutation
  const bulkRejectMutation = useMutation({
    mutationFn: async (reviewIds: string[]) => {
      const { error } = await supabase
        .from("site_reviews" as any)
        .delete()
        .in("id", reviewIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setSelectedReviews([]);
      toast({ title: "Başarılı", description: `${selectedReviews.length} yorum reddedildi` });
    },
    onError: (error: Error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  const toggleReviewSelection = (id: string) => {
    setSelectedReviews((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (reviews: any[]) => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map((r) => r.id));
    }
  };

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
                    <AlertDialogAction onClick={() => rejectMutation.mutate(review.id)}>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Yorum Yönetimi</h2>
          <p className="text-muted-foreground">
            Kullanıcı yorumlarını gözden geçirin ve onaylayın
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Onay Bekleyenler
            {pendingReviews && pendingReviews.length > 0 && (
              <Badge variant="secondary">{pendingReviews.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Onaylananlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {selectedReviews.length > 0 && (
            <Card className="bg-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="font-semibold">{selectedReviews.length} yorum seçildi</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => bulkApproveMutation.mutate(selectedReviews)}
                      disabled={bulkApproveMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Seçilenleri Onayla
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Seçilenleri Reddet
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {selectedReviews.length} yorum kalıcı olarak silinecek. Bu işlem geri
                            alınamaz.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => bulkRejectMutation.mutate(selectedReviews)}
                          >
                            Reddet ve Sil
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
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : pendingReviews && pendingReviews.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {pendingReviews.length} yorum onay bekliyor
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleSelectAll(pendingReviews)}
                >
                  {selectedReviews.length === pendingReviews.length
                    ? "Seçimi Kaldır"
                    : "Tümünü Seç"}
                </Button>
              </div>
              {pendingReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Onay bekleyen yorum bulunmuyor</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : approvedReviews && approvedReviews.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {approvedReviews.length} onaylanmış yorum (son 50)
              </p>
              {approvedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} showActions={false} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Henüz onaylanmış yorum bulunmuyor</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
