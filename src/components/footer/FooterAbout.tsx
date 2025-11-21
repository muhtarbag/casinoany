import { Shield, Lock, CreditCard } from 'lucide-react';
import logo from '@/assets/casinoany-logo.png';
import gameCheckLogo from '@/assets/gamecheck-verified.svg';
import trustpilotLogo from '@/assets/trustpilot-logo.svg';

export const FooterAbout = () => {
  return (
    <div className="lg:col-span-2">
      <img src={logo} alt="CasinoAny.com" className="h-10 w-auto mb-4" />
      <p className="text-sm text-muted-foreground mb-4">
        Türkiye'nin en güvenilir casino ve bahis siteleri rehberi. 
        2020'den beri sektörde, binlerce kullanıcıya en iyi bahis deneyimini yaşatıyoruz.
      </p>
      
      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span>Güvenilir İncelemeler</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <span>Lisanslı Siteler</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <span>Hızlı Ödemeler</span>
        </div>
        
        {/* Trust Badges */}
        <div className="pt-2 space-y-3">
          <a 
            href="https://gamecheck.com/tr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity"
            aria-label="GameCheck Verified"
          >
            <img 
              src={gameCheckLogo} 
              alt="GameCheck Verified" 
              className="h-12 w-auto"
            />
          </a>
          <a 
            href="https://www.trustpilot.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity"
            aria-label="Trustpilot"
          >
            <img 
              src={trustpilotLogo} 
              alt="Trustpilot" 
              className="h-8 w-auto"
            />
          </a>
        </div>
      </div>
    </div>
  );
};
