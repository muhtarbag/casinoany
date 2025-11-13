import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, Clock, Zap, TrendingUp, FileText, Code, Layout } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SEOAnalysis {
  score: number;
  summary: string;
  seo: {
    status: string;
    issues: string[];
    recommendations: string[];
  };
  serp: {
    estimatedPosition: string;
    opportunities: string[];
  };
  technical: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  content: {
    quality: string;
    missingTopics: string[];
    recommendations: string[];
  };
  ux: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  actions: Array<{
    title: string;
    description: string;
    impact: string;
    estimatedTime: string;
    autoFixable: boolean;
    category: string;
  }>;
}

interface AutoFixData {
  problem: string;
  targetFile?: string;
  currentState?: string;
}

export const AIAssistant = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Fetch sites for analysis
  const { data: sites } = useQuery({
    queryKey: ['betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Fetch blog count - using type assertion to avoid TS issues
      const blogResponse = await supabase
        .from('blog_posts' as any)
        .select('*', { count: 'exact', head: true });
      const blogCount = blogResponse.count || 0;

      const { data, error } = await supabase.functions.invoke('ai-site-monitor', {
        body: {
          action: 'analyze-seo',
          data: {
            siteUrl: window.location.origin,
            sites: sites?.map(s => ({ name: s.name, rating: s.rating })) || [],
            blogCount: blogCount || 0,
          }
        }
      });

      if (error) throw error;

      setAnalysis(data.data);
      
      // Save to history
      await supabase.from('ai_analysis_history' as any).insert({
        analysis_type: 'seo',
        score: data.data.score,
        summary: data.data.summary,
        seo_data: data.data.seo,
        serp_data: data.data.serp,
        technical_data: data.data.technical,
        content_data: data.data.content,
        ux_data: data.data.ux,
        actions: data.data.actions,
        provider: data.provider || 'openai',
      } as any);

      toast({
        title: "Analiz Tamamlandı",
        description: `AI Provider: ${data.provider === 'openai' ? 'OpenAI GPT-4o-mini' : 'Lovable AI Gemini'}`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analiz Hatası",
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAutoFix = async (action: any) => {
    setIsApplying(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-site-monitor', {
        body: {
          action: 'auto-fix',
          data: {
            problem: action.description,
            targetFile: action.category,
            currentState: 'Current implementation',
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Düzeltme Önerileri Hazır",
        description: "Önerilen değişiklikleri inceleyebilirsiniz.",
      });

      // Here you would show the suggested changes to the user
      console.log('Auto-fix suggestions:', data.data);
      setSelectedAction(null);
    } catch (error) {
      console.error('Auto-fix error:', error);
      toast({
        title: "Düzeltme Hatası",
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seo':
        return <TrendingUp className="w-4 h-4" />;
      case 'content':
        return <FileText className="w-4 h-4" />;
      case 'technical':
        return <Code className="w-4 h-4" />;
      case 'ux':
        return <Layout className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'yüksek':
        return 'destructive';
      case 'orta':
        return 'default';
      case 'düşük':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                AI Site Asistanı
              </CardTitle>
              <CardDescription>
                SEO, SERP ve kullanıcı deneyimi analizi - OpenAI & Lovable AI destekli
              </CardDescription>
            </div>
            <Button onClick={runAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Yeni Analiz
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!analysis && !isAnalyzing && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Henüz Analiz Yapılmadı</AlertTitle>
              <AlertDescription>
                Site performansınızı ve SEO durumunuzu analiz etmek için "Yeni Analiz" butonuna tıklayın.
              </AlertDescription>
            </Alert>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Genel Skor</span>
                  <span className="text-2xl font-bold text-primary">{analysis.score}/100</span>
                </div>
                <Progress value={analysis.score} className="h-2" />
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      SEO
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={analysis.seo.status === 'İyi' ? 'default' : 'destructive'}>
                      {analysis.seo.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      {analysis.seo.issues.length} sorun tespit edildi
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Teknik
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.technical.score}/100</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {analysis.technical.issues.length} iyileştirme önerisi
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      UX
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.ux.score}/100</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {analysis.ux.issues.length} geliştirme alanı
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* SERP Position */}
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Google SERP Pozisyonu (Tahmini)</AlertTitle>
                <AlertDescription>
                  {analysis.serp.estimatedPosition}
                  {analysis.serp.opportunities.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="font-medium text-sm">Fırsatlar:</p>
                      {analysis.serp.opportunities.map((opp, idx) => (
                        <p key={idx} className="text-xs">• {opp}</p>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* Action Items */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Önerilen Aksiyonlar</h3>
                {analysis.actions.map((action, idx) => (
                  <Card key={idx} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getCategoryIcon(action.category)}
                            {action.title}
                          </CardTitle>
                          <CardDescription>{action.description}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant={getImpactColor(action.impact)}>
                            {action.impact} Etki
                          </Badge>
                          {action.autoFixable && (
                            <Badge variant="outline" className="text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              Otomatik
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{action.estimatedTime}</span>
                        </div>
                        {action.autoFixable && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedAction(action)}
                          >
                            Uygula
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-fix confirmation dialog */}
      <AlertDialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Otomatik Düzeltme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2 mt-2">
                <p className="font-medium">{selectedAction?.title}</p>
                <p className="text-sm">{selectedAction?.description}</p>
                <div className="flex items-center gap-2 mt-4">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">
                    Bu işlem otomatik olarak kod değişiklikleri önerecektir. 
                    Değişiklikleri uygulamadan önce gözden geçirmeniz önerilir.
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedAction && applyAutoFix(selectedAction)}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Hazırlanıyor...
                </>
              ) : (
                'Devam Et'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
