import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useBettingSites } from '@/hooks/queries/useBettingSitesQueries';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Bitcoin, CreditCard, Building2, Wallet, Zap } from 'lucide-react';
import { usePageLoadPerformance } from '@/hooks/usePerformanceMonitor';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BreadcrumbSchema, ItemListSchema, FAQSchema } from '@/components/StructuredData';

// Configuration for each payment method
const PAYMENT_METHODS: Record<string, {
    title: string;
    description: string;
    keywords: string[];
    featureTag: string;
    heroIcon: React.ElementType;
    heroTitle: string;
    heroDesc: string;
    faqs: { question: string; answer: string }[];
    content: React.ReactNode;
}> = {
    'havale-eft': {
        title: "Havale & EFT Kabul Eden Bahis Siteleri 2025",
        description: "7/24 Havale ve EFT ile yatırım yapılan en güvenilir bahis siteleri. FAST ile anında işlem, düşük limitler ve yatırım bonusları.",
        keywords: ["havale bahis", "eft bahis", "banka havalesi", "fast bahis", "hızlı havale"],
        featureTag: 'Havale', // Matching DB feature tag
        heroIcon: Building2,
        heroTitle: "Havale & EFT Bahis Siteleri",
        heroDesc: "Banka hesabınızdan güvenle, 7/24 kesintisiz ve hızlı para yatırabileceğiniz lisanslı siteler.",
        faqs: [
            {
                question: "Hafta sonu Havale/EFT yapılır mı?",
                answer: "Evet, FAST sistemi sayesinde 7/24 anında (limitler dahilinde) transfer yapabilirsiniz. Ayrıca birçok site artık kendi banka havuzları sayesinde 'Havale' yöntemini 24 saat aktif tutmaktadır."
            },
            {
                question: "Havale ile en az ne kadar yatırabilirim?",
                answer: "Havale alt limitleri genellikle 50 TL ile 250 TL arasında değişir. Ancak bazı siteler 'Mefete' veya 'Payfix' gibi aracı kurumlar olmaksızın direkt havale için 100 TL limit koyabilir."
            }
        ],
        content: (
            <>
                <h2 className="text-3xl font-bold mb-4">Havale ile Bahis Güvenli mi?</h2>
                <p className="text-muted-foreground mb-6">
                    Havale ve EFT, Türkiye'deki en geleneksel ödeme yöntemidir. Güvenilirliği yüksektir ancak banka kayıtlarında işlem gözükeceği için açıklama kısmına asla "Bahis", "Casino" gibi ifadeler yazılmamalıdır. Genellikle siteler size "Hizmet Bedeli", "Market Alışverişi" gibi açıklamalar yazmanızı veya boş bırakmanızı önerir.
                </p>
                <h3 className="text-2xl font-bold mb-3">FAST ile Anında Yatırım</h3>
                <p className="text-muted-foreground">
                    Merkez Bankası'nın FAST sistemi sayesinde artık IBAN'a yapılan transferler saniyeler içinde karşı hesaba geçmektedir. Bu sayede gece veya hafta sonu beklemeden bakiyenizi yükleyebilirsiniz.
                </p>
            </>
        )
    },
    'kredi-karti': {
        title: "Kredi Kartı Geçen Bahis Siteleri | Visa & Mastercard",
        description: "Kredi kartı ile para yatırılan bahis siteleri. Visa, Mastercard ve Troy kartlarınızla 3D Secure güvencesiyle anında yatırım yapın.",
        keywords: ["kredi kartı bahis", "visa bahis", "mastercard bahis", "troy kart bahis", "kartla ödeme"],
        featureTag: 'Kredi Kartı',
        heroIcon: CreditCard,
        heroTitle: "Kredi Kartı İle Bahis",
        heroDesc: "Visa, Mastercard ve Troy özellikli kartlarınızla, alışveriş yapar gibi kolayca bahis bakiyesi yükleyin.",
        faqs: [
            {
                question: "Bahis sitesinde kredi kartı kullanmak güvenli mi?",
                answer: "Lisanslı ve SSL sertifikasına sahip (https) sitelerde işlem yapmak güvenlidir. Siteler genellikle 3D Secure (SMS onayı) sistemi kullanır, bu da kartınızın izinsiz kullanımını engeller."
            },
            {
                question: "Kredi kartı ekstrede bahis olarak görünür mü?",
                answer: "Hayır, profesyonel siteler ödemeyi farklı paravan şirketler (Danışmanlık, Turizm, Dijital Hizmetler vb.) üzerinden alır. Ekstrenizde 'X Ticaret' veya 'Y Hizmetleri' şeklinde görünür."
            }
        ],
        content: (
            <>
                <h2 className="text-3xl font-bold mb-4">Kredi Kartı ile Yatırım Avantajları</h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-6">
                    <li><strong>Hız:</strong> İşlem anında onaylanır, bakiye saniyesinde hesaba geçer.</li>
                    <li><strong>Kolaylık:</strong> Ekstra bir hesap açmanıza (Papara, cüzdan vb.) gerek yoktur.</li>
                    <li><strong>Puan Kazanımı:</strong> Bazı kartlarda işlem 'alışveriş' olarak geçtiği için bonus puan kazanabilirsiniz.</li>
                </ul>
                <h3 className="text-2xl font-bold mb-3">Hangi Kartlar Geçerli?</h3>
                <p className="text-muted-foreground">
                    Genellikle Visa ve Mastercard logolu tüm banka ve kredi kartları geçerlidir. Son dönemde yerli ödeme sistemi TROY da birçok sitede kabul edilmeye başlanmıştır.
                </p>
            </>
        )
    },
    'kripto-para': {
        title: "Kripto Para Kabul Eden Bahis Siteleri | Bitcoin & USDT",
        description: "Bitcoin, Ethereum ve USDT (Tether) ile gizli ve güvenli bahis oynayın. Belge istemeyen, yüksek limitli kripto bahis siteleri.",
        keywords: ["kripto bahis", "bitcoin bahis", "usdt bahis", "tether bahis", "anonim bahis"],
        featureTag: 'Kripto',
        heroIcon: Bitcoin,
        heroTitle: "Kripto & Bitcoin Bahis",
        heroDesc: "Tamamen anonim, takipsiz ve kesintisiz. Kripto varlıklarınızla ışık hızında yatırım ve çekim işlemleri.",
        faqs: [
            {
                question: "Kripto para ile bahis yasal mı?",
                answer: "Kripto paralar merkeziyetsiz olduğu için takibi zordur. Bu yöntem, gizliliğine önem veren oyuncular için en güvenli limandır."
            },
            {
                question: "Hangi kripto paralar geçerli?",
                answer: "En popülerleri USDT (TRC20 ağı - düşük komisyon), Bitcoin (BTC), Ethereum (ETH) ve Litecoin (LTC)'dir. USDT sabit kur olduğu için kur riskinden etkilenmezsiniz."
            }
        ],
        content: (
            <>
                <h2 className="text-3xl font-bold mb-4">Neden Kripto ile Bahis?</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Wallet className="w-4 h-4" /> Anonimlik</h4>
                        <p className="text-sm text-muted-foreground">İsim, soyisim veya banka hesabı vermenize gerek yoktur. Sadece cüzdan adresi ile işlem yaparsınız.</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Zap className="w-4 h-4" /> Yüksek Limitler</h4>
                        <p className="text-sm text-muted-foreground">Bankaların günlük transfer limitlerine takılmazsınız. Tek seferde milyonluk çekimler yapabilirsiniz.</p>
                    </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">USDT (Tether) Avantajı</h3>
                <p className="text-muted-foreground">
                    Bahis oyuncuları için en iyi seçenek USDT'dir. 1 USDT her zaman 1 Dolara eşittir. Bitcoin gibi değeri anlık değişmediği için kasadaki paranız erimez. Ödemelerde TRC20 ağını seçerseniz işlem ücreti (gas fee) çok düşüktür (genelde 1$).
                </p>
            </>
        )
    }
};

