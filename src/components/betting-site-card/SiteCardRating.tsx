import { Star } from 'lucide-react';

interface SiteCardRatingProps {
  rating: number;
  reviewCount?: number;
}

export const SiteCardRating = ({ rating, reviewCount = 0 }: SiteCardRatingProps) => {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1 px-3 py-1.5 bg-gold/10 rounded-lg border border-gold/20">
        <Star className="w-4 h-4 fill-gold text-gold" />
        <span className="font-bold text-sm">{rating.toFixed(1)}</span>
      </div>
      {reviewCount > 0 && (
        <div className="text-xs text-muted-foreground">
          {reviewCount} yorum
        </div>
      )}
    </div>
  );
};
