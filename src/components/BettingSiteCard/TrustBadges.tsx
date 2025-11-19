import { memo } from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface TrustBadgesProps {
  reviewCount: number;
}

export const TrustBadges = memo(({ reviewCount }: TrustBadgesProps) => {
  const isVerified = reviewCount > 10;

  return (
    <div className="flex items-center gap-2">
      {/* Licensed Badge */}
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <Badge 
            variant="outline" 
            className="gap-1 border-success/30 text-success hover:bg-success/10 transition-colors text-xs py-0.5 px-2"
          >
            <Shield className="w-3 h-3" />
            Lisanslı
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-64 text-xs">
          <div className="space-y-2">
            <p className="font-semibold">Lisanslı ve Güvenli</p>
            <p className="text-muted-foreground">
              Bu site yasal lisans altında faaliyet göstermektedir ve güvenli oyun ortamı sağlamaktadır.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Verified Badge */}
      {isVerified && (
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <Badge 
              variant="outline" 
              className="gap-1 border-primary/30 text-primary hover:bg-primary/10 transition-colors text-xs py-0.5 px-2"
            >
              <CheckCircle2 className="w-3 h-3" />
              Doğrulandı
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent side="top" className="w-64 text-xs">
            <div className="space-y-2">
              <p className="font-semibold">Kullanıcı Doğrulamalı</p>
              <p className="text-muted-foreground">
                {reviewCount}+ gerçek kullanıcı tarafından değerlendirildi ve doğrulandı.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
});

TrustBadges.displayName = 'TrustBadges';
