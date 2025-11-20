import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, TrendingUp, Target, Award, CheckCircle, Clock, BarChart3, Search, FileCheck, Zap } from 'lucide-react';
import { BreadcrumbSchema } from '@/components/StructuredData';

const About = () => {
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CasinoAny.com',
    description: 'Türkiye\'nin en kapsamlı casino ve bahis siteleri karşılaştırma ve inceleme platformu. Güvenilir, lisanslı casino ve bahis siteleri hakkında detaylı analizler ve kullanıcı yorumları.',
    url: window.location.origin,
    logo: `${window.location.origin}/logos/casinodoo-logo.svg`,
    foundingDate: '2020',
    areaServed: 'TR',
    sameAs: [
      // Sosyal medya linkleri buraya eklenebilir
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1500',
      bestRating: '5',
      worstRating: '1'
    }
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'CasinoAny.com nedir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CasinoAny.com, Türkiye\'deki güvenilir ve lisanslı bahis sitelerini karşılaştıran, inceleyen ve değerlendiren bağımsız bir platformdur. Kullanıcılarımıza en iyi bahis deneyimi için objektif bilgiler sunuyoruz.'
        }
      },
      {
        '@type': 'Question',
        name: 'Bahis sitelerini nasıl değerlendiriyorsunuz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Siteleri lisans durumu, güvenlik önlemleri, ödeme yöntemleri, bonus teklifleri, müşteri hizmetleri, kullanıcı deneyimi ve kullanıcı yorumları gibi 10+ farklı kritere göre kapsamlı olarak değerlendiriyoruz. Her site objektif testlerden geçirilir.'
        }
      },
      {
        '@type': 'Question',
        name: 'Verileriniz ne kadar güvenilir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tüm verilerimiz düzenli olarak güncellenir ve doğrulanır. Uzman ekibimiz her siteyi detaylı olarak test eder, lisans bilgilerini kontrol eder ve kullanıcı geri bildirimlerini analiz eder. Verilerimiz gerçek testler ve deneyimlere dayanır.'
        }
      },
      {
        '@type': 'Question',
        name: 'Platform ücretsiz mi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Evet, platformumuz tamamen ücretsizdir. Kullanıcılarımız tüm incelemelere, karşılaştırmalara ve bilgilere ücretsiz erişebilir. Amacımız bahis severler için en iyi bilgi kaynağı olmaktır.'
        }
      },
      {
        '@type': 'Question',
        name: 'Sorumlu bahis politikanız nedir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sorumlu bahis oyununu destekliyoruz. 18 yaş altına hizmet vermiyoruz, kumar bağımlılığı konusunda farkındalık yaratıyoruz ve kullanıcılarımızı bilinçli bahis oynamaya teşvik ediyoruz. Platformumuzda sorumlu bahis kaynakları bulabilirsiniz.'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px]">
      <SEO
        title="Hakkımızda - Türkiye'nin En Kapsamlı Bahis Siteleri Karşılaştırma Platformu"
        description="CasinoAny.com olarak 2020'den beri güvenilir, lisanslı bahis sitelerini inceleyen ve karşılaştıran bağımsız bir platformuz. Uzman ekibimiz, detaylı analizler ve kullanıcı yorumlarıyla en iyi bahis deneyimi için objektif bilgiler sunuyor."
        keywords={['bahis siteleri hakkında', 'güvenilir bahis platformu', 'bahis sitesi karşılaştırma', 'lisanslı bahis siteleri', 'bahis sitesi inceleme']}
        canonical={`${window.location.origin}/about`}
        structuredData={[organizationStructuredData, faqStructuredData]}
      />
      <BreadcrumbSchema items={[
        { name: 'Ana Sayfa', url: window.location.origin },
        { name: 'Hakkımızda', url: `${window.location.origin}/about` }
      ]} />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">2020'den Beri Güvenilir Kaynak</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Türkiye'nin En Kapsamlı Bahis Siteleri Platformu
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Güvenilir, lisanslı bahis sitelerini inceleyen ve karşılaştıran bağımsız platformunuz. 
              Uzman analizler, gerçek kullanıcı yorumları ve detaylı değerlendirmelerle en iyi bahis deneyimi için rehberiniz.
            </p>
          </div>

          {/* Main Introduction */}
          <Card className="mb-8">
            <CardContent className="pt-6 space-y-4">
              <p className="text-lg leading-relaxed">
                <strong>CasinoAny.com</strong>, Türkiye'deki bahis severlerin güvenli ve kaliteli bahis siteleri 
                bulmasına yardımcı olmak için kurulmuş bağımsız bir inceleme ve karşılaştırma platformudur. 
                2020 yılından bu yana, sektörün önde gelen uzmanlarından oluşan ekibimiz, her bahis sitesini 
                titizlikle test ediyor, analiz ediyor ve objektif değerlendirmeler sunuyor.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Misyonumuz basit: Kullanıcılarımıza en güncel, en doğru ve en kapsamlı bilgileri sağlayarak, 
                bilinçli kararlar almalarına yardımcı olmak. Her ay 50.000+ kullanıcı, bahis siteleri hakkında 
                güvenilir bilgi almak için platformumuza güveniyor.
              </p>
            </CardContent>
          </Card>

          {/* Core Values */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Güvenlik Önceliğimiz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sadece Curaçao, Malta Gaming Authority ve diğer güvenilir otoriteler tarafından 
                  lisanslanmış siteleri inceliyoruz. Güvenlik testlerimizden geçmeyen hiçbir site listelenmez.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-secondary" />
                <CardTitle>Sürekli Güncellenen Veri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bonus kampanyaları, ödeme yöntemleri ve site özellikleri haftalık olarak güncellenir. 
                  Gerçek zamanlı kullanıcı yorumları ile canlı bilgi akışı sağlıyoruz.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto mb-4 text-accent" />
                <CardTitle>Kullanıcı Odaklı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Karmaşık teknik detayları basit ve anlaşılır bir şekilde sunuyoruz. 
                  Filtreleme, karşılaştırma ve arama özellikleriyle aradığınız siteyi kolayca bulun.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <Card className="mb-12 bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Aylık Kullanıcı</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-secondary mb-2">100+</div>
                  <div className="text-sm text-muted-foreground">İncelenmiş Site</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">1500+</div>
                  <div className="text-sm text-muted-foreground">Kullanıcı Yorumu</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">7/24</div>
                  <div className="text-sm text-muted-foreground">Güncel Bilgi</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Methodology */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-6 h-6 text-primary" />
                Değerlendirme Metodolojimiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Her bahis sitesini aşağıdaki kriterlere göre kapsamlı olarak değerlendiriyoruz. 
                Puanlama sistemimiz tamamen objektif ve şeffaftır:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Lisans & Güvenlik (25%)</h4>
                    <p className="text-sm text-muted-foreground">
                      SSL sertifikası, lisans geçerliliği, veri koruma politikaları
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Ödeme Yöntemleri (20%)</h4>
                    <p className="text-sm text-muted-foreground">
                      Çeşitlilik, işlem hızı, minimum limitler, komisyon oranları
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Bonus & Kampanyalar (15%)</h4>
                    <p className="text-sm text-muted-foreground">
                      Hoş geldin bonusu, çevrim şartları, düzenli promosyonlar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Kullanıcı Deneyimi (15%)</h4>
                    <p className="text-sm text-muted-foreground">
                      Arayüz tasarımı, mobil uyumluluk, sayfa hızı, navigasyon
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Müşteri Hizmetleri (10%)</h4>
                    <p className="text-sm text-muted-foreground">
                      Canlı destek, yanıt süresi, çözüm kalitesi, iletişim kanalları
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Bahis Seçenekleri (10%)</h4>
                    <p className="text-sm text-muted-foreground">
                      Spor çeşitliliği, canlı bahis, casino oyunları, sanal sporlar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Kullanıcı Yorumları (5%)</h4>
                    <p className="text-sm text-muted-foreground">
                      Gerçek kullanıcı deneyimleri ve memnuniyet oranları
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Work */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-secondary" />
                Nasıl Çalışıyoruz?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      1
                    </div>
                    <FileCheck className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold">Detaylı Test</h4>
                  <p className="text-sm text-muted-foreground">
                    Uzman ekibimiz her siteye üye olur, para yatırır ve çeker, 
                    bahis yapar ve tüm özellikleri test eder.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                      2
                    </div>
                    <BarChart3 className="w-5 h-5 text-secondary" />
                  </div>
                  <h4 className="font-semibold">Objektif Analiz</h4>
                  <p className="text-sm text-muted-foreground">
                    Toplanan veriler kapsamlı kriterlere göre analiz edilir ve 
                    puanlanır. Hiçbir önyargı olmadan değerlendirme yapılır.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      3
                    </div>
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-semibold">Sürekli Güncelleme</h4>
                  <p className="text-sm text-muted-foreground">
                    Siteler düzenli olarak yeniden değerlendirilir. Değişiklikler, 
                    yeni özellikler ve kampanyalar anında güncellenir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  Misyonumuz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  Türkiye'deki bahis severlere <strong>en güncel</strong>, <strong>en doğru</strong> ve 
                  <strong> en kapsamlı</strong> bilgileri sunarak, güvenli ve keyifli bahis deneyimi 
                  yaşamalarını sağlamak. Şeffaflık, objektiflik ve kullanıcı memnuniyeti her zaman önceliğimizdir.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Platformumuz, hiçbir bahis sitesi tarafından etkilenmeyen bağımsız değerlendirmeler sunar. 
                  Kullanıcı çıkarları her zaman ön plandadır.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-secondary" />
                  Vizyonumuz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  Türkiye'nin <strong>en güvenilir</strong> ve <strong>en kapsamlı</strong> bahis siteleri 
                  karşılaştırma platformu olmak. Yapay zeka destekli analizler, gerçek zamanlı güncellemeler 
                  ve topluluk odaklı yaklaşımla sektörün standardını belirlemek.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Sürekli yenilikçi teknolojiler kullanarak, kullanıcı deneyimini iyileştirmeye ve 
                  bahis dünyasında bilinçli kararlar alınmasına katkıda bulunmaya devam edeceğiz.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Why CasinoAny */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Neden CasinoAny.com?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hem bireysel kullanıcılar hem de kurumsal işbirlikleri için özel olarak tasarlanmış 
                kapsamlı çözümler sunuyoruz.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* For Individual Users */}
              <Card className="border-primary/30 hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Users className="w-7 h-7 text-primary" />
                    Bireysel Kullanıcılar İçin
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Benefits */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Faydalar
                    </h4>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Güvenli Seçim:</strong> Sadece lisanslı ve güvenilir sitelere erişim
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Zaman Tasarrufu:</strong> Tüm siteleri tek platformda karşılaştırın
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>En İyi Bonuslar:</strong> Güncel kampanya ve bonus tekliflerine anında ulaşın
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Gerçek Yorumlar:</strong> Binlerce gerçek kullanıcı deneyimi
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Özellikler
                    </h4>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Akıllı Filtreleme:</strong> Bonus türü, ödeme yöntemi, oyun kategorisine göre arama
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Detaylı İncelemeler:</strong> Her site için kapsamlı analiz ve puanlama
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Karşılaştırma Aracı:</strong> Siteleri yan yana koyarak özellikleri inceleyin
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Mobil Uyumlu:</strong> Her cihazdan kolay erişim ve kullanım
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advantages */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Avantajlar
                    </h4>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>%100 Ücretsiz:</strong> Tüm özelliklere sınırsız erişim, kayıt gerekmez
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Günlük Güncellemeler:</strong> Yeni kampanyalar ve site değişiklikleri anında yayında
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Uzman Destek:</strong> Blog ve rehberlerle bilginizi artırın
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Şikayet Sistemi:</strong> Sorunlarınızı paylaşın, çözüm bulun
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* For Corporate Users */}
              <Card className="border-secondary/30 hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-br from-secondary/10 to-secondary/5">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Target className="w-7 h-7 text-secondary" />
                    Kurumsal Kullanıcılar İçin
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Benefits */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-secondary" />
                      Faydalar
                    </h4>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Geniş Erişim:</strong> Aylık 50.000+ aktif kullanıcıya ulaşın
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Hedefli Kitle:</strong> Bahis oynamak isteyen nitelikli ziyaretçiler
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Marka Bilinirliği:</strong> Güvenilir platform aracılığıyla tanınırlık
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Rekabet Üstünlüğü:</strong> Rakiplerinizden öne çıkın
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-secondary" />
                      Özellikler
                    </h4>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Özel Sayfalar:</strong> Siteniz için detaylı inceleme ve tanıtım sayfası
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Yönetim Paneli:</strong> İçeriklerinizi kendiniz güncelleyin
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Performans Raporları:</strong> Tıklama, görüntülenme ve dönüşüm analitikleri
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Şikayet Yönetimi:</strong> Kullanıcı geri bildirimlerine anında yanıt
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advantages */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                      Avantajlar
                    </h4>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>SEO Faydası:</strong> Yüksek DA/PA değerli backlink ve organik trafik
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Uzun Vadeli İşbirliği:</strong> Sürdürülebilir affiliate programları
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>İtibar Yönetimi:</strong> Objektif değerlendirme ve şeffaf iletişim
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Esnek Paketler:</strong> İhtiyacınıza özel reklam ve sponsorluk seçenekleri
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-center text-muted-foreground mb-3">
                      Sitenizi platformumuza eklemek veya işbirliği fırsatları hakkında bilgi almak için:
                    </p>
                    <div className="flex justify-center">
                      <Badge variant="secondary" className="text-sm px-4 py-2">
                        İletişim: info@casinoany.com
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Responsible Gaming */}
          <Card className="mb-12 border-destructive/30">
            <CardHeader className="bg-destructive/10">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-destructive" />
                Sorumlu Bahis Taahhüdümüz
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="leading-relaxed">
                <strong>CasinoAny.com</strong> olarak, sorumlu bahis oyununu savunuyoruz ve destekliyoruz. 
                Bahis eğlenceli olmalı, asla bir gelir kaynağı veya problem haline gelmemelidir.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm"><strong>18+ Politikası:</strong> Platformumuz sadece 18 yaş ve üzeri kullanıcılara yöneliktir.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm"><strong>Bilinçli Bahis:</strong> Kaybedebildiğiniz miktardan fazla bahis yapmayın.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm"><strong>Limit Belirleme:</strong> Bütçe limitleri koyun ve bunlara sadık kalın.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm"><strong>Yardım Kaynakları:</strong> Problem yaşıyorsanız profesyonel yardım alın.</p>
                  </div>
                </div>
              </div>
              <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20 mt-4">
                <p className="text-sm text-center">
                  Kumar bağımlılığı bir hastalıktır. Yardıma ihtiyacınız varsa: 
                  <strong className="ml-1">Yeşilay 171</strong> veya profesyonel destek alın.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Sıkça Sorulan Sorular</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>CasinoAny.com nedir?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    CasinoAny.com, Türkiye'deki güvenilir ve lisanslı bahis sitelerini karşılaştıran, 
                    inceleyen ve değerlendiren bağımsız bir platformdur. Kullanıcılarımıza en iyi bahis 
                    deneyimi için objektif bilgiler sunuyoruz.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Bahis sitelerini nasıl değerlendiriyorsunuz?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Siteleri lisans durumu, güvenlik önlemleri, ödeme yöntemleri, bonus teklifleri, 
                    müşteri hizmetleri, kullanıcı deneyimi ve kullanıcı yorumları gibi 10+ farklı kritere 
                    göre kapsamlı olarak değerlendiriyoruz. Her site objektif testlerden geçirilir.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Verileriniz ne kadar güvenilir?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Tüm verilerimiz düzenli olarak güncellenir ve doğrulanır. Uzman ekibimiz her siteyi 
                    detaylı olarak test eder, lisans bilgilerini kontrol eder ve kullanıcı geri bildirimlerini 
                    analiz eder. Verilerimiz gerçek testler ve deneyimlere dayanır.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Platform ücretsiz mi?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Evet, platformumuz tamamen ücretsizdir. Kullanıcılarımız tüm incelemelere, karşılaştırmalara 
                    ve bilgilere ücretsiz erişebilir. Amacımız bahis severler için en iyi bilgi kaynağı olmaktır.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Bahis siteleriyle ilişkiniz var mı?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Platformumuz bağımsızdır ve hiçbir bahis sitesinin kontrolünde değildir. Bazı sitelerle 
                    ortaklık programları olsa da, değerlendirmelerimiz tamamen objektiftir ve ortaklık durumu 
                    puanlamayı etkilemez. Kullanıcı çıkarları her zaman önceliğimizdir.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Nasıl iletişime geçebilirim?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Sorularınız, önerileriniz veya site önerileriniz için bizimle iletişime geçebilirsiniz. 
                    Kullanıcı geri bildirimlerine değer veriyor ve platformumuzu sürekli iyileştiriyoruz.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
