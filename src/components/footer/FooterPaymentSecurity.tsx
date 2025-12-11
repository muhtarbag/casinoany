import { Shield, Lock, CreditCard, Bitcoin, Landmark, Wallet } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const FooterPaymentSecurity = () => {
  return (
    <div className="border-t border-border pt-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold mb-3 text-sm">Popüler Ödeme Yöntemleri</h4>
          <div className="flex flex-wrap gap-3 opacity-70">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-card border border-border rounded-md hover:border-primary/50 transition-colors cursor-help">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Papara</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-card border border-border rounded-md hover:border-primary/50 transition-colors cursor-help">
                    <Bitcoin className="w-5 h-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Kripto Para</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-card border border-border rounded-md hover:border-primary/50 transition-colors cursor-help">
                    <Landmark className="w-5 h-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Banka Havalesi</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-card border border-border rounded-md hover:border-primary/50 transition-colors cursor-help">
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>CMT Cüzdan</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Güvenlik & Lisanslar</h4>
          <div className="flex flex-wrap gap-3 opacity-70">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-card border border-border rounded-md hover:border-primary/50 transition-colors cursor-help">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>SSL Güvenliği</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-card border border-border rounded-md hover:border-primary/50 transition-colors cursor-help">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Curacao Lisanslı</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-9 w-9 flex items-center justify-center bg-card border border-border rounded-md hover:border-destructive/50 transition-colors cursor-help font-bold text-xs text-destructive">
                    18+
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>18+ Yaş Sınırı</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};
