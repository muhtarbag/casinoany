import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { History, RotateCcw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ContentVersionsProps {
  siteId: string;
  onRestore: (version: any) => void;
}

export const ContentVersions = ({ siteId, onRestore }: ContentVersionsProps) => {
  const { toast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false);

  const { data: versions, isLoading, refetch } = useQuery({
    queryKey: ['casino-content-versions', siteId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('casino_content_versions')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!siteId,
  });

  const handleRestore = async (version: any) => {
    setIsRestoring(true);
    try {
      // Update main table with version data
      const { error } = await (supabase as any)
        .from('betting_sites')
        .update({
          pros: version.pros,
          cons: version.cons,
          verdict: version.verdict,
          expert_review: version.expert_review,
          game_categories: version.game_categories,
          login_guide: version.login_guide,
          withdrawal_guide: version.withdrawal_guide,
          faq: version.faq,
          block_styles: version.block_styles,
        })
        .eq('id', siteId);

      if (error) throw error;

      // Create a new version entry for the restore action
      const { error: versionError } = await (supabase as any)
        .from('casino_content_versions')
        .insert({
          site_id: siteId,
          generation_source: 'manual',
          pros: version.pros,
          cons: version.cons,
          verdict: version.verdict,
          expert_review: version.expert_review,
          game_categories: version.game_categories,
          login_guide: version.login_guide,
          withdrawal_guide: version.withdrawal_guide,
          faq: version.faq,
          block_styles: version.block_styles,
          metadata: { restored_from: version.id },
        });

      if (versionError) console.error('Version save error:', versionError);

      toast({
        title: "Başarılı!",
        description: "İçerik geri yüklendi.",
      });

      onRestore(version);
      refetch();
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: "Hata",
        description: "İçerik geri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  if (!siteId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          İçerik Geçmişi
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!versions || versions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Henüz versiyon geçmişi bulunmuyor.
          </p>
        ) : (
          <div className="space-y-3">
            {versions.map((version: any) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {format(new Date(version.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      version.generation_source === 'ai' 
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    }`}>
                      {version.generation_source === 'ai' ? 'AI' : 'Manuel'}
                    </span>
                  </div>
                  {version.metadata?.restored_from && (
                    <p className="text-xs text-muted-foreground">
                      Geri yükleme
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleRestore(version)}
                  disabled={isRestoring}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Geri Yükle
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};