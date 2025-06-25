import { useState, useCallback } from 'react';
import {
  UseAiIntegrationReturn,
  AiIntegrationRequest,
  AiIntegrationResult,
} from '@/types/ai';
import { useAiStyling } from './useAiStyling';
import { useSeoOptimization } from './useSeoOptimization';
import { useCategoryRecommendation } from './useCategoryRecommendation';

export function useAiIntegration(): UseAiIntegrationReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<
    'styling' | 'seo' | 'categories' | 'done' | null
  >(null);
  const [results, setResults] = useState<AiIntegrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aiStyling = useAiStyling();
  const seoOptimization = useSeoOptimization();
  const categoryRecommendation = useCategoryRecommendation();

  const processAllAiFeatures = useCallback(
    async (request: AiIntegrationRequest): Promise<AiIntegrationResult> => {
      const {
        title,
        content,
        enableStyling = true,
        enableSeo = true,
        enableCategories = true,
      } = request;

      if (!title.trim() || !content.trim()) {
        throw new Error('Title and content cannot be empty');
      }

      setIsProcessing(true);
      setError(null);
      setProgress(0);
      setCurrentStep(null);

      const result: AiIntegrationResult = {
        overallSuccess: true,
        processedAt: new Date(),
      };

      const enabledFeatures = [
        enableStyling && 'styling',
        enableSeo && 'seo',
        enableCategories && 'categories',
      ].filter(Boolean) as string[];

      const totalSteps = enabledFeatures.length;
      let completedSteps = 0;

      try {
        // Step 1: AI Styling
        if (enableStyling) {
          setCurrentStep('styling');
          setProgress((completedSteps / totalSteps) * 100);

          try {
            const stylingResponse = await aiStyling.enhanceContent(content);
            result.styling = {
              success: stylingResponse.success,
              data: stylingResponse.data,
            };
          } catch (err) {
            result.styling = {
              success: false,
              error: err instanceof Error ? err.message : 'Styling failed',
            };
            result.overallSuccess = false;
          }

          completedSteps++;
          setProgress((completedSteps / totalSteps) * 100);
        }

        // Step 2: SEO Optimization
        if (enableSeo) {
          setCurrentStep('seo');
          setProgress((completedSteps / totalSteps) * 100);

          try {
            const seoData = await seoOptimization.generateSeoData(
              content,
              title
            );
            result.seo = {
              success: true,
              data: seoData,
            };
          } catch (err) {
            result.seo = {
              success: false,
              error:
                err instanceof Error ? err.message : 'SEO optimization failed',
            };
            result.overallSuccess = false;
          }

          completedSteps++;
          setProgress((completedSteps / totalSteps) * 100);
        }

        // Step 3: Category Recommendation
        if (enableCategories) {
          setCurrentStep('categories');
          setProgress((completedSteps / totalSteps) * 100);

          try {
            const recommendations =
              await categoryRecommendation.recommendCategories(title, content);
            result.categories = {
              success: true,
              data: recommendations,
            };
          } catch (err) {
            result.categories = {
              success: false,
              error:
                err instanceof Error
                  ? err.message
                  : 'Category recommendation failed',
            };
            result.overallSuccess = false;
          }

          completedSteps++;
          setProgress(100);
        }

        setCurrentStep('done');
        setResults(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'AI integration failed';
        setError(errorMessage);
        result.overallSuccess = false;
        setResults(result);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [aiStyling, seoOptimization, categoryRecommendation]
  );

  const clearResults = useCallback(() => {
    setResults(null);
    setProgress(0);
    setCurrentStep(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    processAllAiFeatures,
    isProcessing,
    progress,
    currentStep,
    results,
    error,
    clearResults,
    clearError,
  };
}
