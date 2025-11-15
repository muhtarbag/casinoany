import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface TopPage {
  page: string;
  views: number;
}

interface TopPagesTableProps {
  data: TopPage[];
}

export const TopPagesTable = memo(({ data }: TopPagesTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>En Çok Görüntülenen Sayfalar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((page, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-mono text-muted-foreground">#{index + 1}</span>
                <span className="text-sm truncate">{page.page}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">{page.views}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

TopPagesTable.displayName = 'TopPagesTable';
