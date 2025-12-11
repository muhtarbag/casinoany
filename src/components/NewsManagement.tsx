import { useState, useMemo, useCallback } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useNewsArticles, useDeleteNews, useToggleNewsPublish } from '@/hooks/queries/useNewsQueries';
import { VirtualList } from '@/components/VirtualList';
import { BonusImageUploader } from '@/components/bonus/BonusImageUploader';
import { generateSlug, validateSlug, isSlugAvailable } from '@/lib/slugGenerator';

export function NewsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [slugError, setSlugError] = useState<string>('');

  const { data: articles, isLoading } = useNewsArticles();
  const deleteMutation = useDeleteNews();
  const togglePublishMutation = useToggleNewsPublish();

  const handleManualRSSProcess = useCallback(async () => {
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
      toast({
        title: 'Hata',
        description: 'RSS işleme sırasında bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, queryClient]);

  const handleEdit = useCallback((article: any) => {
    setEditingArticle(article);
    setEditDialogOpen(true);
    setSlugError('');
  }, []);

  const handleSlugChange = useCallback((newSlug: string) => {
    setEditingArticle({ ...editingArticle, slug: newSlug });
    
    // Validate format
    const validation = validateSlug(newSlug);
    if (!validation.valid) {
      setSlugError(validation.error || '');
    } else {
      setSlugError('');
    }
  }, [editingArticle]);

  const handleGenerateSlug = useCallback(() => {
    if (!editingArticle?.title) return;
    const newSlug = generateSlug(editingArticle.title);
    setEditingArticle({ ...editingArticle, slug: newSlug });
    setSlugError('');
  }, [editingArticle]);

  const handleUpdateArticle = useCallback(async () => {
    if (!editingArticle) return;

    // Validate slug
    const validation = validateSlug(editingArticle.slug);
    if (!validation.valid) {
      setSlugError(validation.error || '');
      return;
    }

    // Check slug availability
    const available = await isSlugAvailable(editingArticle.slug, editingArticle.id);
    if (!available) {
      setSlugError('Bu slug zaten kullanımda');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({
          title: editingArticle.title,
          slug: editingArticle.slug,
          excerpt: editingArticle.excerpt,
          featured_image: editingArticle.featured_image,
          featured_image_alt: editingArticle.featured_image_alt,
          meta_title: editingArticle.meta_title,
          meta_description: editingArticle.meta_description,
        })
        .eq('id', editingArticle.id);

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'Haber güncellendi',
      });

      queryClient.invalidateQueries({ queryKey: ['admin-news-articles'] });
      setEditDialogOpen(false);
      setEditingArticle(null);
      setSlugError('');
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Haber güncellenirken hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [editingArticle, toast, queryClient]);

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter((article: any) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [articles, searchTerm]);

  const renderArticleItem = useCallback((article: any) => (
    <Card>
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
              onClick={() => handleEdit(article)}
            >
              <Edit className="w-4 h-4" />
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
  ), [togglePublishMutation, deleteMutation]);

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

      {filteredArticles && filteredArticles.length > 0 ? (
        <VirtualList
          items={filteredArticles}
          height={800}
          estimateSize={280}
          renderItem={renderArticleItem}
          className="rounded-lg"
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Henüz haber bulunmamaktadır.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Haber Düzenle</DialogTitle>
            <DialogDescription>
              Haber detaylarını güncelleyin ve featured image ekleyin
            </DialogDescription>
          </DialogHeader>
          
          {editingArticle && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug (SEO için önemli)</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={editingArticle.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={slugError ? 'border-destructive' : ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSlug}
                    disabled={!editingArticle.title}
                  >
                    Oluştur
                  </Button>
                </div>
                {slugError && (
                  <p className="text-sm text-destructive mt-1">{slugError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  URL: /haber/{editingArticle.slug}
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Özet</Label>
                <Textarea
                  id="excerpt"
                  rows={3}
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="meta_title">SEO Başlık</Label>
                <Input
                  id="meta_title"
                  value={editingArticle.meta_title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, meta_title: e.target.value })}
                  placeholder="Boş bırakılırsa başlık kullanılır"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">SEO Açıklama</Label>
                <Textarea
                  id="meta_description"
                  rows={2}
                  value={editingArticle.meta_description || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, meta_description: e.target.value })}
                  placeholder="Boş bırakılırsa özet kullanılır"
                />
              </div>

              <div>
                <Label>Featured Image (SEO için önemli)</Label>
                <BonusImageUploader
                  currentImageUrl={editingArticle.featured_image}
                  onImageUploaded={(url) => setEditingArticle({ ...editingArticle, featured_image: url })}
                  onImageRemoved={() => setEditingArticle({ ...editingArticle, featured_image: null })}
                />
              </div>

              <div>
                <Label htmlFor="featured_image_alt">Image Alt Text (SEO)</Label>
                <Input
                  id="featured_image_alt"
                  value={editingArticle.featured_image_alt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, featured_image_alt: e.target.value })}
                  placeholder="Görselin açıklaması"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingArticle(null);
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleUpdateArticle}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
