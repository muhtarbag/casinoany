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

interface SiteAdditionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteAdditionRequestDialog({ open, onOpenChange }: SiteAdditionRequestDialogProps) {
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [description, setDescription] = useState('');

  const createRequestMutation = useMutation({
    mutationFn: async (data: { site_name: string; site_url: string; description: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Giriş yapmalısınız');

      const { error } = await supabase
        .from('site_addition_requests')
        .insert({
          user_id: user.id,
          site_name: data.site_name,
          site_url: data.site_url,
          description: data.description,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!siteName.trim() || !siteUrl.trim()) {
      toast.error('Site adı ve URL gereklidir');
      return;
    }

    createRequestMutation.mutate({
      site_name: siteName,
      site_url: siteUrl,
      description: description,
    });
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
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="Örn: https://ornek-site.com"
              required
            />
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
