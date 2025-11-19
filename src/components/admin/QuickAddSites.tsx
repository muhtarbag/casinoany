import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Plus, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { generateSlug } from '@/schemas/siteValidation';
import { Badge } from '@/components/ui/badge';

const QUICK_ADD_SITES = [
  { name: 'Tipbom', affiliateLink: 'https://tipbom.com' },
  { name: '3XLwin', affiliateLink: 'https://3xlwin.com' },
  { name: 'Poliwin', affiliateLink: 'https://poliwin.com' },
];

interface QuickAddSitesProps {
  onSitesAdded?: () => void;
}

export const QuickAddSites = ({ onSitesAdded }: QuickAddSitesProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [addedSites, setAddedSites] = useState<string[]>([]);

  const addSiteWithAI = async (siteName: string, affiliateLink: string) => {
    setCurrentSite(siteName);

    // Generate content with AI
    const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-betting-site-content', {
      body: { siteName, siteUrl: affiliateLink }
    });

    if (aiError) {
      if (aiError.message?.includes('429')) {
        throw new Error('AI rate limit aşıldı');
      } else if (aiError.message?.includes('402')) {
        throw new Error('AI kredisi yetersiz');
      }
      throw aiError;
    }

    if (!aiData?.content) {
      throw new Error('AI içerik oluşturulamadı');
    }

    const content = aiData.content;
    const slug = generateSlug(siteName);

    // Check if site already exists
    const { data: existing } = await supabase
      .from('betting_sites')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      throw new Error(`${siteName} zaten sistemde mevcut`);
    }

    // Insert basic site info
    const { data: siteData, error: siteError } = await supabase
      .from('betting_sites')
      .insert({
        name: siteName,
        slug,
        affiliate_link: affiliateLink,
        bonus: content.bonus,
        features: content.features,
        rating: 4.0,
        is_active: true,
        is_featured: false,
      })
      .select()
      .single();

    if (siteError) throw siteError;

    // Insert content
    const { error: contentError } = await supabase
      .from('betting_sites_content')
      .insert({
        site_id: siteData.id,
        pros: content.pros,
        cons: content.cons,
        expert_review: content.expert_review,
        verdict: content.verdict,
        login_guide: content.login_guide,
        withdrawal_guide: content.withdrawal_guide,
        faq: content.faq,
      });

    if (contentError) throw contentError;

    return siteName;
  };

  const handleQuickAdd = async () => {
    setIsProcessing(true);
    const successfullyAdded: string[] = [];

    try {
      for (const site of QUICK_ADD_SITES) {
        try {
          const addedSite = await addSiteWithAI(site.name, site.affiliateLink);
          successfullyAdded.push(addedSite);
          setAddedSites(prev => [...prev, addedSite]);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        } catch (error) {
          console.error(`${site.name} eklenirken hata:`, error);
          showErrorToast(`${site.name}: ${error instanceof Error ? error.message : 'Hata oluştu'}`);
        }
      }

      if (successfullyAdded.length > 0) {
        showSuccessToast(`${successfullyAdded.length} site başarıyla eklendi!`);
        onSitesAdded?.();
      }
    } catch (error) {
      console.error('Toplu ekleme hatası:', error);
      showErrorToast('Siteler eklenirken bir hata oluştu');
    } finally {
      setIsProcessing(false);
      setCurrentSite(null);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Hızlı Site Ekleme
        </CardTitle>
        <CardDescription>
          AI ile hazır içeriklerle Tipbom, 3XLwin ve Poliwin sitelerini tek tıkla ekleyin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD_SITES.map((site) => (
            <Badge
              key={site.name}
              variant={addedSites.includes(site.name) ? 'default' : 'secondary'}
              className="text-sm"
            >
              {addedSites.includes(site.name) && <Check className="w-3 h-3 mr-1" />}
              {site.name}
              {currentSite === site.name && <Loader2 className="w-3 h-3 ml-1 animate-spin" />}
            </Badge>
          ))}
        </div>
        
        <Button
          onClick={handleQuickAdd}
          disabled={isProcessing || addedSites.length === QUICK_ADD_SITES.length}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {currentSite} ekleniyor...
            </>
          ) : addedSites.length === QUICK_ADD_SITES.length ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Tüm Siteler Eklendi
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              {QUICK_ADD_SITES.length} Siteyi Ekle (AI ile)
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Logo yüklemeleri sonra yapılabilir
        </p>
      </CardContent>
    </Card>
  );
};