const PaymentMethod = () => {
    const { slug } = useParams<{ slug: string }>();
    const config = slug ? PAYMENT_METHODS[slug] : null;

    usePageLoadPerformance(`payment-${slug || 'unknown'}`);

    // If slug is invalid, redirect or 404 (handled by Router mostly, but nice to have guard)
    if (!config) {
        return <Navigate to="/" replace />;
    }

    const { data: sites, isLoading } = useBettingSites({
        feature: config.featureTag,
        limit: 20
    });

    const HeroIcon = config.heroIcon;

    return (
        <div className="min-h-screen bg-background pt-[calc(4rem+max(env(safe-area-inset-top),35px))]">
            <SEO
                title={config.title}
                description={config.description}
                keywords={config.keywords}
            />

            {sites && (
                <ItemListSchema
                    title={`${config.heroTitle} Listesi`}
                    items={sites.map(site => ({
                        name: site.name,
                        url: `${window.location.origin}/site/${site.slug}`,
                        image: site.logo_url
                    }))}
                />
            )}

            <BreadcrumbSchema items={[
                { name: 'Ana Sayfa', url: window.location.origin },
                { name: 'Ödeme Yöntemleri', url: `${window.location.origin}/odeme` }, // Intermediate if exists, otherwise fine
                { name: config.heroTitle, url: `${window.location.origin}/odeme/${slug}` }
            ]} />

            <FAQSchema faqs={config.faqs} />

            <GamblingSEOEnhancer isMoneyPage={true} />
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="mb-12 text-center space-y-6 animate-fade-in relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/10 via-background to-background p-8 border border-blue-500/10">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <HeroIcon className="w-32 h-32 text-foreground" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {config.heroTitle}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        {config.heroDesc}
                    </p>
                </div>

                {/* Site List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sites?.map((site, index) => (
                            <BettingSiteCard
                                key={site.id}
                                {...site}
                                logo={site.logo_url}
                                affiliateUrl={site.affiliate_link}
                                rating={site.rating}
                                reviewCount={site.review_count}
                                index={index}
                            />
                        ))}
                        {(!sites || sites.length === 0) && (
                            <div className="col-span-full text-center py-10">
                                <p className="text-muted-foreground">Bu ödeme yöntemi için şu an aktif site bulunamadı.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* SEO Content */}
                <article className="mt-20 prose prose-invert max-w-none">
                    {config.content}
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentMethod;
