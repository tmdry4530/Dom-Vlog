import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AiIntegrationService } from '@/lib/ai/AiIntegrationService';
import { AiStateManager } from '@/lib/ai/AiStateManager';

// Mock fetch 전역 설정
global.fetch = vi.fn();

const mockFetch = fetch as any;

describe('AI Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AI Styling API', () => {
    it('should make successful API call for style enhancement', async () => {
      const mockResponse = {
        success: true,
        data: {
          enhancedContent: '# Enhanced Content\n\nImproved content here.',
          readabilityScore: 85,
          improvements: ['Added proper headings', 'Improved code blocks'],
          processingTime: 2000,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const response = await fetch('/api/ai/style-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '# Test Content',
          contentType: 'markdown',
        }),
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.enhancedContent).toBe(
        '# Enhanced Content\n\nImproved content here.'
      );
      expect(result.data.readabilityScore).toBe(85);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
      });

      const response = await fetch('/api/ai/style-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '# Test Content' }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('SEO Optimization API', () => {
    it('should generate SEO recommendations', async () => {
      const mockSeoData = {
        recommendedTitle: 'Optimized Title',
        metaDescription: 'SEO optimized description',
        keywords: ['react', 'seo', 'optimization'],
        confidence: 0.9,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockSeoData,
          }),
      });

      const response = await fetch('/api/ai/seo/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Title',
          content: 'Test content',
          contentType: 'markdown',
        }),
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.recommendedTitle).toBe('Optimized Title');
      expect(result.data.confidence).toBe(0.9);
    });

    it('should validate SEO', async () => {
      const mockValidationResult = {
        score: 75,
        issues: ['Missing meta description'],
        recommendations: ['Add meta description'],
        passed: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockValidationResult,
          }),
      });

      const response = await fetch('/api/ai/seo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Test content',
          contentType: 'markdown',
        }),
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.score).toBe(75);
      expect(result.data.passed).toBe(false);
    });
  });

  describe('Category Recommendation API', () => {
    it('should recommend categories', async () => {
      const mockRecommendations = [
        {
          categoryId: 'cat1',
          categoryName: 'React',
          confidence: 0.9,
          reasoning: 'Content mentions React components',
          isExisting: true,
          keyTopics: ['hooks', 'components'],
        },
        {
          categoryId: 'cat2',
          categoryName: 'Frontend',
          confidence: 0.8,
          reasoning: 'Frontend development topics',
          isExisting: true,
          keyTopics: ['ui', 'development'],
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { recommendations: mockRecommendations },
          }),
      });

      const response = await fetch('/api/ai/category/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'React Tutorial',
          content: 'This is a React tutorial content',
          contentType: 'markdown',
        }),
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.recommendations).toHaveLength(2);
      expect(result.data.recommendations[0].categoryName).toBe('React');
      expect(result.data.recommendations[0].confidence).toBe(0.9);
    });

    it('should apply categories', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              postId: 'post123',
              addedCategories: 1,
              removedCategories: 0,
            },
          }),
      });

      const response = await fetch('/api/ai/category/auto-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: 'post123',
          selectedCategories: [{ categoryId: 'cat1', confidence: 0.9 }],
          replaceExisting: false,
        }),
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.addedCategories).toBe(1);
    });
  });
});

describe('AiIntegrationService', () => {
  let service: AiIntegrationService;

  beforeEach(() => {
    service = AiIntegrationService.getInstance();
    mockFetch.mockClear();
  });

  it('should be a singleton', () => {
    const service1 = AiIntegrationService.getInstance();
    const service2 = AiIntegrationService.getInstance();
    expect(service1).toBe(service2);
  });

  it('should process content with all features enabled', async () => {
    // Mock all three API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              enhancedContent: 'Enhanced content',
              readabilityScore: 85,
              improvements: ['Added headings'],
              processingTime: 2000,
            },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              recommendedTitle: 'SEO Title',
              metaDescription: 'SEO description',
              keywords: ['react'],
              confidence: 0.9,
            },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              recommendations: [
                {
                  categoryId: 'cat1',
                  categoryName: 'React',
                  confidence: 0.9,
                  reasoning: 'React content',
                  isExisting: true,
                  keyTopics: ['hooks'],
                },
              ],
            },
          }),
      });

    const result = await service.processContent({
      title: 'Test Title',
      content: 'Test content',
      enableStyling: true,
      enableSeo: true,
      enableCategories: true,
    });

    expect(result.overallSuccess).toBe(true);
    expect(result.styling?.success).toBe(true);
    expect(result.seo?.success).toBe(true);
    expect(result.categories?.success).toBe(true);
    expect(result.processedAt).toBeInstanceOf(Date);
  });

  it('should handle partial failures gracefully', async () => {
    // Styling succeeds, SEO fails, Categories succeed
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { enhancedContent: 'Enhanced', readabilityScore: 85 },
          }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { recommendations: [] },
          }),
      });

    const result = await service.processContent({
      title: 'Test Title',
      content: 'Test content',
      enableStyling: true,
      enableSeo: true,
      enableCategories: true,
    });

    expect(result.overallSuccess).toBe(false);
    expect(result.styling?.success).toBe(true);
    expect(result.seo?.success).toBe(false);
    expect(result.categories?.success).toBe(true);
  });
});

