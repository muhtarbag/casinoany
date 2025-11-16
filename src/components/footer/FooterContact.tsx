import { Mail, Send, Users, Twitter, Facebook, Instagram, Youtube, Pin, Clock } from 'lucide-react';

export const FooterContact = () => {
  return (
    <div>
      <h3 className="font-bold text-lg mb-4">İletişim</h3>
      
      <div className="space-y-3 text-sm text-muted-foreground mb-6">
        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
          <a href="mailto:hello@visiontech.co" className="hover:text-primary transition-colors">
            hello@visiontech.co
          </a>
        </div>
        <div className="flex items-start gap-2">
          <Send className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
          <a href="https://t.me/visiontechco" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            @visiontechco
          </a>
        </div>
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
          <a href="https://teams.microsoft.com/l/chat/0/0?users=hello@visiontech.co" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            Microsoft Teams
          </a>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
          <span>7/24 Destek</span>
        </div>
      </div>

      <h4 className="font-semibold mb-3">Sosyal Medya</h4>
      <div className="flex gap-2 justify-start items-center">
        <a 
          href="https://x.com/CasinoAnyx" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10"
          aria-label="Twitter/X"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a 
          href="https://www.facebook.com/profile.php?id=61565906765310" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10"
          aria-label="Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>
        <a 
          href="https://www.instagram.com/casinoanytrxx/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10"
          aria-label="Instagram"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <a 
          href="https://www.youtube.com/@CasinoAny" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10"
          aria-label="YouTube"
        >
          <Youtube className="w-5 h-5" />
        </a>
        <a 
          href="https://pin.it/Qz3eAfhj3" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10"
          aria-label="Pinterest"
        >
          <Pin className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};
