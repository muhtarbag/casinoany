import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SiteFormData } from '@/schemas/siteValidation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteFormProgress } from '@/components/forms/SiteFormProgress';
import { SiteFormStepBasic } from './wizard-steps/SiteFormStepBasic';
import { SiteFormStepSocial } from './wizard-steps/SiteFormStepSocial';
import { SiteFormStepAffiliate } from './wizard-steps/SiteFormStepAffiliate';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface SiteFormWizardProps {
  form: UseFormReturn<SiteFormData>;
  editingId: string | null;
  logoFile: File | null;
  logoPreview: string | null;
  onLogoFileChange: (file: File | null) => void;
  onLogoPreviewChange: (preview: string | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const STEPS = ['Temel Bilgiler', 'Sosyal Medya', 'Affiliate'];

export function SiteFormWizard({
  form,
  editingId,
  logoFile,
  logoPreview,
  onLogoFileChange,
  onLogoPreviewChange,
  onSubmit,
  onCancel,
  isLoading,
}: SiteFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const result = await form.trigger(fieldsToValidate as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <SiteFormProgress currentStep={currentStep} steps={STEPS} />

      <Card>
        <CardContent className="pt-6">
          {currentStep === 0 && (
            <SiteFormStepBasic
              form={form}
              logoFile={logoFile}
              logoPreview={logoPreview}
              onLogoFileChange={onLogoFileChange}
              onLogoPreviewChange={onLogoPreviewChange}
            />
          )}
          {currentStep === 1 && <SiteFormStepSocial form={form} />}
          {currentStep === 2 && <SiteFormStepAffiliate form={form} />}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          İptal
        </Button>

        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext} disabled={isLoading}>
              İleri
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Güncelle' : 'Kaydet'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function getFieldsForStep(step: number): string[] {
  switch (step) {
    case 0:
      return ['name', 'slug', 'rating', 'affiliate_link', 'bonus', 'features'];
    case 1:
      return ['email', 'whatsapp', 'telegram', 'twitter', 'instagram', 'facebook', 'youtube'];
    case 2:
      return [
        'affiliate_contract_date',
        'affiliate_contract_terms',
        'affiliate_has_monthly_payment',
        'affiliate_monthly_payment',
        'affiliate_panel_url',
        'affiliate_panel_username',
        'affiliate_panel_password',
        'affiliate_notes',
        'affiliate_commission_percentage',
      ];
    default:
      return [];
  }
}
