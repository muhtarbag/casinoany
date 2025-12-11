import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useBettingSites } from '@/hooks/queries/useBettingSitesQueries';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Twitch, Youtube, Play, Star, Trophy, Users } from 'lucide-react';
import { usePageLoadPerformance } from '@/hooks/usePerformanceMonitor';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BreadcrumbSchema, ItemListSchema, FAQSchema } from '@/components/StructuredData';

// Configuration for influencers
const INFLUENCERS: Record<string, {
    name: string;
    description: string;
    keywords: string[];
    favoriteGames: string[];
    platform: 'kick' | 'twitch' | 'youtube';
    heroImage: string; // Placeholder or color 
    bio: string;
    faqs: { question: string; answer: string }[];
}> = {
    'ekrem-abi': {
        name: "Ekrem Abi",
        description: "Ekrem Abi'nin güvenerek oyun oynadığı bahis siteleri listesi. Yayınlarda kazandığı rekorlar ve önerdiği lisanslı siteler.",
        keywords: ["ekrem abi hangi sitede oynuyor", "ekrem abi casino", "ekrem abi bahis", "ekrem abi yayın"],
        favoriteGames: ["Sweet Bonanza", "Gates of Olympus", "Crazy Time"],
        platform: 'kick',
        heroImage: "from-green-900",
        bio: "Ekrem Abi (Erkan Özmen), Türkiye'nin en eski ve en tanınan casino yayıncılarından biridir. Yüksek bahisleri ve samimi sohbetiyle bilinir. Genellikle güvenilirliği kanıtlanmış, lisanslı ve ödemeleri hızlı yapan büyük siteleri tercih eder.",
        faqs: [
            {
                question: "Ekrem Abi hangi sitede oynuyor?",
                answer: "Ekrem Abi yayınlarında genellikle sponsorlu olduğu ve güvenilirliğine kefil olduğu lisanslı sitelerde oynar. Güncel listeyi bu sayfada bulabilirsiniz."
            },
            {
                question: "Ekrem Abi'nin rekor kazancı nedir?",
                answer: "Yayınlarında slot oyunlarında milyonlarca liralık kazançlar elde etmiştir. Özellikle Sweet Bonanza ve Gates of Olympus oyunlarında rekorları vardır."
            }
        ]
    },
    'dede': {
        name: "Dede (Gates of Olympus)",
        description: "Slot dünyasının efsanesi Dede'nin en sevdiği siteler. Gates of Olympus oyununda en çok çarpan veren siteler listesi.",
        keywords: ["dede hangi sitede", "gates of olympus dede", "dede slot", "dede taktikleri"],
        favoriteGames: ["Gates of Olympus", "Gates of Olympus 1000", "Zeus Lightning"],
        platform: 'youtube',
        heroImage: "from-yellow-900",
        bio: "Sosyal medyada 'Dede' lakabıyla bilinen Gates of Olympus karakteri, Türk bahis severlerin fenomeni haline gelmiştir. 'Dede' aslında bir yayıncı değil, oyunun ana karakteridir ancak oyuncular ona hitaben oynarlar. Dede'nin bol çarpan attığı (RTP'si yüksek) siteler aşağıdadır.",
        faqs: [
            {
                question: "Dede (Zeus) oyunu hangi sitede var?",
                answer: "Pragmatic Play sağlayıcısı ile çalışan tüm lisanslı bahis sitelerinde Gates of Olympus (Dede) oyunu mevcuttur. Listemizdeki sitelerden güvenle oynayabilirsiniz."
            },
            {
                question: "Dede en çok saat kaçta kazandırır?",
                answer: "Slot oyunlarında kesin bir kazanç saati yoktur ancak oyuncu trafiğinin yoğun olduğu akşam saatlerinde havuzun dolmasıyla büyük ikramiye ihtimalinin arttığına inanılır."
            }
        ]
    },
    'roshtein': {
        name: "Roshtein",
        description: "Dünyanın en ünlü slot yayıncısı Roshtein'in oynadığı global siteler. Milyon dolarlık bahisler ve efsanevi kazançlar.",
        keywords: ["roshtein hangi sitede", "roshtein casino", "roshtein rekor", "roshtein fake mi"],
        favoriteGames: ["Wanted Dead or a Wild", "Fruit Party", "Book of Shadows"],
        platform: 'kick',
        heroImage: "from-purple-900",
        bio: "İsveçli yayıncı Roshtein, casino yayıncılığı (Slots Streaming) denince dünyada akla gelen ilk isimdir. Stake gibi kripto tabanlı ve belge istemeyen global dev sitelerde oynamayı tercih eder. İnanılmaz yüksek (High Roller) bahisleriyle tanınır.",
        faqs: [
            {
                question: "Roshtein parası gerçek mi?",
                answer: "Roshtein, sitelerle yaptığı özel 'Affiliate' anlaşmaları sayesinde yüksek bakiyelerle oynar. Kazançları gerçektir ancak bakiyesinin bir kısmı sponsorluk anlaşması gereği site tarafından sağlanabilir."
            },
            {
                question: "Roshtein Türkiye'ye açık sitelerde oynuyor mu?",
                answer: "Evet, Roshtein'in oynadığı global sitelerin birçoğu Türkiye'den üye kabul etmektedir. Kripto para ile yatırım yaparak bu sitelerde oynayabilirsiniz."
            }
        ]
    }
};

