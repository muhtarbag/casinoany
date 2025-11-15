import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function GenerateCasinoContentBulk() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateForSites = async () => {
    setIsGenerating(true);
    
    const siteIds = [
      'db05e0fd-dd3c-4cf9-a353-eb948b21f650', // tokyobet
      '4e8bffff-f943-44af-8eda-a5c34b22dcca', // bahsegel
      '3dc0d826-215f-4a47-b0db-e3789faa7a32', // mariobet
      '18996917-230d-4f81-a8ff-9010464aeb16', // matbet
      '13a96806-ae6f-4c59-b6fe-e2b2325d787e', // savabet
      '72e9c4d2-3582-44e6-8216-609eb77b4cbe', // meritking
      '70060c32-d52b-49da-84e9-935a29868720', // palacebet
      'c5f7696f-d197-4829-9d9f-0754f7937a4b', // betwild
      '80bd1f31-4657-4e36-821c-d096288431d9', // enbet
      '1e7047bd-9c60-4252-a883-578e826d5412', // ibizabet
      '0d8a4b8e-3d7c-4e1f-a54e-2eeb4cec8fc4', // tikobet
      'c33b2232-0b6d-4ad4-90a5-a23fa0b92df4', // betsilin
      '74e8d716-0391-49a7-b146-b2ba73cd14c3', // hitbet
      '2b98baee-d6cc-481c-8aa0-053c12672fb1', // rbet
      '25ac0663-ff4f-4e33-8221-5605db6ca5a1', // kingroyal
      '18d7c854-b5e8-4957-8c35-d8e6415fa179', // ramadabet
    ];

    try {
      const { data, error } = await supabase.functions.invoke('generate-casino-content', {
        body: {
          isBulk: true,
          siteIds: siteIds
        }
      });

      if (error) throw error;

      toast.success('Casino içeriği başarıyla oluşturuldu!');
      console.log('Generated content:', data);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('İçerik oluşturulurken hata oluştu: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <Button 
        onClick={generateForSites} 
        disabled={isGenerating}
        size="lg"
      >
        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isGenerating ? 'İçerik Oluşturuluyor...' : '16 Site İçin İçerik Oluştur'}
      </Button>
    </div>
  );
}
