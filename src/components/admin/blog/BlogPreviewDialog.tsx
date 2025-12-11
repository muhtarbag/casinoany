
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Clock, Tag, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface BlogPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    imagePreview: string | null;
}

export function BlogPreviewDialog({
    open,
    onOpenChange,
    formData,
    imagePreview
}: BlogPreviewDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Blog Önizleme
                    </DialogTitle>
                    <DialogDescription>
                        Blog yazınızın yayınlandığında nasıl görüneceğinin önizlemesi
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <article className="prose prose-invert max-w-none">
                        {/* Header Section */}
                        <div className="mb-8 pb-6 border-b border-border">
                            <h1 className="text-4xl font-bold mb-4 text-foreground">{formData.title || 'Başlık'}</h1>

                            {/* Meta Information */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{format(new Date(), 'dd MMMM yyyy', { locale: tr })}</span>
                                </div>
                                {formData.read_time && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{formData.read_time} dakika okuma</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    <span>0 görüntüleme</span>
                                </div>
                            </div>

                            {/* Tags */}
                            {formData.tags && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <Tag className="w-4 h-4 text-muted-foreground" />
                                    {formData.tags.split(',').map((tag: string, idx: number) => (
                                        <Badge key={idx} variant="secondary">
                                            {tag.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Category */}
                            {formData.category && (
                                <div className="mt-3">
                                    <Badge variant="outline">{formData.category}</Badge>
                                </div>
                            )}
                        </div>

                        {/* Featured Image */}
                        {imagePreview && (
                            <div className="mb-8 rounded-lg overflow-hidden">
                                <img
                                    src={imagePreview}
                                    alt={formData.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {/* Excerpt */}
                        {formData.excerpt && (
                            <div className="mb-6 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                                <p className="text-lg italic text-foreground">{formData.excerpt}</p>
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-foreground prose-a:text-primary"
                            dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-muted-foreground">İçerik henüz eklenmedi...</p>' }}
                        />
                    </article>

                    {/* SEO Meta Preview */}
                    <div className="border-t border-border pt-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ExternalLink className="w-5 h-5" />
                            SEO Önizleme
                        </h3>

                        {/* Google Search Result Preview */}
                        <div className="bg-card p-4 rounded-lg border">
                            <div className="text-xs text-muted-foreground mb-1">
                                {window.location.origin}/blog/{formData.slug || 'blog-basligi'}
                            </div>
                            <div className="text-xl text-blue-500 hover:underline mb-1">
                                {formData.meta_title || formData.title || 'Blog Başlığı'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {formData.meta_description || formData.excerpt || 'Meta açıklama henüz eklenmedi...'}
                            </div>
                        </div>

                        {/* Meta Keywords */}
                        {formData.meta_keywords && (
                            <div className="text-sm">
                                <span className="font-medium text-foreground">Anahtar Kelimeler: </span>
                                <span className="text-muted-foreground">{formData.meta_keywords}</span>
                            </div>
                        )}

                        {/* Status Indicator */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-foreground">Yayın Durumu:</span>
                            {formData.is_published ? (
                                <Badge variant="default">Yayınlanacak</Badge>
                            ) : (
                                <Badge variant="secondary">Taslak Olarak Kaydedilecek</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
