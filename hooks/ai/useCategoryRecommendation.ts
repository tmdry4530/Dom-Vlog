import { useState, useCallback } from 'react';
import {
  UseCategoryRecommendationReturn,
  CategoryRecommendation,
  SelectedCategory,
} from '@/types/ai';

export function useCategoryRecommendation(): UseCategoryRecommendationReturn {
  const [isRecommending, setIsRecommending] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [recommendations, setRecommendations] = useState<
    CategoryRecommendation[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const recommendCategories = useCallback(
    async (
      title: string,
      content: string
    ): Promise<CategoryRecommendation[]> => {
      if (!title.trim() || !content.trim()) {
        throw new Error('Title and content cannot be empty');
      }

      setIsRecommending(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/category/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
            contentType: 'markdown',
            maxSuggestions: 3,
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
          throw new Error(result.error || 'Category recommendation failed');
        }

        const categoryRecommendations = result.data?.recommendations || [];
        setRecommendations(categoryRecommendations);

        return categoryRecommendations;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setIsRecommending(false);
      }
    },
    []
  );

  const applyCategories = useCallback(
    async (
      postId: string,
      categories: SelectedCategory[]
    ): Promise<boolean> => {
      if (!postId || categories.length === 0) {
        throw new Error('Post ID and categories are required');
      }

      setIsApplying(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/category/auto-tag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId,
            selectedCategories: categories.map((cat) => ({
              categoryId: cat.id,
              confidence: cat.confidence,
            })),
            replaceExisting: false,
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
          throw new Error(result.error || 'Auto-tagging failed');
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setIsApplying(false);
      }
    },
    []
  );

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    recommendCategories,
    applyCategories,
    isRecommending,
    isApplying,
    recommendations,
    error,
    clearRecommendations,
    clearError,
  };
}
