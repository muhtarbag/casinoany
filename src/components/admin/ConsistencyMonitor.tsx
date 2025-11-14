import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAnalyticsConsistency } from '@/hooks/useAnalyticsConsistency';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const ConsistencyMonitor = () => {
  const { data: report, isLoading } = useAnalyticsConsistency();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Veri Tutarlılık Monitörü</CardTitle>
          <CardDescription>Analiz ediliyor...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!report) return null;

  const getScoreColor = (score: number): string => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      warning: 'default',
      info: 'secondary',
    } as const;
    return variants[severity as keyof typeof variants] || 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Veri Tutarlılık Monitörü</CardTitle>
            <CardDescription>
              Son kontrol: {new Date(report.timestamp).toLocaleString('tr-TR')}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(report.consistency_score)}`}>
              {report.consistency_score.toFixed(1)}/10
            </div>
            <p className="text-sm text-muted-foreground">Tutarlılık Skoru</p>
          </div>
        </div>
        <Progress 
          value={report.consistency_score * 10} 
          className="mt-4"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="text-2xl font-bold text-red-600">
              {report.summary.critical_issues}
            </div>
            <p className="text-sm text-muted-foreground">Kritik</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
            <div className="text-2xl font-bold text-yellow-600">
              {report.summary.warnings}
            </div>
            <p className="text-sm text-muted-foreground">Uyarı</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="text-2xl font-bold text-blue-600">
              {report.summary.info_issues}
            </div>
            <p className="text-sm text-muted-foreground">Bilgi</p>
          </div>
        </div>

        {/* Issues List */}
        {report.issues.length === 0 ? (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle>Tüm Kontroller Başarılı!</AlertTitle>
            <AlertDescription>
              Sistemde veri tutarsızlığı tespit edilmedi. Tüm analitik veriler doğru ve güncel.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Tespit Edilen Sorunlar:</h4>
            {report.issues.map((issue, index) => (
              <Alert key={index}>
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTitle className="mb-0">{issue.description}</AlertTitle>
                      <Badge variant={getSeverityBadge(issue.severity)}>
                        {issue.severity === 'critical' ? 'Kritik' : issue.severity === 'warning' ? 'Uyarı' : 'Bilgi'}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">
                      <div className="mt-2">
                        <strong>Etkilenen:</strong> {issue.affected_count} kayıt
                      </div>
                      <div className="mt-1 text-muted-foreground italic">
                        💡 {issue.recommendation}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
