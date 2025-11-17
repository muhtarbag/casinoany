import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { CasinoContentEditor } from '@/components/CasinoContentEditor';

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

  // Fetch site content
  const { data: siteContent, isLoading } = useQuery({
    queryKey: ['site-content', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('pros, cons, verdict, expert_review, game_categories, login_guide, withdrawal_guide, faq')
        .eq('id', siteId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!siteId,
  });

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
    }
  }, [siteContent]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', siteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content', siteId] });
      queryClient.invalidateQueries({ queryKey: ['owned-site-full'] });
      toast({
        title: 'Başarılı',
        description: 'İçerik başarıyla kaydedildi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İçerik kaydedilemedi',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site İçeriğini Düzenle</CardTitle>
          <CardDescription>
            Sitenizin detay sayfasında görünecek içerikleri buradan düzenleyebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
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
        </CardContent>
      </Card>
    </div>
  );
};
