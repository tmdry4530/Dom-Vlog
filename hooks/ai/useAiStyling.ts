import { useState, useCallback } from 'react';
import {
  UseAiStylingReturn,
  StyleUpgradeResponse,
  StyleUpgradeData,
} from '@/types/ai';

export function useAiStyling(): UseAiStylingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<StyleUpgradeData | null>(null);

  const enhanceContent = useCallback(
    async (content: string): Promise<StyleUpgradeResponse> => {
      if (!content.trim()) {
        throw new Error('Content cannot be empty');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/style-upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            contentType: 'markdown',
            options: {
              includeTableOfContents: true,
              enhanceCodeBlocks: true,
              improveHeadingStructure: true,
              optimizeForSEO: true,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result: StyleUpgradeResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'AI styling failed');
        }

        if (result.data) {
          setLastResult(result.data);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    enhanceContent,
    isLoading,
    error,
    lastResult,
    clearResult,
    clearError,
  };
}