const Influencer = () => {
    const { slug } = useParams<{ slug: string }>();
    const config = slug ? INFLUENCERS[slug] : null;

    usePageLoadPerformance(`influencer-${slug || 'unknown'}`);

    if (!config) {
        return <Navigate to="/" replace />;
    }

    // Assign generic "Influencer Pick" features mostly
    const { data: sites, isLoading } = useBettingSites({
        limit: 15
    });

    const PlatformIcon = config.platform === 'twitch' ? Twitch : config.platform === 'youtube' ? Youtube : Play;

    return (
        <div className="min-h-screen bg-background pt-[calc(4rem+max(env(safe-area-inset-top),35px))]">
            <SEO
                title={`${config.name} Hangi Sitede Oynuyor? | 2025 Güncel Liste`}
                description={config.description}
                keywords={config.keywords}
            />

            {sites && (
                <ItemListSchema
                    title={`${config.name} Önerdiği Siteler`}
                    items={sites.map(site => ({
                        name: site.name,
                        url: `${window.location.origin}/site/${site.slug}`,
                        image: site.logo_url
                    }))}
                />
            )}

            <BreadcrumbSchema items={[
                { name: 'Ana Sayfa', url: window.location.origin },
                { name: 'Fenomenler', url: `${window.location.origin}/fenomen` },
                { name: config.name, url: `${window.location.origin}/fenomen/${slug}` }
            ]} />

            <FAQSchema faqs={config.faqs} />

            <GamblingSEOEnhancer isMoneyPage={true} />
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Profile Section */}
                <div className={`mb-12 rounded-3xl bg-gradient-to-br ${config.heroImage} via-background to-background p-8 border border-white/5 relative overflow-hidden`}>
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        {/* Fake Avatar / Initial */}
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-4xl font-bold shadow-2xl ring-4 ring-background">
                            {config.name[0]}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 backdrop-blur text-sm font-medium">
                                <PlatformIcon className="w-4 h-4" />
                                {config.platform.toUpperCase()} Yayıncısı
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold">
                                {config.name}
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                {config.bio}
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                                {config.favoriteGames.map(game => (
                                    <span key={game} className="px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                        {game}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                        <Users className="absolute -right-10 -bottom-10 w-64 h-64" />
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold">Önerdiği Bahis Siteleri</h2>
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
                                badge={index === 0 ? `${config.name}'in Favorisi` : undefined}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Influencer;
