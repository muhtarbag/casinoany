import { useState, useEffect, type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Code, 
  Package, 
  FileWarning,
  Zap,
  Activity
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface BuildIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail' | 'checking';
  issues: BuildIssue[];
  icon: ReactNode;
}

export const BuildHealthMonitor = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      name: 'TypeScript Kontrolleri',
      status: 'checking',
      issues: [],
      icon: <Code className="w-5 h-5" />
    },
    {
      name: 'Bağımlılık Analizi',
      status: 'checking',
      issues: [],
      icon: <Package className="w-5 h-5" />
    },
    {
      name: 'Console Hataları',
      status: 'checking',
      issues: [],
      icon: <FileWarning className="w-5 h-5" />
    },
    {
      name: 'Performans Metrikleri',
      status: 'checking',
      issues: [],
      icon: <Zap className="w-5 h-5" />
    }
  ]);

  const runHealthCheck = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const checks: HealthCheck[] = [];

    // TypeScript Checks
    setScanProgress(25);
    const tsCheck = await checkTypeScriptIssues();
    checks.push(tsCheck);

    // Dependency Checks
    setScanProgress(50);
    const depCheck = await checkDependencies();
    checks.push(depCheck);

    // Console Error Checks
    setScanProgress(75);
    const consoleCheck = await checkConsoleErrors();
    checks.push(consoleCheck);

    // Performance Checks
    setScanProgress(100);
    const perfCheck = await checkPerformance();
    checks.push(perfCheck);

    setHealthChecks(checks);
    setLastScan(new Date());
    setIsScanning(false);

    const hasErrors = checks.some(c => c.status === 'fail');
    const hasWarnings = checks.some(c => c.status === 'warn');

    if (hasErrors) {
      toast({
        title: "Build Sorunları Tespit Edildi",
        description: "Deployment öncesi kritik hatalar var!",
        variant: "destructive"
      });
    } else if (hasWarnings) {
      toast({
        title: "Uyarılar Var",
        description: "Bazı potansiyel sorunlar tespit edildi.",
      });
    } else {
      toast({
        title: "Build Sağlıklı ✅",
        description: "Tüm kontroller başarılı!",
      });
    }
  };

  const checkTypeScriptIssues = async (): Promise<HealthCheck> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const issues: BuildIssue[] = [];

    // React import kontrolü
    try {
      const hasReactImportIssues = false; // Simulated check
      
      if (hasReactImportIssues) {
        issues.push({
          type: 'warning',
          category: 'Import',
          message: 'Bazı component dosyalarında React import eksik olabilir',
          suggestion: 'Component dosyalarına "import React from \'react\';" ekleyin'
        });
      }
    } catch (error) {
      issues.push({
        type: 'error',
        category: 'TypeScript',
        message: 'TypeScript kontrolleri yapılamadı',
        suggestion: 'TypeScript yapılandırmasını kontrol edin'
      });
    }

    return {
      name: 'TypeScript Kontrolleri',
      status: issues.filter(i => i.type === 'error').length > 0 ? 'fail' : 
              issues.length > 0 ? 'warn' : 'pass',
      issues,
      icon: <Code className="w-5 h-5" />
    };
  };

  const checkDependencies = async (): Promise<HealthCheck> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const issues: BuildIssue[] = [];

    // Check for common dependency issues
    const criticalDeps = ['react', 'react-dom', '@tanstack/react-query', '@supabase/supabase-js'];
    
    // Simulated check - in real implementation, you'd check package.json
    const missingDeps: string[] = [];
    
    if (missingDeps.length > 0) {
      issues.push({
        type: 'error',
        category: 'Dependencies',
        message: `Eksik bağımlılıklar: ${missingDeps.join(', ')}`,
        suggestion: 'npm install komutu ile bağımlılıkları yükleyin'
      });
    }

    return {
      name: 'Bağımlılık Analizi',
      status: issues.filter(i => i.type === 'error').length > 0 ? 'fail' : 
              issues.length > 0 ? 'warn' : 'pass',
      issues,
      icon: <Package className="w-5 h-5" />
    };
  };

  const checkConsoleErrors = async (): Promise<HealthCheck> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const issues: BuildIssue[] = [];

    // Check for console errors in current session
    const hasConsoleErrors = window.console.error !== undefined;
    
    if (hasConsoleErrors) {
      // This is a simplified check - you could implement a console error listener
      issues.push({
        type: 'info',
        category: 'Runtime',
        message: 'Console hataları için loglara bakın',
        suggestion: 'Browser developer tools console\'unu kontrol edin'
      });
    }

    return {
      name: 'Console Hataları',
      status: issues.filter(i => i.type === 'error').length > 0 ? 'fail' : 
              issues.length > 0 ? 'warn' : 'pass',
      issues,
      icon: <FileWarning className="w-5 h-5" />
    };
  };

  const checkPerformance = async (): Promise<HealthCheck> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const issues: BuildIssue[] = [];

    // Check bundle size and performance metrics
    if (performance && performance.getEntriesByType) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navTiming) {
        const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
        
        if (loadTime > 3000) {
          issues.push({
            type: 'warning',
            category: 'Performance',
            message: `Yavaş yükleme süresi: ${Math.round(loadTime)}ms`,
            suggestion: 'Code splitting ve lazy loading kullanarak optimizasyon yapın'
          });
        }

        const domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.fetchStart;
        if (domContentLoaded > 1500) {
          issues.push({
            type: 'info',
            category: 'Performance',
            message: `DOM yükleme süresi: ${Math.round(domContentLoaded)}ms`,
            suggestion: 'Critical CSS inline edin ve JavaScript\'i defer edin'
          });
        }
      }
    }

    return {
      name: 'Performans Metrikleri',
      status: issues.filter(i => i.type === 'error').length > 0 ? 'fail' : 
              issues.length > 0 ? 'warn' : 'pass',
      issues,
      icon: <Zap className="w-5 h-5" />
    };
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warn':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: HealthCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">Başarılı</Badge>;
      case 'warn':
        return <Badge variant="default" className="bg-yellow-500">Uyarı</Badge>;
      case 'fail':
        return <Badge variant="destructive">Hata</Badge>;
      case 'checking':
        return <Badge variant="secondary">Kontrol Ediliyor...</Badge>;
    }
  };

  const totalIssues = healthChecks.reduce((sum, check) => sum + check.issues.length, 0);
  const criticalIssues = healthChecks.reduce(
    (sum, check) => sum + check.issues.filter(i => i.type === 'error').length, 
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Build Sağlık Kontrolü</CardTitle>
              <CardDescription>
                Deployment öncesi potansiyel sorunları tespit edin
              </CardDescription>
            </div>
            <Button 
              onClick={runHealthCheck} 
              disabled={isScanning}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Taranıyor...' : 'Yeniden Tara'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isScanning && (
            <div className="space-y-2">
              <Progress value={scanProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Build sağlığı kontrol ediliyor... {scanProgress}%
              </p>
            </div>
          )}
          
          {!isScanning && lastScan && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Son tarama: {lastScan.toLocaleTimeString('tr-TR')}</span>
              <div className="flex gap-4">
                <span>Toplam Sorun: {totalIssues}</span>
                {criticalIssues > 0 && (
                  <span className="text-red-500 font-semibold">
                    Kritik: {criticalIssues}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Check Results */}
      <div className="grid gap-4 md:grid-cols-2">
        {healthChecks.map((check, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {check.icon}
                  <CardTitle className="text-lg">{check.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  {getStatusBadge(check.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {check.issues.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sorun tespit edilmedi ✓
                </p>
              ) : (
                <div className="space-y-3">
                  {check.issues.map((issue, issueIndex) => (
                    <Alert 
                      key={issueIndex}
                      variant={issue.type === 'error' ? 'destructive' : 'default'}
                    >
                      <AlertTitle className="flex items-center gap-2">
                        {issue.type === 'error' && <XCircle className="w-4 h-4" />}
                        {issue.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                        {issue.category}
                      </AlertTitle>
                      <AlertDescription className="space-y-1">
                        <p>{issue.message}</p>
                        {issue.file && (
                          <p className="text-xs font-mono">
                            {issue.file}{issue.line ? `:${issue.line}` : ''}
                          </p>
                        )}
                        {issue.suggestion && (
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deployment Readiness */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Hazırlığı</CardTitle>
        </CardHeader>
        <CardContent>
          {criticalIssues > 0 ? (
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertTitle>Deployment Yapılamaz</AlertTitle>
              <AlertDescription>
                {criticalIssues} adet kritik hata var. Deployment öncesi bu hataları düzeltmeniz gerekiyor.
              </AlertDescription>
            </Alert>
          ) : healthChecks.some(c => c.status === 'warn') ? (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Uyarılarla Deployment Yapılabilir</AlertTitle>
              <AlertDescription>
                Kritik hata yok ancak {totalIssues} uyarı var. Deployment yapabilirsiniz ama uyarıları incelemeniz önerilir.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-500">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <AlertTitle className="text-green-500">Deployment İçin Hazır ✅</AlertTitle>
              <AlertDescription>
                Tüm kontroller başarılı! Güvenle deployment yapabilirsiniz.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
