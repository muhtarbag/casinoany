import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { analytics } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { Step1Basic } from '@/components/wizard/Step1Basic';
import { Step2ContactSocial } from '@/components/wizard/Step2ContactSocial';
import { Step3CompanyDetails } from '@/components/wizard/Step3CompanyDetails';
import { Step4Summary } from '@/components/wizard/Step4Summary';
import { StepIndividualProfile } from '@/components/wizard/StepIndividualProfile';

const Signup = () => {
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'user' | 'site_owner'>('user');
  const [currentStep, setCurrentStep] = useState(0);

  const [username, setUsername] = useState('');

  const [selectedSite, setSelectedSite] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [siteEmail, setSiteEmail] = useState('');
  const [siteTelegram, setSiteTelegram] = useState('');
  const [siteWhatsapp, setSiteWhatsapp] = useState('');
  const [siteFacebook, setSiteFacebook] = useState('');
  const [siteTwitter, setSiteTwitter] = useState('');
  const [siteInstagram, setSiteInstagram] = useState('');
  const [siteYoutube, setSiteYoutube] = useState('');
  
  const { user, loading: authLoading } = useAuth();
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
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const wizardSteps = userType === 'site_owner' 
    ? ['Site ve Şirket', 'İletişim', 'Şirket Detayları', 'Özet']
    : ['Profil Bilgileri'];

  const validateStep = (step: number): boolean => {
    if (userType === 'user') {
      if (!username.trim()) {
        toast({ title: 'Hata', description: 'Lütfen kullanıcı adı girin', variant: 'destructive' });
        return false;
      }
      if (username.length < 3) {
        toast({ title: 'Hata', description: 'Kullanıcı adı en az 3 karakter olmalıdır', variant: 'destructive' });
        return false;
      }
      return true;
    }

    switch (step) {
      case 0:
        if (!selectedSite) {
          toast({ title: 'Hata', description: 'Lütfen bir site seçin', variant: 'destructive' });
          return false;
        }
        if (selectedSite === 'new_site' && !newSiteName.trim()) {
          toast({ title: 'Hata', description: 'Lütfen site adını girin', variant: 'destructive' });
          return false;
        }
        if (!companyName.trim()) {
          toast({ title: 'Hata', description: 'Lütfen şirket adını girin', variant: 'destructive' });
          return false;
        }
        return true;
      case 1:
        if (!contactName.trim()) {
          toast({ title: 'Hata', description: 'Lütfen yetkili kişi adını girin', variant: 'destructive' });
          return false;
        }
        if (!siteEmail && !siteTelegram && !siteWhatsapp) {
          toast({ title: 'Hata', description: 'En az bir iletişim yöntemi girmelisiniz', variant: 'destructive' });
          return false;
        }
        return true;
      case 2:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, wizardSteps.length - 1));
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail || !password || !confirmPassword) {
      toast({ title: 'Hata', description: 'Lütfen tüm zorunlu alanları doldurun', variant: 'destructive' });
      return;
    }
    
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast({ title: 'Hata', description: 'Lütfen ad, soyad ve telefon alanlarını doldurun', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Hata', description: 'Şifreler eşleşmiyor', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Hata', description: 'Şifre en az 6 karakter olmalıdır', variant: 'destructive' });
      return;
    }

    if (userType === 'user' && !validateStep(0)) return;
    if (userType === 'site_owner' && !validateStep(currentStep)) return;

    setLoading(true);
    
    try {
      const metadata: any = {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        accountType: userType
      };

      if (userType === 'user') {
        metadata.username = username;
      } else {
        // Kurumsal üyelik metadata - handle_new_user ile uyumlu field isimleri
        metadata.companyName = companyName;
        metadata.companyDescription = description;
        metadata.companyWebsite = companyWebsite;
        metadata.contactPersonName = contactName;
        // İletişim bilgileri - doğru field isimleri
        metadata.supportEmail = siteEmail; // profiles.support_email
        metadata.contactTelegram = siteTelegram;
        metadata.contactWhatsapp = siteWhatsapp;
        // Sosyal medya - doğru field isimleri
        metadata.socialFacebook = siteFacebook;
        metadata.socialTwitter = siteTwitter;
        metadata.socialInstagram = siteInstagram;
        metadata.socialYoutube = siteYoutube;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          data: metadata
        }
      });

      if (signUpError) throw signUpError;

      if (userType === 'site_owner' && authData.user) {
        const ownerData: any = {
          user_id: authData.user.id,
          company_name: companyName,
          description: description,
          logo_url: logoUrl,
          contact_person_name: contactName,
          // Site_owners tablosundaki doğru kolon isimleri
          contact_email: siteEmail,
          contact_telegram: siteTelegram,
          contact_whatsapp: siteWhatsapp,
          social_facebook: siteFacebook,
          social_twitter: siteTwitter,
          social_instagram: siteInstagram,
          social_youtube: siteYoutube,
          support_email: siteEmail, // Profiles ile tutarlılık için
          status: 'pending'
        };

        if (selectedSite === 'new_site') {
          ownerData.new_site_name = newSiteName;
        } else {
          ownerData.site_id = selectedSite;
        }

        const { error: ownerError } = await supabase.from('site_owners').insert(ownerData);

        if (ownerError) {
          console.error('Site owner oluşturma hatası:', ownerError);
          toast({ 
            title: 'Uyarı', 
            description: 'Hesabınız oluşturuldu ancak başvurunuz kaydedilemedi. Lütfen destek ile iletişime geçin.', 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Başvuru Alındı!', 
            description: 'Başvurunuz başarıyla kaydedildi. Yönetici onayı bekleniyor.', 
            duration: 6000 
          });
        }
      } else {
        analytics.trackSignup();
        toast({ 
          title: 'Kayıt Başarılı!', 
          description: 'Hesabınız başarıyla oluşturuldu.', 
          duration: 4000 
        });
      }

      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setLoading(false);
      toast({ 
        title: 'Kayıt Başarısız', 
        description: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.', 
        variant: 'destructive' 
      });
    }
  };

  const renderWizardStep = () => {
    if (userType === 'user') {
      return (
        <StepIndividualProfile
          username={username}
          setUsername={setUsername}
          disabled={loading}
        />
      );
    }

    switch (currentStep) {
      case 0:
        return <Step1Basic selectedSite={selectedSite} setSelectedSite={setSelectedSite} newSiteName={newSiteName} setNewSiteName={setNewSiteName} companyName={companyName} setCompanyName={setCompanyName} description={description} setDescription={setDescription} logoUrl={logoUrl} setLogoUrl={setLogoUrl} sites={sites || []} disabled={loading} userEmail={userEmail} />;
      case 1:
        return <Step2ContactSocial contactName={contactName} setContactName={setContactName} email={siteEmail} setEmail={setSiteEmail} telegram={siteTelegram} setTelegram={setSiteTelegram} whatsapp={siteWhatsapp} setWhatsapp={setSiteWhatsapp} facebook={siteFacebook} setFacebook={setSiteFacebook} twitter={siteTwitter} setTwitter={setSiteTwitter} instagram={siteInstagram} setInstagram={setSiteInstagram} youtube={siteYoutube} setYoutube={setSiteYoutube} disabled={loading} />;
      case 2:
        return <Step3CompanyDetails companyWebsite={companyWebsite} setCompanyWebsite={setCompanyWebsite} disabled={loading} />;
      case 3:
        return <Step4Summary selectedSite={selectedSite} newSiteName={newSiteName} companyName={companyName} description={description} companyWebsite={companyWebsite} contactName={contactName} email={siteEmail} telegram={siteTelegram} whatsapp={siteWhatsapp} facebook={siteFacebook} twitter={siteTwitter} instagram={siteInstagram} youtube={siteYoutube} logoUrl={logoUrl} sites={sites || []} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Kayıt Ol
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Hesap oluşturmak için bilgilerinizi girin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hesap Tipi - Kompakt */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hesap Tipi</Label>
              <RadioGroup 
                value={userType} 
                onValueChange={(value) => { 
                  setUserType(value as 'user' | 'site_owner'); 
                  setCurrentStep(0); 
                }} 
                className="grid grid-cols-2 gap-3"
              >
                <div className={`relative flex items-center space-x-2 border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${userType === 'user' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="cursor-pointer text-sm font-medium">
                    Bireysel
                  </Label>
                </div>
                <div className={`relative flex items-center space-x-2 border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${userType === 'site_owner' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <RadioGroupItem value="site_owner" id="site_owner" />
                  <Label htmlFor="site_owner" className="cursor-pointer text-sm font-medium">
                    Site Sahibi
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Form Alanları - Kompakt Grid Layout */}
            <div className="space-y-3">
              {/* Ad Soyad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-sm">Ad *</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm">Soyad *</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Telefon Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">Telefon *</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+90 5XX XXX XX XX" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">E-posta *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userEmail} 
                    onChange={(e) => setUserEmail(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Kullanıcı Adı - Sadece bireysel için */}
              {userType === 'user' && (
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm">Kullanıcı Adı *</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="kullaniciadi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    disabled={loading}
                    maxLength={20}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sadece küçük harf, rakam ve alt çizgi
                  </p>
                </div>
              )}

              {/* Şifreler Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm">Şifre *</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      disabled={loading}
                      className="h-10 pr-10"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-10 w-10" 
                      onClick={() => setShowPassword(!showPassword)} 
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm">Şifre Tekrar *</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      disabled={loading}
                      className="h-10 pr-10"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-10 w-10" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Wizard için */}
            {wizardSteps.length > 0 && userType === 'site_owner' && (
              <>
                <WizardProgress steps={wizardSteps} currentStep={currentStep} />
                <div className="min-h-[200px]">{renderWizardStep()}</div>
              </>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              {userType === 'site_owner' && currentStep > 0 && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-1" />Geri
                </Button>
              )}
              
              {userType === 'site_owner' && currentStep < wizardSteps.length - 1 ? (
                <Button type="button" onClick={handleNext} disabled={loading} className="flex-1 ml-auto">
                  İleri<ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 ml-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Kayıt Ediliyor...
                    </>
                  ) : (
                    'Kayıt Ol'
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-4 text-center text-sm border-t pt-4">
            <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              Giriş Yap
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;