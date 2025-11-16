import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Hata',
        description: 'Lütfen email adresinizi girin',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setEmailSent(true);
      toast({
        title: 'Başarılı!',
        description: 'Şifre sıfırlama linki email adresinize gönderildi',
      });
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Gönderildi</CardTitle>
            <CardDescription>
              Şifre sıfırlama linki <span className="font-semibold text-foreground">{email}</span> adresine gönderildi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Emailinizi kontrol edin ve şifrenizi sıfırlamak için linke tıklayın.
            </p>
            <div className="pt-4">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Giriş Sayfasına Dön
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Şifremi Unuttum</CardTitle>
          <CardDescription className="text-center">
            Email adresinizi girin, size şifre sıfırlama linki gönderelim
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Sıfırlama Linki Gönder'
              )}
            </Button>

            <div className="text-center pt-4">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="inline-block mr-1 h-3 w-3" />
                Giriş sayfasına dön
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;