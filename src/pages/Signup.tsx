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
  const [email, setEmail] = useState('');
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
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [favoriteGameProviders, setFavoriteGameProviders] = useState<string[]>([]);

  const [selectedSite, setSelectedSite] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTeams, setContactTeams] = useState('');
  const [contactTelegram, setContactTelegram] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [telegramChannel, setTelegramChannel] = useState('');
  const [kick, setKick] = useState('');
  const [discord, setDiscord] = useState('');
  const [bioLink, setBioLink] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [pinterest, setPinterest] = useState('');
  
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
        if (!contactEmail && !contactTeams && !contactTelegram && !contactWhatsapp) {
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
    
    if (!email || !password || !confirmPassword) {
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
        metadata.city = city;
        metadata.district = district;
        metadata.favoriteTeam = favoriteTeam;
        metadata.interests = interests.join(',');
        metadata.favoriteGameProviders = favoriteGameProviders.join(',');
      } else {
        metadata.companyName = companyName;
        metadata.companyDescription = description;
        metadata.companyWebsite = companyWebsite;
        metadata.contactPersonName = contactName;
        metadata.contactEmail = contactEmail;
        metadata.contactTeams = contactTeams;
        metadata.contactTelegram = contactTelegram;
        metadata.contactWhatsapp = contactWhatsapp;
        metadata.socialFacebook = facebook;
        metadata.socialTwitter = twitter;
        metadata.socialInstagram = instagram;
        metadata.socialLinkedin = linkedin;
        metadata.socialYoutube = youtube;
        metadata.socialTelegramChannel = telegramChannel;
        metadata.socialKick = kick;
        metadata.socialDiscord = discord;
        metadata.bioLink = bioLink;
        metadata.supportEmail = supportEmail;
        metadata.socialPinterest = pinterest;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
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
          contact_email: contactEmail,
          contact_teams: contactTeams,
          contact_telegram: contactTelegram,
          contact_whatsapp: contactWhatsapp,
          social_facebook: facebook,
          social_twitter: twitter,
          social_instagram: instagram,
          social_linkedin: linkedin,
          social_youtube: youtube,
          social_telegram_channel: telegramChannel,
          social_kick: kick,
          social_discord: discord,
          social_bio_link: bioLink,
          support_email: supportEmail,
          social_pinterest: pinterest,
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
          city={city}
          setCity={setCity}
          district={district}
          setDistrict={setDistrict}
          favoriteTeam={favoriteTeam}
          setFavoriteTeam={setFavoriteTeam}
          interests={interests}
          setInterests={setInterests}
          favoriteGameProviders={favoriteGameProviders}
          setFavoriteGameProviders={setFavoriteGameProviders}
          disabled={loading}
        />
      );
    }

    switch (currentStep) {
      case 0:
        return <Step1Basic selectedSite={selectedSite} setSelectedSite={setSelectedSite} newSiteName={newSiteName} setNewSiteName={setNewSiteName} companyName={companyName} setCompanyName={setCompanyName} description={description} setDescription={setDescription} logoUrl={logoUrl} setLogoUrl={setLogoUrl} sites={sites || []} disabled={loading} userEmail={email} />;
      case 1:
        return <Step2ContactSocial contactName={contactName} setContactName={setContactName} contactEmail={contactEmail} setContactEmail={setContactEmail} contactTeams={contactTeams} setContactTeams={setContactTeams} contactTelegram={contactTelegram} setContactTelegram={setContactTelegram} contactWhatsapp={contactWhatsapp} setContactWhatsapp={setContactWhatsapp} facebook={facebook} setFacebook={setFacebook} twitter={twitter} setTwitter={setTwitter} instagram={instagram} setInstagram={setInstagram} linkedin={linkedin} setLinkedin={setLinkedin} youtube={youtube} setYoutube={setYoutube} telegramChannel={telegramChannel} setTelegramChannel={setTelegramChannel} kick={kick} setKick={setKick} discord={discord} setDiscord={setDiscord} bioLink={bioLink} setBioLink={setBioLink} supportEmail={supportEmail} setSupportEmail={setSupportEmail} pinterest={pinterest} setPinterest={setPinterest} disabled={loading} />;
      case 2:
        return <Step3CompanyDetails companyWebsite={companyWebsite} setCompanyWebsite={setCompanyWebsite} disabled={loading} />;
      case 3:
        return <Step4Summary selectedSite={selectedSite} newSiteName={newSiteName} companyName={companyName} description={description} companyWebsite={companyWebsite} contactName={contactName} contactEmail={contactEmail} contactTeams={contactTeams} contactTelegram={contactTelegram} contactWhatsapp={contactWhatsapp} facebook={facebook} twitter={twitter} instagram={instagram} linkedin={linkedin} youtube={youtube} telegramChannel={telegramChannel} kick={kick} discord={discord} bioLink={bioLink} supportEmail={supportEmail} pinterest={pinterest} logoUrl={logoUrl} sites={sites || []} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Kayıt Ol</CardTitle>
          <CardDescription className="text-center">Hesap oluşturmak için bilgilerinizi girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>Hesap Tipi</Label>
              <RadioGroup value={userType} onValueChange={(value) => { setUserType(value as 'user' | 'site_owner'); setCurrentStep(0); }} className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="cursor-pointer flex-1">
                    <div className="font-semibold">Bireysel Kullanıcı</div>
                    <p className="text-xs text-muted-foreground mt-1">Site incelemesi yapabilir, yorum yazabilirsiniz</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
                  <RadioGroupItem value="site_owner" id="site_owner" />
                  <Label htmlFor="site_owner" className="cursor-pointer flex-1">
                    <div className="font-semibold">Site Sahibi</div>
                    <p className="text-xs text-muted-foreground mt-1">Site ekleyebilir, yönetebilirsiniz</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad *</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input id="phone" type="tel" placeholder="+90 5XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre *</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {wizardSteps.length > 0 && <WizardProgress steps={wizardSteps} currentStep={currentStep} />}

            <div className="min-h-[300px]">{renderWizardStep()}</div>

            <div className="flex gap-3">
              {userType === 'site_owner' && currentStep > 0 && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                  <ChevronLeft className="w-4 h-4 mr-2" />Geri
                </Button>
              )}
              
              {userType === 'site_owner' && currentStep < wizardSteps.length - 1 ? (
                <Button type="button" onClick={handleNext} disabled={loading} className="ml-auto">
                  İleri<ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="ml-auto">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Kaydediliyor...</> : 'Kayıt Ol'}
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Zaten hesabınız var mı? <Link to="/login" className="text-primary hover:underline">Giriş Yap</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;