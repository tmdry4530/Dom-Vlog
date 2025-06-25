import { useState, useCallback } from 'react';
import { UseSeoOptimizationReturn } from '@/types/ai';
import { SeoRecommendationData, SEOValidationResult } from '@/types/seo';

export function useSeoOptimization(): UseSeoOptimizationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [seoData, setSeoData] = useState<SeoRecommendationData | null>(null);
  const [validationResult, setValidationResult] =
    useState<SEOValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSeoData = useCallback(
    async (content: string, title: string): Promise<SeoRecommendationData> => {
      if (!content.trim() || !title.trim()) {
        throw new Error('Content and title cannot be empty');
      }

      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/seo/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
            contentType: 'markdown',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'SEO recommendation failed');
        }

        const seoRecommendation = result.data;
        setSeoData(seoRecommendation);

        return seoRecommendation;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const validateSeo = useCallback(
    async (content: string): Promise<SEOValidationResult> => {
      if (!content.trim()) {
        throw new Error('Content cannot be empty');
      }

      setIsValidating(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/seo/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            contentType: 'markdown',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'SEO validation failed');
        }

        const validation = result.data;
        setValidationResult(validation);

        return validation;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const clearData = useCallback(() => {
    setSeoData(null);
    setValidationResult(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateSeoData,
    validateSeo,
    isGenerating,
    isValidating,
    seoData,
    validationResult,
    error,
    clearData,
    clearError,
  };
}
