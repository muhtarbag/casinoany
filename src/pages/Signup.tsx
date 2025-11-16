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
  const [wizardData, setWizardData] = useState({
    selectedSite: '',
    newSiteName: '',
    companyName: '',
    description: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    telegramChannel: '',
    kick: '',
    discord: '',
    bioLink: '',
    logoUrl: '',
    contactName: '',
    contactEmail: '',
    contactTeams: '',
    contactTelegram: '',
    contactWhatsapp: '',
  });
  
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
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const wizardSteps = ['Site ve Şirket', 'İletişim ve Sosyal Medya'];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!wizardData.selectedSite) {
          toast({ title: 'Hata', description: 'Lütfen bir site seçin', variant: 'destructive' });
          return false;
        }
        if (wizardData.selectedSite === 'new_site' && !wizardData.newSiteName.trim()) {
          toast({ title: 'Hata', description: 'Lütfen site adını girin', variant: 'destructive' });
          return false;
        }
        return true;
      case 1:
        if (!wizardData.contactName.trim()) {
          toast({ title: 'Hata', description: 'Lütfen yetkili kişi adını girin', variant: 'destructive' });
          return false;
        }
        if (!wizardData.contactEmail && !wizardData.contactTeams && !wizardData.contactTelegram && !wizardData.contactWhatsapp) {
          toast({ title: 'Hata', description: 'En az bir iletişim yöntemi girmelisiniz', variant: 'destructive' });
          return false;
        }
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
    
    if (userType === 'user' && (!firstName.trim() || !lastName.trim() || !phone.trim())) {
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
    if (userType === 'site_owner' && !validateStep(1)) return;

    setLoading(true);
    
    const userData = userType === 'user' ? { firstName, lastName, phone } : undefined;
    const result = await signUp(email, password, userType, wizardData.selectedSite !== 'new_site' ? wizardData.selectedSite : null, userData);
    if (result.error) {
      setLoading(false);
      toast({ title: 'Kayıt Başarısız', description: result.error.message, variant: 'destructive' });
      return;
    }

    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (userType === 'site_owner' && newUser) {
      const ownerData: any = {
        user_id: newUser.id,
        company_name: wizardData.companyName,
        description: wizardData.description,
        logo_url: wizardData.logoUrl,
        contact_person_name: wizardData.contactName,
        contact_email: wizardData.contactEmail,
        contact_teams: wizardData.contactTeams,
        contact_telegram: wizardData.contactTelegram,
        contact_whatsapp: wizardData.contactWhatsapp,
        social_facebook: wizardData.facebook,
        social_twitter: wizardData.twitter,
        social_instagram: wizardData.instagram,
        social_linkedin: wizardData.linkedin,
        social_youtube: wizardData.youtube,
        social_telegram_channel: wizardData.telegramChannel,
        social_kick: wizardData.kick,
        social_discord: wizardData.discord,
        social_bio_link: wizardData.bioLink,
        status: 'pending'
      };

      // If user wants to create a new site or selected existing site
      if (wizardData.selectedSite === 'new_site') {
        ownerData.new_site_name = wizardData.newSiteName;
      } else {
        ownerData.site_id = wizardData.selectedSite;
      }

      await (supabase as any).from('site_owners').insert(ownerData);
      toast({ title: 'Başvuru Alındı!', description: 'Admin onayı bekleniyor.', duration: 6000 });
    } else {
      analytics.trackSignup();
      toast({ title: 'Kayıt Başarılı!', description: 'Hesabınız oluşturuldu.', duration: 4000 });
    }

    setLoading(false);
    setTimeout(() => navigate('/login'), 2000);
  };

  const renderWizardStep = () => {
    const props = { ...wizardData, sites: sites || [], disabled: loading };
    const update = (field: string) => (value: string) => setWizardData({...wizardData, [field]: value});
    
    switch (currentStep) {
      case 0: return <Step1Basic {...props} setSelectedSite={update('selectedSite')} setNewSiteName={update('newSiteName')} setCompanyName={update('companyName')} setDescription={update('description')} setLogoUrl={update('logoUrl')} />;
      case 1: return <Step2ContactSocial 
        contactName={wizardData.contactName} 
        setContactName={update('contactName')} 
        contactEmail={wizardData.contactEmail} 
        setContactEmail={update('contactEmail')} 
        contactTeams={wizardData.contactTeams} 
        setContactTeams={update('contactTeams')} 
        contactTelegram={wizardData.contactTelegram} 
        setContactTelegram={update('contactTelegram')} 
        contactWhatsapp={wizardData.contactWhatsapp} 
        setContactWhatsapp={update('contactWhatsapp')} 
        facebook={wizardData.facebook} 
        setFacebook={update('facebook')} 
        twitter={wizardData.twitter} 
        setTwitter={update('twitter')} 
        instagram={wizardData.instagram} 
        setInstagram={update('instagram')} 
        linkedin={wizardData.linkedin} 
        setLinkedin={update('linkedin')} 
        youtube={wizardData.youtube} 
        setYoutube={update('youtube')}
        telegramChannel={wizardData.telegramChannel}
        setTelegramChannel={update('telegramChannel')}
        kick={wizardData.kick}
        setKick={update('kick')}
        discord={wizardData.discord}
        setDiscord={update('discord')}
        bioLink={wizardData.bioLink}
        setBioLink={update('bioLink')}
        disabled={loading} 
      />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Kayıt Ol</CardTitle>
          <CardDescription className="text-center">Yeni hesap oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>Hesap Tipi</Label>
              <RadioGroup value={userType} onValueChange={(value: any) => setUserType(value)}>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Bireysel Kullanıcı Kaydı</div>
                    <div className="text-sm text-muted-foreground">Siteleri favorilere ekle, yorum yap, şikayet et</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="site_owner" id="site_owner" />
                  <Label htmlFor="site_owner" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Kurumsal Kullanıcı Kaydı</div>
                    <div className="text-sm text-muted-foreground">Kendi sitenizi yönetin</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {userType === 'user' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad *</Label>
                    <Input id="firstName" type="text" placeholder="Adınız" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad *</Label>
                    <Input id="lastName" type="text" placeholder="Soyadınız" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input id="phone" type="tel" placeholder="+90 5XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Şifre *</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="pr-10" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className="pr-10" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            </div>

            {userType === 'site_owner' && (
              <div className="border rounded-lg p-6 space-y-6">
                <WizardProgress steps={wizardSteps} currentStep={currentStep} />
                {renderWizardStep()}
                <div className="flex gap-3">
                  {currentStep > 0 && <Button type="button" variant="outline" onClick={handleBack} disabled={loading}><ChevronLeft className="w-4 h-4 mr-1" />Geri</Button>}
                  {currentStep < wizardSteps.length - 1 && <Button type="button" onClick={handleNext} disabled={loading} className="ml-auto">İleri<ChevronRight className="w-4 h-4 ml-1" /></Button>}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />İşleniyor...</> : 'Kayıt Ol'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Hesabınız var mı? </span>
            <Link to="/login" className="text-primary hover:underline">Giriş Yap</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
