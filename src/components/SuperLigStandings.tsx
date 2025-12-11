import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useSuperLigStandings } from '@/hooks/queries/useSuperLigQueries';
import { Trophy } from 'lucide-react';
import { SuperLigSyncButton } from './SuperLigSyncButton';
import { useAuth } from '@/contexts/AuthContext';

export function SuperLigStandings() {
  const { data: standings, isLoading } = useSuperLigStandings();
  const { isAdmin } = useAuth();

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
              <Trophy className="h-5 w-5 text-primary" />
              Süper Lig Puan Durumu 2024-2025
            </CardTitle>
            <CardDescription>
              Güncel puan durumu ve takım istatistikleri
            </CardDescription>
          </div>
          {isAdmin && <SuperLigSyncButton />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Sıra</TableHead>
                <TableHead>Takım</TableHead>
                <TableHead className="text-center">O</TableHead>
                <TableHead className="text-center">G</TableHead>
                <TableHead className="text-center">B</TableHead>
                <TableHead className="text-center">M</TableHead>
                <TableHead className="text-center">A</TableHead>
                <TableHead className="text-center">Y</TableHead>
                <TableHead className="text-center">AV</TableHead>
                <TableHead className="text-center font-bold">P</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings && standings.length > 0 ? (
                standings.map((standing: any) => (
                  <TableRow key={standing.id}>
                    <TableCell className="font-medium">
                      {standing.position}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {standing.team?.logo_url && (
                          <img 
                            src={standing.team.logo_url} 
                            alt={standing.team.name}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span className="font-medium">
                          {standing.team?.name || 'Bilinmeyen'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{standing.played}</TableCell>
                    <TableCell className="text-center text-green-600">{standing.won}</TableCell>
                    <TableCell className="text-center text-yellow-600">{standing.drawn}</TableCell>
                    <TableCell className="text-center text-red-600">{standing.lost}</TableCell>
                    <TableCell className="text-center">{standing.goals_for}</TableCell>
                    <TableCell className="text-center">{standing.goals_against}</TableCell>
                    <TableCell className="text-center">{standing.goal_difference}</TableCell>
                    <TableCell className="text-center font-bold">{standing.points}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Henüz puan durumu verisi bulunmamaktadır
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p><strong>O:</strong> Oynanan Maç, <strong>G:</strong> Galibiyet, <strong>B:</strong> Beraberlik, <strong>M:</strong> Mağlubiyet</p>
          <p><strong>A:</strong> Atılan Gol, <strong>Y:</strong> Yenilen Gol, <strong>AV:</strong> Averaj, <strong>P:</strong> Puan</p>
        </div>
      </CardContent>
    </Card>
  );
}
