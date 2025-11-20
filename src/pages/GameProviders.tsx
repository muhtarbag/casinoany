import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Trophy, Gamepad2, Zap, TrendingUp, Award } from 'lucide-react';
import { useState, useMemo } from 'react';
import { generateSEOTitle, generateMetaDescription, generateBreadcrumbs } from '@/utils/seoHelpers';
import { buildCanonical } from '@/lib/seo/canonical';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface GameProvider {
  id: string;
  name: string;
  tier: 'premium' | 'major' | 'specialty';
  category: string;
  description: string;
  gameCount?: string;
  popularGames?: string[];
  specialties?: string[];
  logo?: string;
  founded?: string;
  headquarters?: string;
}

const gameProviders: GameProvider[] = [
  // Premium Tier - Slots & Casino
  {
    id: 'pragmatic-play',
    name: 'Pragmatic Play',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'Pragmatic Play, 600+ oyunlu geniş portföyü ile dünya çapında tanınan önde gelen oyun sağlayıcısıdır. Gates of Olympus ve Sweet Bonanza gibi ikonik slotlar, yüksek RTP oranları ve yenilikçi bonus özellikleri ile oyunculara muhteşem kazanç fırsatları sunuyor.',
    gameCount: '600+',
    popularGames: ['Gates of Olympus', 'Sweet Bonanza', 'The Dog House', 'Wild West Gold'],
    specialties: ['Megaways Slotlar', 'Yüksek RTP', 'Mobil Uyumlu'],
    founded: '2015',
    headquarters: 'Malta'
  },
  {
    id: 'netent',
    name: 'NetEnt',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'Evolution Group bünyesindeki NetEnt, online casino dünyasının öncülerinden. Starburst, Gonzo\'s Quest ve Dead or Alive gibi efsanevi slotlarıyla tanınan NetEnt, sinematik grafikler ve yenilikçi mekanikler ile sektörde devrim yarattı.',
    gameCount: '200+',
    popularGames: ['Starburst', 'Gonzo\'s Quest', 'Dead or Alive 2', 'Divine Fortune'],
    specialties: ['Sinematik Grafikler', 'Yenilikçi Mekanikler', 'Jackpot Ağı'],
    founded: '1996',
    headquarters: 'Stockholm, İsveç'
  },
  {
    id: 'microgaming',
    name: 'Microgaming',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'Microgaming, 800+ oyunlu devasa portföyü ve Mega Moolah jackpot ağı ile casino dünyasının devleri arasında. 1994\'ten beri sektörde olan bu deneyimli sağlayıcı, milyonlarca dolar değerinde jackpotlar dağıttı.',
    gameCount: '800+',
    popularGames: ['Mega Moolah', 'Immortal Romance', 'Thunderstruck II', 'Book of Oz'],
    specialties: ['Progressive Jackpots', 'Geniş Oyun Yelpazesi', 'Lisanslı İçerikler'],
    founded: '1994',
    headquarters: 'Isle of Man'
  },
  {
    id: 'playngo',
    name: 'Play\'n GO',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'Play\'n GO, 400+ oyunlu portföyü ile mobil-öncelikli yaklaşımıyla öne çıkar. Book of Dead serisi ile tüm dünyada üne kavuşan sağlayıcı, yüksek volatilite ve büyük kazanç potansiyeli sunan oyunlar üretiyor.',
    gameCount: '400+',
    popularGames: ['Book of Dead', 'Reactoonz', 'Fire Joker', 'Moon Princess'],
    specialties: ['Mobil Optimizasyon', 'Yüksek Volatilite', 'Unique Temalar'],
    founded: '1997',
    headquarters: 'Växjö, İsveç'
  },
  {
    id: 'playtech',
    name: 'Playtech',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'Playtech, geniş oyun portföyü ve branded içerikler ile tanınan dev bir yazılım sağlayıcısı. Age of Gods serisi, Marvel slotları ve canlı casino çözümleri ile sektörde lider konumda.',
    gameCount: '700+',
    popularGames: ['Age of the Gods', 'Great Blue', 'Buffalo Blitz', 'Frankie Dettori\'s Magic Seven'],
    specialties: ['Branded Content', 'Jackpot Ağı', 'Canlı Casino'],
    founded: '1999',
    headquarters: 'Isle of Man'
  },
  {
    id: 'red-tiger',
    name: 'Red Tiger',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'NetEnt/Evolution Group bünyesindeki Red Tiger, günlük jackpotları ve Gonzo\'s Quest Megaways gibi hit oyunları ile biliniyor. Yenilikçi mekanikler ve garantili ödeme süreleri ile oyuncu memnuniyetini ön planda tutuyor.',
    gameCount: '200+',
    popularGames: ['Gonzo\'s Quest Megaways', 'Dragon\'s Luck', 'Piggy Riches Megaways', 'Mystery Reels'],
    specialties: ['Daily Jackpots', 'Megaways', 'Mobil Uyumlu'],
    founded: '2014',
    headquarters: 'Isle of Man'
  },
  {
    id: 'push-gaming',
    name: 'Push Gaming',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'Push Gaming, yüksek volatilite ve yenilikçi bonus özellikleri ile dikkat çekiyor. Jammin\' Jars, Razor Shark ve Fat Banker gibi oyunları ile geniş oyuncu kitlesine hitap ediyor.',
    gameCount: '100+',
    popularGames: ['Jammin\' Jars', 'Razor Shark', 'Fat Banker', 'Retro Tapes'],
    specialties: ['Yüksek Volatilite', 'Cluster Pays', 'Unique Mekanikler'],
    founded: '2010',
    headquarters: 'Londra, UK'
  },
  {
    id: 'relax-gaming',
    name: 'Relax Gaming',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'Hem studio hem de aggregator olarak faaliyet gösteren Relax Gaming, Money Train serisi ile büyük başarı yakaladı. 2000+ oyunluk aggregation platformu ile binlerce içeriğe tek noktadan erişim sunuyor.',
    gameCount: '200+ Studio + 2000+ Aggregation',
    popularGames: ['Money Train 2', 'Money Train 3', 'Temple Tumble', 'TNT Tumble'],
    specialties: ['Aggregation Platform', 'Yenilikçi Bonuslar', 'Yüksek Kazançlar'],
    founded: '2010',
    headquarters: 'Malta'
  },
  {
    id: 'yggdrasil',
    name: 'Yggdrasil Gaming',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'GEMs programı ve yenilikçi mekanikleri ile tanınan Yggdrasil, Vikings Go serisinin yaratıcısı. Artistik tasarımları ve eşsiz oyun deneyimleri ile premium segment oyuncularına hitap ediyor.',
    gameCount: '150+',
    popularGames: ['Vikings Go Berzerk', 'Valley of the Gods', 'Holmes and the Stolen Stones', 'Nitro Circus'],
    specialties: ['GEMs Program', 'Artistik Tasarım', 'Unique Mekanikler'],
    founded: '2013',
    headquarters: 'Malta'
  },
  {
    id: 'hacksaw-gaming',
    name: 'Hacksaw Gaming',
    tier: 'premium',
    category: 'Slots & Casino',
    description: 'Hacksaw Gaming, yüksek volatilite ve büyük kazanç potansiyeli ile biliniyor. Le Bandit ve Wanted Dead or a Wild gibi oyunları ile agresif bahis stratejileri seven oyuncuların gözdesi.',
    gameCount: '100+',
    popularGames: ['Le Bandit', 'Wanted Dead or a Wild', 'Chaos Crew', 'Stacko'],
    specialties: ['Yüksek Volatilite', 'Max Win Potansiyeli', 'Hızlı Oyun'],
    founded: '2018',
    headquarters: 'Malta'
  },

  // Premium Tier - Live Casino
  {
    id: 'evolution-gaming',
    name: 'Evolution Gaming',
    tier: 'premium',
    category: 'Live Casino',
    description: 'Evolution Gaming, canlı casino dünyasının tartışmasız lideri. Lightning serisi, Dream Catcher ve Crazy Time gibi game show\'ları ile devrim yaratan sağlayıcı, profesyonel krupiyeler ve HD yayın kalitesi ile birinci sınıf deneyim sunuyor.',
    gameCount: '500+',
    popularGames: ['Lightning Roulette', 'Crazy Time', 'Monopoly Live', 'Dream Catcher', 'Gonzo\'s Treasure Hunt'],
    specialties: ['Lightning Serisi', 'Game Shows', 'HD Streaming', 'Çoklu Dil Desteği'],
    founded: '2006',
    headquarters: 'Riga, Letonya'
  },
  {
    id: 'ezugi',
    name: 'Ezugi',
    tier: 'premium',
    category: 'Live Casino',
    description: 'Evolution Group bünyesindeki Ezugi, geniş canlı masa oyunları yelpazesi ile tanınıyor. Türkçe krupiyeler, özel masalar ve yüksek limitlerle VIP oyunculara premium deneyim sunuyor.',
    gameCount: '100+',
    popularGames: ['Turkish Roulette', 'Unlimited Blackjack', 'Andar Bahar', 'Dragon Tiger'],
    specialties: ['Türkçe Krupiyeler', 'VIP Masaları', 'Özel Stüdyolar'],
    founded: '2012',
    headquarters: 'Curacao'
  },
  {
    id: 'authentic-gaming',
    name: 'Authentic Gaming',
    tier: 'premium',
    category: 'Live Casino',
    description: 'Authentic Gaming, gerçek kara tabanlı casinolardan canlı yayın yapan ilk ve tek sağlayıcı. Avrupa\'nın en prestijli casinolarından direkt masalar ile otantik casino atmosferi sunuyor.',
    gameCount: '50+',
    popularGames: ['Dragonara Casino Roulette', 'Casino Lugano Roulette', 'Platinum Casino Roulette'],
    specialties: ['Gerçek Casino Yayınları', 'Otantik Atmosfer', 'HD Çoklu Açı'],
    founded: '2015',
    headquarters: 'Malta'
  },
  {
    id: 'playtech-live',
    name: 'Playtech Live',
    tier: 'premium',
    category: 'Live Casino',
    description: 'Playtech\'in canlı casino kolu, Age of Gods Live serisi ve premium VIP masaları ile dikkat çekiyor. Geniş bahis limitleri ve profesyonel krupiyelerle her seviye oyuncuya hitap ediyor.',
    gameCount: '100+',
    popularGames: ['Age of Gods Live Roulette', 'Quantum Roulette', 'Unlimited Blackjack', 'Buffalo Blitz Live'],
    specialties: ['Branded Live Games', 'VIP Masaları', 'Yüksek Limitler'],
    founded: '2006',
    headquarters: 'Riga, Letonya'
  },
  {
    id: 'pragmatic-live',
    name: 'Pragmatic Play Live',
    tier: 'premium',
    category: 'Live Casino',
    description: 'Pragmatic Play\'in canlı casino hizmeti, Sweet Bonanza Candyland gibi game show\'ları ile slot dünyasını live casino\'ya taşıyor. Yenilikçi mekanikler ve yüksek etkileşim öne çıkıyor.',
    gameCount: '50+',
    popularGames: ['Sweet Bonanza Candyland', 'Mega Wheel', 'Boom City', 'ONE Blackjack'],
    specialties: ['Game Shows', 'Slot Temalarından Uyarlamalar', 'Mobil Uyumlu'],
    founded: '2019',
    headquarters: 'Malta'
  },

  // Premium Tier - Innovative & Crash Games
  {
    id: 'spribe',
    name: 'Spribe',
    tier: 'premium',
    category: 'Innovative & Crash',
    description: 'Spribe, Aviator ile crash game dünyasında devrim yarattı. Basit ama bağımlılık yaratan oyun mekaniği, şeffaf RNG sistemi ve sosyal özellikler ile milyonlarca oyuncunun favorisi.',
    gameCount: '20+',
    popularGames: ['Aviator', 'Mines', 'Plinko', 'Dice', 'Goal'],
    specialties: ['Crash Games', 'Provably Fair', 'Sosyal Özellikler', 'Hızlı Oyun'],
    founded: '2018',
    headquarters: 'Malta'
  },
  {
    id: 'galaxsys',
    name: 'Galaxsys',
    tier: 'premium',
    category: 'Innovative & Crash',
    description: 'Galaxsys, hızlı tempolu crash ve fast games ile tanınıyor. Turbo specialties ve benzersiz oyun mekanikleri ile anlık kazanç arayanların tercihi.',
    gameCount: '50+',
    popularGames: ['Turbo Crash', 'Space XY', 'Rocket X', 'Cappadocia'],
    specialties: ['Fast Games', 'Crash Games', 'Turbo Mekanikler'],
    founded: '2020',
    headquarters: 'Malta'
  },
  {
    id: 'turbo-games',
    name: 'Turbo Games',
    tier: 'premium',
    category: 'Innovative & Crash',
    description: 'Turbo Games, hızlı bahis oyunları ve crash mekanikleri ile instant win severlerin favorisi. Dakikada onlarca oyun oynayabileceğiniz yüksek tempolu içerikler.',
    gameCount: '30+',
    popularGames: ['Crash X', 'Limbo', 'Keno', 'Turbo Dice'],
    specialties: ['Hızlı Oyunlar', 'Yüksek Tempo', 'Instant Win'],
    founded: '2019',
    headquarters: 'Curacao'
  },
  {
    id: 'bgaming',
    name: 'BGaming',
    tier: 'premium',
    category: 'Innovative & Crash',
    description: 'BGaming, Provably Fair teknolojisi ve kripto para odaklı oyunları ile bilinir. Şeffaf RNG sistemi ve blockchain entegrasyonu ile güven ve adalet ön planda.',
    gameCount: '80+',
    popularGames: ['Plinko', 'Book of Cats', 'Alien Fruits', 'Lucky Lady Moon'],
    specialties: ['Provably Fair', 'Kripto Para', 'Blockchain', 'RNG Şeffaflığı'],
    founded: '2018',
    headquarters: 'Curacao'
  },
  {
    id: 'smartsoft-gaming',
    name: 'SmartSoft Gaming',
    tier: 'premium',
    category: 'Innovative & Crash',
    description: 'SmartSoft Gaming, JetX ile Aviator\'a güçlü alternatif sunuyor. Crash game innovatorları olarak bilinen sağlayıcı, benzersiz mekanikler ve sosyal özellikler ile öne çıkıyor.',
    gameCount: '40+',
    popularGames: ['JetX', 'JetX3', 'Cappadocia', 'Balloon'],
    specialties: ['Crash Games', 'Sosyal Özellikler', 'Çoklu Bahis'],
    founded: '2015',
    headquarters: 'Gürcistan'
  },

  // Tier 2 - Major Providers
  {
    id: 'elk-studios',
    name: 'ELK Studios',
    tier: 'major',
    category: 'Slots & Table Games',
    description: 'ELK Studios, mobil-öncelikli tasarımları ve betting strategy mekanikleri ile öne çıkıyor. Oyuncuların kendi strateji seviyelerini seçebildikleri unique sistem.',
    gameCount: '60+',
    popularGames: ['Cygnus', 'Ecuador Gold', 'Sam on the Beach', 'Chi'],
    specialties: ['Mobil-Öncelik', 'Betting Strategies', 'Matematiksel Oyun'],
    founded: '2013',
    headquarters: 'Stockholm, İsveç'
  },
  {
    id: 'nolimit-city',
    name: 'Nolimit City',
    tier: 'major',
    category: 'Slots & Table Games',
    description: 'Nolimit City, yüksek volatilite ve xWays mekanikleri ile hardcore slotçuların favorisi. 100,000x üzeri max win potansiyeli ile devasa kazançlar sunuyor.',
    gameCount: '80+',
    popularGames: ['San Quentin xWays', 'Mental', 'Fire in the Hole xBomb', 'Tombstone R.I.P'],
    specialties: ['Extreme Volatilite', 'xWays Mekanik', 'Yüksek Max Win'],
    founded: '2013',
    headquarters: 'Stockholm, İsveç'
  },
  {
    id: 'big-time-gaming',
    name: 'Big Time Gaming (BTG)',
    tier: 'major',
    category: 'Slots & Table Games',
    description: 'Megaways mekanizminin yaratıcısı Big Time Gaming, Bonanza ile slot dünyasında çığır açtı. Her spin\'de 100,000+ farklı kazanma yolu sunabilen devrimci sistem.',
    gameCount: '50+',
    popularGames: ['Bonanza', 'Extra Chilli', 'White Rabbit', 'Danger High Voltage'],
    specialties: ['Megaways Yaratıcısı', 'Yüksek Volatilite', 'Innovative Mekanikler'],
    founded: '2011',
    headquarters: 'Sydney, Avustralya'
  },
  {
    id: 'quickspin',
    name: 'Quickspin',
    tier: 'major',
    category: 'Slots & Table Games',
    description: 'Playtech bünyesindeki İsveç stüdyosu Quickspin, kaliteli grafikler ve sinematik animasyonlar ile biliniyor. Her oyun bir sanat eseri gibi özenle tasarlanıyor.',
    gameCount: '70+',
    popularGames: ['Sticky Bandits', 'Big Bad Wolf', 'Divine Dreams', 'Sakura Fortune'],
    specialties: ['Premium Grafikler', 'Sinematik Animasyon', 'İskandinav Tasarım'],
    founded: '2011',
    headquarters: 'Stockholm, İsveç'
  },
  {
    id: 'thunderkick',
    name: 'Thunderkick',
    tier: 'major',
    category: 'Slots & Table Games',
    description: 'Thunderkick, artistik tasarımları ve unique mekanikleri ile standartların dışına çıkıyor. Her oyun görsel bir şölen ve eşsiz bir deneyim.',
    gameCount: '50+',
    popularGames: ['Esqueleto Explosivo', 'Pink Elephants', 'Beat the Beast', 'Wild Heist Cashout'],
    specialties: ['Artistik Tasarım', 'Unique Mekanikler', 'Görsel Şölen'],
    founded: '2012',
    headquarters: 'Stockholm, İsveç'
  },
  {
    id: 'blueprint-gaming',
    name: 'Blueprint Gaming',
    tier: 'major',
    category: 'Slots & Table Games',
    description: 'Blueprint Gaming, Fishin\' Frenzy serisi ile UK pazarının lideri. Megaways lisansı ve Jackpot King ağı ile büyük kazançlar sunuyor.',
    gameCount: '200+',
    popularGames: ['Fishin\' Frenzy', 'Eye of Horus', 'Diamond Mine', 'Rick and Morty Megaways'],
    specialties: ['UK Market Leader', 'Jackpot King', 'Megaways Lisansı'],
    founded: '2001',
    headquarters: 'UK'
  },

  // Specialty Providers - seçilmiş önemli sağlayıcılar
  {
    id: 'amusnet-egt',
    name: 'Amusnet (EGT Interactive)',
    tier: 'specialty',
    category: 'Bölgesel Güçlüler',
    description: 'Bulgaristan merkezli Amusnet, 20 Burning Hot gibi klasik slotları ile Balkan pazarının lideri. Kara tabanlı kabine oyunlarının online versiyonları ile nostalji seven oyunculara hitap ediyor.',
    gameCount: '100+',
    popularGames: ['20 Burning Hot', '40 Super Hot', 'Shining Crown', 'Burning Hot 6 Reels'],
    specialties: ['Klasik Slotlar', 'Balkan Pazarı', 'Kabine Oyunları'],
    founded: '2002',
    headquarters: 'Sofya, Bulgaristan'
  },
  {
    id: 'tvbet',
    name: 'TVBet',
    tier: 'specialty',
    category: 'Live Dealer & Game Shows',
    description: 'TVBet, TV oyunları ve loto entegrasyonu ile unique bir niş doldurur. Televizyon formatında canlı çekiliş oyunları ile farklı bir canlı casino deneyimi.',
    gameCount: '30+',
    popularGames: ['Keno', 'Lottery', '5Bet', 'WheelBet'],
    specialties: ['TV Format Oyunlar', 'Loto Entegrasyonu', 'Canlı Çekilişler'],
    founded: '2015',
    headquarters: 'Ukrayna'
  },
];

