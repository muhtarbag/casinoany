import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

// URL normalization function
const normalizeUrl = (url: string): string => {
  let normalized = url.trim();
  
  // If URL doesn't start with http:// or https://, add https://
  if (normalized && !normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized;
  }
  
  return normalized;
};

// Validation schema
const siteRequestSchema = z.object({
  site_name: z.string()
    .trim()
    .min(1, 'Site adı gereklidir')
    .max(100, 'Site adı en fazla 100 karakter olabilir'),
  site_url: z.string()
    .trim()
    .min(1, 'Site URL gereklidir')
    .url('Geçerli bir URL giriniz')
    .max(500, 'URL en fazla 500 karakter olabilir'),
  description: z.string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional(),
});

interface SiteAdditionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteAdditionRequestDialog({ open, onOpenChange }: SiteAdditionRequestDialogProps) {
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [description, setDescription] = useState('');

  const createRequestMutation = useMutation({
    mutationFn: async (data: { site_name: string; site_url: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Giriş yapmalısınız');

      const { error } = await supabase
        .from('site_addition_requests')
        .insert({
          user_id: user.id,
          site_name: data.site_name,
          site_url: data.site_url,
          description: data.description || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Site ekleme talebiniz başarıyla gönderildi!', {
        description: 'Talebiniz incelendikten sonra bilgilendirileceksiniz.',
      });
      setSiteName('');
      setSiteUrl('');
      setDescription('');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creating request:', error);
      toast.error('Talep gönderilirken bir hata oluştu');
    },
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSiteUrl(value);
  };

  const handleUrlBlur = () => {
    if (siteUrl.trim()) {
      const normalized = normalizeUrl(siteUrl);
      setSiteUrl(normalized);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize URL before validation
    const normalizedUrl = normalizeUrl(siteUrl);
    
    // Validate with zod
    try {
      const validatedData = siteRequestSchema.parse({
        site_name: siteName,
        site_url: normalizedUrl,
        description: description || undefined,
      });

      createRequestMutation.mutate({
        site_name: validatedData.site_name,
        site_url: validatedData.site_url,
        description: validatedData.description,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        toast.error('Geçersiz veri');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Site Ekleme Talebi</DialogTitle>
          <DialogDescription>
            Şikayet etmek istediğiniz site listemizde yoksa, eklenmesi için talepte bulunabilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Adı *</Label>
            <Input
              id="site-name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Örn: Bahis Sitesi"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-url">Site URL/Domain *</Label>
            <Input
              id="site-url"
              type="text"
              value={siteUrl}
              onChange={handleUrlChange}
              onBlur={handleUrlBlur}
              placeholder="Örn: www.ornek-site.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              Otomatik olarak https:// eklenecektir
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu siteyi neden eklemek istiyorsunuz?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createRequestMutation.isPending}
            >
              İptal
            </Button>
            <Button type="submit" disabled={createRequestMutation.isPending}>
              {createRequestMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Talep Gönder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
