import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { User, MapPin, Heart } from 'lucide-react';

interface StepIndividualProfileProps {
  username: string;
  setUsername: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  district: string;
  setDistrict: (value: string) => void;
  favoriteTeam: string;
  setFavoriteTeam: (value: string) => void;
  interests: string[];
  setInterests: (value: string[]) => void;
  favoriteGameProviders: string[];
  setFavoriteGameProviders: (value: string[]) => void;
  disabled?: boolean;
}

const INTEREST_OPTIONS = [
  'Spor Bahisleri',
  'Canlı Casino',
  'Slot Oyunları',
  'Poker',
  'Sanal Sporlar',
  'E-Spor Bahisleri',
  'At Yarışı',
  'Rulet',
  'Blackjack',
  'Bingo'
];

const GAME_PROVIDERS = [
  'Pragmatic Play',
  'Evolution Gaming',
  'NetEnt',
  'Play\'n GO',
  'Microgaming',
  'Playtech',
  'EGT',
  'Novomatic',
  'Yggdrasil',
  'Quickspin'
];

const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale',
  'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize',
  'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ',
  'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

export const StepIndividualProfile = ({
  username,
  setUsername,
  city,
  setCity,
  district,
  setDistrict,
  favoriteTeam,
  setFavoriteTeam,
  interests,
  setInterests,
  favoriteGameProviders,
  setFavoriteGameProviders,
  disabled
}: StepIndividualProfileProps) => {
  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, interest]);
    } else {
      setInterests(interests.filter(i => i !== interest));
    }
  };

  const handleProviderChange = (provider: string, checked: boolean) => {
    if (checked) {
      setFavoriteGameProviders([...favoriteGameProviders, provider]);
    } else {
      setFavoriteGameProviders(favoriteGameProviders.filter(p => p !== provider));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Profil Bilgileri</h3>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Şehir
              </Label>
              <Select value={city} onValueChange={setCity} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Şehir seçin" />
                </SelectTrigger>
                <SelectContent>
                  {TURKISH_CITIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">İlçe</Label>
              <Input
                id="district"
                type="text"
                placeholder="İlçe adı"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="favoriteTeam" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Favori Takım
            </Label>
            <Input
              id="favoriteTeam"
              type="text"
              placeholder="Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor..."
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-3">
            <Label>İlgi Alanlarınız</Label>
            <div className="grid grid-cols-2 gap-3">
              {INTEREST_OPTIONS.map(interest => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={interests.includes(interest)}
                    onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`interest-${interest}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {interest}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Favori Oyun Sağlayıcıları</Label>
            <div className="grid grid-cols-2 gap-3">
              {GAME_PROVIDERS.map(provider => (
                <div key={provider} className="flex items-center space-x-2">
                  <Checkbox
                    id={`provider-${provider}`}
                    checked={favoriteGameProviders.includes(provider)}
                    onCheckedChange={(checked) => handleProviderChange(provider, checked as boolean)}
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`provider-${provider}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {provider}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};