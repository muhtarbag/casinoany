import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface BonusCardProps {
  title: string;
  bonus_amount: string;
  bonus_type: string;
  category: string;
  image_url: string | null;
  description?: string;
  wagering_requirement?: string | null;
  validity_period?: string | null;
  bonus_code?: string | null;
  claim_url?: string | null;
  onDetailsClick: () => void;
  onClaimClick?: () => void;
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

const getCategoryBadge = (category: string) => {
  const config: Record<string, { label: string; className: string }> = {
    casino: { label: 'CASINO', className: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    spor: { label: 'SPOR', className: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    all: { label: 'TÜM', className: 'bg-green-500/10 text-green-600 border-green-200' },
  };
  const cat = config[category] || config.all;
  return <Badge className={cat.className}>{cat.label}</Badge>;
};

export const BonusCard = ({
  title,
  bonus_amount,
  bonus_type,
  category,
  image_url,
  description,
  wagering_requirement,
  validity_period,
  bonus_code,
  claim_url,
  onDetailsClick,
  onClaimClick,
}: BonusCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Bonus Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-20">🎁</div>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            {getCategoryBadge(category)}
          </div>

          {/* Bonus Code Badge */}
          {bonus_code && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-yellow-500 text-black border-0 font-mono">
                {bonus_code}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <h3 className="font-bold text-lg line-clamp-2 mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{getBonusTypeName(bonus_type)}</p>
          </div>

          {/* Bonus Amount - Highlighted */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">{bonus_amount}</p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {wagering_requirement && (
              <div>
                <p className="text-muted-foreground text-xs">Çevirme</p>
                <p className="font-semibold">{wagering_requirement}</p>
              </div>
            )}
            {validity_period && (
              <div>
                <p className="text-muted-foreground text-xs">Geçerlilik</p>
                <p className="font-semibold">{validity_period}</p>
              </div>
            )}
          </div>

          {/* Description Preview */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDetailsClick}
              className="flex-1"
            >
              <Info className="w-4 h-4 mr-1" />
              Devamını Oku
            </Button>
            {(claim_url || onClaimClick) && (
              <Button
                size="sm"
                onClick={() => {
                  if (claim_url) {
                    window.open(claim_url, '_blank');
                  } else if (onClaimClick) {
                    onClaimClick();
                  }
                }}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Bonus Talep Et
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
