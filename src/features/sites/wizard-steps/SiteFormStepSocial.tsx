import { UseFormReturn } from 'react-hook-form';
import { SiteFormData } from '@/schemas/siteValidation';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormFieldWrapper } from '@/components/forms/FormFieldWrapper';
import { Mail, MessageCircle, Send, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

interface SiteFormStepSocialProps {
  form: UseFormReturn<SiteFormData>;
}

export function SiteFormStepSocial({ form }: SiteFormStepSocialProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormFieldWrapper
              label="E-posta"
              helpText="Site destek veya iletişim e-postası"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="destek@site.com" className="pl-10" {...field} />
              </div>
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormFieldWrapper
              label="WhatsApp"
              helpText="WhatsApp iletişim numarası"
            >
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="+90 555 555 55 55" className="pl-10" {...field} />
              </div>
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="telegram"
          render={({ field }) => (
            <FormFieldWrapper
              label="Telegram"
              helpText="Telegram kullanıcı adı veya kanal linki"
            >
              <div className="relative">
                <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="@kullaniciadi" className="pl-10" {...field} />
              </div>
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="twitter"
          render={({ field }) => (
            <FormFieldWrapper
              label="Twitter / X"
              helpText="Twitter profil linki"
            >
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="https://twitter.com/..." className="pl-10" {...field} />
              </div>
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormFieldWrapper
              label="Instagram"
              helpText="Instagram profil linki"
            >
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="https://instagram.com/..." className="pl-10" {...field} />
              </div>
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="facebook"
          render={({ field }) => (
            <FormFieldWrapper
              label="Facebook"
              helpText="Facebook sayfa linki"
            >
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="https://facebook.com/..." className="pl-10" {...field} />
              </div>
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="youtube"
          render={({ field }) => (
            <FormFieldWrapper
              label="YouTube"
              helpText="YouTube kanal linki"
            >
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="https://youtube.com/..." className="pl-10" {...field} />
              </div>
            </FormFieldWrapper>
          )}
        />
      </div>
    </div>
  );
}
