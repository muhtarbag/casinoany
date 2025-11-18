import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, FileText, MapPin, Globe } from 'lucide-react';

interface Step3CompanyDetailsProps {
  companyTaxNumber: string;
  setCompanyTaxNumber: (value: string) => void;
  companyType: string;
  setCompanyType: (value: string) => void;
  companyAddress: string;
  setCompanyAddress: (value: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (value: string) => void;
  disabled?: boolean;
}

export const Step3CompanyDetails = ({
  companyTaxNumber,
  setCompanyTaxNumber,
  companyType,
  setCompanyType,
  companyAddress,
  setCompanyAddress,
  companyWebsite,
  setCompanyWebsite,
  disabled
}: Step3CompanyDetailsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Şirket Detayları</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyTaxNumber" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Vergi Numarası / TCKN *
            </Label>
            <Input
              id="companyTaxNumber"
              type="text"
              placeholder="1234567890"
              value={companyTaxNumber}
              onChange={(e) => setCompanyTaxNumber(e.target.value)}
              disabled={disabled}
              maxLength={11}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyType" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Şirket Tipi *
            </Label>
            <Select value={companyType} onValueChange={setCompanyType} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Şirket tipini seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="limited">Limited Şirket (Ltd. Şti.)</SelectItem>
                <SelectItem value="anonim">Anonim Şirket (A.Ş.)</SelectItem>
                <SelectItem value="sahis">Şahıs Şirketi</SelectItem>
                <SelectItem value="komandit">Komandit Şirket</SelectItem>
                <SelectItem value="kolektif">Kolektif Şirket</SelectItem>
                <SelectItem value="kooperatif">Kooperatif</SelectItem>
                <SelectItem value="diger">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Şirket Adresi *
            </Label>
            <Input
              id="companyAddress"
              type="text"
              placeholder="Tam adres (il, ilçe, mahalle, cadde, no)"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Şirket Web Sitesi ( Maskeli Affilatete Redirect Link )
            </Label>
            <Input
              id="companyWebsite"
              type="url"
              placeholder="https://sirket.com"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};