import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSuperLigFixtures } from '@/hooks/queries/useSuperLigQueries';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function SuperLigFixtures() {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const { data: fixtures, isLoading } = useSuperLigFixtures('2024-2025', selectedWeek);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      scheduled: { label: 'Oynanacak', variant: 'secondary' },
      live: { label: 'Canlı', variant: 'destructive' },
      finished: { label: 'Bitti', variant: 'default' },
      postponed: { label: 'Ertelendi', variant: 'outline' },
    };
    
    const { label, variant } = statusMap[status] || { label: status, variant: 'default' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Süper Lig Fikstürü
            </CardTitle>
            <CardDescription>Haftalık maç programı</CardDescription>
          </div>
          <Select
            value={selectedWeek.toString()}
            onValueChange={(value) => setSelectedWeek(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Hafta seç" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 38 }, (_, i) => i + 1).map((week) => (
                <SelectItem key={week} value={week.toString()}>
                  {week}. Hafta
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fixtures && fixtures.length > 0 ? (
            fixtures.map((fixture: any) => (
              <Card key={fixture.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {fixture.home_team?.logo_url && (
                        <img 
                          src={fixture.home_team.logo_url} 
                          alt={fixture.home_team.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <span className="font-semibold text-lg">
                        {fixture.home_team?.name || 'Bilinmeyen'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 px-6">
                    {fixture.status === 'finished' ? (
                      <div className="text-2xl font-bold">
                        {fixture.home_score} - {fixture.away_score}
                      </div>
                    ) : (
                      <>
                        {fixture.match_date && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(fixture.match_date), 'dd MMM HH:mm', { locale: tr })}
                          </div>
                        )}
                        <div className="text-xl font-bold text-muted-foreground">VS</div>
                      </>
                    )}
                    {getStatusBadge(fixture.status)}
                  </div>

                  <div className="flex-1 flex justify-end">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg text-right">
                        {fixture.away_team?.name || 'Bilinmeyen'}
                      </span>
                      {fixture.away_team?.logo_url && (
                        <img 
                          src={fixture.away_team.logo_url} 
                          alt={fixture.away_team.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                {fixture.venue && (
                  <div className="mt-2 text-sm text-muted-foreground text-center">
                    📍 {fixture.venue}
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedWeek}. hafta için henüz fikstür verisi bulunmamaktadır
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
