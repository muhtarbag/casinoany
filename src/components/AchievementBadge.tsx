import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  color: string;
  isEarned: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge = ({
  icon,
  name,
  description,
  color,
  isEarned,
  earnedAt,
  size = 'md'
}: AchievementBadgeProps) => {
  const Icon = (Icons as any)[icon] || Icons.Award;
  
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative rounded-full flex items-center justify-center border-2 transition-all cursor-help',
              sizeClasses[size],
              isEarned
                ? 'bg-gradient-to-br from-muted to-background shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-muted/30 border-dashed opacity-50 grayscale'
            )}
            style={{
              borderColor: isEarned ? color : undefined
            }}
          >
            <Icon
              className={cn(iconSizes[size], isEarned && 'drop-shadow-md')}
              style={{ color: isEarned ? color : undefined }}
            />
            {!isEarned && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-full">
                <Icons.Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" style={{ color }} />
              <p className="font-semibold">{name}</p>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            {isEarned && earnedAt && (
              <p className="text-xs text-muted-foreground">
                Kazanıldı: {new Date(earnedAt).toLocaleDateString('tr-TR')}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
