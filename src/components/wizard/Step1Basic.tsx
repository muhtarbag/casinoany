import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step1BasicProps {
  selectedSite: string;
  setSelectedSite: (value: string) => void;
  newSiteName: string;
  setNewSiteName: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  sites: any[];
  disabled?: boolean;
}

export const Step1Basic = ({
  selectedSite,
  setSelectedSite,
  newSiteName,
  setNewSiteName,
  companyName,
  setCompanyName,
  description,
  setDescription,
  sites,
  disabled
}: Step1BasicProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="site">Site Seçimi *</Label>
        <Select value={selectedSite} onValueChange={setSelectedSite} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Sitenizi seçin veya yeni site ekleyin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_site" className="font-semibold text-primary">
              ➕ Yeni Site Ekle
            </SelectItem>
            {sites && sites.length > 0 ? (
              sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no_sites" disabled>
                Sistemde kayıtlı site bulunmuyor
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {(!sites || sites.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Sistemde henüz site yok. Yeni site ekleyebilirsiniz.
          </p>
        )}
      </div>

      {selectedSite === 'new_site' && (
        <div className="space-y-2">
          <Label htmlFor="newSiteName">Yeni Site Adı *</Label>
          <Input
            id="newSiteName"
            type="text"
            placeholder="Örn: Sahabet, Betboo"
            value={newSiteName}
            onChange={(e) => setNewSiteName(e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Site admin onayından sonra aktif hale gelecektir
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="companyName">Şirket Adı</Label>
        <Input
          id="companyName"
          type="text"
          placeholder="Şirket adınız"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          placeholder="Site hakkında kısa açıklama..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
          rows={4}
        />
      </div>
    </div>
  );
};
