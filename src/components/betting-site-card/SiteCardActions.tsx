import { ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

interface SiteCardActionsProps {
  onDetailsClick: (e: React.MouseEvent) => void;
  onAffiliateClick: (e: React.MouseEvent) => void;
}

export const SiteCardActions = ({ onDetailsClick, onAffiliateClick }: SiteCardActionsProps) => {
  return (
    <CardFooter className="px-6 pb-6 pt-0 gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 group/btn"
        onClick={onDetailsClick}
      >
        Detaylar
        <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
      </Button>
      <Button 
        size="sm" 
        className="flex-1 relative font-bold overflow-hidden group/cta transition-all duration-500 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_50px_rgba(236,72,153,0.4)] hover:scale-[1.02] text-white border-0"
        onClick={onAffiliateClick}
      >
        {/* Animated shimmer */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 translate-x-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%]" />
        </div>
        
        {/* Pulse glow */}
        <div className="absolute inset-0 bg-white/5 animate-glow" />
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2 drop-shadow-lg">
          Siteye Git
          <ExternalLink className="w-4 h-4 group-hover/cta:translate-x-1 transition-all duration-300" />
        </span>
      </Button>
    </CardFooter>
  );
};
