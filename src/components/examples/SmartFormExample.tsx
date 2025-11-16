/**
 * Example usage of SmartFormWrapper with form persistence and smart defaults
 * This is a reference implementation - adapt to your specific forms
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SmartFormWrapper } from '@/components/forms/SmartFormWrapper';
import { useSmartDefaults } from '@/hooks/useSmartDefaults';
import { ShortcutHint } from '@/components/shortcuts/ShortcutHint';
import { toast } from 'sonner';

interface SiteFormData {
  name: string;
  affiliateLink: string;
  bonus: string;
  rating: number;
  features: string[];
}

export function SmartFormExample() {
  const { getLastUsedValues, saveDefaults } = useSmartDefaults({ context: 'site-form' });

  // Get smart defaults for pre-filling
  const lastUsed = getLastUsedValues(['rating', 'features']);

  const initialValues: SiteFormData = {
    name: '',
    affiliateLink: '',
    bonus: '',
    rating: lastUsed.rating || 4, // Smart default from previous usage
    features: lastUsed.features || [],
  };

  const handleSubmit = (values: SiteFormData) => {
    // Save as smart defaults for next time
    saveDefaults(values);
    
    toast.success('Form başarıyla kaydedildi!');
  };

  return (
    <SmartFormWrapper
      formKey="new-site-form"
      initialValues={initialValues}
      context="site-form"
      onSubmit={handleSubmit}
      excludeFromPersistence={['affiliateLink']} // Don't persist sensitive data
    >
      {({ values, updateValues, clearDraft }) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(values);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">
              Site Adı
              <ShortcutHint 
                shortcut={{ key: 'Tab' }} 
                className="ml-2"
              />
            </Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => updateValues({ name: e.target.value })}
              placeholder="Örn: BetSite"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliateLink">Affiliate Link</Label>
            <Input
              id="affiliateLink"
              value={values.affiliateLink}
              onChange={(e) => updateValues({ affiliateLink: e.target.value })}
              placeholder="https://..."
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus">Bonus</Label>
            <Input
              id="bonus"
              value={values.bonus}
              onChange={(e) => updateValues({ bonus: e.target.value })}
              placeholder="Örn: 100% Hoşgeldin Bonusu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">
              Puan (1-5)
              <span className="ml-2 text-xs text-muted-foreground">
                Varsayılan: {lastUsed.rating || 4} (önceki kullanımdan)
              </span>
            </Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              step="0.5"
              value={values.rating}
              onChange={(e) => updateValues({ rating: parseFloat(e.target.value) })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 gap-2">
              Kaydet
              <ShortcutHint shortcut={{ key: 'Enter', ctrl: true }} />
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={clearDraft}
            >
              Taslağı Temizle
            </Button>
          </div>
        </form>
      )}
    </SmartFormWrapper>
  );
}
