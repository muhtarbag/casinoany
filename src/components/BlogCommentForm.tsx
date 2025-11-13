import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare } from 'lucide-react';

interface BlogCommentFormProps {
  postId: string;
}

export const BlogCommentForm = ({ postId }: BlogCommentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const submitCommentMutation = useMutation({
    mutationFn: async () => {
      const commentData: any = {
        post_id: postId,
        comment: comment.trim(),
      };

      if (user) {
        commentData.user_id = user.id;
      } else {
        // Anonymous comment
        if (!name.trim() || !email.trim()) {
          throw new Error('Lütfen ad ve email alanlarını doldurun');
        }
        commentData.name = name.trim();
        commentData.email = email.trim();
      }

      const { error } = await supabase
        .from('blog_comments' as any)
        .insert([commentData]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Yorum gönderildi',
        description: 'Yorumunuz onay bekliyor. Onaylandıktan sonra görüntülenecektir.',
      });
      setComment('');
      setName('');
      setEmail('');
      queryClient.invalidateQueries({ queryKey: ['blog-comments', postId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Yorum gönderilemedi',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (comment.trim().length < 3) {
      toast({
        title: 'Hata',
        description: 'Yorum en az 3 karakter olmalıdır',
        variant: 'destructive',
      });
      return;
    }

    submitCommentMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Yorum Yap
        </CardTitle>
        <CardDescription>
          {user 
            ? 'Düşüncelerinizi paylaşın' 
            : 'Yorum yapmak için bilgilerinizi girin (üyelik gerekmez)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Adınız *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Yorumunuz *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Yorumunuzu buraya yazın..."
              rows={4}
              required
              minLength={3}
            />
          </div>

          <Button
            type="submit"
            disabled={submitCommentMutation.isPending}
            className="w-full md:w-auto"
          >
            {submitCommentMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              'Yorum Gönder'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
