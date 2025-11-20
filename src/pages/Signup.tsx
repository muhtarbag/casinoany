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
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Logo / Back to Home */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 sm:absolute sm:top-6 sm:left-6 flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors group z-10"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
          <span className="text-white font-bold text-base sm:text-lg">C</span>
        </div>
        <span className="font-semibold hidden sm:inline-block">CasinoAny</span>
      </Link>

      <Card className="w-full max-w-lg shadow-2xl border-primary/10 backdrop-blur-sm bg-background/95 relative z-10 animate-scale-in mt-16 sm:mt-0">
        <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Hoş Geldiniz
          </CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm">
            Hesap oluşturarak topluluğumuza katılın
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Hesap Tipi - Modern Cards */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Üyelik Türü Seçin</Label>
              <RadioGroup 
                value={userType} 
                onValueChange={(value) => { 
                  setUserType(value as 'user' | 'site_owner'); 
                  setCurrentStep(0); 
                }} 
                className="grid grid-cols-2 gap-2 sm:gap-3"
              >
                <div className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${userType === 'user' ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md' : 'border-border/50 hover:border-primary/30'}`}>
                  <RadioGroupItem value="user" id="user" className="absolute top-2 right-2 sm:top-3 sm:right-3" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-1.5 sm:mb-2 shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <Label htmlFor="user" className="cursor-pointer text-center">
                    <div className="font-semibold text-xs sm:text-sm">Bireysel</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Üye olun</p>
                  </Label>
                </div>
                <div className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${userType === 'site_owner' ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md' : 'border-border/50 hover:border-primary/30'}`}>
                  <RadioGroupItem value="site_owner" id="site_owner" className="absolute top-2 right-2 sm:top-3 sm:right-3" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center mb-1.5 sm:mb-2 shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <Label htmlFor="site_owner" className="cursor-pointer text-center">
                    <div className="font-semibold text-sm">Site Sahibi</div>
                    <p className="text-xs text-muted-foreground mt-0.5">İşletme</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Form Alanları - Premium Design */}
            <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
              {/* Ad Soyad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Ad
                  </Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-10 sm:h-11 border-border/50 focus:border-primary transition-colors text-sm"
                    placeholder="Adınız"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Soyad
                  </Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-10 sm:h-11 border-border/50 focus:border-primary transition-colors text-sm"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>

              {/* Telefon Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    Telefon
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+90 5XX XXX XX XX" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-10 sm:h-11 border-border/50 focus:border-primary transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    E-posta
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userEmail} 
                    onChange={(e) => setUserEmail(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-10 sm:h-11 border-border/50 focus:border-primary transition-colors text-sm"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              {/* Kullanıcı Adı - Sadece bireysel için */}
              {userType === 'user' && (
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Kullanıcı Adı
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="kullaniciadi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    disabled={loading}
                    maxLength={20}
                    className="h-10 sm:h-11 border-border/50 focus:border-primary transition-colors text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sadece küçük harf, rakam ve alt çizgi
                  </p>
                </div>
              )}

              {/* Şifreler Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Şifre
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      disabled={loading}
                      className="h-10 sm:h-11 pr-10 border-border/50 focus:border-primary transition-colors text-sm"
                      placeholder="••••••••"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-10 w-10 sm:h-11 sm:w-11 hover:bg-transparent" 
                      onClick={() => setShowPassword(!showPassword)} 
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Şifre Tekrar
                  </Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      disabled={loading}
                      className="h-10 sm:h-11 pr-10 border-border/50 focus:border-primary transition-colors text-sm"
                      placeholder="••••••••"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-10 w-10 sm:h-11 sm:w-11 hover:bg-transparent" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Wizard için */}
            {wizardSteps.length > 0 && userType === 'site_owner' && (
              <>
                <WizardProgress steps={wizardSteps} currentStep={currentStep} />
                <div className="min-h-[180px] sm:min-h-[200px]">{renderWizardStep()}</div>
              </>
            )}

            {/* Submit Buttons - Premium Design */}
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              {userType === 'site_owner' && currentStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack} 
                  disabled={loading} 
                  className="flex-1 h-10 sm:h-11 border-border/50 hover:border-primary/50 text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />Geri
                </Button>
              )}
              
              {userType === 'site_owner' && currentStep < wizardSteps.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={loading} 
                  className="flex-1 ml-auto h-10 sm:h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm"
                >
                  İleri<ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 ml-auto h-10 sm:h-11 bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all text-white font-medium text-xs sm:text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Kayıt Ediliyor...</span>
                      <span className="sm:hidden">Kayıt...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Kayıt Ol
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Login Link - Enhanced */}
          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm border-t pt-4 sm:pt-6">
            <p className="text-muted-foreground mb-1.5 sm:mb-2">
              Zaten hesabınız var mı?
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1 sm:gap-1.5 text-primary hover:text-primary/80 font-medium transition-colors group"
            >
              Giriş Yap
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;