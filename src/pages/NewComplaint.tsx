import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [siteId, setSiteId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('normal');
  const [isPublic, setIsPublic] = useState('true');

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <>
        <SEO title="Giriş Gerekli" description="Şikayet oluşturmak için giriş yapmalısınız" />
        <Header />
        <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px]">
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground mb-4 text-lg">
                  Şikayet oluşturmak için giriş yapmalısınız
                </p>
                <Button asChild>
                  <Link to="/login">Giriş Yap</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { data: sites } = useQuery({
    queryKey: ['betting-sites-for-complaint'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const createComplaintMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('site_complaints')
        .insert({
          site_id: siteId,
          user_id: user!.id,
          title,
          description,
          category,
          severity,
          is_public: isPublic === 'true',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Başarılı',
        description: 'Şikayetiniz kaydedildi',
      });
      navigate(`/sikayetler/${data.id}`);
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Şikayet oluşturulurken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!siteId || !title || !description || !category) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm gerekli alanları doldurun',
        variant: 'destructive',
      });
      return;
    }

    createComplaintMutation.mutate();
  };

  const categoryOptions = [
    { value: 'odeme', label: 'Ödeme' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'musteri_hizmetleri', label: 'Müşteri Hizmetleri' },
    { value: 'teknik', label: 'Teknik' },
    { value: 'guvenlik', label: 'Güvenlik' },
    { value: 'diger', label: 'Diğer' },
  ];

  return (
    <>
      <SEO 
        title="Şikayet Et"
        description="Bahis siteleri hakkında şikayetinizi paylaşın"
      />
      <Header />
      <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px]">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/sikayetler">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Yeni Şikayet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site">Site Seçimi *</Label>
                <Select value={siteId} onValueChange={setSiteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şikayet edeceğiniz siteyi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites?.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Şikayet Başlığı *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Kısa ve açıklayıcı bir başlık"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şikayet kategorisi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Önem Derecesi</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detaylı Açıklama *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sorununuzu detaylı bir şekilde açıklayın..."
                  rows={8}
                />
              </div>

              <div className="space-y-3">
                <Label>Görünürlük</Label>
                <RadioGroup value={isPublic} onValueChange={setIsPublic}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="public" />
                    <Label htmlFor="public" className="font-normal cursor-pointer">
                      Herkese açık (Önerilen)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="private" />
                    <Label htmlFor="private" className="font-normal cursor-pointer">
                      Sadece site sahibi görebilir
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createComplaintMutation.isPending}
              >
                {createComplaintMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  'Şikayeti Gönder'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NewComplaint;