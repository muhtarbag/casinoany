import React, { useState } from 'react';
import { useBettingSites } from '@/hooks/queries/useBettingSitesQueries';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Gift, Wallet, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { usePageLoadPerformance } from '@/hooks/usePerformanceMonitor';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BreadcrumbSchema, ItemListSchema, FAQSchema } from '@/components/StructuredData';

const BonusSites = () => {
    usePageLoadPerformance('bonus-sites-stats');
    const [filter, setFilter] = useState<'all' | 'welcome' | 'free' | 'lost'>('all');

    // Fetch top rated sites.
    const { data: sites, isLoading } = useBettingSites({ limit: 25 });

    // Client-side filtering simulation (since we don't have deep filters in API yet)
    // In real scenario, API should handle this. Here we just show all or slice/reorder.
    const displaySites = sites || [];

    const faqs = [
        {
            question: "Hangi bahis siteleri bonus veriyor?",
            answer: "Türkiye pazarındaki neredeyse tüm yurtdışı kaynaklı bahis siteleri bonus verir. En popülerleri Bets10, Mobilbahis, Rexbet ve Jetbahis gibi büyük firmalardır."
        },
        {
            question: "Çevrim şartsız bonus nedir?",
            answer: "Çevrim şartsız bonus, aldığınız bonusu belirli bir orandan (örneğin 1.50) sadece bir kez oynamanızın yeterli olduğu, nakite çevrilmesi en kolay bonus türüdür."
        },
        {
            question: "Deneme bonusu veren siteler güvenilir mi?",
            answer: "Deneme bonusu genellikle yeni açılan veya üye çekmek isteyen siteler tarafından verilir. Bu sitelerin lisanslı olup olmadığını kontrol etmeniz önemlidir. Sitemizdeki listeden güvenilir olanları bulabilirsiniz."
        }
    ];

    return (
        <div className="min-h-screen bg-background pt-[calc(4rem+max(env(safe-area-inset-top),35px))]">
            <SEO
                title="Bonus Veren Siteler 2025 | Deneme Bonusu & Hoşgeldin Bonusu"
                description="En yüksek bonus veren bahis siteleri ve casino platformları. Yatırımsız deneme bonusu, çevrimsiz hoşgeldin bonusu ve kayıp bonusu kampanyaları."
                keywords={[
                    "bonus veren siteler", "deneme bonusu", "hoşgeldin bonusu", "bedava bahis",
                    "casino bonusları", "yatırım şartsız bonus"
                ]}
            />

            {displaySites.length > 0 && (
                <ItemListSchema
                    title="Bonus Veren Siteler Listesi"
                    items={displaySites.map(site => ({
                        name: site.name,
                        url: `${window.location.origin}/site/${site.slug}`,
                        image: site.logo_url
                    }))}
                />
            )}

            <BreadcrumbSchema items={[
                { name: 'Ana Sayfa', url: window.location.origin },
                { name: 'Bonus Veren Siteler', url: `${window.location.origin}/bonus-veren-siteler` }
            ]} />

            <FAQSchema faqs={faqs} />

            <GamblingSEOEnhancer isMoneyPage={true} />
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="mb-12 text-center space-y-6 animate-fade-in relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/10 via-background to-background p-8 border border-purple-500/10">
                    <div className="absolute top-0 left-0 p-4 opacity-10">
                        <Gift className="w-32 h-32 text-purple-500" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-400 bg-clip-text text-transparent">
                        Bonus Veren Siteler
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Cebinizden para çıkmadan kazanmaya başlayın. 2025'in en cömert bonus kampanyaları, çevrimsiz fırsatlar ve bedava bahis hakları burada.
                    </p>

                    {/* Category Pills */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            className="rounded-full"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Tüm Bonuslar
                        </Button>
                        <Button
                            variant={filter === 'welcome' ? 'default' : 'outline'}
                            onClick={() => setFilter('welcome')}
                            className="rounded-full"
                        >
                            <Wallet className="w-4 h-4 mr-2" />
                            Hoşgeldin Bonusu
                        </Button>
                        <Button
                            variant={filter === 'free' ? 'default' : 'outline'}
                            onClick={() => setFilter('free')}
                            className="rounded-full"
                        >
                            <Gift className="w-4 h-4 mr-2" />
                            Deneme Bonusu
                        </Button>
                        <Button
                            variant={filter === 'lost' ? 'default' : 'outline'}
                            onClick={() => setFilter('lost')}
                            className="rounded-full"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Kayıp Bonusu
                        </Button>
                    </div>
                </div>

                {/* Site List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displaySites.map((site, index) => (
                            <BettingSiteCard
                                key={site.id}
                                {...site}
                                logo={site.logo_url}
                                affiliateUrl={site.affiliate_link}
                                rating={site.rating}
                                reviewCount={site.review_count}
                                index={index}
                                // Highlight bonus info 
                                badge={index < 3 ? 'En Yüksek Bonus' : undefined}
                            />
                        ))}
                    </div>
                )}

                {/* SEO Content: Bonus Guide */}
                <article className="mt-20 prose prose-invert max-w-none">
                    <h2 className="text-3xl font-bold text-center mb-10">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Bonus Rehberi</span>: Hangisini Seçmelisiniz?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-card p-6 rounded-2xl border border-border hover:border-purple-500/50 transition-colors">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Wallet className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Hoşgeldin Bonusu</h3>
                            <p className="text-muted-foreground text-sm">
                                İlk yatırımınıza özel %100 veya %200 oranında verilen en yüksek tutarlı bonustur. Genellikle 5000 TL'ye kadar çıkabilir. Çevrim şartı vardır.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-2xl border border-border hover:border-pink-500/50 transition-colors">
                            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Gift className="w-6 h-6 text-pink-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Deneme Bonusu</h3>
                            <p className="text-muted-foreground text-sm">
                                Yatırım yapmadan siteyi denemeniz için verilen bedava bakiyedir (100 TL - 200 TL). Kazancı çekmek için genelde küçük bir yatırım veya çevrim istenir.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-2xl border border-border hover:border-blue-500/50 transition-colors">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                                <RotateCcw className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Çevrimsiz Bonus</h3>
                            <p className="text-muted-foreground text-sm">
                                En değerli bonus türü. Aldığınız bonusu sadece 1 kez oynamanız yeterlidir. Oranı düşüktür (%15-%20) ama nakite çevirmesi kolaydır.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mt-12 mb-4">Bonus Alırken Nelere Dikkat Etmeli?</h2>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li><strong>Maksimum Kazanç Limiti:</strong> Deneme bonuslarında genellikle çekebileceğiniz tutar sabittir (örn: Max 500 TL).</li>
                        <li><strong>Geçerlilik Süresi:</strong> Bonuslar hesabınıza tanımlandıktan sonra genelde 7-30 gün içinde kullanılmalıdır.</li>
                        <li><strong>Oyun Kısıtlaması:</strong> Bazı bonuslar sadece Sporda, bazıları sadece Casinoda geçerlidir.</li>
                    </ul>
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default BonusSites;
