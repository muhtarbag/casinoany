import { Link } from "react-router-dom";
import { Search, MessageSquare, Gift } from "lucide-react";
import { Button } from "./ui/button";

export const HowItWorksSection = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Nasıl Çalışır?
        </h2>
        <p className="text-muted-foreground text-lg">
          Güvenli bahis deneyimi için üç basit adım
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Kart 1: Karşılaştır */}
        <div className="group relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <Search className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <h3 className="text-2xl font-bold mb-3">Karşılaştır & İncele</h3>
            <p className="text-muted-foreground mb-6">
              Binlerce bahis sitesini karşılaştır, bonusları incele, en iyi seçimi yap
            </p>
            
            <Button
              asChild
              variant="outline"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            >
              <a href="#sites-list">
                Siteleri İncele
              </a>
            </Button>
          </div>
        </div>

        {/* Kart 2: Şikayet & Yorum (Vurgulu) */}
        <div className="group relative bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-8 hover:scale-110 transition-all duration-300 hover:shadow-2xl border-2 border-accent md:transform md:-translate-y-2">
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-accent to-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              Topluluk Gücü ⭐
            </span>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <MessageSquare className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <h3 className="text-2xl font-bold mb-3">Şikayet & Yorum Paylaş</h3>
            <p className="text-muted-foreground mb-6">
              Deneyimlerini paylaş, topluluğa yardım et, diğer kullanıcıları bilgilendir
            </p>
            
            <Button
              asChild
              className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-lg"
            >
              <Link to="/sikayetler/yeni">
                Şikayet Paylaş
              </Link>
            </Button>
          </div>
        </div>

        {/* Kart 3: Üye Ol */}
        <div className="group relative bg-gradient-to-br from-success/10 to-primary/10 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-success/20">
          <div className="absolute top-4 right-4">
            <span className="bg-success text-success-foreground text-xs font-bold px-3 py-1 rounded-full">
              Ücretsiz 🎉
            </span>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-primary rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <Gift className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <h3 className="text-2xl font-bold mb-3">Üye Ol, Kazan</h3>
            <p className="text-muted-foreground mb-6">
              Özel bonuslar, VIP içerikler, sadakat puanları ve daha fazlası seni bekliyor
            </p>
            
            <Button
              asChild
              variant="outline"
              className="w-full group-hover:bg-success group-hover:text-success-foreground transition-all border-success/50"
            >
              <Link to="/auth">
                Hemen Üye Ol
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
