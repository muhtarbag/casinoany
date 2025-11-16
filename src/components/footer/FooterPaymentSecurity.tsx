import { Shield, Lock } from 'lucide-react';

export const FooterPaymentSecurity = () => {
  return (
    <div className="border-t border-border pt-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold mb-3 text-sm">Popüler Ödeme Yöntemleri</h4>
          <div className="flex flex-wrap gap-3 opacity-70">
            <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
              💳 Papara
            </div>
            <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
              ₿ Kripto Para
            </div>
            <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
              🏦 Banka Havalesi
            </div>
            <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
              💰 CMT Cüzdan
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3 text-sm">Güvenlik & Lisanslar</h4>
          <div className="flex flex-wrap gap-3 opacity-70">
            <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium flex items-center gap-2">
              <Shield className="w-3 h-3" />
              SSL Güvenliği
            </div>
            <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Curacao Lisanslı
            </div>
            <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
              18+ Yaş Sınırı
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
