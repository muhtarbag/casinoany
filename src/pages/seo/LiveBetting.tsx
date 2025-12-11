import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { useBettingSites } from '@/hooks/queries/useBettingSitesQueries';
import { usePageLoadPerformance } from '@/hooks/usePerformanceMonitor';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BreadcrumbSchema, ItemListSchema } from '@/components/StructuredData';

const LiveBetting = () => {
    usePageLoadPerformance('live-betting-stats');

    const { data: sites, isLoading } = useBettingSites({
        feature: 'Canlı Bahis',
        limit: 20
    });

    // Fallback if no specific feature filtering works (or if we want to show all top sites)
    // For now we trust the feature filter, or we could fallback to general sort.

    return (
        <div className="min-h-screen bg-background pt-[calc(4rem+max(env(safe-area-inset-top),35px))]">
            <SEO
                title="Canlı Bahis Siteleri 2025 | En Yüksek Oranlar | CasinoAny"
                description="Türkiye'nin en iyi ve en güvenilir canlı bahis siteleri. Maç anında değişen yüksek oranlar, tek maçtan yatmayan kuponlar ve canlı maç izle seçenekleri."
                keywords={[
                    "canlı bahis", "canlı iddaa", "canlı bahis siteleri", "yüksek oranlı bahis",
                    "güvenilir bahis siteleri", "tek maç bahis", "canlı maç sonuçları"
                ]}
            />
            {sites && (
                <ItemListSchema
                    title="Canlı Bahis Siteleri Listesi"
                    items={sites.map(site => ({
                        name: site.name,
                        url: `${window.location.origin}/site/${site.slug}`,
                        image: site.logo_url
                    }))}
                />
            )}
            <BreadcrumbSchema items={[
                { name: 'Ana Sayfa', url: window.location.origin },
                { name: 'Canlı Bahis Siteleri', url: `${window.location.origin}/canli-bahis` }
            ]} />
            <GamblingSEOEnhancer isMoneyPage={true} />
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Custom Mini Hero */}
                <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-2xl p-8 mb-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl pointer-events-none" />
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 relative z-10">
                        Canlı Bahis Siteleri 2025
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto relative z-10">
                        Anlık değişen oranlarla heyecanı katlayın. Türkiye'nin en güvenilir, lisanslı ve hızlı ödeme yapan canlı bahis platformlarını sizler için inceledik.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <LoadingSpinner />
                        </div>
                    ) : sites?.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-muted-foreground">
                            Şu anda filtrelere uygun site bulunamadı.
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
                </div>

                {/* Long Form SEO Content */}
                <article className="prose prose-invert max-w-none bg-card/50 p-6 md:p-10 rounded-xl border border-border/50">
                    <h2>Canlı Bahis Nedir ve Neden Tercih Edilir?</h2>
                    <p>
                        Canlı bahis, bir spor müsabakası devam ederken oynanan bahis türüdür. Klasik bahisten farklı olarak, maçın gidişatına göre oranlar saniye saniye değişir. Bu dinamik yapı, maçı iyi okuyan sporseverler için büyük kazanç fırsatları sunar.
                    </p>

                    <h3>Güvenilir Canlı Bahis Sitesi Nasıl Anlaşılır?</h3>
                    <p>
                        İnternette yüzlerce kaçak bahis sitesi bulunsa da, paranızı ve kişisel verilerinizi korumak için sadece lisanslı siteleri tercih etmelisiniz. Bir sitenin güvenilir olduğunu anlamak için şunlara dikkat edin:
                    </p>
                    <ul>
                        <li><strong>Lisans:</strong> Curacao, Malta (MGA) veya İngiltere lisansı var mı?</li>
                        <li><strong>Ödeme Hızı:</strong> Papara, Havale veya Kripto ile çekimler ne kadar sürüyor?</li>
                        <li><strong>Canlı Destek:</strong> 7/24 Türkçe müşteri hizmetleri var mı?</li>
                        <li><strong>Altyapı:</strong> BetConstruct, Pronet Gaming gibi sağlam altyapılar kullanılıyor mu?</li>
                    </ul>

                    <h3>Canlı Bahiste Kazanma Taktikleri</h3>
                    <p>
                        Duygusal kararlar yerine istatistiklere güvenin. Takımların form durumu, sakat oyuncular ve maç içi istatistikler (topla oynama, şut sayısı) size yol gösterecektir. Ayrıca "kasa yönetimi" yaparak, bakiyenizin tamamını tek bir maça yatırmaktan kaçının.
                    </p>
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default LiveBetting;
