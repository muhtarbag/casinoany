import { Card, CardContent } from '@/components/ui/card';

/**
 * DISABLED - Analytics removed for performance
 */
export function SitePerformanceCards() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          Site performans analizi performans iyileştirmesi için devre dışı bırakıldı.
        </p>
      </CardContent>
    </Card>
  );
}
