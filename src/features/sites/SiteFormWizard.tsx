import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SiteFormData } from '@/schemas/siteValidation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteFormProgress } from '@/components/forms/SiteFormProgress';
import { SiteFormStepBasic } from './wizard-steps/SiteFormStepBasic';
import { SiteFormStepSocial } from './wizard-steps/SiteFormStepSocial';
import { SiteFormStepAffiliate } from './wizard-steps/SiteFormStepAffiliate';
import { ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutHint } from '@/components/shortcuts/ShortcutHint';

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
  const isMobile = useIsMobile();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        if (currentStep === STEPS.length - 1) {
          handleSubmit();
        }
      },
      description: 'Formu kaydet',
    },
    {
      key: 'Escape',
      handler: () => {
        if (!isLoading) {
          onCancel();
        }
      },
      description: 'Formu iptal et',
    },
    {
      key: 'Enter',
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        if (currentStep < STEPS.length - 1) {
          handleNext();
        } else {
          handleSubmit();
        }
      },
      description: 'Sonraki adım / Kaydet',
    },
  ]);

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
    <div className="space-y-4 sm:space-y-6">
      <SiteFormProgress currentStep={currentStep} steps={STEPS} />

      <Card>
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto order-last sm:order-first"
        >
          {isMobile && <X className="w-4 h-4 mr-2" />}
          İptal
        </Button>

        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
              {!isMobile && 'Geri'}
            </Button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button 
              type="button" 
              onClick={handleNext} 
              disabled={isLoading}
              className="flex-1 sm:flex-none gap-2"
            >
              {!isMobile && 'İleri'}
              <ChevronRight className="w-4 h-4" />
              {!isMobile && <ShortcutHint shortcut={{ key: 'Enter', ctrl: true }} />}
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="flex-1 sm:flex-none gap-2"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Güncelle' : 'Kaydet'}
              {!isMobile && <ShortcutHint shortcut={{ key: 'S', ctrl: true }} />}
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
