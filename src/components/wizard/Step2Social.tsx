import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

interface Step2SocialProps {
  facebook: string;
  setFacebook: (value: string) => void;
  twitter: string;
  setTwitter: (value: string) => void;
  instagram: string;
  setInstagram: (value: string) => void;
  linkedin: string;
  setLinkedin: (value: string) => void;
  youtube: string;
  setYoutube: (value: string) => void;
  disabled?: boolean;
}

export const Step2Social = ({
  facebook,
  setFacebook,
  twitter,
  setTwitter,
  instagram,
  setInstagram,
  linkedin,
  setLinkedin,
  youtube,
  setYoutube,
  disabled
}: Step2SocialProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Sosyal medya hesaplarınızı ekleyin (Opsiyonel)
      </p>

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
        <Label htmlFor="linkedin" className="flex items-center gap-2">
          <Linkedin className="w-4 h-4 text-blue-700" />
          LinkedIn
        </Label>
        <Input
          id="linkedin"
          type="url"
          placeholder="https://linkedin.com/company/..."
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
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
  );
};
