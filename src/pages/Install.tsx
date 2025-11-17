import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Chrome, Apple, Check } from 'lucide-react';
import { SEO } from '@/components/SEO';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Capture PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <Header />
      <SEO 
        title="Uygulamayı Yükle"
        description="CasinoAny mobil uygulamasını telefonunuza yükleyin. Hızlı erişim, offline çalışma ve daha fazlası."
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <Smartphone className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Mobil Uygulamayı Yükle
            </h1>
            <p className="text-muted-foreground text-lg">
              CasinoAny'i telefonunuza yükleyin, her zaman yanınızda olsun
            </p>
          </div>

          {isInstalled ? (
            <Card className="border-green-500/50 bg-green-500/5">
              <CardContent className="pt-6 text-center">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Uygulama Yüklendi! ✨</h3>
                <p className="text-muted-foreground">
                  CasinoAny artık ana ekranınızda. Keyifli kullanımlar!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Android & Chrome Install */}
              {deferredPrompt && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Chrome className="w-6 h-6" />
                      Hızlı Yükleme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Uygulamayı tek tıkla telefonunuza yükleyin
                    </p>
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-secondary"
                      onClick={handleInstall}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Şimdi Yükle
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* iOS Install Guide */}
              {isIOS && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="w-6 h-6" />
                      iPhone Kullanıcıları İçin
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 text-sm">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        <span>
                          Safari'de bu sayfayı açın (eğer başka tarayıcıdaysanız)
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <span>
                          Ekranın altındaki <strong>Paylaş</strong> butonuna (<span className="inline-block">□↑</span>) dokunun
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        <span>
                          Aşağı kaydırın ve <strong>"Ana Ekrana Ekle"</strong> seçeneğine dokunun
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                          4
                        </span>
                        <span>
                          Sağ üstteki <strong>"Ekle"</strong> butonuna dokunun
                        </span>
                      </li>
                    </ol>
                    <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-center">
                        🎉 Artık CasinoAny ana ekranınızda!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Android Manual Install */}
              {isAndroid && !deferredPrompt && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Chrome className="w-6 h-6" />
                      Android Kullanıcıları İçin
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 text-sm">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        <span>
                          Chrome tarayıcısında bu sayfayı açın
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <span>
                          Sağ üstteki <strong>Menü</strong> butonuna (⋮) dokunun
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        <span>
                          <strong>"Ana ekrana ekle"</strong> veya <strong>"Uygulama yükle"</strong> seçeneğine dokunun
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                          4
                        </span>
                        <span>
                          <strong>"Yükle"</strong> butonuna dokunun
                        </span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Neden Yüklemeliyim?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                        ⚡
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Anında Erişim</h4>
                        <p className="text-sm text-muted-foreground">
                          Ana ekranınızdan tek dokunuşla açın
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                        📱
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Tam Ekran Deneyim</h4>
                        <p className="text-sm text-muted-foreground">
                          Tarayıcı çubuğu olmadan, tam ekran kullanın
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                        🔔
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Bildirimler</h4>
                        <p className="text-sm text-muted-foreground">
                          Yeni bonuslar ve kampanyalardan haberdar olun
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                        ⚡
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Hızlı & Hafif</h4>
                        <p className="text-sm text-muted-foreground">
                          Çok az yer kaplar, çok hızlı çalışır
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;