import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Check, X, Shield, Clock, CreditCard, Users } from 'lucide-react';
import { CasinoReviewSchema, ExpertReviewSchema } from '@/components/seo/GamblingSEOSchemas';
import { OptimizedImage } from '@/components/OptimizedImage';

interface CasinoReviewTemplateProps {
  casino: {
    name: string;
    slug: string;
    logo: string;
    rating: number;
    reviewCount: number;
    bonus: string;
    license: string;
    established: string;
    minDeposit: string;
    withdrawalTime: string;
    gameCount: number;
    liveCasino: boolean;
    mobileApp: boolean;
  };
  pros: string[];
  cons: string[];
  features: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  }[];
  paymentMethods: string[];
  gameProviders: string[];
  expertReview: {
    author: string;
    expertise: string;
    experience: string;
    summary: string;
    date: string;
  };
  affiliateLink: string;
}

/**
 * SEO-Optimized Casino Review Template
 * E-E-A-T compliant, schema-enhanced, conversion-focused
 */
export const CasinoReviewTemplate = ({
  casino,
  pros,
  cons,
  features,
  paymentMethods,
  gameProviders,
  expertReview,
  affiliateLink
}: CasinoReviewTemplateProps) => {
  return (
    <div className="space-y-8">
      {/* SEO Schemas */}
      <CasinoReviewSchema
        name={casino.name}
        url={`${window.location.origin}/site/${casino.slug}`}
        logo={casino.logo}
        rating={casino.rating}
        reviewCount={casino.reviewCount}
        bonus={casino.bonus}
        features={features.map(f => f.title)}
        license={casino.license}
        paymentMethods={paymentMethods}
        gameProviders={gameProviders}
      />
      
      <ExpertReviewSchema
        articleTitle={`${casino.name} İnceleme 2025 - %100 Objektif Değerlendirme`}
        articleBody={expertReview.summary}
        author={{
          name: expertReview.author,
          expertise: expertReview.expertise,
          experience: expertReview.experience
        }}
        datePublished={expertReview.date}
        dateModified={new Date().toISOString()}
        rating={casino.rating}
        casinoName={casino.name}
      />

      {/* Quick Overview Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <OptimizedImage
                src={casino.logo}
                alt={casino.name}
                width={80}
                height={80}
                className="rounded-lg"
                priority
              />
              <div>
                <CardTitle className="text-2xl">{casino.name} İnceleme 2025</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(casino.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{casino.rating.toFixed(1)}/5.0</span>
                  <span className="text-sm text-muted-foreground">
                    ({casino.reviewCount} değerlendirme)
                  </span>
                </div>
              </div>
            </div>
            <Button 
              size="lg" 
              className="px-8"
              onClick={() => window.open(affiliateLink, '_blank')}
            >
              Siteye Git →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoItem icon={<Shield />} label="Lisans" value={casino.license} />
            <InfoItem icon={<CreditCard />} label="Min. Yatırım" value={casino.minDeposit} />
            <InfoItem icon={<Clock />} label="Çekim Süresi" value={casino.withdrawalTime} />
            <InfoItem icon={<Users />} label="Oyun Sayısı" value={`${casino.gameCount}+`} />
          </div>
        </CardContent>
      </Card>

      {/* Bonus Highlight */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">🎁 Hoşgeldin Bonusu</h3>
            <p className="text-3xl font-extrabold text-primary mb-4">{casino.bonus}</p>
            <Button size="lg" onClick={() => window.open(affiliateLink, '_blank')}>
              Bonusu Al →
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              18+ | Çevrim şartları geçerlidir | Sorumluluk ile oynayın
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pros & Cons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" /> Artı Yönler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" /> Eksi Yönler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>{casino.name} Özellikleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              {feature.icon && (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Yöntemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {method}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Oyun Sağlayıcıları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {gameProviders.map((provider, index) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                {provider}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expert Review (E-E-A-T) */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle>👤 Uzman Görüşü</CardTitle>
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold">{expertReview.author}</p>
            <p>{expertReview.expertise} | {expertReview.experience}</p>
            <p className="text-xs mt-1">Son Güncelleme: {new Date(expertReview.date).toLocaleDateString('tr-TR')}</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{expertReview.summary}</p>
        </CardContent>
      </Card>

      {/* CTA Footer */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="py-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            {casino.name} ile Kazanmaya Başla!
          </h3>
          <Button 
            size="lg" 
            variant="secondary" 
            className="px-12"
            onClick={() => window.open(affiliateLink, '_blank')}
          >
            Hemen Kaydol →
          </Button>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center p-4 bg-muted/20 rounded-lg">
        <p>
          ⚠️ Bu inceleme {new Date(expertReview.date).toLocaleDateString('tr-TR')} tarihinde güncellenmiştir.
          Bonus ve kampanyalar değişkenlik gösterebilir. 18+ yaş sınırı geçerlidir.
          Kumar bağımlılık yapabilir, sorumluluk ile oynayın. 🔞
        </p>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  </div>
);
