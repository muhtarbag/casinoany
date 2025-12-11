import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { useBettingSites } from '@/hooks/queries/useBettingSitesQueries';
import { usePageLoadPerformance } from '@/hooks/usePerformanceMonitor';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { BreadcrumbSchema, ItemListSchema } from '@/components/StructuredData';

const FreeSpin = () => {
    usePageLoadPerformance('freespin-stats');

    // Filter for sites that specifically mention 'Free Spin' or 'Slot' in features
    // If exact filter fails we can adjust, but Free Spin is a common feature tag.
    const { data: sites, isLoading } = useBettingSites({
        feature: 'Free Spin',
        limit: 20
    });

    return (
        <div className="min-h-screen bg-background pt-[calc(4rem+max(env(safe-area-inset-top),35px))]">
            <SEO
                title="Free Spin Veren Siteler 2025 | Yatırımsız Deneme Bonusu"
                description="En güncel free spin (bedava dönüş) veren casino siteleri. Yatırım şartsız deneme bonusları, sweet bonanza free spinleri ve daha fazlası."
                keywords={[
                    "free spin", "bedava dönüş", "yatırımsız deneme bonusu", "slot bonusları",
                    "casino deneme bonusu", "sweet bonanza free spin"
                ]}
            />
            {sites && (
                <ItemListSchema
                    title="Free Spin Veren Siteler"
                    items={sites.map(site => ({
                        name: site.name,
                        url: `${window.location.origin}/site/${site.slug}`,
                        image: site.logo_url
                    }))}
                />
            )}
            <BreadcrumbSchema items={[
                { name: 'Ana Sayfa', url: window.location.origin },
                { name: 'Free Spin Veren Siteler', url: `${window.location.origin}/free-spin` }
            ]} />
            <GamblingSEOEnhancer isMoneyPage={true} />
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-2xl p-8 mb-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-purple-500/5 blur-3xl pointer-events-none" />
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 relative z-10">
                        Free Spin Veren Siteler 2025
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto relative z-10">
                        Slot oyunlarında şansınızı ücretsiz deneyin. Yatırım yapmadan önce siteleri test etmeniz için en iyi Free Spin fırsatları burada.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        sites?.map(site => (
                            <BettingSiteCard
                                key={site.id}
                                {...site}
                                logo={site.logo_url}
                                affiliateUrl={site.affiliate_link}
                                reviewCount={site.review_count}
                                avgRating={site.avg_rating}
                            />
                        ))
                    )}
                    {/* Fallback msg if needed - simplistic for now */}
                    {!isLoading && (!sites || sites.length === 0) && (
                        <p className="text-center col-span-full text-muted-foreground">Şu an aktif free spin kampanyası bulunamadı, ancak aşağıdaki popüler casino sitelerine göz atabilirsiniz.</p>
                    )}
                </div>

                <article className="prose prose-invert max-w-none bg-card/50 p-6 md:p-10 rounded-xl border border-border/50">
                    <h2>Free Spin (Bedava Dönüş) Nedir?</h2>
                    <p>
                        Free Spin, online casino sitelerinin slot oyunlarında kullanılmak üzere üyelerine hediye ettiği "ücretsiz çevrim" hakkıdır. Genellikle yeni üyeliklerde veya özel kampanya günlerinde verilir. Örneğin "50 Free Spin" aldığınızda, belirli bir slot oyununda (örn: Sweet Bonanza) 50 kez ücretsiz oynama hakkınız olur ve kazancınız bakiyenize eklenir.
                    </p>

                    <h3>Yatırımsız Free Spin Nasıl Alınır?</h3>
                    <p>
                        Yatırımsız bonuslar, oyuncuların en çok aradığı promosyon türüdür. Bu bonusu almak için genellikle siteye üye olmanız ve telefon/SMS doğrulaması yapmanız yeterlidir. Her şirketin kuralı farklıdır; bazıları kazancınızı çekmek için küçük bir yatırım talep ederken, bazıları tamamen şartsız çekim imkanı sunar.
                    </p>

                    <h3>En Popüler Free Spin Oyunları</h3>
                    <ul>
                        <li><strong>Sweet Bonanza:</strong> Pragmatic Play'in efsaneleşmiş oyunu.</li>
                        <li><strong>Gates of Olympus:</strong> Dede lakaplı Zeus temalı oyun.</li>
                        <li><strong>Starburst:</strong> NetEnt'in klasiği.</li>
                    </ul>
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default FreeSpin;
