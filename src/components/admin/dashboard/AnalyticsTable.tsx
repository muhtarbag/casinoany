import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Award } from 'lucide-react';
import { SiteAnalytics } from '@/hooks/queries/useAnalyticsQueries';

interface AnalyticsTableProps {
  siteAnalytics: SiteAnalytics[];
}

type SortKey = 'site_name' | 'views' | 'clicks' | 'ctr' | 'revenue' | 'conversions';
type SortOrder = 'asc' | 'desc';

export const AnalyticsTable = ({ siteAnalytics }: AnalyticsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('clicks');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...siteAnalytics].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (sortKey === 'site_name') {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [siteAnalytics, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Find top performers
  const maxCTR = Math.max(...siteAnalytics.map(s => s.ctr));
  const maxRevenue = Math.max(...siteAnalytics.map(s => s.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detaylı Site Metrikleri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('site_name')}
                    className="h-8 -ml-4"
                  >
                    Site Adı
                    <SortIcon column="site_name" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('views')}
                    className="h-8"
                  >
                    Görüntülenme
                    <SortIcon column="views" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('clicks')}
                    className="h-8"
                  >
                    Tıklama
                    <SortIcon column="clicks" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('ctr')}
                    className="h-8"
                  >
                    CTR
                    <SortIcon column="ctr" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('revenue')}
                    className="h-8"
                  >
                    Gelir
                    <SortIcon column="revenue" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('conversions')}
                    className="h-8"
                  >
                    Dönüşüm
                    <SortIcon column="conversions" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((site) => (
                <TableRow key={site.site_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {site.logo_url && (
                        <img
                          src={site.logo_url}
                          alt={site.site_name}
                          className="w-8 h-8 rounded object-contain"
                        />
                      )}
                      {site.site_name}
                      {(site.ctr === maxCTR || site.revenue === maxRevenue) && (
                        <Award className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{site.views.toLocaleString('tr-TR')}</TableCell>
                  <TableCell className="text-right">{site.clicks.toLocaleString('tr-TR')}</TableCell>
                  <TableCell className="text-right">
                    <span className={site.ctr === maxCTR ? 'font-bold text-green-600 dark:text-green-400' : ''}>
                      {site.ctr.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={site.revenue === maxRevenue ? 'font-bold text-orange-600 dark:text-orange-400' : ''}>
                      {formatCurrency(site.revenue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{site.conversions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Sayfa {currentPage} / {totalPages} - Toplam {sortedData.length} site
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
