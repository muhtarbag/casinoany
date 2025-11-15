import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function BulkCasinoContentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSite, setCurrentSite] = useState('');

  const missingSites = [
    { id: 'db05e0fd-dd3c-4cf9-a353-eb948b21f650', name: 'Tokyobet' },
    { id: '4e8bffff-f943-44af-8eda-a5c34b22dcca', name: 'Bahsegel' },
    { id: '3dc0d826-215f-4a47-b0db-e3789faa7a32', name: 'Mariobet' },
    { id: '18996917-230d-4f81-a8ff-9010464aeb16', name: 'Matbet' },
    { id: '13a96806-ae6f-4c59-b6fe-e2b2325d787e', name: 'SavaBet' },
    { id: '72e9c4d2-3582-44e6-8216-609eb77b4cbe', name: 'Meritking' },
    { id: '70060c32-d52b-49da-84e9-935a29868720', name: 'Palacebet' },
    { id: 'c5f7696f-d197-4829-9d9f-0754f7937a4b', name: 'Betwild' },
    { id: '80bd1f31-4657-4e36-821c-d096288431d9', name: 'Enbet' },
    { id: '1e7047bd-9c60-4252-a883-578e826d5412', name: 'İbizabet' },
    { id: '0d8a4b8e-3d7c-4e1f-a54e-2eeb4cec8fc4', name: 'Tikobet' },
    { id: 'c33b2232-0b6d-4ad4-90a5-a23fa0b92df4', name: 'Betsilin' },
    { id: '74e8d716-0391-49a7-b146-b2ba73cd14c3', name: 'Hitbet' },
    { id: '2b98baee-d6cc-481c-8aa0-053c12672fb1', name: 'Rbet' },
    { id: '25ac0663-ff4f-4e33-8221-5605db6ca5a1', name: 'KingRoyal' },
    { id: '18d7c854-b5e8-4957-8c35-d8e6415fa179', name: 'Ramadabet' },
    { id: '9a99b7e7-08a0-44f9-8b9f-7a482ed2f577', name: 'DinamoBet' },
  ];

  const generateContent = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      const siteIds = missingSites.map(s => s.id);
      
      setCurrentSite('Toplu içerik üretimi başlatılıyor...');
      
      const { data, error } = await supabase.functions.invoke('generate-casino-content', {
        body: {
          isBulk: true,
          siteIds: siteIds
        }
      });

      if (error) throw error;

      setProgress(100);
      setCurrentSite('Tamamlandı!');
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
