import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Sparkles, Layers } from 'lucide-react';
import { CasinoContentEditor } from './CasinoContentEditor';
import { BlockCustomization } from './casino/BlockCustomization';
import { ContentVersions } from './casino/ContentVersions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { lazyWithRetry } from '@/components/Performance/LazyComponent';

const BulkCasinoContentGenerator = lazyWithRetry(() => import('@/pages/admin/content/BulkCasinoContentGenerator'));

export const CasinoContentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [verdict, setVerdict] = useState('');
  const [expertReview, setExpertReview] = useState('');
  const [gameCategories, setGameCategories] = useState<Record<string, string>>({});
  const [loginGuide, setLoginGuide] = useState('');
  const [withdrawalGuide, setWithdrawalGuide] = useState('');
  const [faq, setFaq] = useState<Array<{ question: string; answer: string }>>([]);
  const [blockStyles, setBlockStyles] = useState<Record<string, { icon: string; color: string }>>({
    verdict: { icon: 'shield', color: '#3b82f6' },
    expertReview: { icon: 'fileText', color: '#8b5cf6' },
    gameOverview: { icon: 'gamepad', color: '#10b981' },
    loginGuide: { icon: 'login', color: '#f59e0b' },
    withdrawalGuide: { icon: 'wallet', color: '#06b6d4' },
    faq: { icon: 'help', color: '#ec4899' },
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // Fetch all sites
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['betting-sites-casino-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch selected site content
  const { data: siteContent, isLoading: contentLoading } = useQuery({
    queryKey: ['site-casino-content', selectedSiteId],
    queryFn: async () => {
      if (!selectedSiteId) return null;
      const { data, error } = await supabase
        .from('betting_sites')
        .select('pros, cons, verdict, expert_review, game_categories, login_guide, withdrawal_guide, faq, block_styles')
        .eq('id', selectedSiteId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSiteId,
  });

  // Load content when site is selected
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
      
      // Load block styles
      const styles = siteContent.block_styles as Record<string, { icon: string; color: string }>;
      if (styles) {
        setBlockStyles(styles);
      }
    }
  }, [siteContent]);

  // Bulk generate for all sites
  const generateBulkAI = useCallback(async () => {
    if (!sites || sites.length === 0) {
      toast({
        title: "Hata",
        description: "Henüz aktif site bulunmuyor",
        variant: "destructive",
      });
      return;
    }

    setIsBulkGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-casino-content', {
        body: { 
          mode: 'bulk',
          siteIds: sites.map((s: any) => s.id)
        }
      });

      if (error) throw error;

      toast({
        title: "Toplu İçerik Oluşturuldu",
        description: `${data.successCount || 0} site için içerik başarıyla oluşturuldu!`,
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['betting-sites-casino-content'] });
      if (selectedSiteId) {
        queryClient.invalidateQueries({ queryKey: ['site-casino-content', selectedSiteId] });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İçerik oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsBulkGenerating(false);
    }
  }, [sites, toast, queryClient, selectedSiteId]);

  const handleVersionRestore = useCallback((version: any) => {
    setPros(version.pros || []);
    setCons(version.cons || []);
    setVerdict(version.verdict || '');
    setExpertReview(version.expert_review || '');
    setGameCategories(version.game_categories || {});
    setLoginGuide(version.login_guide || '');
    setWithdrawalGuide(version.withdrawal_guide || '');
    setFaq(version.faq || []);
    if (version.block_styles) {
      setBlockStyles(version.block_styles);
    }
    
    queryClient.invalidateQueries({ queryKey: ['site-casino-content', selectedSiteId] });
  }, [selectedSiteId, queryClient]);

  // Generate content with AI
  const generateWithAI = useCallback(async () => {
    if (!selectedSiteId) return;
    
    const selectedSite = sites?.find(s => s.id === selectedSiteId);
    if (!selectedSite) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-casino-content', {
        body: {
          siteId: selectedSiteId,
          siteName: selectedSite.name || '',
          siteUrl: selectedSite.affiliate_link || '',
        },
      });

      if (error) throw error;

      if (data.success) {
        setPros(data.content.pros);
        setCons(data.content.cons);
        setVerdict(data.content.verdict);
        setExpertReview(data.content.expertReview);
        setGameCategories(data.content.gameCategories);
        setLoginGuide(data.content.loginGuide);
        setWithdrawalGuide(data.content.withdrawalGuide);
        setFaq(data.content.faq);

        toast({
          title: "Başarılı!",
          description: "AI ile casino içeriği oluşturuldu ve kaydedildi.",
        });

        queryClient.invalidateQueries({ queryKey: ['site-casino-content', selectedSiteId] });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İçerik oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSiteId, sites, toast, queryClient]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSiteId) throw new Error('Site seçilmedi');
      
      const { error } = await supabase
        .from('betting_sites')
        .update({
          pros: pros.filter(p => p.trim()),
          cons: cons.filter(c => c.trim()),
          verdict: verdict || null,
          expert_review: expertReview || null,
          game_categories: Object.keys(gameCategories).length > 0 ? gameCategories : null,
          login_guide: loginGuide || null,
          withdrawal_guide: withdrawalGuide || null,
          faq: faq.filter(f => f.question.trim() && f.answer.trim()).length > 0 
            ? faq.filter(f => f.question.trim() && f.answer.trim()) 
            : null,
          block_styles: blockStyles,
        })
        .eq('id', selectedSiteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      queryClient.invalidateQueries({ queryKey: ['site-casino-content', selectedSiteId] });
      toast({ title: 'Başarılı', description: 'Casino içeriği güncellendi.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    },
  });

  const handleSiteChange = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    setPros([]);
    setCons([]);
    setVerdict('');
    setExpertReview('');
    setGameCategories({});
    setLoginGuide('');
    setWithdrawalGuide('');
    setFaq([]);
  }, []);

  const handleSave = useCallback(() => {
    updateMutation.mutate();
  }, [updateMutation]);

  if (sitesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <BulkCasinoContentGenerator />
      </Suspense>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Casino İçerik Yönetimi</span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isBulkGenerating || !sites || sites.length === 0}
                  variant="default"
                  className="gap-2"
                >
                  <Layers className="w-4 h-4" />
                  {isBulkGenerating ? "Oluşturuluyor..." : "Toplu AI Oluştur"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Toplu İçerik Oluştur</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tüm aktif siteler için AI ile casino içeriği oluşturulacak. Bu işlem birkaç dakika sürebilir. Devam etmek istiyor musunuz?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={generateBulkAI}>
                    Oluştur
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Site Seç</label>
            <div className="flex gap-2">
              <Select value={selectedSiteId} onValueChange={handleSiteChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Bir site seçin" />
                </SelectTrigger>
                <SelectContent>
                  {sites?.map((site: any) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedSiteId && (
                <Button
                  onClick={generateWithAI}
                  disabled={isGenerating}
                  variant="outline"
                  className="gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? "Oluşturuluyor..." : "AI ile Oluştur"}
                </Button>
              )}
            </div>
          </div>

          {contentLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSiteId && !contentLoading && (
        <>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">İçerik Yönetimi</TabsTrigger>
              <TabsTrigger value="customization">Görsel Özelleştirme</TabsTrigger>
              <TabsTrigger value="versions">Versiyon Geçmişi</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <CasinoContentEditor
                pros={pros}
                setPros={setPros}
                cons={cons}
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

            <TabsContent value="customization" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BlockCustomization
                  blockName="Uzman Görüşü"
                  iconName={blockStyles.verdict?.icon || 'shield'}
                  iconColor={blockStyles.verdict?.color || '#3b82f6'}
                  onIconChange={(icon) => setBlockStyles(prev => ({
                    ...prev,
                    verdict: { ...prev.verdict, icon }
                  }))}
                  onColorChange={(color) => setBlockStyles(prev => ({
                    ...prev,
                    verdict: { ...prev.verdict, color }
                  }))}
                />

                <BlockCustomization
                  blockName="Detaylı İnceleme"
                  iconName={blockStyles.expertReview?.icon || 'fileText'}
                  iconColor={blockStyles.expertReview?.color || '#8b5cf6'}
                  onIconChange={(icon) => setBlockStyles(prev => ({
                    ...prev,
                    expertReview: { ...prev.expertReview, icon }
                  }))}
                  onColorChange={(color) => setBlockStyles(prev => ({
                    ...prev,
                    expertReview: { ...prev.expertReview, color }
                  }))}
                />

                <BlockCustomization
                  blockName="Oyun Çeşitleri"
                  iconName={blockStyles.gameOverview?.icon || 'gamepad'}
                  iconColor={blockStyles.gameOverview?.color || '#10b981'}
                  onIconChange={(icon) => setBlockStyles(prev => ({
                    ...prev,
                    gameOverview: { ...prev.gameOverview, icon }
                  }))}
                  onColorChange={(color) => setBlockStyles(prev => ({
                    ...prev,
                    gameOverview: { ...prev.gameOverview, color }
                  }))}
                />

                <BlockCustomization
                  blockName="Giriş Rehberi"
                  iconName={blockStyles.loginGuide?.icon || 'login'}
                  iconColor={blockStyles.loginGuide?.color || '#f59e0b'}
                  onIconChange={(icon) => setBlockStyles(prev => ({
                    ...prev,
                    loginGuide: { ...prev.loginGuide, icon }
                  }))}
                  onColorChange={(color) => setBlockStyles(prev => ({
                    ...prev,
                    loginGuide: { ...prev.loginGuide, color }
                  }))}
                />

                <BlockCustomization
                  blockName="Para Çekme Rehberi"
                  iconName={blockStyles.withdrawalGuide?.icon || 'wallet'}
                  iconColor={blockStyles.withdrawalGuide?.color || '#06b6d4'}
                  onIconChange={(icon) => setBlockStyles(prev => ({
                    ...prev,
                    withdrawalGuide: { ...prev.withdrawalGuide, icon }
                  }))}
                  onColorChange={(color) => setBlockStyles(prev => ({
                    ...prev,
                    withdrawalGuide: { ...prev.withdrawalGuide, color }
                  }))}
                />

                <BlockCustomization
                  blockName="SSS"
                  iconName={blockStyles.faq?.icon || 'help'}
                  iconColor={blockStyles.faq?.color || '#ec4899'}
                  onIconChange={(icon) => setBlockStyles(prev => ({
                    ...prev,
                    faq: { ...prev.faq, icon }
                  }))}
                  onColorChange={(color) => setBlockStyles(prev => ({
                    ...prev,
                    faq: { ...prev.faq, color }
                  }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="versions" className="space-y-6">
              <ContentVersions 
                siteId={selectedSiteId}
                onRestore={handleVersionRestore}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              size="lg"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
