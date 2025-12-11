import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { analytics } from "@/lib/analytics";
import { handleError, handleSuccess } from "@/lib/errorHandling";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Login olmuş kullanıcılar için name/email opsiyonel (profile'dan çekilecek)
const reviewSchemaAuthenticated = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter olmalıdır").max(100, "Başlık en fazla 100 karakter olabilir"),
  comment: z.string().trim().min(20, "Yorum en az 20 karakter olmalıdır").max(1000, "Yorum en fazla 1000 karakter olabilir"),
  rating: z.number().min(1, "En az 1 yıldız vermelisiniz").max(5, "En fazla 5 yıldız verebilirsiniz"),
});

// Anonim kullanıcılar için name/email zorunlu
const reviewSchemaAnonymous = reviewSchemaAuthenticated.extend({
  name: z.string().trim().min(2, "İsim en az 2 karakter olmalıdır").max(100, "İsim en fazla 100 karakter olabilir"),
  email: z.string().trim().email("Geçerli bir email adresi giriniz").max(255, "Email en fazla 255 karakter olabilir"),
});

type ReviewFormDataAuthenticated = z.infer<typeof reviewSchemaAuthenticated>;
type ReviewFormDataAnonymous = z.infer<typeof reviewSchemaAnonymous>;

interface ReviewFormProps {
  siteId: string;
}

export default function ReviewForm({ siteId }: ReviewFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hoveredRating, setHoveredRating] = useState(0);

  // Kullanıcı profil bilgilerini çek
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('email, first_name, last_name, username')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isAuthenticated = !!user;

  const form = useForm<ReviewFormDataAuthenticated | ReviewFormDataAnonymous>({
    resolver: zodResolver(isAuthenticated ? reviewSchemaAuthenticated : reviewSchemaAnonymous),
    defaultValues: isAuthenticated 
      ? {
          title: "",
          comment: "",
          rating: 0,
        }
      : {
          name: "",
          email: "",
          title: "",
          comment: "",
          rating: 0,
        },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormDataAuthenticated | ReviewFormDataAnonymous) => {
      // Login olmuş kullanıcı için profile bilgilerini kullan
      const userName = isAuthenticated 
        ? profile?.username || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Kullanıcı'
        : ('name' in data ? data.name : '');
      
      const userEmail = isAuthenticated
        ? profile?.email || user?.email || ''
        : ('email' in data ? data.email : '');

      const { error } = await supabase.from("site_reviews").insert({
        site_id: siteId,
        user_id: user?.id || null,
        name: userName,
        email: userEmail,
        title: data.title,
        comment: data.comment,
        rating: data.rating,
        is_approved: false,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Track review submission in analytics
      const rating = form.getValues('rating');
      analytics.trackReviewSubmit(siteId, rating);
      
      handleSuccess(
        "Yorumunuz başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.",
        "İnceleme Gönderildi"
      );
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["site-reviews", siteId] });
    },
    onError: (error: Error) => {
      handleError(error, {
        title: "Yorum Gönderilemedi",
        description: "Lütfen tekrar deneyin veya daha sonra tekrar gelin.",
      });
    },
  });

  const onSubmit = (data: ReviewFormDataAuthenticated | ReviewFormDataAnonymous) => {
    createReviewMutation.mutate(data);
  };

  const currentRating = form.watch("rating");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Login olmuş kullanıcı bilgisi */}
        {isAuthenticated && profile && (
          <Alert className="bg-primary/5 border-primary/20">
            <User className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">
                {profile.username || `${profile.first_name} ${profile.last_name}`}
              </span> olarak yorum yazıyorsunuz
            </AlertDescription>
          </Alert>
        )}

        {/* Rating Stars */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Puanınız</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => field.onChange(rating)}
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= (hoveredRating || currentRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name - Sadece anonim kullanıcılar için */}
        {!isAuthenticated && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İsminiz</FormLabel>
                <FormControl>
                  <Input placeholder="Adınız ve Soyadınız" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Email - Sadece anonim kullanıcılar için */}
        {!isAuthenticated && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Adresiniz</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ornek@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Başlık</FormLabel>
              <FormControl>
                <Input placeholder="Yorumunuza bir başlık verin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Comment */}
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yorumunuz</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deneyimlerinizi detaylı olarak paylaşın..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createReviewMutation.isPending} className="w-full">
          {createReviewMutation.isPending ? "Gönderiliyor..." : "Yorum Gönder"}
        </Button>
      </form>
    </Form>
  );
}
