import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Eye, FileText, HelpCircle, Gamepad2, LogIn, Wallet, Award, AlertTriangle } from 'lucide-react';
import { CasinoContentEditor } from '@/components/CasinoContentEditor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdvancedContentEditor } from './content/AdvancedContentEditor';
import { siteContentSchema } from '@/lib/validation/siteContentSchema';

interface SiteContentEditorProps {
  siteId: string;
}

export const SiteContentEditor = ({ siteId }: SiteContentEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [verdict, setVerdict] = useState('');
  const [expertReview, setExpertReview] = useState('');
  const [gameCategories, setGameCategories] = useState<Record<string, string>>({});
  const [loginGuide, setLoginGuide] = useState('');
  const [withdrawalGuide, setWithdrawalGuide] = useState('');
  const [faq, setFaq] = useState<Array<{ question: string; answer: string }>>([]);
  const [blockStyles, setBlockStyles] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);
  const isFirstRender = useRef(true);

  // Fetch site content
  const { data: siteContent, isLoading } = useQuery({
    queryKey: ['site-content', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('pros, cons, verdict, expert_review, game_categories, login_guide, withdrawal_guide, faq, block_styles')
        .eq('id', siteId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!siteId,
  });

  // ✅ Real-time updates for content changes (silent mode)
  useEffect(() => {
    if (!siteId) return;

    const channel = supabase
      .channel('site-content-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'betting_sites',
          filter: `id=eq.${siteId}`
        },
        (payload) => {
          // Update local state with new data
          const newData = payload.new as any;
          if (newData) {
            setPros(newData.pros || []);
            setCons(newData.cons || []);
            setVerdict(newData.verdict || '');
            setExpertReview(newData.expert_review || '');
            setGameCategories(newData.game_categories || {});
            setLoginGuide(newData.login_guide || '');
            setWithdrawalGuide(newData.withdrawal_guide || '');
            setFaq(newData.faq || []);
            setBlockStyles(newData.block_styles || {});
            
            // Invalidate query to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['site-content', siteId] });
            
            // ✅ Silent update - no toast notification
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [siteId, queryClient]);

  // Load content when fetched
  useEffect(() => {
    if (siteContent) {
      setPros((siteContent.pros as string[]) || []);
      setCons((siteContent.cons as string[]) || []);
      setVerdict((siteContent.verdict as string) || '');
      setExpertReview((siteContent.expert_review as string) || '');
      setGameCategories((siteContent.game_categories as Record<string, string>) || {});
      setLoginGuide((siteContent.login_guide as string) || '');
      setWithdrawalGuide((siteContent.withdrawal_guide as string) || '');
      setFaq((siteContent.faq as Array<{ question: string; answer: string }>) || []);
      setBlockStyles((siteContent.block_styles as any) || {});
    }
  }, [siteContent]);

  // Track changes - ✅ Fixed: Skip first render and compare with original data
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (siteContent) {
      const hasActualChanges = 
        JSON.stringify(pros) !== JSON.stringify(siteContent.pros) ||
        JSON.stringify(cons) !== JSON.stringify(siteContent.cons) ||
        verdict !== (siteContent.verdict || '') ||
        expertReview !== (siteContent.expert_review || '') ||
        JSON.stringify(gameCategories) !== JSON.stringify(siteContent.game_categories || {}) ||
        loginGuide !== (siteContent.login_guide || '') ||
        withdrawalGuide !== (siteContent.withdrawal_guide || '') ||
        JSON.stringify(faq) !== JSON.stringify(siteContent.faq || []) ||
        JSON.stringify(blockStyles) !== JSON.stringify(siteContent.block_styles || {});
      
      setHasChanges(hasActualChanges);
    }
  }, [pros, cons, verdict, expertReview, gameCategories, loginGuide, withdrawalGuide, faq, blockStyles, siteContent]);

  // Save mutation with validation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // ✅ VALIDATE before saving
      const validationResult = siteContentSchema.safeParse({
        pros,
        cons,
        verdict,
        expertReview,
        gameCategories,
        loginGuide,
        withdrawalGuide,
        faq,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join('\n');
        throw new Error(`Lütfen aşağıdaki hataları düzeltin:\n\n${errors}`);
      }

      const { error } = await supabase
        .from('betting_sites')
        .update({
          pros,
          cons,
          verdict,
          expert_review: expertReview,
          game_categories: gameCategories,
          login_guide: loginGuide,
          withdrawal_guide: withdrawalGuide,
          faq,
          block_styles: blockStyles,
          updated_at: new Date().toISOString(),
        })
        .eq('id', siteId);

      if (error) throw error;
    },
    onSuccess: () => {
      // ✅ OPTIMIZED: Optimistic update to prevent unnecessary refetch
      queryClient.setQueryData(['site-content', siteId], {
        pros,
        cons,
        verdict,
        expert_review: expertReview,
        game_categories: gameCategories,
        login_guide: loginGuide,
        withdrawal_guide: withdrawalGuide,
        faq,
        block_styles: blockStyles,
      });
      
      // Only invalidate parent query
      queryClient.invalidateQueries({ queryKey: ['owned-site-full'] });
      
      setHasChanges(false);
      isFirstRender.current = true; // Reset first render flag
      toast({
        title: 'Başarılı',
        description: 'İçerik başarıyla kaydedildi',
      });
    },
    onError: (error: any) => {
      // ✅ Show detailed validation errors
      toast({
        title: 'Kaydetme Başarısız',
        description: error.message || 'İçerik kaydedilemedi',
        variant: 'destructive',
        duration: 10000, // Show for 10 seconds
      });
      
      console.error('Save error:', error);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const contentStats = {
    prosCount: pros.length,
    consCount: cons.length,
    faqCount: faq.length,
    gamesCount: Object.keys(gameCategories).length,
    hasExpertReview: !!expertReview,
    hasVerdict: !!verdict,
    hasLoginGuide: !!loginGuide,
    hasWithdrawalGuide: !!withdrawalGuide,
  };

  const completionPercentage = Math.round(
    ((contentStats.prosCount > 0 ? 1 : 0) +
      (contentStats.consCount > 0 ? 1 : 0) +
      (contentStats.hasExpertReview ? 1 : 0) +
      (contentStats.hasVerdict ? 1 : 0) +
      (contentStats.hasLoginGuide ? 1 : 0) +
      (contentStats.hasWithdrawalGuide ? 1 : 0) +
      (contentStats.faqCount > 0 ? 1 : 0) +
      (contentStats.gamesCount > 0 ? 1 : 0)) /
      8 *
      100
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>İçerik Yönetimi</span>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="text-sm text-muted-foreground font-normal">
                  Kaydedilmemiş değişiklikler
                </span>
              )}
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !hasChanges}
                size="sm"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Site içeriğinizi düzenleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <p className="text-sm text-muted-foreground">İçerik Tamamlama</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{contentStats.prosCount + contentStats.consCount}</div>
              <p className="text-sm text-muted-foreground">Artı/Eksi Özellik</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{contentStats.faqCount}</div>
              <p className="text-sm text-muted-foreground">SSS Sorusu</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{contentStats.gamesCount}</div>
              <p className="text-sm text-muted-foreground">Oyun Kategorisi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Warning */}
      {completionPercentage < 50 && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            İçerik tamamlama oranınız düşük. Kullanıcılara daha iyi bir deneyim sunmak için tüm bölümleri doldurun.
          </AlertDescription>
        </Alert>
      )}

      {/* Content Editor Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="expert" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="expert" className="gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Uzman</span>
              </TabsTrigger>
              <TabsTrigger value="games" className="gap-2">
                <Gamepad2 className="h-4 w-4" />
                <span className="hidden sm:inline">Oyunlar</span>
              </TabsTrigger>
              <TabsTrigger value="login" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Giriş</span>
              </TabsTrigger>
              <TabsTrigger value="withdrawal" className="gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Çekim</span>
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">SSS</span>
              </TabsTrigger>
              <TabsTrigger value="verdict" className="gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Değerlendirme</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Gelişmiş</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expert" className="space-y-4">
              <CasinoContentEditor
                pros={pros}
                cons={cons}
                setPros={setPros}
                setCons={setCons}
                verdict={verdict}
                setVerdict={setVerdict}
                expertReview={expertReview}
                setExpertReview={setExpertReview}
                gameCategories={gameCategories}
                setGameCategories={setGameCategories}
                loginGuide={loginGuide}
                setLoginGuide={setLoginGuide}
                withdrawalGuide={withdrawalGuide}
                setWithdrawalGuide={setWithdrawalGuide}
                faq={faq}
                setFaq={setFaq}
              />
            </TabsContent>

            <TabsContent value="games" className="space-y-4">
              <CasinoContentEditor
                pros={pros}
                cons={cons}
                setPros={setPros}
                setCons={setCons}
                verdict={verdict}
                setVerdict={setVerdict}
                expertReview={expertReview}
                setExpertReview={setExpertReview}
                gameCategories={gameCategories}
                setGameCategories={setGameCategories}
                loginGuide={loginGuide}
                setLoginGuide={setLoginGuide}
                withdrawalGuide={withdrawalGuide}
                setWithdrawalGuide={setWithdrawalGuide}
                faq={faq}
                setFaq={setFaq}
              />
            </TabsContent>

            <TabsContent value="login" className="space-y-4">
              <CasinoContentEditor
                pros={pros}
                cons={cons}
                setPros={setPros}
                setCons={setCons}
                verdict={verdict}
                setVerdict={setVerdict}
                expertReview={expertReview}
                setExpertReview={setExpertReview}
                gameCategories={gameCategories}
                setGameCategories={setGameCategories}
                loginGuide={loginGuide}
                setLoginGuide={setLoginGuide}
                withdrawalGuide={withdrawalGuide}
                setWithdrawalGuide={setWithdrawalGuide}
                faq={faq}
                setFaq={setFaq}
              />
            </TabsContent>

            <TabsContent value="withdrawal" className="space-y-4">
              <CasinoContentEditor
                pros={pros}
                cons={cons}
                setPros={setPros}
                setCons={setCons}
                verdict={verdict}
                setVerdict={setVerdict}
                expertReview={expertReview}
                setExpertReview={setExpertReview}
                gameCategories={gameCategories}
                setGameCategories={setGameCategories}
                loginGuide={loginGuide}
                setLoginGuide={setLoginGuide}
                withdrawalGuide={withdrawalGuide}
                setWithdrawalGuide={setWithdrawalGuide}
                faq={faq}
                setFaq={setFaq}
              />
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              <CasinoContentEditor
                pros={pros}
                cons={cons}
                setPros={setPros}
                setCons={setCons}
                verdict={verdict}
                setVerdict={setVerdict}
                expertReview={expertReview}
                setExpertReview={setExpertReview}
                gameCategories={gameCategories}
                setGameCategories={setGameCategories}
                loginGuide={loginGuide}
                setLoginGuide={setLoginGuide}
                withdrawalGuide={withdrawalGuide}
                setWithdrawalGuide={setWithdrawalGuide}
                faq={faq}
                setFaq={setFaq}
              />
            </TabsContent>

            <TabsContent value="verdict" className="space-y-4">
              <CasinoContentEditor
                pros={pros}
                cons={cons}
                setPros={setPros}
                setCons={setCons}
                verdict={verdict}
                setVerdict={setVerdict}
                expertReview={expertReview}
                setExpertReview={setExpertReview}
                gameCategories={gameCategories}
                setGameCategories={setGameCategories}
                loginGuide={loginGuide}
                setLoginGuide={setLoginGuide}
                withdrawalGuide={withdrawalGuide}
                setWithdrawalGuide={setWithdrawalGuide}
                faq={faq}
                setFaq={setFaq}
              />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <AdvancedContentEditor
                blockStyles={blockStyles}
                onStylesChange={setBlockStyles}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
