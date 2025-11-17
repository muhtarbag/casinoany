import { memo } from 'react';
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    created_at: string;
    name?: string;
    email?: string;
    profiles?: {
      username: string;
      avatar_url: string | null;
    };
  };
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const ReviewCard = memo(({ review }: ReviewCardProps) => {
  const username = review.name || review.profiles?.username || "Anonim";
  const date = new Date(review.created_at).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card 
      className="bg-card border-border hover:border-primary/30 transition-colors"
      role="article"
      aria-label={`${username} tarafından ${review.rating} yıldız ile yapılan yorum`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <span className="text-sm font-bold text-foreground">{getInitials(username)}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{username}</p>
              <time className="text-xs text-muted-foreground" dateTime={review.created_at}>
                {date}
              </time>
            </div>
          </div>
          <div 
            className="flex items-center gap-0.5 flex-shrink-0"
            role="img"
            aria-label={`${review.rating} üzerinden 5 yıldız`}
          >
            {[...Array(5)].map((_, i) => (
              <Star 
                key={`star-${review.id}-${i}`} 
                className={`w-4 h-4 ${i < review.rating ? "fill-gold text-gold" : "fill-muted text-muted"}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h4 className="font-semibold mb-2 text-foreground">{review.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      </CardContent>
    </Card>
  );
});

ReviewCard.displayName = 'ReviewCard';

export default ReviewCard;
