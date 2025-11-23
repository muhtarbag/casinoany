import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, TrendingUp, Gift, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BonusDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonus: {
    title: string;
    bonus_amount: string;
    bonus_type: string;
    category: string;
    image_url: string | null;
    description?: string;
    wagering_requirement?: string | null;
    terms?: string | null;
    eligibility?: string | null;
    validity_period?: string | null;
    min_deposit?: string | null;
    max_bonus?: string | null;
    bonus_code?: string | null;
    claim_url?: string | null;
  };
  siteName?: string;
  affiliateLink?: string;
}

const getBonusTypeName = (type: string) => {
  const types: Record<string, string> = {
    'no_deposit': 'Deneme Bonusu',
    'welcome': 'Hoşgeldin Bonusu',
    'deposit': 'Yatırım Bonusu',
    'reload': 'Yeniden Yükleme',
    'cashback': 'Cashback',
    'free_spins': 'Bedava Spin',
    'other': 'Diğer',
  };
  return types[type] || type;
};

export const BonusDetailModal = ({
  isOpen,
  onClose,
  bonus,
  siteName,
  affiliateLink,
}: BonusDetailModalProps) => {
  const handleClaimBonus = () => {
    const url = bonus.claim_url || affiliateLink;
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <div className="relative">
          {/* Header Image */}
          {bonus.image_url && (
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src={bonus.image_url}
                alt={bonus.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{getBonusTypeName(bonus.bonus_type)}</Badge>
                  {bonus.bonus_code && (
                    <Badge className="bg-yellow-500 text-black border-0 font-mono">
                      KOD: {bonus.bonus_code}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{bonus.title}</DialogTitle>
                {siteName && (
                  <p className="text-sm text-muted-foreground">{siteName}</p>
                )}
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-6">
                {/* Bonus Amount Highlight */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">
                    {bonus.bonus_amount}
                  </p>
                  {bonus.max_bonus && (
                    <p className="text-sm text-muted-foreground">
                      Maksimum: {bonus.max_bonus}
                    </p>
                  )}
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {bonus.wagering_requirement && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Çevirme Şartı</p>
                        <p className="font-semibold">{bonus.wagering_requirement}</p>
                      </div>
                    </div>
                  )}
                  {bonus.validity_period && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Geçerlilik</p>
                        <p className="font-semibold">{bonus.validity_period}</p>
                      </div>
                    </div>
                  )}
                  {bonus.min_deposit && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Gift className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Min. Yatırım</p>
                        <p className="font-semibold">{bonus.min_deposit}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {bonus.description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Bonus Açıklaması</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {bonus.description}
                    </p>
                  </div>
                )}

                {/* Eligibility */}
                {bonus.eligibility && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Uygunluk Koşulları
                    </h3>
                    <p className="text-muted-foreground">{bonus.eligibility}</p>
                  </div>
                )}

                {/* Terms */}
                {bonus.terms && (
                  <div className="space-y-2 p-4 bg-yellow-500/5 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-lg text-yellow-700 dark:text-yellow-500">
                      Şartlar ve Koşullar
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {bonus.terms}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Kapat
              </Button>
              {(bonus.claim_url || affiliateLink) && (
                <Button
                  onClick={handleClaimBonus}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Bonusu Hemen Al
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
