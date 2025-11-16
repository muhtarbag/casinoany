import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { analytics } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'user' | 'site_owner'>('user');
  const [selectedSite, setSelectedSite] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: sites } = useQuery({
    queryKey: ['betting-sites-for-registration'],
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

  useEffect(() => {
    // Only redirect if auth is loaded and user exists
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm alanları doldurun',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Şifreler eşleşmiyor',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır',
        variant: 'destructive',
      });
      return;
    }

    if (userType === 'site_owner' && !selectedSite) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir site seçin',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await signUp(email, password);

    if (result.error) {
      setLoading(false);
      toast({
        title: 'Kayıt Başarısız',
        description: result.error.message || 'Bir hata oluştu',
        variant: 'destructive',
      });
      return;
    }

    // Get user from auth state
    const { data: { user: newUser } } = await supabase.auth.getUser();

    // If site owner, create ownership request
    if (userType === 'site_owner' && newUser) {
      await (supabase as any)
        .from('site_owners')
        .insert({
          user_id: newUser.id,
          site_id: selectedSite,
          company_name: companyName,
          description: description,
          status: 'pending'
        });

      toast({
        title: 'Başvuru Alındı!',
        description: 'Site sahipliği başvurunuz alındı. Admin onayı bekleniyor. Onaylandığında size bildirilecek.',
        duration: 6000,
      });
    } else {
      // Track successful signup
      analytics.trackSignup();
      
      toast({
        title: 'Kayıt Başarılı!',
        description: 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.',
        duration: 4000,
      });
    }

    setLoading(false);
    
    // Redirect to login
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Kayıt Ol</CardTitle>
          <CardDescription className="text-center">
            Yeni hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Hesap Tipi</Label>
              <RadioGroup value={userType} onValueChange={(value: any) => setUserType(value)}>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Kullanıcı (B2C)</div>
                    <div className="text-sm text-muted-foreground">Siteleri favorilere ekle, yorum yap, şikayet et</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="site_owner" id="site_owner" />
                  <Label htmlFor="site_owner" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Site Sahibi (B2B)</div>
                    <div className="text-sm text-muted-foreground">Kendi sitenizi yönetin, yorumları ve şikayetleri yanıtlayın</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {userType === 'site_owner' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="site">Site Seçimi *</Label>
                  <Select value={selectedSite} onValueChange={setSelectedSite} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sitenizi seçin" />
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
                  <Label htmlFor="companyName">Şirket Adı (Opsiyonel)</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Şirket adınız"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Site sahipliği başvurunuz hakkında bilgi verin..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kayıt yapılıyor...
                </>
              ) : userType === 'site_owner' ? (
                'Başvuru Gönder'
              ) : (
                'Kayıt Ol'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
            <Link to="/login" className="text-primary hover:underline">
              Giriş Yap
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
