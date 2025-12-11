import { useState, useCallback } from 'react';
import { GeneratedContent } from './useAIContentIntegration';

export const useAIGeneratedContent = () => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const storeContent = useCallback((content: GeneratedContent) => {
    setGeneratedContent(content);
  }, []);

  const clearContent = useCallback(() => {
    setGeneratedContent(null);
  }, []);

  return {
    generatedContent,
    storeContent,
    clearContent,
  };
};
