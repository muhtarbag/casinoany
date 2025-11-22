import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { Globe } from 'lucide-react';

interface Step3CompanyDetailsProps {
  companyWebsite: string;
  setCompanyWebsite: (value: string) => void;
  disabled?: boolean;
}

export const Step3CompanyDetails = ({
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
              required
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};