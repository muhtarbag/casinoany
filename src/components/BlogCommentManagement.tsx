import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Trash2, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const BlogCommentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['admin-blog-comments'],
    queryFn: async () => {
      const { data: commentsData, error } = await supabase
        .from('blog_comments' as any)
        .select(`
          *,
          blog_posts!inner(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for authenticated users
      const userIds = commentsData
        .map((c: any) => c.user_id)
        .filter((id: string | null) => id !== null);

      let profilesData = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await (supabase as any)
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) throw profilesError;
        profilesData = data || [];
      }

      return commentsData.map((comment: any) => {
        const profile = profilesData?.find((p: any) => p.id === comment.user_id);
        return {
          ...comment,
          profiles: profile ? { username: profile.username } : undefined,
        };
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_comments' as any)
        .update({ is_approved: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-comments'] });
      toast({ title: 'Yorum onaylandı' });
    },
    onError: (error: any) => {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_comments' as any)
        .update({ is_approved: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-comments'] });
      toast({ title: 'Yorum reddedildi' });
    },
    onError: (error: any) => {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_comments' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-comments'] });
      toast({ title: 'Yorum silindi' });
    },
    onError: (error: any) => {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    },
  });

  const pendingComments = comments?.filter((c: any) => !c.is_approved) || [];
  const approvedComments = comments?.filter((c: any) => c.is_approved) || [];

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Pending Comments */}
      {pendingComments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Onay Bekleyen Yorumlar ({pendingComments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingComments.map((comment: any) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/30 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {comment.profiles?.username || comment.name || 'Anonim'}
                      </span>
                      <Badge variant="outline">{comment.blog_posts.title}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(new Date(comment.created_at), 'd MMM yyyy, HH:mm', { locale: tr })}
                    </p>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approveMutation.mutate(comment.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(comment.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Approved Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Onaylanmış Yorumlar ({approvedComments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvedComments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Henüz onaylanmış yorum bulunmamaktadır.
            </p>
          ) : (
            approvedComments.map((comment: any) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg bg-muted space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {comment.profiles?.username || comment.name || 'Anonim'}
                      </span>
                      <Badge variant="outline">{comment.blog_posts.title}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(new Date(comment.created_at), 'd MMM yyyy, HH:mm', { locale: tr })}
                    </p>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(comment.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(comment.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
