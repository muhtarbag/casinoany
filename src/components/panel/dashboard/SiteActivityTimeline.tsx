import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Activity {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    created_at: string;
  }>;
  complaints: Array<{
    id: string;
    title: string;
    severity: string;
    created_at: string;
  }>;
}

interface SiteActivityTimelineProps {
  activity: Activity | undefined;
}

export const SiteActivityTimeline = ({ activity }: SiteActivityTimelineProps) => {
  if (!activity) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  const allActivities = [
    ...activity.reviews.map(review => ({
      id: review.id,
      type: 'review' as const,
      title: `${review.rating} yıldız değerlendirme`,
      description: review.comment?.substring(0, 100) || 'Yorum yok',
      date: review.created_at,
      severity: null,
    })),
    ...activity.complaints.map(complaint => ({
      id: complaint.id,
      type: 'complaint' as const,
      title: complaint.title,
      description: 'Yeni şikayet',
      date: complaint.created_at,
      severity: complaint.severity,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Son Yorumlar
          </CardTitle>
          <CardDescription>
            Son yapılan kullanıcı değerlendirmeleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.reviews.length > 0 ? (
              activity.reviews.map(review => (
                <div key={review.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { 
                        addSuffix: true,
                        locale: tr 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {review.comment || 'Yorum yapılmadı'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Henüz yorum bulunmuyor
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complaints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Son Şikayetler
          </CardTitle>
          <CardDescription>
            Kullanıcılar tarafından yapılan şikayetler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.complaints.length > 0 ? (
              activity.complaints.map(complaint => {
                const severityVariant = complaint.severity === 'high' 
                  ? 'destructive' 
                  : complaint.severity === 'medium' 
                  ? 'default' 
                  : 'secondary';
                
                return (
                  <div key={complaint.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={severityVariant}>
                        {complaint.severity === 'high' ? 'Yüksek' : 
                         complaint.severity === 'medium' ? 'Orta' : 'Düşük'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(complaint.created_at), { 
                          addSuffix: true,
                          locale: tr 
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-medium line-clamp-1">
                      {complaint.title}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Şikayet bulunmuyor
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Combined Timeline */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Tüm Aktiviteler</CardTitle>
          <CardDescription>
            Kronolojik sırayla tüm aktiviteler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {allActivities.length > 0 ? (
              allActivities.map(activity => (
                <div key={activity.id} className="flex gap-3 border-b pb-3 last:border-0">
                  <div className={`mt-1 p-2 rounded-full h-fit ${
                    activity.type === 'review' 
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {activity.type === 'review' ? (
                      <Star className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{activity.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.date), { 
                          addSuffix: true,
                          locale: tr 
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Henüz aktivite bulunmuyor
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
