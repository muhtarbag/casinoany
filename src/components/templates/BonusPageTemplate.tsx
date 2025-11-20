import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, TrendingUp, Clock, Shield, AlertCircle } from 'lucide-react';
import { BonusOfferSchema, CasinoHowToSchema } from '@/components/seo/GamblingSEOSchemas';
import { OptimizedImage } from '@/components/OptimizedImage';

interface BonusOffer {
  id: string;
  casino: {
    name: string;
    slug: string;
    logo: string;
    rating: number;
  };
  bonusType: 'welcome' | 'nodeposit' | 'freespin' | 'cashback' | 'reload';
  title: string;
  amount: string;
  wageringRequirement: string;
  validUntil: string;
  bonusCode?: string;
  terms: string[];
  eligibility: string[];
  affiliateLink: string;
}

interface BonusPageTemplateProps {
  pageTitle: string;
  pageDescription: string;
  bonusOffers: BonusOffer[];
  howToSteps?: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
}

const BONUS_TYPE_LABELS = {
  welcome: '🎁 Hoşgeldin Bonusu',
  nodeposit: '💰 Yatırımsız Bonus',
  freespin: '🎰 Free Spin',
  cashback: '💸 Cashback',
  reload: '🔄 Yenileme Bonusu'
};

const BONUS_TYPE_COLORS = {
  welcome: 'bg-green-500',
  nodeposit: 'bg-blue-500',
  freespin: 'bg-purple-500',
  cashback: 'bg-orange-500',
  reload: 'bg-pink-500'
};

/**
 * SEO-Optimized Bonus Page Template
 * Money keyword focused: "deneme bonusu", "yatırımsız bonus", etc.
 */
