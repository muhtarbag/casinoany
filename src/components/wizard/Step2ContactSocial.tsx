import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, MessageSquare, Send, Phone, AlertCircle, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Step2ContactSocialProps {
  contactName: string;
  setContactName: (value: string) => void;
  contactEmail: string;
  setContactEmail: (value: string) => void;
  contactTeams: string;
  setContactTeams: (value: string) => void;
  contactTelegram: string;
  setContactTelegram: (value: string) => void;
  contactWhatsapp: string;
  setContactWhatsapp: (value: string) => void;
  facebook: string;
  setFacebook: (value: string) => void;
  twitter: string;
  setTwitter: (value: string) => void;
  instagram: string;
  setInstagram: (value: string) => void;
  linkedin: string;
  setLinkedin: (value: string) => void;
  youtube: string;
  setYoutube: (value: string) => void;
  disabled?: boolean;
}

export const Step2ContactSocial = ({
  contactName,
  setContactName,
  contactEmail,
  setContactEmail,
  contactTeams,
  setContactTeams,
  contactTelegram,
  setContactTelegram,
  contactWhatsapp,
  setContactWhatsapp,
  facebook,
  setFacebook,
  twitter,
  setTwitter,
  instagram,
  setInstagram,
  linkedin,
  setLinkedin,
  youtube,
  setYoutube,
  disabled
}: Step2ContactSocialProps) => {
  const hasAtLeastOneContact = contactEmail || contactTeams || contactTelegram || contactWhatsapp;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">İletişim Bilgileri</h3>
        <Alert variant={hasAtLeastOneContact ? "default" : "destructive"} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            En az bir iletişim yöntemi zorunludur (Email, Teams, Telegram veya WhatsApp)
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Yetkili Kişi Adı *</Label>
            <Input
              id="contactName"
              type="text"
              placeholder="Ad Soyad"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="iletisim@site.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactTeams" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Microsoft Teams
              </Label>
              <Input
                id="contactTeams"
                type="text"
                placeholder="Teams kullanıcı adı"
                value={contactTeams}
                onChange={(e) => setContactTeams(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactTelegram" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Telegram
              </Label>
              <Input
                id="contactTelegram"
                type="text"
                placeholder="@kullaniciadi"
                value={contactTelegram}
                onChange={(e) => setContactTelegram(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactWhatsapp" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp
              </Label>
              <Input
                id="contactWhatsapp"
                type="tel"
                placeholder="+90 5XX XXX XX XX"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-lg mb-2">Sosyal Medya Hesapları</h3>
        <p className="text-sm text-muted-foreground mb-4">Opsiyonel - Sosyal medya hesaplarınızı ekleyebilirsiniz</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </Label>
            <Input
              id="facebook"
              type="url"
              placeholder="https://facebook.com/..."
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="w-4 h-4 text-sky-500" />
              Twitter / X
            </Label>
            <Input
              id="twitter"
              type="url"
              placeholder="https://twitter.com/..."
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-600" />
              Instagram
            </Label>
            <Input
              id="instagram"
              type="url"
              placeholder="https://instagram.com/..."
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-700" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/..."
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="youtube" className="flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-600" />
              YouTube
            </Label>
            <Input
              id="youtube"
              type="url"
              placeholder="https://youtube.com/..."
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
