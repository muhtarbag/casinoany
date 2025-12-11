
import { BettingCalculator } from '@/components/tools/BettingCalculator';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const CalculatorPage = () => {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            <SEO
                title="Bahis ve Bonus Çevrim Hesaplama Aracı | CasinoAny"
                description="Ücretsiz bonus çevrim şartı hesaplama ve iddaa oran/kazanç hesaplayıcı. Bahis stratejilerinizi matematiksel verilerle güçlendirin."
                keywords={['bonus çevrim hesaplama', 'iddaa oran hesaplama', 'bahis kazanç hesapla', 'çevrim şartı nedir', 'kombine kupon hesaplama']}
                canonical="https://casinoany.com/araclar/bahis-hesaplama"
                ogType="website"
            />

            <Header />

            <main className="container mx-auto px-4 py-8 md:py-12 pt-[100px] md:pt-[120px] pb-24 md:pb-12">
                <div className="max-w-5xl mx-auto">
                    {/* Tool Section */}
                    <div className="mb-20">
                        <BettingCalculator />
                    </div>

                    {/* SEO Content Section */}
                    <div className="grid md:grid-cols-2 gap-12 items-start mt-20 border-t border-border/50 pt-16">
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-3xl font-display font-bold">
                                Neden Hesaplama Aracı Kullanmalısınız?
                            </h2>
                            <div className="prose prose-invert text-muted-foreground">
                                <p>
                                    Bahis ve casino dünyasında kazanmanın yarısı şans ise, diğer yarısı <strong>matematiksel stratejidir</strong>.
                                    Pek çok oyuncu, aldığı bonusun çevrim şartlarını yanlış hesapladığı için kazancını çekememektedir.
                                </p>
                                <p>
                                    CasinoAny Hesaplama Aracı ile:
                                </p>
                                <ul className="space-y-2 list-none pl-0">
                                    {[
                                        'Bonus çevrimini tamamlamak için gereken net tutarı öğrenirsiniz.',
                                        'Kombine kuponlarınızın toplam oranını hatasız hesaplarsınız.',
                                        'Kasa yönetimi (Bankroll Management) yaparken riskinizi görürsünüz.',
                                        'Duygusal değil, veri odaklı bahis yaparsınız.'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 bg-green-500/10 p-1 rounded-full">
                                                <Check className="w-3 h-3 text-green-500" />
                                            </div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-card/30 rounded-3xl p-8 border border-border/50 space-y-6">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
                                SSS
                            </Badge>
                            <h3 className="text-xl font-bold">Sıkça Sorulan Sorular</h3>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-foreground">Çevrim Şartı (Wagering) Nedir?</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Bahis sitelerinin verdiği bonusu nakit olarak çekebilmeniz için oynamanız gereken minimum bahis tutarıdır. Örneğin 10x şartı varsa, bonusun 10 katı kadar oyun oynamalısınız.
                                    </p>
                                </div>
                                <div className="h-px bg-border/50" />
                                <div>
                                    <h4 className="font-semibold text-foreground">Oyun Katkısı Ne Demek?</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Her oyun çevrime eşit etki etmez. Slot oyunları genellikle %100 katkı sağlarken, Blackjack veya Rulet gibi oyunlar %10-%20 katkı sağlayabilir. Aracımızda bunu ayarlayabilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <MobileBottomNav />
        </div>
    );
};

export default CalculatorPage;
