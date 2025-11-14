import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare } from 'lucide-react';
import { useAddBlogComment } from '@/hooks/queries/useBlogQueries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const commentSchema = z.object({
  name: z.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(100, 'Ad en fazla 100 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Ad sadece harf içermelidir'),
  email: z.string()
    .email('Geçerli bir email adresi giriniz')
    .max(255, 'Email en fazla 255 karakter olabilir'),
  comment: z.string()
    .min(10, 'Yorum en az 10 karakter olmalıdır')
    .max(1000, 'Yorum en fazla 1000 karakter olabilir')
    .regex(/^[^<>{}]*$/, 'Yorum geçersiz karakterler içeriyor'),
});

interface BlogCommentFormProps {
  postId: string;
}

export const BlogCommentForm = ({ postId }: BlogCommentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const submitCommentMutation = useAddBlogComment();

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: '',
      email: '',
      comment: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof commentSchema>) => {
    const commentData: any = {
      post_id: postId,
      comment: values.comment.trim(),
    };

    if (user) {
      commentData.user_id = user.id;
    } else {
      commentData.name = values.name.trim();
      commentData.email = values.email.trim();
    }

    submitCommentMutation.mutate(commentData, {
      onSuccess: () => {
        form.reset();
        toast({
          title: 'Başarılı',
          description: 'Yorumunuz onay için gönderildi',
        });
      },
    });
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adınız *</FormLabel>
                      <FormControl>
                        <Input placeholder="Adınız" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yorumunuz *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Yorumunuzu buraya yazın..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </CardContent>
    </Card>
  );
};
