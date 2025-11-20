import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';

interface StepIndividualProfileProps {
  username: string;
  setUsername: (value: string) => void;
  disabled?: boolean;
}

export const StepIndividualProfile = ({
  username,
  setUsername,
  disabled
}: StepIndividualProfileProps) => {

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Profil Bilgileri</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Diğer bilgilerinizi profilinizden istediğiniz zaman güncelleyebilirsiniz.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Kullanıcı Adı *
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="kullaniciadi"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              disabled={disabled}
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              Sadece küçük harf, rakam ve alt çizgi kullanabilirsiniz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};