import {
  AiIntegrationRequest,
  AiIntegrationResult,
  StyleUpgradeData,
  StyleUpgradeResponse,
} from '@/types/ai';
import { SeoRecommendationData } from '@/types/seo';

/**
 * AI 통합 서비스 클래스
 * 여러 AI 기능을 조합하여 사용할 수 있는 고수준 서비스를 제공
 */
export class AiIntegrationService {
  private static instance: AiIntegrationService;

  public static getInstance(): AiIntegrationService {
    if (!AiIntegrationService.instance) {
      AiIntegrationService.instance = new AiIntegrationService();
    }
    return AiIntegrationService.instance;
  }

  /**
   * 전체 AI 기능을 통합 처리
   */
  async processContent(
    request: AiIntegrationRequest
  ): Promise<AiIntegrationResult> {
    const {
      title,
      content,
      enableStyling = true,
      enableSeo = true,
      enableCategories = true,
    } = request;

    const result: AiIntegrationResult = {
      overallSuccess: true,
      processedAt: new Date(),
    };

    // 병렬 처리를 위한 Promise 배열
    const promises: Promise<void>[] = [];

    // AI 스타일링 처리
    if (enableStyling) {
      promises.push(
        this.enhanceWithStyling(content)
          .then((data) => {
            result.styling = { success: true, data };
          })
          .catch((error) => {
            result.styling = {
              success: false,
              error: error.message || 'Styling failed',
            };
            result.overallSuccess = false;
          })
      );
    }

    // SEO 최적화 처리
    if (enableSeo) {
      promises.push(
        this.optimizeSeo(content, title)
          .then((data) => {
            result.seo = { success: true, data };
          })
          .catch((error) => {
            result.seo = {
              success: false,
              error: error.message || 'SEO optimization failed',
            };
            result.overallSuccess = false;
          })
      );
    }

    // 카테고리 추천 처리
    if (enableCategories) {
      promises.push(
        this.recommendCategories(title, content)
          .then((data) => {
            result.categories = { success: true, data };
          })
          .catch((error) => {
            result.categories = {
              success: false,
              error: error.message || 'Category recommendation failed',
            };
            result.overallSuccess = false;
          })
      );
    }

    // 모든 AI 작업을 병렬 실행
    await Promise.allSettled(promises);

    return result;
  }

  /**
   * AI 스타일링 기능
   */
  async enhanceWithStyling(content: string): Promise<StyleUpgradeData> {
    const response = await fetch('/api/ai/style-upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: StyleUpgradeResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Styling enhancement failed');
    }

    return result.data;
  }

  /**
   * SEO 최적화 기능
   */
  async optimizeSeo(
    content: string,
    title: string
  ): Promise<SeoRecommendationData> {
    const response = await fetch('/api/ai/seo/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        contentType: 'markdown',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'SEO optimization failed');
    }

    return result.data;
  }

  /**
   * 카테고리 추천 기능
   */
  async recommendCategories(title: string, content: string) {
    const response = await fetch('/api/ai/category/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        contentType: 'markdown',
        maxSuggestions: 3,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data?.recommendations) {
      throw new Error(result.error || 'Category recommendation failed');
    }

    return result.data.recommendations;
  }

  /**
   * 처리 결과를 데이터베이스에 적용
   */
  async validateAndApply(
    postId: string,
    results: AiIntegrationResult
  ): Promise<boolean> {
    try {
      const operations: Promise<boolean>[] = [];

      // 카테고리 자동 태깅 적용
      if (results.categories?.success && results.categories.data) {
        const categoryPromise = this.applyCategoryTags(
          postId,
          results.categories.data
        );
        operations.push(categoryPromise);
      }

      // SEO 메타데이터 적용은 별도 API가 필요할 수 있음
      // 현재는 카테고리만 자동 적용

      const operationResults = await Promise.allSettled(operations);
      return operationResults.every(
        (result) => result.status === 'fulfilled' && result.value
      );
    } catch (error) {
      console.error('Failed to apply AI results:', error);
      return false;
    }
  }

  /**
   * 카테고리 태그 적용
   */
  private async applyCategoryTags(
    postId: string,
    recommendations: any[]
  ): Promise<boolean> {
    const selectedCategories = recommendations
      .filter((rec) => rec.confidence > 0.7) // 높은 신뢰도만 자동 적용
      .map((rec) => ({
        categoryId: rec.categoryId,
        confidence: rec.confidence,
      }));

    if (selectedCategories.length === 0) {
      return true; // 자동 적용할 카테고리가 없음
    }

    const response = await fetch('/api/ai/category/auto-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        selectedCategories,
        replaceExisting: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to apply category tags: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  }
}

// 싱글톤 인스턴스 내보내기
export const aiIntegrationService = AiIntegrationService.getInstance();
