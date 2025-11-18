import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, Globe, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Step4SummaryProps {
  selectedSite: string;
  newSiteName: string;
  companyName: string;
  description: string;
  companyWebsite: string;
  contactName: string;
  contactEmail: string;
  contactTeams: string;
  contactTelegram: string;
  contactWhatsapp: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  telegramChannel: string;
  kick: string;
  discord: string;
  bioLink: string;
  supportEmail: string;
  pinterest: string;
  logoUrl: string;
  sites: any[];
}

export const Step4Summary = (props: Step4SummaryProps) => {
  const siteName = props.selectedSite === 'new_site' 
    ? props.newSiteName 
    : props.sites?.find(s => s.id === props.selectedSite)?.name || 'Site seçilmedi';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="font-semibold text-xl mb-2">Başvuru Özeti</h3>
        <p className="text-muted-foreground text-sm">
          Lütfen bilgilerinizi kontrol edin. Başvurunuz yöneticiler tarafından incelenecektir.
        </p>
      </div>

      <Separator />

      {/* Site & Company Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Site Bilgisi</p>
              <p className="text-lg font-semibold">{siteName}</p>
            </div>
            <Badge variant={props.selectedSite === 'new_site' ? 'default' : 'secondary'}>
              {props.selectedSite === 'new_site' ? 'Yeni Site' : 'Mevcut Site'}
            </Badge>
          </div>

          {props.logoUrl && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Logo</p>
              <img src={props.logoUrl} alt="Site Logo" className="h-16 object-contain rounded border p-2" />
            </div>
          )}

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">{props.companyName}</p>
            </div>

            {props.companyWebsite && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a href={props.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {props.companyWebsite}
                </a>
              </div>
            )}
          </div>

          {props.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Açıklama</p>
                <p className="text-sm">{props.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <h4 className="font-semibold">İletişim Bilgileri</h4>
          
          {props.contactName && (
            <div className="text-sm">
              <span className="text-muted-foreground">Yetkili Kişi:</span> {props.contactName}
            </div>
          )}

          <div className="grid gap-2 text-sm">
            {props.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{props.contactEmail}</span>
              </div>
            )}
            {props.contactTeams && (
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span>Teams: {props.contactTeams}</span>
              </div>
            )}
            {props.contactTelegram && (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-muted-foreground" />
                <span>Telegram: {props.contactTelegram}</span>
              </div>
            )}
            {props.contactWhatsapp && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>WhatsApp: {props.contactWhatsapp}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      {(props.facebook || props.twitter || props.instagram || props.linkedin || props.youtube || 
        props.telegramChannel || props.kick || props.discord || props.bioLink || props.supportEmail || props.pinterest) && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-3">Sosyal Medya</h4>
            <div className="flex flex-wrap gap-2">
              {props.facebook && <Badge variant="outline">Facebook</Badge>}
              {props.twitter && <Badge variant="outline">Twitter/X</Badge>}
              {props.instagram && <Badge variant="outline">Instagram</Badge>}
              {props.linkedin && <Badge variant="outline">LinkedIn</Badge>}
              {props.youtube && <Badge variant="outline">YouTube</Badge>}
              {props.telegramChannel && <Badge variant="outline">Telegram Kanal</Badge>}
              {props.kick && <Badge variant="outline">Kick</Badge>}
              {props.discord && <Badge variant="outline">Discord</Badge>}
              {props.pinterest && <Badge variant="outline">Pinterest</Badge>}
              {props.supportEmail && <Badge variant="outline">Destek Mail</Badge>}
              {props.bioLink && <Badge variant="outline">Bio Link</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
        <p className="font-medium mb-1">📋 Sonraki Adımlar:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Başvurunuz yönetici ekibimiz tarafından incelenecektir</li>
          <li>Onay süreci genellikle 1-2 iş günü içinde tamamlanır</li>
          <li>Sonuç hakkında e-posta ile bilgilendirileceksiniz</li>
        </ul>
      </div>
    </div>
  );
};