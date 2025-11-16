import { Link } from 'react-router-dom';

export const FooterLinks = () => {
  return (
    <>
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
            <Link to="/haberler" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
              📰 Haberler
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
            <Link to="/sitemap.xml" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
              🗺️ Site Haritası
            </Link>
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
    </>
  );
};
