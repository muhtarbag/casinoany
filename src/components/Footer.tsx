import { Mail, Twitter, Facebook, Instagram, Youtube, Linkedin, Shield, CreditCard, Lock, Phone, MapPin, Clock } from 'lucide-react';
import logo from '@/assets/casinodoo-logo.svg';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Başarılı!",
        description: "E-bülten aboneliğiniz oluşturuldu.",
      });
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-border bg-gradient-to-b from-card/30 to-card/60 mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="bg-primary/10 rounded-lg p-8 mb-12 border border-primary/20">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">📬 E-Bültene Abone Olun</h3>
            <p className="text-muted-foreground mb-6">
              En yeni bonuslar, kampanyalar ve bahis ipuçlarından haberdar olun!
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit">Abone Ol</Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* About Section */}
          <div className="lg:col-span-2">
            <img src={logo} alt="CasinoAny.com" className="h-10 w-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Türkiye'nin en güvenilir casino ve bahis siteleri rehberi. 
              2020'den beri sektörde, binlerce kullanıcıya en iyi bahis deneyimini yaşatıyoruz.
            </p>
            
            <div className="space-y-2 text-sm text-muted-foreground">
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
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Keşfet</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  🏠 Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  ℹ️ Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  📝 Blog
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  🗺️ Site Haritası
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-lg mb-4">Kategoriler</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/casino-siteleri" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  🎰 Casino Siteleri
                </Link>
              </li>
              <li>
                <Link to="/spor-bahisleri" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  ⚽ Spor Bahisleri
                </Link>
              </li>
              <li>
                <Link to="/bonus-kampanyalari" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  🎁 Bonus Kampanyaları
                </Link>
              </li>
              <li>
                <Link to="/mobil-bahis" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  📱 Mobil Bahis
                </Link>
              </li>
              <li>
                <Link to="/canli-casino" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  🎮 Canlı Casino
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">İletişim</h3>
            
            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <a href="mailto:info@casinoany.com" className="hover:text-primary transition-colors">
                  info@casinoany.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>+90 (555) 123 45 67</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>7/24 Destek</span>
              </div>
            </div>

            <h4 className="font-semibold mb-3">Sosyal Medya</h4>
            <div className="flex gap-3 flex-wrap">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 rounded-lg hover:bg-primary/10">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods & Security */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-3 text-sm">Popüler Ödeme Yöntemleri</h4>
              <div className="flex flex-wrap gap-3 opacity-70">
                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
                  💳 Papara
                </div>
                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
                  ₿ Kripto Para
                </div>
                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
                  🏦 Banka Havalesi
                </div>
                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
                  💰 CMT Cüzdan
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-sm">Güvenlik & Lisanslar</h4>
              <div className="flex flex-wrap gap-3 opacity-70">
                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  SSL Güvenliği
                </div>
                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Curacao Lisanslı
                </div>
                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
                  18+ Yaş Sınırı
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 CasinoAny.com. Tüm hakları saklıdır.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">Gizlilik Politikası</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Kullanım Şartları</Link>
            <span>•</span>
            <Link to="/cookies" className="hover:text-primary transition-colors">Çerez Politikası</Link>
            <span>•</span>
            <Link to="/kvkk" className="hover:text-primary transition-colors">KVKK</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ 18 yaşından küçüklerin bahis ve şans oyunları oynaması yasaktır. Kumar bağımlılığına karşı dikkatli olun.
          </p>
          <p className="text-xs text-muted-foreground">
            Bu site bilgilendirme amaçlıdır. Sorumlu bahis oynayın ve kaybetmeyi göze alabileceğinizden fazla para yatırmayın.
          </p>
        </div>
      </div>
    </footer>
  );
};
