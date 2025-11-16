import { Link } from 'react-router-dom';

export const FooterLegal = () => {
  return (
    <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <Link to="/privacy" className="hover:text-primary transition-colors">
          Gizlilik Politikası
        </Link>
        <Link to="/terms" className="hover:text-primary transition-colors">
          Kullanım Koşulları
        </Link>
        <Link to="/cookies" className="hover:text-primary transition-colors">
          Çerez Politikası
        </Link>
        <Link to="/kvkk" className="hover:text-primary transition-colors">
          KVKK
        </Link>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-2 opacity-70">
        <p>
          © 2024 CasinoAny.com - Tüm Hakları Saklıdır
        </p>
        <p className="text-xs leading-relaxed">
          ⚠️ 18 yaşından küçüklerin bahis ve şans oyunlarına katılması yasaktır. 
          Kumar bağımlılığı tehlikeli olabilir. Sorumlu oyun ilkelerine uygun şekilde oynayın.
        </p>
        <p className="text-xs">
          🔒 CasinoAny.com, casino ve bahis siteleri hakkında bağımsız bilgi ve inceleme platformudur. 
          Sitemiz reklam içerikli bağlantılardan gelir elde edebilir.
        </p>
      </div>
    </div>
  );
};
