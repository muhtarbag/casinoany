import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, TrendingUp } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
            Hakkımızda
          </h1>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                BahisSiteleri olarak, Türkiye'deki en güvenilir ve kaliteli bahis sitelerini 
                bir araya getirerek kullanıcılarımıza en iyi deneyimi sunmayı hedefliyoruz. 
                Platformumuz, bahis severlerin doğru ve güvenli sitelere ulaşmasını sağlamak 
                için kurulmuştur.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Güvenilir</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sadece lisanslı ve güvenilir bahis sitelerini listeliyoruz
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-secondary" />
                <CardTitle>Güncel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bonuslar ve kampanyalar sürekli güncellenir
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto mb-4 text-accent" />
                <CardTitle>Kullanıcı Dostu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Kolay erişim ve anlaşılır içerikler
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Misyonumuz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Kullanıcılarımıza en iyi bahis deneyimini yaşatmak için sürekli çalışıyoruz. 
                Güvenilir, hızlı ve kazançlı bahis siteleri hakkında detaylı bilgi sunarak, 
                doğru tercihlerde bulunmanıza yardımcı oluyoruz.
              </p>
              <p className="text-muted-foreground">
                Sorumlu bahis oyununun önemini vurgulayarak, kullanıcılarımızın bilinçli 
                kararlar almasını destekliyoruz. 18 yaş altına hizmet vermiyoruz ve 
                sorumlu bahis politikalarını destekliyoruz.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
