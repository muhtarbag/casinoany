import { useState } from 'react';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Building2, HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const individualFAQs: FAQItem[] = [
  {
    category: 'Hesap & Üyelik',
    question: 'Nasıl üye olabilirim?',
    answer: 'Ana sayfadaki "Kayıt Ol" butonuna tıklayarak e-posta adresiniz ve şifreniz ile ücretsiz üyelik oluşturabilirsiniz. Üyelik işlemi sadece birkaç dakika sürer ve tamamen ücretsizdir.'
  },
  {
    category: 'Hesap & Üyelik',
    question: 'Şifremi unuttum, ne yapmalıyım?',
    answer: 'Giriş sayfasındaki "Şifremi Unuttum" linkine tıklayın. E-posta adresinizi girin ve size gönderilen link ile yeni şifre oluşturabilirsiniz.'
  },
  {
    category: 'Hesap & Üyelik',
    question: 'Hesabımı nasıl silebilirim?',
    answer: 'Profil ayarlarınızdan "Hesap Ayarları" bölümüne gidin ve "Hesabımı Sil" seçeneğini kullanın. Hesabınız silindikten sonra tüm verileriniz kalıcı olarak silinecektir.'
  },
  {
    category: 'Değerlendirme & İnceleme',
    question: 'Bahis sitelerine nasıl yorum yapabilirim?',
    answer: 'Site detay sayfasındaki "Değerlendirme Yap" butonuna tıklayarak deneyimlerinizi puanla birlikte paylaşabilirsiniz. Yorumlarınız moderasyon sürecinden geçtikten sonra yayınlanacaktır.'
  },
  {
    category: 'Değerlendirme & İnceleme',
    question: 'Yaptığım yorumu düzenleyebilir miyim?',
    answer: 'Evet, profilinizden "Değerlendirmelerim" bölümüne giderek daha önce yaptığınız yorumları düzenleyebilir veya silebilirsiniz.'
  },
  {
    category: 'Değerlendirme & İnceleme',
    question: 'Olumsuz yorumum yayınlanır mı?',
    answer: 'Evet, kurallarımıza uygun tüm yorumlar yayınlanır. Yapıcı eleştiriler ve gerçek deneyimler bizim için değerlidir. Sadece küfür, hakaret veya yanıltıcı bilgi içeren yorumlar reddedilir.'
  },
  {
    category: 'Şikayet',
    question: 'Bir bahis sitesi hakkında şikayet nasıl oluşturabilirim?',
    answer: 'Şikayetler sayfasından "Yeni Şikayet" butonuna tıklayarak detaylı şikayetinizi iletebilirsiniz. Şikayetiniz incelendikten sonra ilgili site yetkililerine iletilir ve takip edilir.'
  },
  {
    category: 'Şikayet',
    question: 'Şikayetim ne kadar sürede cevaplanır?',
    answer: 'Şikayetler genellikle 24-48 saat içinde incelenir ve ilgili site yetkililerine iletilir. Site yetkilisinden yanıt 3-7 iş günü içinde gelir. Süreci profilinizden takip edebilirsiniz.'
  },
  {
    category: 'Şikayet',
    question: 'Şikayetim çözülmezse ne olur?',
    answer: 'Şikayetiniz çözülmezse, durumu detaylı şekilde belgeleyin ve destek ekibimizle iletişime geçin. Gerekli durumlarda yasal yolları kullanmanız için size rehberlik edebiliriz.'
  },
  {
    category: 'Bonus & Kampanyalar',
    question: 'Bonus tekliflerinden nasıl faydalanabilirim?',
    answer: 'Bonus sayfamızdaki kampanyaları inceleyip "Bonusu Al" butonuna tıklayarak ilgili siteye yönlendirilirsiniz. Bonus kodlarını kaydetmeyi unutmayın.'
  },
  {
    category: 'Bonus & Kampanyalar',
    question: 'Deneme bonusu nedir?',
    answer: 'Deneme bonusu, bahis sitelerinin yeni üyelere verdikleri para yatırma gerektirmeyen bonuslardır. Bu bonuslarla siteyi risk almadan deneyebilirsiniz.'
  },
  {
    category: 'Sadakat Programı',
    question: 'Puan sistemi nasıl çalışır?',
    answer: 'Yorum yaparak, şikayet oluşturarak ve siteyi aktif kullanarak puan kazanırsınız. Puanlarınızı özel ödüller ve avantajlar için kullanabilirsiniz.'
  },
  {
    category: 'Sadakat Programı',
    question: 'Kazandığım puanları nasıl kullanabilirim?',
    answer: 'Profilinizden "Sadakat Programı" bölümüne giderek puanlarınızı görüntüleyebilir ve mevcut ödüller için harcayabilirsiniz.'
  },
  {
    category: 'Güvenlik & Gizlilik',
    question: 'Kişisel bilgilerim güvende mi?',
    answer: 'Evet, tüm kişisel verileriniz SSL şifreleme ile korunur ve KVKK kapsamında güvenle saklanır. Bilgilerinizi asla üçüncü şahıslarla paylaşmayız.'
  },
  {
    category: 'Güvenlik & Gizlilik',
    question: 'Hesabımı nasıl daha güvenli hale getirebilirim?',
    answer: 'Güçlü bir şifre kullanın, şifrenizi düzenli olarak değiştirin ve hesap bilgilerinizi kimseyle paylaşmayın. İki faktörlü kimlik doğrulamayı aktif etmenizi öneririz.'
  }
];

