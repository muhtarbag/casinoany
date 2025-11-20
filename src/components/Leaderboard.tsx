import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  limit?: number;
  showTitle?: boolean;
}

const tierColors = {
  bronze: 'text-amber-700',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-purple-500'
};

const rankIcons = {
  1: Trophy,
  2: Medal,
  3: Award
};

export const Leaderboard = ({ limit = 10, showTitle = true }: LeaderboardProps) => {
  const { data: leaderboard = [], isLoading } = useLeaderboard('all', limit);

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Liderlik Tablosu</CardTitle>
            <CardDescription>En aktif kullanıcılar</CardDescription>
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Liderlik Tablosu
          </CardTitle>
          <CardDescription>En çok puan toplayan kullanıcılar</CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Henüz lider yok</p>
          </div>
        ) : (
          leaderboard.map((entry) => {
            const RankIcon = rankIcons[entry.rank as keyof typeof rankIcons];
            const isTopThree = entry.rank && entry.rank <= 3;

            return (
              <div
                key={entry.user_id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors',
                  isTopThree && 'bg-gradient-to-r from-muted/50 to-transparent'
                )}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8">
                  {RankIcon ? (
                    <RankIcon
                      className={cn(
                        'h-5 w-5',
                        entry.rank === 1 && 'text-yellow-500',
                        entry.rank === 2 && 'text-gray-400',
                        entry.rank === 3 && 'text-amber-700'
                      )}
                    />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar_url} />
                  <AvatarFallback>
                    {entry.username?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.username}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className={cn('capitalize', tierColors[entry.tier as keyof typeof tierColors])}>
                      {entry.tier}
                    </span>
                    {' seviye'}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {entry.total_points.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">puan</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
