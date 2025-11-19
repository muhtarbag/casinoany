import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';

interface GeneratedContent {
  bonus: string;
  features: string[];
  pros: string[];
  cons: string[];
  expert_review: string;
  verdict: string;
  login_guide: string;
  withdrawal_guide: string;
  faq: Array<{ question: string; answer: string }>;
}

interface AIContentGeneratorProps {
  onContentGenerated: (content: GeneratedContent) => void;
  siteName?: string;
}

export const AIContentGenerator = ({ onContentGenerated, siteName: initialSiteName = '' }: AIContentGeneratorProps) => {
  const [siteName, setSiteName] = useState(initialSiteName);
  const [siteUrl, setSiteUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!siteName.trim()) {
      showErrorToast('Lütfen site adı girin');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-betting-site-content', {
        body: { siteName, siteUrl }
      });

      if (error) {
        if (error.message?.includes('429')) {
          showErrorToast('Rate limit aşıldı, lütfen daha sonra tekrar deneyin');
        } else if (error.message?.includes('402')) {
          showErrorToast('AI kredisi yetersiz, lütfen workspace\'e kredi ekleyin');
        } else {
          throw error;
        }
        return;
      }

      if (data?.content) {
        onContentGenerated(data.content);
        showSuccessToast('AI içerik başarıyla oluşturuldu!');
      } else {
        throw new Error('Geçersiz yanıt formatı');
      }
    } catch (error) {
      console.error('AI content generation error:', error);
      showErrorToast(error instanceof Error ? error.message : 'İçerik oluşturulurken bir hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI İçerik Oluşturucu
        </CardTitle>
        <CardDescription>
          Yapay zeka ile SEO-dostu bahis sitesi içeriği otomatik oluşturun
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-site-name">Site Adı *</Label>
          <Input
            id="ai-site-name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Örn: Tipbom"
            disabled={isGenerating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-site-url">Site URL (Opsiyonel)</Label>
          <Input
            id="ai-site-url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="Örn: tipbom.com"
            disabled={isGenerating}
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !siteName.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              İçerik Oluşturuluyor...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI ile İçerik Oluştur
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
