import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SiteCardFavoriteButtonProps {
  isFavorite: boolean;
  isToggling: boolean;
  name: string;
  onClick: (e: React.MouseEvent) => void;
}

export const SiteCardFavoriteButton = ({ 
  isFavorite, 
  isToggling, 
  name, 
  onClick 
}: SiteCardFavoriteButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full transition-all duration-200",
        "hover:scale-110 active:scale-95",
        isFavorite 
          ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" 
          : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
      )}
      onClick={onClick}
      disabled={isToggling}
      aria-label={isFavorite ? `${name} favorilerden çıkar` : `${name} favorilere ekle`}
    >
      <Heart 
        className={cn(
          "h-5 w-5 transition-all",
          isFavorite && "fill-current"
        )} 
        aria-hidden="true"
      />
    </Button>
  );
};
