import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SiteFormData } from '@/schemas/siteValidation';

export interface GeneratedContent {
  bonus: string;
  features: string[];
  pros: string[];
  cons: string[];
  expert_review: string;
  verdict: string;
  login_guide: string;
  withdrawal_guide: string;
  faq: Array<{ question: string; answer: string }>;
}

export const useAIContentIntegration = (form: UseFormReturn<SiteFormData>) => {
  const applyGeneratedContent = useCallback((content: GeneratedContent) => {
    // Apply basic info fields that exist in the form
    form.setValue('bonus', content.bonus);
    
    // Convert features array to comma-separated string for the form
    form.setValue('features', content.features.join(', '));
  }, [form]);

  return { applyGeneratedContent };
};
