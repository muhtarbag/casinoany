import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useBlogComments } from '@/hooks/queries/useBlogQueries';

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
  const { data: comments, isLoading } = useBlogComments(postId);

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
