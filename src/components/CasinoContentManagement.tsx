import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { CasinoContentEditor } from './CasinoContentEditor';

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
      const { data, error } = await (supabase as any)
        .from('betting_sites')
        .select('pros, cons, verdict, expert_review, game_categories, login_guide, withdrawal_guide, faq')
        .eq('id', selectedSiteId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSiteId,
  });

  // Load content when site is selected
  useState(() => {
    if (siteContent) {
      setPros((siteContent.pros as string[]) || []);
      setCons((siteContent.cons as string[]) || []);
      setVerdict((siteContent.verdict as string) || '');
      setExpertReview((siteContent.expert_review as string) || '');
      setGameCategories((siteContent.game_categories as Record<string, string>) || {});
      setLoginGuide((siteContent.login_guide as string) || '');
      setWithdrawalGuide((siteContent.withdrawal_guide as string) || '');
      setFaq((siteContent.faq as Array<{ question: string; answer: string }>) || []);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSiteId) throw new Error('Site seçilmedi');
      
      const { error } = await (supabase as any)
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

  const handleSiteChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    // Reset content when changing site
    setPros([]);
    setCons([]);
    setVerdict('');
    setExpertReview('');
    setGameCategories({});
    setLoginGuide('');
    setWithdrawalGuide('');
    setFaq([]);
  };

  const handleSave = () => {
    updateMutation.mutate();
  };

  if (sitesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Casino İçerik Yönetimi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Site Seç</label>
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
