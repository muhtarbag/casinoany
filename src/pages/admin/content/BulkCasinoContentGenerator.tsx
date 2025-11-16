import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { logger } from '@/lib/logger';

export default function BulkCasinoContentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSite, setCurrentSite] = useState('');
  const [missingSites, setMissingSites] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMissingSites = async () => {
      try {
        const { data, error } = await supabase
          .from('betting_sites')
          .select('id, name')
          .eq('is_active', true)
          .or('pros.is.null,cons.is.null,verdict.is.null,expert_review.is.null');

        if (error) throw error;
        setMissingSites(data || []);
      } catch (error) {
        console.error('Error fetching missing sites:', error);
        toast.error('Casino içeriği eksik siteler yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissingSites();
  }, []);

  const generateContent = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Process in batches of 3 to avoid timeout
      const batchSize = 3;
      const batches = [];
      for (let i = 0; i < missingSites.length; i += batchSize) {
        batches.push(missingSites.slice(i, i + batchSize));
      }

      let completedCount = 0;
      const totalSites = missingSites.length;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const siteIds = batch.map(s => s.id);
        
        setCurrentSite(`Batch ${batchIndex + 1}/${batches.length} işleniyor: ${batch.map(s => s.name).join(', ')}...`);
        
        const { data, error } = await supabase.functions.invoke('generate-casino-content', {
          body: {
            isBulk: true,
            siteIds: siteIds
          }
        });

        if (error) {
          console.error(`Batch ${batchIndex + 1} error:`, error);
          toast.error(`Batch ${batchIndex + 1} için hata: ${error.message}`);
        } else {
          completedCount += batch.length;
          const progressPercent = Math.round((completedCount / totalSites) * 100);
          setProgress(progressPercent);
          toast.success(`${batch.length} site tamamlandı (${completedCount}/${totalSites})`);
        }
      }

      setProgress(100);
      setCurrentSite('Tüm siteler tamamlandı!');
      toast.success(`${missingSites.length} site için casino içeriği başarıyla oluşturuldu!`);
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('İçerik oluşturulurken hata oluştu: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Yükleniyor...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (missingSites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Toplu Casino İçerik Üretimi
          </CardTitle>
          <CardDescription>
            Tüm siteler için casino içeriği mevcut!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Toplu Casino İçerik Üretimi
        </CardTitle>
        <CardDescription>
          {missingSites.length} site için casino içeriği eksik. Tümü için AI ile otomatik içerik oluşturabilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4 bg-muted/50">
          <h4 className="font-semibold mb-2">İçerik Oluşturulacak Siteler:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {missingSites.map(site => (
              <div key={site.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                {site.name}
              </div>
            ))}
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {currentSite}
            </p>
          </div>
        )}

        <Button 
          onClick={generateContent}
          disabled={isGenerating}
          size="lg"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              İçerik Oluşturuluyor...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {missingSites.length} Site İçin İçerik Oluştur
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
