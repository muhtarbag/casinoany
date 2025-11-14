import { UseFormReturn } from 'react-hook-form';
import { SiteFormData } from '@/schemas/siteValidation';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormFieldWrapper } from '@/components/forms/FormFieldWrapper';
import { Label } from '@/components/ui/label';

interface SiteFormStepAffiliateProps {
  form: UseFormReturn<SiteFormData>;
}

export function SiteFormStepAffiliate({ form }: SiteFormStepAffiliateProps) {
  const hasMonthlyPayment = form.watch('affiliate_has_monthly_payment');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="affiliate_contract_date"
          render={({ field }) => (
            <FormFieldWrapper
              label="Anlaşma Tarihi"
              helpText="Affiliate anlaşmasının başlangıç tarihi"
            >
              <Input type="date" {...field} />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="affiliate_commission_percentage"
          render={({ field }) => (
            <FormFieldWrapper
              label="Komisyon Oranı"
              helpText="Kazanç komisyon yüzdesi"
            >
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="25"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  value={field.value ?? ''}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="affiliate_panel_url"
          render={({ field }) => (
            <FormFieldWrapper
              label="Panel URL"
              helpText="Affiliate yönetim paneli adresi"
            >
              <Input type="url" placeholder="https://panel.site.com" {...field} />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="affiliate_panel_username"
          render={({ field }) => (
            <FormFieldWrapper
              label="Panel Kullanıcı Adı"
              helpText="Panele giriş için kullanıcı adı"
            >
              <Input placeholder="kullanici123" {...field} />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="affiliate_panel_password"
          render={({ field }) => (
            <FormFieldWrapper
              label="Panel Şifresi"
              helpText="Panele giriş şifresi (güvenli saklanır)"
            >
              <Input type="password" placeholder="••••••••" {...field} />
            </FormFieldWrapper>
          )}
        />

        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="affiliate_has_monthly_payment"
            render={({ field }) => (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="monthly-payment" className="text-sm font-medium">
                    Aylık Sabit Ödeme
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Komisyon dışında sabit ödeme var mı?
                  </p>
                </div>
                <Switch
                  id="monthly-payment"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          {hasMonthlyPayment && (
            <FormField
              control={form.control}
              name="affiliate_monthly_payment"
              render={({ field }) => (
                <FormFieldWrapper
                  label="Aylık Ödeme Tutarı"
                  required
                  helpText="TL cinsinden aylık sabit ödeme"
                >
                  <div className="relative">
                    <Input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="5000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      value={field.value ?? ''}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₺
                    </span>
                  </div>
                </FormFieldWrapper>
              )}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t pt-6">
        <FormField
          control={form.control}
          name="affiliate_contract_terms"
          render={({ field }) => (
            <FormFieldWrapper
              label="Anlaşma Şartları"
              helpText="Affiliate anlaşmasının detayları ve şartları"
            >
              <Textarea
                placeholder="Anlaşma detaylarını buraya yazın..."
                className="min-h-[120px]"
                {...field}
              />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="affiliate_notes"
          render={({ field }) => (
            <FormFieldWrapper
              label="Notlar"
              helpText="Özel notlar veya hatırlatmalar"
            >
              <Textarea
                placeholder="Özel notlarınızı buraya ekleyin..."
                className="min-h-[100px]"
                {...field}
              />
            </FormFieldWrapper>
          )}
        />
      </div>
    </div>
  );
}
