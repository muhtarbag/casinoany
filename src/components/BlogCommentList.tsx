import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface BlogCommentListProps {
  postId: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id?: string;
  name?: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export const BlogCommentList = ({ postId }: BlogCommentListProps) => {
  const { data: comments, isLoading } = useQuery({
    queryKey: ['blog-comments', postId],
    queryFn: async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('blog_comments' as any)
        .select('*')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Fetch profiles for authenticated users
      const userIds = commentsData
        .map((c: any) => c.user_id)
        .filter((id: string | null) => id !== null);

      let profilesData = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) throw profilesError;
        profilesData = data || [];
      }

      // Combine comments with profiles
      const commentsWithProfiles = commentsData.map((comment: any) => {
        const profile = profilesData?.find((p: any) => p.id === comment.user_id);
        return {
          ...comment,
          profiles: profile ? { username: profile.username || 'Anonim' } : undefined,
        };
      });

      return commentsWithProfiles as Comment[];
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Yorumlar yükleniyor...
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Henüz yorum yapılmamış. İlk yorumu siz yapın!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Yorumlar ({comments.length})
      </h3>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {comment.profiles?.username || comment.name || 'Anonim'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), 'd MMM yyyy, HH:mm', { locale: tr })}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {comment.comment}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