describe('AiStateManager', () => {
  let stateManager: AiStateManager;

  beforeEach(() => {
    stateManager = AiStateManager.getInstance();
  });

  it('should be a singleton', () => {
    const manager1 = AiStateManager.getInstance();
    const manager2 = AiStateManager.getInstance();
    expect(manager1).toBe(manager2);
  });

  it('should handle network errors appropriately', () => {
    const networkError = new Error('fetch failed') as any;
    networkError.code = 'NETWORK_ERROR';

    const userError = stateManager.handleAiError(networkError);

    expect(userError.title).toBe('네트워크 오류');
    expect(userError.canRetry).toBe(true);
    expect(userError.retryDelay).toBe(3000);
    expect(userError.fallbackOptions).toContain('오프라인으로 작업하기');
  });

  it('should handle quota exceeded errors', () => {
    const quotaError = new Error('quota exceeded') as any;
    quotaError.code = 'QUOTA_EXCEEDED';

    const userError = stateManager.handleAiError(quotaError);

    expect(userError.title).toBe('API 사용량 초과');
    expect(userError.canRetry).toBe(true);
    expect(userError.retryDelay).toBe(60000);
    expect(userError.fallbackOptions).toContain('수동으로 편집하기');
  });

  it('should generate appropriate retry strategies', () => {
    const stylingOperation = {
      type: 'styling' as const,
      priority: 1,
      estimatedDuration: 2000,
    };

    const strategy = stateManager.createRetryStrategy(stylingOperation);

    expect(strategy.maxRetries).toBe(3);
    expect(strategy.backoffMultiplier).toBe(1.5);
    expect(strategy.baseDelay).toBe(1000);
  });

  it('should calculate retry delays correctly', () => {
    const strategy = {
      maxRetries: 3,
      backoffMultiplier: 2,
      baseDelay: 1000,
    };

    expect(stateManager.calculateRetryDelay(strategy, 0)).toBe(1000);
    expect(stateManager.calculateRetryDelay(strategy, 1)).toBe(2000);
    expect(stateManager.calculateRetryDelay(strategy, 2)).toBe(4000);
  });

  it('should generate progress updates correctly', () => {
    const operations = [
      { type: 'styling' as const, priority: 1, estimatedDuration: 2000 },
      { type: 'seo' as const, priority: 2, estimatedDuration: 3000 },
      { type: 'categories' as const, priority: 3, estimatedDuration: 1000 },
    ];

    const updates = stateManager.generateProgressUpdates(operations);

    expect(updates).toHaveLength(3);
    expect(updates[0].step).toBe('AI 스타일링');
    expect(updates[0].progress).toBe(0);
    expect(updates[1].step).toBe('SEO 최적화');
    expect(updates[2].step).toBe('카테고리 추천');
  });

  it('should track loading state', () => {
    const operation = {
      type: 'styling' as const,
      priority: 1,
      estimatedDuration: 2000,
    };

    const loadingState = stateManager.trackLoadingState(operation);

    expect(loadingState.isLoading).toBe(true);
    expect(loadingState.progress).toBe(0);
    expect(loadingState.currentStep).toBe('styling 처리 중...');
    expect(loadingState.estimatedTimeRemaining).toBe(2000);
  });

  it('should assess error severity correctly', () => {
    const unauthorizedError = new Error('Unauthorized') as any;
    unauthorizedError.code = 'UNAUTHORIZED';

    const quotaError = new Error('Quota exceeded') as any;
    quotaError.code = 'QUOTA_EXCEEDED';

    const serverError = new Error('Server error') as any;
    serverError.code = '500';

    const timeoutError = new Error('Timeout') as any;
    timeoutError.code = 'TIMEOUT';

    const genericError = new Error('Generic error') as any;

    expect(stateManager.getErrorSeverity(unauthorizedError)).toBe('critical');
    expect(stateManager.getErrorSeverity(quotaError)).toBe('high');
    expect(stateManager.getErrorSeverity(serverError)).toBe('medium');
    expect(stateManager.getErrorSeverity(timeoutError)).toBe('medium');
    expect(stateManager.getErrorSeverity(genericError)).toBe('low');
  });
});
