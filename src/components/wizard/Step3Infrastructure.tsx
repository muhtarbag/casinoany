import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Server } from 'lucide-react';

interface Step3InfrastructureProps {
  provider: string;
  setProvider: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  disabled?: boolean;
}

export const Step3Infrastructure = ({
  provider,
  setProvider,
  notes,
  setNotes,
  disabled
}: Step3InfrastructureProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Altyapı Bilgileri</h3>
      <p className="text-sm text-muted-foreground">Sitenizin altyapı bilgilerini paylaşın (Opsiyonel)</p>

      <div className="space-y-2">
        <Label htmlFor="provider" className="flex items-center gap-2">
          <Server className="w-4 h-4" />
          Altyapı Sağlayıcısı
        </Label>
        <Select value={provider} onValueChange={setProvider} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Sağlayıcı seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cloudflare">Cloudflare</SelectItem>
            <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
            <SelectItem value="google_cloud">Google Cloud</SelectItem>
            <SelectItem value="azure">Microsoft Azure</SelectItem>
            <SelectItem value="digitalocean">DigitalOcean</SelectItem>
            <SelectItem value="linode">Linode</SelectItem>
            <SelectItem value="vultr">Vultr</SelectItem>
            <SelectItem value="hetzner">Hetzner</SelectItem>
            <SelectItem value="ovh">OVH</SelectItem>
            <SelectItem value="custom">Özel Sunucu</SelectItem>
            <SelectItem value="other">Diğer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="infrastructure_notes">Ek Bilgiler</Label>
        <Textarea
          id="infrastructure_notes"
          placeholder="Sunucu konumu, CDN kullanımı, güvenlik önlemleri vb..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={disabled}
          rows={4}
        />
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">Bu bilgiler neden isteniyor?</p>
        <p className="text-muted-foreground">
          Altyapı bilgileri, sitenizin güvenilirliği ve performansı hakkında kullanıcılarımıza 
          daha fazla bilgi vermemize yardımcı olur.
        </p>
      </div>
    </div>
  );
};
