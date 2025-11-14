import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit, Eye, RefreshCw, Rss } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
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
} from './ui/alert-dialog';
import { useNewsArticles, useDeleteNews, useToggleNewsPublish } from '@/hooks/queries/useNewsQueries';

export function NewsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: articles, isLoading } = useNewsArticles();
  const deleteMutation = useDeleteNews();
  const togglePublishMutation = useToggleNewsPublish();

  const handleManualRSSProcess = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('rss-news-processor');

      if (error) throw error;

      toast({
        title: 'RSS İşleme Tamamlandı',
        description: `${data.processed || 0} haber işlendi`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-news-articles'] });
    } catch (error) {
      console.error('RSS processing error:', error);
      toast({
        title: 'Hata',
        description: 'RSS işleme sırasında bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredArticles = articles?.filter((article: any) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Haber ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          onClick={handleManualRSSProcess}
          disabled={isProcessing}
          className="gap-2"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Rss className="w-4 h-4" />
          )}
          RSS Feed'leri İşle
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredArticles?.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant={article.is_published ? 'default' : 'secondary'}>
                      {article.is_published ? 'Yayında' : 'Taslak'}
                    </Badge>
                    <Badge variant="outline">{article.category}</Badge>
                    <span>•</span>
                    <Eye className="w-4 h-4" />
                    {article.view_count}
                    <span>•</span>
                    <span>{format(new Date(article.created_at), 'd MMM yyyy', { locale: tr })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/haber/${article.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublishMutation.mutate({
                      id: article.id,
                      isPublished: article.is_published
                    })}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Haberi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu haberi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(article.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {article.excerpt}
              </p>
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.slice(0, 5).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!filteredArticles || filteredArticles.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Henüz haber bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
}
