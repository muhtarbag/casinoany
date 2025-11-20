import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSiteKeywords } from '@/hooks/queries/useSEOQueries';
import { TrendingUp, TrendingDown, Minus, Target, Search } from 'lucide-react';

interface KeywordTrackingTableProps {
  siteId: string;
}

export const KeywordTrackingTable = ({ siteId }: KeywordTrackingTableProps) => {
  const { data: keywords, isLoading } = useSiteKeywords(siteId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keyword Takibi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const targetKeywords = keywords?.filter(k => k.is_target_keyword) || [];
  const otherKeywords = keywords?.filter(k => !k.is_target_keyword) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Keyword Performansı
        </CardTitle>
        <CardDescription>
          {targetKeywords.length} hedef keyword, {otherKeywords.length} diğer keyword
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Hedef Keywords */}
          {targetKeywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Hedef Keywords
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead className="text-center">Sıralama</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead className="text-center">Hacim</TableHead>
                    <TableHead className="text-center">CTR</TableHead>
                    <TableHead className="text-center">Öncelik</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetKeywords.map((keyword) => (
                    <TableRow key={keyword.id}>
                      <TableCell className="font-medium">{keyword.keyword}</TableCell>
                      <TableCell className="text-center">
                        {keyword.current_rank ? (
                          <Badge variant="outline">#{keyword.current_rank}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(keyword.trend)}
                          {keyword.rank_change !== 0 && (
                            <span className="text-xs">
                              {Math.abs(keyword.rank_change)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {keyword.search_volume?.toLocaleString() || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {keyword.ctr ? `${keyword.ctr}%` : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getPriorityColor(keyword.priority)}>
                          {keyword.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Diğer Keywords - Sadece en iyi 5'i göster */}
          {otherKeywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">En İyi Performans Gösteren Diğer Keywords</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead className="text-center">Sıralama</TableHead>
                    <TableHead className="text-center">Tıklamalar</TableHead>
                    <TableHead className="text-center">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherKeywords.slice(0, 5).map((keyword) => (
                    <TableRow key={keyword.id}>
                      <TableCell className="font-medium">{keyword.keyword}</TableCell>
                      <TableCell className="text-center">
                        {keyword.current_rank ? (
                          <Badge variant="outline">#{keyword.current_rank}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{keyword.clicks || 0}</TableCell>
                      <TableCell className="text-center">
                        {keyword.ctr ? `${keyword.ctr}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {keywords?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Henüz keyword eklenmemiş</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
