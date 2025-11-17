import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2, Edit, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

export default function Reviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('site_reviews')
        .select(`
          *,
          betting_sites (
            name,
            slug,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('site_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      toast.success('Yorum başarıyla silindi');
    },
    onError: () => {
      toast.error('Yorum silinirken bir hata oluştu');
    }
  });

  if (!user) {
    return (
      <ProfileLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Yorumlarınızı görmek için lütfen giriş yapın.
            </p>
            <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
          </CardContent>
        </Card>
      </ProfileLayout>
    );
  }

  if (isLoading) {
    return (
      <ProfileLayout>
        <ProfileSkeleton />
      </ProfileLayout>
    );
  }

  return (
    <>
      <SEO 
        title="Yorumlarım"
        description="Site yorumlarınızı görüntüleyin ve yönetin"
      />
      <ProfileLayout>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Yorumlarım</CardTitle>
            <CardDescription>
              Bahis sitelerine yaptığınız yorumları görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
        </Card>

          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {review.betting_sites?.logo_url && (
                          <img 
                            src={review.betting_sites.logo_url} 
                            alt={review.betting_sites.name}
                            className="w-12 h-12 rounded object-contain"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">
                            {review.betting_sites?.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-gold text-gold'
                                      : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                              {review.is_approved ? 'Onaylandı' : 'Onay Bekliyor'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        disabled={deleteReviewMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">{review.title}</h3>
                    <p className="text-muted-foreground mb-4">{review.comment}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Henüz yorum yapmadınız
                </p>
                <Button onClick={() => navigate('/')}>
                  Siteleri Keşfet
                </Button>
              </CardContent>
            </Card>
          )}
      </ProfileLayout>
    </>
  );
}
