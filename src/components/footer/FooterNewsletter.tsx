import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const FooterNewsletter = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Başarılı!",
        description: "E-bülten aboneliğiniz oluşturuldu.",
      });
      setEmail('');
    }
  };

  return (
    <div className="bg-primary/10 rounded-lg p-8 mb-12 border border-primary/20">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold mb-2">📬 E-Bültene Abone Olun</h3>
        <p className="text-muted-foreground mb-6">
          En yeni bonuslar, kampanyalar ve bahis ipuçlarından haberdar olun!
        </p>
        <form onSubmit={handleNewsletter} className="flex gap-2 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit">Abone Ol</Button>
        </form>
      </div>
    </div>
  );
};
