import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, MessageCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  type: 'review';
}

interface Complaint {
  id: string;
  site_id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  created_at: string;
  type: 'complaint';
}

interface SiteDetailReviewsProps {
  site: any;
  reviews: Review[];
  complaints: Complaint[];
  user: any;
  averageRating: string;
}

export const SiteDetailReviews = ({ 
  site, 
  reviews, 
  complaints,
  user, 
  averageRating 
}: SiteDetailReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Combine and sort reviews and complaints by date
  const allItems = [...reviews, ...complaints].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const visibleItems = allItems.slice(0, 5);
  const hiddenItems = allItems.slice(5);

  const renderItem = (item: any) => {
    if (item.type === 'review') {
      return (
        <div key={item.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Yorum
            </Badge>
          </div>
          <ReviewCard review={item} />
        </div>
      );
    } else {
      // Complaint card
      return (
        <div key={item.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Şikayet
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.severity === 'high' ? 'Yüksek' : item.severity === 'medium' ? 'Orta' : 'Düşük'}
            </Badge>
          </div>
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-base">
                {item.title}
              </CardTitle>
              <CardDescription>
                {item.profiles?.username || 'Anonim'} • {new Date(item.created_at).toLocaleDateString('tr-TR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {item.status && (
                <Badge variant="secondary" className="mt-3">
                  Durum: {item.status === 'resolved' ? 'Çözüldü' : item.status === 'in_progress' ? 'İnceleniyor' : 'Beklemede'}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-gold" />
          Kullanıcı Yorumları & Şikayetler
        </CardTitle>
        <CardDescription>
          {allItems.length > 0 
            ? `${reviews.length} yorum, ${complaints.length} şikayet • Ortalama: ${averageRating}`
            : 'Henüz yorum veya şikayet yok'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {user ? (
          showReviewForm ? (
            <div className="space-y-4">
              <ReviewForm siteId={site.id} />
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
                className="w-full"
              >
                İptal
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setShowReviewForm(true)}
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Yorum Yaz
            </Button>
          )
        ) : (
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to="/login">
                <MessageCircle className="w-4 h-4 mr-2" />
                Yorum Yazmak İçin Giriş Yap
              </Link>
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          {allItems.length > 0 ? (
            <>
              {/* First 3 items visible */}
              {visibleItems.map(renderItem)}

              {/* Rest in accordion */}
              {hiddenItems.length > 0 && (
                <Accordion type="single" collapsible className="border rounded-lg">
                  <AccordionItem value="more-items" className="border-none px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="text-sm font-medium">
                        {hiddenItems.length} yorum ve şikayet daha göster
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-4">
                      {hiddenItems.map(renderItem)}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                İlk yorumu siz yapın! 🎉
              </p>
              {!user && (
                <div className="flex gap-2 justify-center">
                  <Button asChild variant="default">
                    <Link to="/login">Giriş Yap</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/signup">Kayıt Ol</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
