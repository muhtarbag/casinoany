import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';

interface Review {
  id: string;
  site_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface SiteDetailReviewsProps {
  site: any;
  reviews: Review[];
  user: any;
  averageRating: string;
}

export const SiteDetailReviews = ({ 
  site, 
  reviews, 
  user, 
  averageRating 
}: SiteDetailReviewsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-gold" />
          Kullanıcı Yorumları
        </CardTitle>
        <CardDescription>
          {reviews.length > 0 
            ? `${reviews.length} değerlendirme • Ortalama: ${averageRating}`
            : 'Henüz değerlendirme yok'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {user && <ReviewForm siteId={site.id} />}
        
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              İlk yorumu siz yapın! 🎉
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
