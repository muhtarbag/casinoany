import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, MessageSquare, Send, Phone, AlertCircle } from 'lucide-react';

interface Step5ContactProps {
  contactName: string;
  setContactName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  teams: string;
  setTeams: (value: string) => void;
  telegram: string;
  setTelegram: (value: string) => void;
  whatsapp: string;
  setWhatsapp: (value: string) => void;
  disabled?: boolean;
}

export const Step5Contact = ({
  contactName,
  setContactName,
  email,
  setEmail,
  teams,
  setTeams,
  telegram,
  setTelegram,
  whatsapp,
  setWhatsapp,
  disabled
}: Step5ContactProps) => {
  const hasAtLeastOneContact = email || teams || telegram || whatsapp;

  return (
    <div className="space-y-4">
      <Alert variant={hasAtLeastOneContact ? "default" : "destructive"}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>En az bir iletişim yöntemi zorunludur</strong>
          <p className="text-sm mt-1">
            Şikayetler ve önemli bildirimler için en az bir iletişim kanalı seçmelisiniz.
          </p>
        </AlertDescription>
      </Alert>

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

      <div className="grid gap-4 md:grid-cols-2">
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
          <Label htmlFor="teams" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Microsoft Teams
          </Label>
          <Input
            id="teams"
            type="text"
            placeholder="Teams kullanıcı adı"
            value={teams}
            onChange={(e) => setTeams(e.target.value)}
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
            placeholder="@kullaniciadi veya +90..."
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
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
            type="tel"
            placeholder="+90 5XX XXX XX XX"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
        <p className="font-medium">İletişim Bilgileri Kullanım Amacı:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Kullanıcı şikayetlerinin size iletilmesi</li>
          <li>Önemli platform güncellemeleri</li>
          <li>Site durumu ile ilgili acil bildirimler</li>
          <li>Hesap onay işlemleri</li>
        </ul>
      </div>
    </div>
  );
};
