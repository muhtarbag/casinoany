
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface BlogListProps {
    posts: any[];
    onEdit: (post: any) => void;
    onPreview: (post: any) => void;
    onDelete: (id: string) => void;
}

export function BlogList({ posts, onEdit, onPreview, onDelete }: BlogListProps) {
    return (
        <div className="grid gap-4">
            {posts?.map((post) => (
                <Card key={post.id}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-semibold">{post.title}</h3>
                                    {post.is_published ? (
                                        <Badge variant="default">Yayında</Badge>
                                    ) : post.scheduled_publish_at ? (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Zamanlanmış: {format(new Date(post.scheduled_publish_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Taslak</Badge>
                                    )}
                                    {post.category && <Badge variant="outline">{post.category}</Badge>}
                                </div>
                                <p className="text-muted-foreground text-sm mb-2">{post.excerpt}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {post.view_count} görüntüleme
                                    </span>
                                    {post.read_time && <span>{post.read_time} dk okuma</span>}
                                    {post.tags && post.tags.length > 0 && (
                                        <span>Etiketler: {post.tags.join(', ')}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onPreview(post)}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => onEdit(post)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => onDelete(post.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