const GameProviders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const seoTitle = generateSEOTitle('Oyun Sağlayıcıları', 'CasinoAny', true);
  const seoDescription = generateMetaDescription(
    'En iyi casino oyun sağlayıcıları: Pragmatic Play, NetEnt, Evolution Gaming, Spribe Aviator ve 50+ premium slot, canlı casino, crash game provider. Detaylı incelemeler ve popüler oyunlar.',
    155
  );

  const canonicalUrl = buildCanonical('/oyun-saglayicilari');
  const breadcrumbs = generateBreadcrumbs('/oyun-saglayicilari');

  const filteredProviders = useMemo(() => {
    return gameProviders.filter(provider => {
      const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           provider.popularGames?.some(game => game.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTier = selectedTier === 'all' || provider.tier === selectedTier;
      const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
      
      return matchesSearch && matchesTier && matchesCategory;
    });
  }, [searchTerm, selectedTier, selectedCategory]);

  const categories = Array.from(new Set(gameProviders.map(p => p.category)));

  // Schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Casino Oyun Sağlayıcıları",
    "description": "En iyi casino oyun sağlayıcıları listesi",
    "numberOfItems": gameProviders.length,
    "itemListElement": gameProviders.map((provider, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": provider.name,
        "description": provider.description,
        "foundingDate": provider.founded,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": provider.headquarters
        }
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content="oyun sağlayıcıları, slot sağlayıcıları, pragmatic play, netent, evolution gaming, aviator, spribe, crash games, live casino, casino yazılım sağlayıcıları" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.url}>{crumb.name}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">50+ Premium Oyun Sağlayıcısı</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Casino Oyun Sağlayıcıları
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Dünya çapında tanınan en iyi slot, live casino ve crash game sağlayıcılarını keşfedin. 
              Pragmatic Play'den NetEnt'e, Evolution Gaming'den Spribe'a kadar tüm premium providerlar burada.
            </p>
          </header>

          {/* Filters & Search */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Sağlayıcı veya oyun ara... (örn: Pragmatic, Gates of Olympus, Aviator)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                <Badge
                  variant={selectedTier === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTier('all')}
                >
                  <Star className="w-3 h-3 mr-1" />
                  Tümü
                </Badge>
                <Badge
                  variant={selectedTier === 'premium' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTier('premium')}
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
                <Badge
                  variant={selectedTier === 'major' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTier('major')}
                >
                  <Award className="w-3 h-3 mr-1" />
                  Major
                </Badge>
                <Badge
                  variant={selectedTier === 'specialty' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTier('specialty')}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Specialty
                </Badge>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={selectedCategory === 'all' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('all')}
                >
                  Tüm Kategoriler
                </Badge>
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-muted-foreground">
            {filteredProviders.length} sağlayıcı bulundu
          </div>

          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-6 h-6 text-primary" />
                      <Badge variant={
                        provider.tier === 'premium' ? 'default' : 
                        provider.tier === 'major' ? 'secondary' : 
                        'outline'
                      }>
                        {provider.tier === 'premium' ? '⭐ Premium' : 
                         provider.tier === 'major' ? '🏆 Major' : 
                         '⚡ Specialty'}
                      </Badge>
                    </div>
                    {provider.gameCount && (
                      <Badge variant="outline" className="text-xs">
                        {provider.gameCount} oyun
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{provider.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {provider.category}
                    {provider.headquarters && ` • ${provider.headquarters}`}
                    {provider.founded && ` • ${provider.founded}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {provider.description}
                  </p>

                  {provider.popularGames && provider.popularGames.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Popüler Oyunlar
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {provider.popularGames.slice(0, 4).map((game, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {game}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {provider.specialties && provider.specialties.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        Özel Özellikler
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProviders.length === 0 && (
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
              <p className="text-muted-foreground">
                Aramanıza uygun oyun sağlayıcısı bulunamadı. Farklı kriterler deneyin.
              </p>
            </div>
          )}

          {/* SEO Content Section */}
          <section className="mt-16 prose prose-sm max-w-none">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl">
                  En İyi Casino Oyun Sağlayıcıları 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Premium Tier Sağlayıcılar</h2>
                  <p className="mb-3">
                    Casino dünyasının devleri olarak bilinen premium tier sağlayıcılar, sektörde en kaliteli ve güvenilir oyunları üretirler. 
                    <strong> Pragmatic Play</strong>, 600+ oyunlu portföyü ve Gates of Olympus, Sweet Bonanza gibi ikonik slotları ile lider konumda. 
                    <strong> NetEnt</strong>, Starburst ve Gonzo's Quest gibi efsanevi oyunları ile slot tarihine damgasını vurmuştur.
                  </p>
                  <p>
                    <strong>Evolution Gaming</strong>, canlı casino dünyasının tartışmasız lideri olarak Lightning serisi ve Crazy Time gibi 
                    game show'ları ile devrim yaratmıştır. <strong>Spribe</strong>'ın Aviator oyunu ise crash game türünün popülerleşmesinde 
                    kilit rol oynamıştır.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Slot Oyun Sağlayıcıları</h2>
                  <p className="mb-3">
                    Slot sağlayıcıları arasında <strong>Pragmatic Play, NetEnt, Play'n GO, Microgaming</strong> ve <strong>Push Gaming</strong> 
                    öne çıkmaktadır. Bu sağlayıcılar yüksek RTP oranları, yenilikçi bonus özellikleri ve görsel açıdan etkileyici oyunlar sunarlar.
                  </p>
                  <p>
                    <strong>Big Time Gaming</strong>'in Megaways mekanizması, slot dünyasında devrim yaratmış ve artık birçok sağlayıcı 
                    tarafından lisanslanarak kullanılmaktadır. Her spin'de 100,000+ farklı kazanma yolu sunabilen bu sistem, 
                    oyunculara eşsiz bir deneyim vaat ediyor.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Live Casino Sağlayıcıları</h2>
                  <p>
                    Canlı casino deneyiminde <strong>Evolution Gaming</strong> tartışmasız lider konumdadır. Profesyonel krupiyeler, 
                    HD yayın kalitesi ve Lightning Roulette, Crazy Time gibi yenilikçi game show'lar ile sektörün standardını belirlemektedir. 
                    <strong>Ezugi</strong> ve <strong>Pragmatic Play Live</strong> de kaliteli alternatifler sunmaktadır.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Crash Game ve Fast Games</h2>
                  <p className="mb-3">
                    Crash game türünün yükselişinde <strong>Spribe</strong>'ın Aviator oyunu öncü rol oynamıştır. Basit ama bağımlılık 
                    yaratan oyun mekaniği, şeffaf RNG sistemi ve sosyal özellikler ile milyonlarca oyuncunun favorisi haline gelmiştir.
                  </p>
                  <p>
                    <strong>SmartSoft Gaming</strong>'in JetX'i, <strong>Galaxsys</strong>'in Turbo Crash'i ve <strong>Turbo Games</strong>'in 
                    hızlı tempolu oyunları da bu kategoride güçlü alternatifler sunmaktadır.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Oyun Sağlayıcısı Seçerken Dikkat Edilmesi Gerekenler</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Lisans ve Güvenilirlik:</strong> Malta, UK, Curacao gibi saygın lisanslar</li>
                    <li><strong>RTP Oranları:</strong> %96+ RTP ideal kabul edilir</li>
                    <li><strong>Oyun Çeşitliliği:</strong> Geniş portföy ve düzenli yeni çıkışlar</li>
                    <li><strong>Mobil Uyumluluk:</strong> Responsive tasarım ve mobil optimizasyon</li>
                    <li><strong>Yenilikçilik:</strong> Unique mekanikler ve bonus özellikleri</li>
                    <li><strong>Adil Oyun:</strong> RNG sertifikaları ve şeffaflık</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default GameProviders;
