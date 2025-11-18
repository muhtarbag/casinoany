import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, Phone, AlertCircle, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Step2ContactSocialProps {
  contactName: string;
  setContactName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  telegram: string;
  setTelegram: (value: string) => void;
  whatsapp: string;
  setWhatsapp: (value: string) => void;
  facebook: string;
  setFacebook: (value: string) => void;
  twitter: string;
  setTwitter: (value: string) => void;
  instagram: string;
  setInstagram: (value: string) => void;
  youtube: string;
  setYoutube: (value: string) => void;
  disabled?: boolean;
}

export const Step2ContactSocial = ({
  contactName,
  setContactName,
  email,
  setEmail,
  telegram,
  setTelegram,
  whatsapp,
  setWhatsapp,
  facebook,
  setFacebook,
  twitter,
  setTwitter,
  instagram,
  setInstagram,
  youtube,
  setYoutube,
  disabled
}: Step2ContactSocialProps) => {
  const hasAtLeastOneContact = email || telegram || whatsapp;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">İletişim Bilgileri</h3>
        <Alert variant={hasAtLeastOneContact ? "default" : "destructive"} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            En az bir iletişim yöntemi zorunludur (Email, Telegram veya WhatsApp)
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
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="iletisim@site.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="text"
                placeholder="+90 555 555 55 55"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Telegram
              </Label>
              <Input
                id="telegram"
                type="text"
                placeholder="@kullaniciadi"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-lg mb-4">Sosyal Medya Hesapları</h3>
        <p className="text-sm text-muted-foreground mb-4">Sosyal medya hesaplarınızı ekleyin (isteğe bağlı)</p>

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
