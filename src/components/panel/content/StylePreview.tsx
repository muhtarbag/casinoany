import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Star, Gamepad2 } from 'lucide-react';

interface BlockStyles {
  prosConsBlock?: {
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    padding?: number;
    shadow?: string;
  };
  expertReviewBlock?: {
    backgroundColor?: string;
    accentColor?: string;
    fontSize?: number;
    lineHeight?: number;
  };
  verdictBlock?: {
    backgroundColor?: string;
    highlightColor?: string;
    borderStyle?: string;
  };
  gameCategories?: {
    cardStyle?: string;
    hoverEffect?: string;
    iconSize?: number;
  };
  guides?: {
    backgroundColor?: string;
    stepNumberColor?: string;
    spacing?: number;
  };
}

interface StylePreviewProps {
  blockStyles: BlockStyles;
}

export function StylePreview({ blockStyles }: StylePreviewProps) {
  const getShadowClass = (shadow?: string) => {
    switch (shadow) {
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      case 'xl': return 'shadow-xl';
      default: return '';
    }
  };

  const getCardStyleClass = (style?: string) => {
    switch (style) {
      case 'elevated': return 'shadow-lg';
      case 'outlined': return 'border-2';
      case 'minimal': return 'border-0 shadow-none';
      default: return '';
    }
  };

  const getHoverEffectClass = (effect?: string) => {
    switch (effect) {
      case 'scale': return 'hover:scale-105';
      case 'lift': return 'hover:-translate-y-1 hover:shadow-lg';
      case 'glow': return 'hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-muted/20 rounded-lg">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Stil Önizlemesi</h3>
        <p className="text-sm text-muted-foreground">
          Aşağıda stillerinizin nasıl görüneceğini görebilirsiniz
        </p>
      </div>

      {/* Pros/Cons Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Artı/Eksi Bloğu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg border transition-all ${getShadowClass(blockStyles.prosConsBlock?.shadow)}`}
              style={{
                backgroundColor: blockStyles.prosConsBlock?.backgroundColor || '#ffffff',
                borderColor: blockStyles.prosConsBlock?.borderColor || '#e5e7eb',
                borderRadius: `${blockStyles.prosConsBlock?.borderRadius || 8}px`,
                padding: `${blockStyles.prosConsBlock?.padding || 16}px`,
              }}
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Artılar</h4>
                  <p className="text-sm text-muted-foreground">Hızlı ödeme işlemleri</p>
                  <p className="text-sm text-muted-foreground">Geniş oyun seçeneği</p>
                </div>
              </div>
            </div>
            <div
              className={`p-4 rounded-lg border transition-all ${getShadowClass(blockStyles.prosConsBlock?.shadow)}`}
              style={{
                backgroundColor: blockStyles.prosConsBlock?.backgroundColor || '#ffffff',
                borderColor: blockStyles.prosConsBlock?.borderColor || '#e5e7eb',
                borderRadius: `${blockStyles.prosConsBlock?.borderRadius || 8}px`,
                padding: `${blockStyles.prosConsBlock?.padding || 16}px`,
              }}
            >
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Eksiler</h4>
                  <p className="text-sm text-muted-foreground">Sınırlı bonus seçenekleri</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expert Review Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Uzman İncelemesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-6 rounded-lg border-l-4"
            style={{
              backgroundColor: blockStyles.expertReviewBlock?.backgroundColor || '#f9fafb',
              borderLeftColor: blockStyles.expertReviewBlock?.accentColor || '#6366f1',
              fontSize: `${blockStyles.expertReviewBlock?.fontSize || 16}px`,
              lineHeight: blockStyles.expertReviewBlock?.lineHeight || 1.6,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5" style={{ color: blockStyles.expertReviewBlock?.accentColor || '#6366f1' }} />
              <span className="font-semibold">Uzman Görüşü</span>
            </div>
            <p>
              Site kullanıcı deneyimi açısından oldukça başarılı. Özellikle mobil uyumluluğu ve 
              hızlı yükleme süreleri dikkat çekiyor. Bonus kampanyaları rekabetçi seviyede.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Verdict Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Değerlendirme Bloğu</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-6 rounded-lg border-2"
            style={{
              backgroundColor: blockStyles.verdictBlock?.backgroundColor || '#fef3c7',
              borderColor: blockStyles.verdictBlock?.highlightColor || '#f59e0b',
              borderStyle: blockStyles.verdictBlock?.borderStyle || 'solid',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: blockStyles.verdictBlock?.highlightColor || '#f59e0b' }}
              >
                8.5
              </div>
              <div>
                <h4 className="font-semibold">Genel Değerlendirme</h4>
                <p className="text-sm text-muted-foreground">Çok İyi</p>
              </div>
            </div>
            <p className="text-sm">
              Güvenilir ve kullanıcı dostu bir platform. Özellikle yeni başlayanlar için uygun.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Game Categories Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Oyun Kategorileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Slot Oyunları', 'Masa Oyunları', 'Canlı Casino', 'Jackpot'].map((game) => (
              <div
                key={game}
                className={`p-4 rounded-lg border text-center transition-all cursor-pointer ${getCardStyleClass(blockStyles.gameCategories?.cardStyle)} ${getHoverEffectClass(blockStyles.gameCategories?.hoverEffect)}`}
              >
                <Gamepad2 
                  className="mx-auto mb-2" 
                  style={{ 
                    width: `${blockStyles.gameCategories?.iconSize || 24}px`,
                    height: `${blockStyles.gameCategories?.iconSize || 24}px`
                  }} 
                />
                <p className="text-sm font-medium">{game}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guides Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Rehber Adımları</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="space-y-4"
            style={{ gap: `${blockStyles.guides?.spacing || 16}px` }}
          >
            {[1, 2, 3].map((step) => (
              <div 
                key={step}
                className="flex items-start gap-4 p-4 rounded-lg"
                style={{ backgroundColor: blockStyles.guides?.backgroundColor || '#f3f4f6' }}
              >
                <div 
                  className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: blockStyles.guides?.stepNumberColor || '#6366f1' }}
                >
                  {step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Adım {step}</h4>
                  <p className="text-sm text-muted-foreground">
                    {step === 1 && 'Siteye üye olun ve hesabınızı oluşturun'}
                    {step === 2 && 'Kimlik doğrulama belgelerinizi yükleyin'}
                    {step === 3 && 'İlk yatırımınızı yapın ve bonusunuzu alın'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