export const BonusPageTemplate = ({
  pageTitle,
  pageDescription,
  bonusOffers,
  howToSteps
}: BonusPageTemplateProps) => {
  return (
    <div className="space-y-8 px-4 md:px-6 lg:px-8">
      {/* Schema for first bonus (featured) */}
      {bonusOffers[0] && (
        <BonusOfferSchema
          title={bonusOffers[0].title}
          description={`${bonusOffers[0].casino.name} - ${bonusOffers[0].amount}`}
          bonusAmount={bonusOffers[0].amount}
          wageringRequirement={bonusOffers[0].wageringRequirement}
          validUntil={bonusOffers[0].validUntil}
          eligibility={bonusOffers[0].eligibility}
          siteName={bonusOffers[0].casino.name}
          siteUrl={bonusOffers[0].affiliateLink}
        />
      )}

      {/* How-To Schema */}
      {howToSteps && (
        <CasinoHowToSchema
          title={`${pageTitle} Nasıl Alınır?`}
          description={pageDescription}
          steps={howToSteps}
          totalTime="PT5M"
        />
      )}

      {/* Hero Section */}
      <div className="text-center space-y-4 py-6 md:py-8 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
          {pageTitle}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
          {pageDescription}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm px-2">
          <Badge variant="secondary" className="px-2 md:px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Güncel Liste 2025
          </Badge>
          <Badge variant="secondary" className="px-2 md:px-3 py-1">
            <Shield className="w-3 h-3 mr-1" />
            Doğrulanmış Bonuslar
          </Badge>
          <Badge variant="secondary" className="px-2 md:px-3 py-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            {bonusOffers.length} Kampanya
          </Badge>
        </div>
      </div>

      {/* Bonus Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            En İyi Bonus Teklifleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bonusOffers.map((bonus, index) => (
              <BonusCard key={bonus.id} bonus={bonus} rank={index + 1} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Claim */}
      {howToSteps && (
        <Card>
          <CardHeader>
            <CardTitle>Bonus Nasıl Alınır?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {howToSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{step.name}</h4>
                    <p className="text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notes */}
      <Card className="border-orange-500/50 bg-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="w-5 h-5" />
            Önemli Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✅ Bonus kampanyaları düzenli olarak güncellenmektedir</p>
          <p>✅ Çevrim şartları casino bazında değişkenlik gösterebilir</p>
          <p>✅ Bonuslar 18+ yaş sınırına tabidir</p>
          <p>⚠️ Kumar bağımlılık yapabilir, sorumluluk ile oynayın</p>
        </CardContent>
      </Card>

      {/* FAQ Schema opportunity */}
      <Card>
        <CardHeader>
          <CardTitle>Sıkça Sorulan Sorular</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FAQItem
            question="Bonus nasıl çevrilir?"
            answer="Bonusları çevirmek için belirlenen çevrim şartını (örn: 35x) tamamlamanız gerekmektedir. Her bonus için farklı şartlar geçerli olabilir."
          />
          <FAQItem
            question="Deneme bonusu nedir?"
            answer="Deneme bonusu, yeni üyelere yatırım yapmadan verilen bonustur. Genellikle kayıt sonrası otomatik tanımlanır veya bonus kodu ile alınır."
          />
          <FAQItem
            question="Çevrim şartı nedir?"
            answer="Çevrim şartı, bonusu çekim yapabilmek için toplam ne kadar bahis yapmanız gerektiğini gösterir. Örnek: 100 TL bonus x35 çevrim = 3,500 TL bahis."
          />
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center p-4 bg-muted/20 rounded-lg">
        <p>
          📅 Bu sayfa {new Date().toLocaleDateString('tr-TR')} tarihinde güncellenmiştir.
          Bonus kampanyaları değişebilir, siteye gitmeden önce güncel şartları kontrol edin.
          18+ | Kumar bağımlılık yapabilir | Sorumluluk ile oynayın 🔞
        </p>
      </div>
    </div>
  );
};

const BonusCard = ({ bonus, rank }: { bonus: BonusOffer; rank: number }) => (
  <div className="flex flex-col gap-4 p-4 md:p-6 border-2 rounded-xl hover:shadow-lg hover:border-primary/20 transition-all bg-card">
    {/* Mobile: Vertical Layout */}
    <div className="flex items-start gap-4 md:hidden">
      <div className="w-24 h-16 flex-shrink-0 bg-gray-900 rounded-lg border-2 border-border p-2 flex items-center justify-center">
        <OptimizedImage
          src={bonus.casino.logo}
          alt={bonus.casino.name}
          width={88}
          height={48}
          className="object-contain w-full h-full"
          objectFit="contain"
          priority={rank <= 3}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg mb-1.5 leading-tight">{bonus.casino.name}</h3>
        <Badge className={`${BONUS_TYPE_COLORS[bonus.bonusType]} text-white text-xs`}>
          {BONUS_TYPE_LABELS[bonus.bonusType]}
        </Badge>
      </div>
    </div>

    {/* Desktop: Horizontal Layout */}
    <div className="hidden md:flex items-center gap-6 flex-1">
      <div className="w-32 h-20 flex-shrink-0 bg-gray-900 rounded-lg border-2 border-border p-3 flex items-center justify-center">
        <OptimizedImage
          src={bonus.casino.logo}
          alt={bonus.casino.name}
          width={120}
          height={60}
          className="object-contain w-full h-full"
          objectFit="contain"
          priority={rank <= 3}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-xl mb-2">{bonus.casino.name}</h3>
        <Badge className={`${BONUS_TYPE_COLORS[bonus.bonusType]} text-white mb-2`}>
          {BONUS_TYPE_LABELS[bonus.bonusType]}
        </Badge>
        <p className="text-sm text-muted-foreground mb-3">{bonus.title}</p>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <span className="flex items-center gap-2 text-primary">
            <Gift className="w-4 h-4" />
            {bonus.amount}
          </span>
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Çevrim: {bonus.wageringRequirement}
          </span>
          {bonus.bonusCode && (
            <Badge variant="outline" className="font-mono text-xs">
              Kod: {bonus.bonusCode}
            </Badge>
          )}
        </div>
      </div>
    </div>

    {/* Mobile: Details Section */}
    <div className="md:hidden space-y-2">
      <p className="text-sm text-muted-foreground line-clamp-2">{bonus.title}</p>
      <div className="flex flex-wrap gap-3 text-sm font-medium">
        <span className="flex items-center gap-1.5 text-primary">
          <Gift className="w-4 h-4" />
          {bonus.amount}
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          Çevrim: {bonus.wageringRequirement}
        </span>
        {bonus.bonusCode && (
          <Badge variant="outline" className="font-mono text-xs">
            Kod: {bonus.bonusCode}
          </Badge>
        )}
      </div>
    </div>
    
    <Button
      size="lg"
      className={`w-full md:w-auto md:ml-auto px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-semibold transition-all duration-300 ${
        rank <= 3 
          ? 'bg-gradient-to-r from-gold via-primary to-gold shadow-glow-gold hover:scale-110 hover:shadow-[0_0_40px_hsl(var(--gold)/0.6)] relative overflow-hidden group before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:translate-x-[-200%] before:transition-transform before:duration-1000 hover:before:translate-x-[200%]' 
          : 'hover:scale-105 hover:shadow-lg'
      }`}
      onClick={() => window.open(bonus.affiliateLink, '_blank')}
    >
      <span className="relative z-10">{rank <= 3 ? '🎁 ' : ''}Bonusu Al →</span>
    </Button>
  </div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
  <div className="border-l-2 border-primary pl-4">
    <h4 className="font-semibold mb-2">{question}</h4>
    <p className="text-sm text-muted-foreground">{answer}</p>
  </div>
);
