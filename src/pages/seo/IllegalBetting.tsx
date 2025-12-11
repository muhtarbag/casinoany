import React from 'react';
import { useBettingSites } from '@/hooks/queries/useBettingSitesQueries';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Globe, Info } from 'lucide-react';
import { usePageLoadPerformance } from '@/hooks/usePerformanceMonitor';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BreadcrumbSchema, ItemListSchema, FAQSchema } from '@/components/StructuredData';

const IllegalBetting = () => {
    usePageLoadPerformance('illegal-betting-stats');

    // We fetch top sites. In TR context, 'Illegal' (Kaçak) usually refers to 
    // any site not licensed by the state (Spor Toto), so basically all our offshore sites.
    const { data: sites, isLoading } = useBettingSites({
        limit: 20
    });

    const faqs = [
        {
            question: "Kaçak bahis siteleri güvenilir mi?",
            answer: "Kaçak bahis terimi Türkiye'de yerel lisansı olmayan siteler için kullanılır. Ancak bu sitelerin çoğu (Curacao, Malta gibi) uluslararası lisanslara sahiptir ve dünya genelinde yasal olarak hizmet verirler. Lisanslı ve kurumsal siteler güvenilirdir."
        },
        {
            question: "Kaçak iddaa oynarsam ceza alır mıyım?",
            answer: "Yasal olmayan sitelerde bahis oynamanın idari para cezası vardır. Ancak binlerce kullanıcı olduğu için takibi zordur. Yine de risk almamak için kişisel güvenliğinize dikkat etmeniz önerilir."
        },
        {
            question: "Kaçak bahis sitelerindeki oranlar neden daha yüksek?",
            answer: "Yerel siteler yüksek vergi oranları nedeniyle düşük oran verirken, yurtdışı merkezli siteler daha düşük vergi ödedikleri için kullanıcılarına çok daha yüksek oranlar ve bonuslar sunabilirler."
        }
    ];

    return (
        <div className="min-h-screen bg-background pt-[calc(4rem+max(env(safe-area-inset-top),35px))]">
            <SEO
                title="Kaçak Bahis Siteleri 2025 | Yüksek Oranlar ve Güvenilir Firmalar"
                description="En iyi kaçak bahis siteleri listesi. Yüksek oranlar, bedava bonuslar ve belge istemeyen güvenilir kaçak iddaa siteleri incelemesi."
                keywords={[
                    "kaçak bahis", "kaçak iddaa", "kaçak bahis siteleri", "illegal bahis",
                    "belge istemeyen siteler", "yüksek oranlı siteler"
                ]}
            />

            {sites && (
                <ItemListSchema
                    title="En İyi Kaçak Bahis Siteleri"
                    items={sites.map(site => ({
                        name: site.name,
                        url: `${window.location.origin}/site/${site.slug}`,
                        image: site.logo_url
                    }))}
                />
            )}

            <BreadcrumbSchema items={[
                { name: 'Ana Sayfa', url: window.location.origin },
                { name: 'Kaçak Bahis Siteleri', url: `${window.location.origin}/kacak-bahis` }
            ]} />

            <FAQSchema faqs={faqs} />

            <GamblingSEOEnhancer isMoneyPage={true} />
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="mb-12 text-center space-y-4 animate-fade-in relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900/10 via-background to-background p-8 border border-red-500/10">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="w-32 h-32 text-red-500" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                        Kaçak Bahis Siteleri 2025
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Türkiye'nin en popüler yüksek oranlı bahis siteleri. Lisanslı, güvenilir ve ödeme garantili firmaların güncel giriş adresleri.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-600">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-semibold">Lisanslı & Güvenli</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600">
                            <Globe className="w-4 h-4" />
                            <span className="text-sm font-semibold">Uluslararası Otorite</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600">
                            <Info className="w-4 h-4" />
                            <span className="text-sm font-semibold">7/24 Destek</span>
                        </div>
                    </div>
                </div>

                {/* Warning / Disclaimer Box */}
                <div className="mb-10 p-4 border-l-4 border-yellow-500 bg-yellow-500/5 rounded-r-lg">
                    <p className="text-sm text-muted-foreground">
                        <strong>Yasal Uyarı:</strong> "Kaçak Bahis" terimi, Türkiye'de Spor Toto lisansı bulunmayan siteleri ifade eder. Bu listedeki siteler Avrupa lisanslı (Curacao, MGA) kurumsal firmalardır ancak Türkiye yasalarına göre illegal kabul edilebilirler. Sorumluluk kullanıcıya aittir.
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
                    </div>
                )}

                {/* SEO Content */}
                <article className="mt-20 prose prose-invert max-w-none">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Info className="w-8 h-8 text-primary" />
                        Neden Kaçak Bahis Tercih Ediliyor?
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        Türkiye'de yasal bahis sitelerinin sunduğu düşük oranlar ve sınırlı bahis seçenekleri (örneğin canlı bahiste az maç olması, tek maç oynanamaması gibi kısıtlamalar), kullanıcıları alternatif arayışlara itmektedir. "Kaçak bahis" olarak adlandırılan yurtdışı merkezli siteler, bu noktada sundukları avantajlarla öne çıkmaktadır.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 my-10">
                        <div className="p-6 bg-card rounded-xl border border-border">
                            <h3 className="text-xl font-bold text-green-500 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Avantajları
                            </h3>
                            <ul className="space-y-2">
                                <li>✅ Yasal sitelere göre %30-%40 daha yüksek oranlar.</li>
                                <li>✅ Her maça tek maç (MBS sorunu yok) oynama imkanı.</li>
                                <li>✅ Casino, Canlı Casino, Slot ve Poker gibi ekstra oyunlar.</li>
                                <li>✅ Deneme bonusu, hoşgeldin bonusu ve kayıp bonusları.</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-card rounded-xl border border-border">
                            <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Dikkat Edilmesi Gerekenler
                            </h3>
                            <ul className="space-y-2">
                                <li>⚠️ Lisanssız merdiven altı sitelerden uzak durulmalı.</li>
                                <li>⚠️ Adres engellemeleri nedeniyle güncel giriş adresi değişebilir.</li>
                                <li>⚠️ Şikayetvar ve forumlardaki kullanıcı yorumları incelenmeli.</li>
                                <li>⚠️ Çok yüksek miktar bakiyeler tek seferde çekilmemeli.</li>
                            </ul>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mt-10">Güvenilir Kaçak Bahis Siteleri Nasıl Anlaşılır?</h2>
                    <p>
                        Bir sitenin "kaçak" olması onun dolandırıcı olduğu anlamına gelmez. Avrupa'da halka açık, borsada işlem gören dev bahis şirketleri (örn: Bets10, Mobilbahis gibi yapılar) Türkiye'de vergi vermedikleri için kaçak statüsündedir.
                    </p>
                    <p>
                        Güvenilirlik için bakmanız gereken ilk kriter <strong>Lisans</strong>tır. Sitemizde yer alan tüm firmalar Curacao veya Malta lisansına sahiptir ve düzenli olarak denetlenirler.
                    </p>
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default IllegalBetting;
