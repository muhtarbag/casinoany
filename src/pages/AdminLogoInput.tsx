import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLogoInputProps {
  logoPreview: string | null;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearLogo: () => void;
}

export const AdminLogoInput = ({ logoPreview, onLogoChange, onClearLogo }: AdminLogoInputProps) => {
  return (
    <div className="md:col-span-2 space-y-3">
      <Label htmlFor="logo" className="flex items-center gap-2">
        <ImagePlus className="w-4 h-4" />
        Logo
      </Label>
      <div className="flex items-center gap-4">
        <Input 
          id="logo" 
          type="file" 
          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml" 
          onChange={onLogoChange}
          className="flex-1"
        />
        {logoPreview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearLogo}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {logoPreview && (
        <div className="p-4 bg-muted rounded-lg border">
          <p className="text-sm font-medium mb-2">Önizleme:</p>
          <img 
            src={logoPreview} 
            alt="Logo önizleme" 
            className="w-32 h-32 object-contain bg-white rounded border p-2"
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Desteklenen formatlar: JPG, PNG, WebP, SVG | Maksimum: 5MB | Otomatik optimize edilir (400x400 max, WebP formatı)
      </p>
    </div>
  );
};