const corporateFAQs: FAQItem[] = [
  {
    category: 'Kurumsal Üyelik',
    question: 'Bahis sitem için nasıl kurumsal üyelik oluşturabilirim?',
    answer: 'Kurumsal üyelik başvurusu için "Site Ekle" sayfasından başvuru formunu doldurun. Şirket bilgileriniz ve gerekli belgeler kontrol edildikten sonra hesabınız aktif edilir. Onay süreci 2-3 iş günü sürer.'
  },
  {
    category: 'Kurumsal Üyelik',
    question: 'Kurumsal üyeliğin maliyeti nedir?',
    answer: 'Temel kurumsal üyelik ücretsizdir. Premium özellikler ve reklam paketleri için farklı planlarımız bulunmaktadır. Detaylı fiyatlandırma için satış ekibimizle iletişime geçebilirsiniz.'
  },
  {
    category: 'Kurumsal Üyelik',
    question: 'Hangi belgeler gereklidir?',
    answer: 'Ticaret sicil gazetesi, vergi levhası, şirket yetkilisinin kimlik fotokopisi ve yetki belgesi gereklidir. Ayrıca lisans bilgilerinizi de talep ediyoruz.'
  },
  {
    category: 'Site Yönetimi',
    question: 'Site bilgilerimi nasıl güncelleyebilirim?',
    answer: 'Panel girişi yaptıktan sonra "Site Yönetimi" bölümünden tüm site bilgilerinizi, bonus tekliflerinizi ve sosyal medya hesaplarınızı güncelleyebilirsiniz.'
  },
  {
    category: 'Site Yönetimi',
    question: 'Logo ve görsellerimi nasıl yükleyebilirim?',
    answer: 'Site yönetimi panelinden "Medya" bölümünü kullanarak logonuzu ve promosyon görsellerinizi yükleyebilirsiniz. Görseller otomatik olarak optimize edilir.'
  },
  {
    category: 'Site Yönetimi',
    question: 'Alternatif domain adreslerimi nasıl eklerim?',
    answer: 'Panel üzerinden "Domain Yönetimi" bölümünden aktif ve yedek domain adreslerinizi ekleyebilir ve yönetebilirsiniz. Bloke edilen adresler otomatik olarak güncellenebilir.'
  },
  {
    category: 'Şikayet Yönetimi',
    question: 'Sitem hakkında gelen şikayetleri nasıl görebilirim?',
    answer: 'Panel üzerinden "Şikayetler" bölümünden sitenize yapılan tüm şikayetleri görüntüleyebilir, yanıtlayabilir ve çözüm süreçlerini takip edebilirsiniz.'
  },
  {
    category: 'Şikayet Yönetimi',
    question: 'Şikayetlere yanıt verme sürem var mı?',
    answer: 'Şikayetlere 7 iş günü içinde yanıt vermeniz beklenir. Hızlı yanıt veren siteler puanlama sisteminde avantaj kazanır ve kullanıcı güvenilirliği artar.'
  },
  {
    category: 'Şikayet Yönetimi',
    question: 'Haksız şikayetlere itiraz edebilir miyim?',
    answer: 'Evet, haksız veya yanıltıcı bulduğunuz şikayetler için panel üzerinden itiraz başvurusu yapabilirsiniz. İtirazınız incelendikten sonra gerekli işlemler yapılır.'
  },
  {
    category: 'Performans & Analitik',
    question: 'Site performansımı nasıl takip edebilirim?',
    answer: 'Dashboard üzerinden site görüntüleme sayıları, tıklanma oranları, dönüşüm metrikleri ve kullanıcı etkileşimlerini detaylı raporlarla takip edebilirsiniz.'
  },
  {
    category: 'Performans & Analitik',
    question: 'Hangi metrikleri görebilirim?',
    answer: 'Günlük/aylık görüntüleme, tıklama oranları (CTR), dönüşüm sayıları, ortalama puan, yorum sayısı, şikayet durumu ve rakip karşılaştırma gibi detaylı analizlere erişebilirsiniz.'
  },
  {
    category: 'Performans & Analitik',
    question: 'Raporları dışa aktarabilir miyim?',
    answer: 'Evet, tüm performans raporlarınızı Excel, PDF veya CSV formatlarında dışa aktarabilirsiniz. Otomatik periyodik raporlama da ayarlayabilirsiniz.'
  },
  {
    category: 'Reklam & Promosyon',
    question: 'Sitemi nasıl öne çıkarabilirim?',
    answer: 'Premium üyelik paketleri ile ana sayfada öne çıkarılabilir, özel etiketler alabilir ve sponsorlu içerik yayınlayabilirsiniz. Detaylar için satış ekibimizle görüşün.'
  },
  {
    category: 'Reklam & Promosyon',
    question: 'Banner reklamı verebilir miyim?',
    answer: 'Evet, farklı sayfalarda banner reklamları yayınlayabilirsiniz. Kampanya bütçenize göre özel paketler sunuyoruz.'
  },
  {
    category: 'Reklam & Promosyon',
    question: 'Bonus kampanyalarımı nasıl tanıtabilirim?',
    answer: 'Panel üzerinden bonus kampanyalarınızı ekleyebilir ve "Öne Çıkan Bonuslar" bölümünde görünürlük kazanabilirsiniz.'
  },
  {
    category: 'Doğrulama & Güvenilirlik',
    question: 'Site doğrulaması nedir?',
    answer: 'Site doğrulaması, sitenizin sahibi olduğunuzu kanıtlayan bir süreçtir. Domain kontrolü veya e-posta doğrulaması ile yapılır. Doğrulanmış siteler özel bir rozet alır.'
  },
  {
    category: 'Doğrulama & Güvenilirlik',
    question: 'Güvenilirlik puanım nasıl hesaplanır?',
    answer: 'Kullanıcı yorumları, şikayet çözüm oranı, yanıt süresi, lisans durumu ve site güvenliği gibi faktörler güvenilirlik puanınızı etkiler.'
  },
  {
    category: 'Ödeme & Fatura',
    question: 'Nasıl ödeme yapabilirim?',
    answer: 'Kredi kartı, havale/EFT veya kurumsal fatura ile ödeme yapabilirsiniz. Tüm ödemeler güvenli ödeme altyapısı ile işlenir.'
  },
  {
    category: 'Ödeme & Fatura',
    question: 'Fatura alabilir miyim?',
    answer: 'Evet, kurumsal üyelerimize her ödeme için e-fatura kesilir. Faturalarınıza panel üzerinden "Ödemeler" bölümünden ulaşabilirsiniz.'
  },
  {
    category: 'Destek & İletişim',
    question: 'Teknik destek nasıl alabilirim?',
    answer: 'Panel içinden canlı destek, e-posta veya telefon ile 7/24 teknik destek alabilirsiniz. Premium üyeler öncelikli destek hizmeti alır.'
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('individual');

  const filterFAQs = (faqs: FAQItem[]) => {
    if (!searchQuery) return faqs;
    
    return faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCategories = (faqs: FAQItem[]) => {
    return [...new Set(faqs.map(faq => faq.category))];
  };

  const filteredIndividualFAQs = filterFAQs(individualFAQs);
  const filteredCorporateFAQs = filterFAQs(corporateFAQs);

  return (
    <>
      <SEO
        title="Sıkça Sorulan Sorular (SSS)"
        description="Bahis siteleri platformu hakkında bireysel ve kurumsal üyeler için sıkça sorulan sorular ve cevapları. Hesap yönetimi, şikayetler, bonus kampanyaları ve daha fazlası."
        keywords={['SSS', 'sıkça sorulan sorular', 'bahis siteleri yardım', 'hesap yönetimi', 'şikayet süreci', 'bonus kampanyaları']}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
          <div className="container mx-auto px-4 py-12">
            <Breadcrumb
              items={[
                { label: 'Ana Sayfa', href: '/' },
                { label: 'SSS' }
              ]}
            />

            <div className="max-w-3xl mx-auto text-center mt-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <HelpCircle className="w-10 h-10 text-primary" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sıkça Sorulan Sorular
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Aradığınız cevapları bulmak için kategorilere göz atın veya arama yapın
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Sorularınızı arayın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="container mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Bireysel Üyeler
              </TabsTrigger>
              <TabsTrigger value="corporate" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Kurumsal Üyeler
              </TabsTrigger>
            </TabsList>

            {/* Individual FAQs */}
            <TabsContent value="individual" className="space-y-8">
              {searchQuery && filteredIndividualFAQs.length === 0 ? (
                <Card className="p-12 text-center">
                  <CardContent>
                    <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Sonuç bulunamadı</h3>
                    <p className="text-muted-foreground">
                      Aradığınız soruyu bulamadık. Farklı anahtar kelimeler deneyin veya destek ekibimizle iletişime geçin.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getCategories(filteredIndividualFAQs).map((category) => (
                  <Card key={category} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="secondary">{category}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {filteredIndividualFAQs.filter(faq => faq.category === category).length} soru
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        {filteredIndividualFAQs
                          .filter(faq => faq.category === category)
                          .map((faq, index) => (
                            <AccordionItem
                              key={`${category}-${index}`}
                              value={`${category}-${index}`}
                              className="border-b last:border-0"
                            >
                              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 text-left">
                                <span className="font-medium">{faq.question}</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 py-4 text-muted-foreground bg-muted/20">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Corporate FAQs */}
            <TabsContent value="corporate" className="space-y-8">
              {searchQuery && filteredCorporateFAQs.length === 0 ? (
                <Card className="p-12 text-center">
                  <CardContent>
                    <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Sonuç bulunamadı</h3>
                    <p className="text-muted-foreground">
                      Aradığınız soruyu bulamadık. Farklı anahtar kelimeler deneyin veya destek ekibimizle iletişime geçin.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getCategories(filteredCorporateFAQs).map((category) => (
                  <Card key={category} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="secondary">{category}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {filteredCorporateFAQs.filter(faq => faq.category === category).length} soru
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        {filteredCorporateFAQs
                          .filter(faq => faq.category === category)
                          .map((faq, index) => (
                            <AccordionItem
                              key={`${category}-${index}`}
                              value={`${category}-${index}`}
                              className="border-b last:border-0"
                            >
                              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 text-left">
                                <span className="font-medium">{faq.question}</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 py-4 text-muted-foreground bg-muted/20">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Contact Section */}
          <Card className="max-w-4xl mx-auto mt-12 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Sorunuza cevap bulamadınız mı?</h3>
              <p className="text-muted-foreground mb-6">
                Destek ekibimiz size yardımcı olmak için hazır
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/iletisim">
                    <Mail className="w-4 h-4 mr-2" />
                    İletişime Geçin
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="tel:+908501234567">
                    <Phone className="w-4 h-4 mr-2" />
                    0850 123 45 67
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
