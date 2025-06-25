import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CategoryService } from '@/ai/services/CategoryService';
import { AutoTagService } from '@/ai/services/AutoTagService';
import type { CategoryRecommendRequest } from '@/types/ai';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    post: {
      findUnique: vi.fn(),
    },
    postCategory: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      groupBy: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock Gemini AI
vi.mock('@/ai/models/category-classifier-config', () => ({
  createCategoryClassifierModel: vi.fn().mockReturnValue({
    generateContent: vi.fn(),
  }),
  categoryClassifierConfig: {
    model: 'gemini-2.5-flash-lite',
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    maxTokens: 2048,
    maxContentLength: 10000,
    timeoutMs: 30000,
    retryAttempts: 3,
  },
  handleCategoryClassificationError: vi.fn(),
  categoryWeights: {
    'web-development': 1.2,
    blockchain: 1.1,
    cryptography: 1.1,
    'ai-ml': 1.0,
    devops: 1.0,
    tutorial: 0.9,
    review: 0.9,
  },
  defaultCategoryMapping: {},
  performanceConfig: {
    responseTimeThreshold: 5000,
    confidenceThreshold: 0.7,
    batchSize: 5,
    cacheTTL: 24 * 60 * 60 * 1000,
  },
}));

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    vi.clearAllMocks();
    // CategoryService를 다시 인스턴스화
    categoryService = new CategoryService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('recommendCategories', () => {
    it('유효한 요청에 대해 카테고리 추천을 반환해야 함', async () => {
      // Arrange
      const mockRequest: CategoryRecommendRequest = {
        title: 'React Hooks 사용법',
        content:
          'React Hooks는 함수형 컴포넌트에서 상태 관리를 할 수 있게 해주는 기능입니다. useState, useEffect 등이 있습니다.',
        contentType: 'markdown',
        maxSuggestions: 3,
      };

      const mockCategories = [
        {
          id: 'web-development',
          name: 'Web Development',
          slug: 'web-development',
          description: '웹 개발 관련 글',
        },
        {
          id: 'tutorial',
          name: 'Tutorial',
          slug: 'tutorial',
          description: '튜토리얼 및 가이드',
        },
      ];

      const mockGeminiResponse = {
        response: {
          text: () => `\`\`\`json
{
  "recommendations": [
    {
      "categoryId": "web-development",
      "categoryName": "Web Development",
      "confidence": 0.92,
      "reasoning": "React Hooks에 대한 웹 개발 튜토리얼입니다.",
      "keyTopics": ["React", "Hooks", "Frontend"]
    }
  ],
  "contentAnalysis": {
    "primaryTopic": "Web Development",
    "secondaryTopics": ["React", "Hooks"],
    "technicalLevel": "intermediate",
    "contentType": "tutorial",
    "keyTopics": ["React", "Hooks", "useState", "useEffect"],
    "technicalTerms": ["React", "Hooks", "useState", "useEffect"],
    "frameworksAndTools": ["React"]
  }
}
\`\`\``,
        },
      };

      // Mock implementations
      const { prisma } = await import('@/lib/prisma');
      (prisma.category.findMany as any).mockResolvedValue(mockCategories);

      const mockModel = {
        generateContent: vi.fn().mockResolvedValue(mockGeminiResponse),
      };

      const { createCategoryClassifierModel } = await import(
        '@/ai/models/category-classifier-config'
      );
      (createCategoryClassifierModel as any).mockReturnValue(mockModel);

      // Act
      const result = await categoryService.recommendCategories(mockRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.recommendations).toHaveLength(1);
      expect(result.data?.recommendations[0].categoryId).toBe(
        'web-development'
      );
      expect(result.data?.recommendations[0].confidence).toBeGreaterThan(0.9);
      expect(result.data?.contentAnalysis.primaryTopic).toBe('Web Development');
    });

    it('잘못된 입력에 대해 에러를 반환해야 함', async () => {
      // Arrange
      const invalidRequest = {
        title: '',
        content: 'too short',
        contentType: 'markdown',
      } as CategoryRecommendRequest;

      // Act
      const result = await categoryService.recommendCategories(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('Gemini AI 응답 파싱 오류를 처리해야 함', async () => {
      // Arrange
      const mockRequest: CategoryRecommendRequest = {
        title: 'Test Title',
        content: 'Test content that is long enough to pass validation checks.',
        contentType: 'markdown',
        maxSuggestions: 3,
      };

      const mockCategories = [
        {
          id: 'test-category',
          name: 'Test Category',
          slug: 'test-category',
          description: '테스트 카테고리',
        },
      ];

      const mockGeminiResponse = {
        response: {
          text: () => 'Invalid JSON response without proper format',
        },
      };

      // Mock implementations
      const { prisma } = await import('@/lib/prisma');
      (prisma.category.findMany as any).mockResolvedValue(mockCategories);

      const mockModel = {
        generateContent: vi.fn().mockResolvedValue(mockGeminiResponse),
      };

      const { createCategoryClassifierModel } = await import(
        '@/ai/models/category-classifier-config'
      );
      (createCategoryClassifierModel as any).mockReturnValue(mockModel);

      // Act
      const result = await categoryService.recommendCategories(mockRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('healthCheck', () => {
    it('서비스 상태를 정상적으로 반환해야 함', async () => {
      // Arrange
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: Promise.resolve(),
        }),
      };

      const { createCategoryClassifierModel } = await import(
        '@/ai/models/category-classifier-config'
      );
      (createCategoryClassifierModel as any).mockReturnValue(mockModel);

      // Act
      const result = await categoryService.healthCheck();

      // Assert
      expect(result.status).toBe('healthy');
      expect(result.model).toBe('gemini-2.5-flash-lite');
      expect(result.timestamp).toBeTypeOf('number');
    });
  });
});

describe('AutoTagService', () => {
  let autoTagService: AutoTagService;

  beforeEach(() => {
    vi.clearAllMocks();
    autoTagService = new AutoTagService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('applyAutoTags', () => {
    it('카테고리를 포스트에 성공적으로 적용해야 함', async () => {
      // Arrange
      const mockRequest = {
        postId: 'test-post-id',
        selectedCategories: [
          {
            categoryId: 'web-development',
            confidence: 0.9,
          },
        ],
        replaceExisting: false,
      };

      const mockPost = {
        id: 'test-post-id',
        title: 'Test Post',
        content: 'Test content',
        status: 'published',
      };

      const mockCategory = {
        id: 'web-development',
        name: 'Web Development',
        slug: 'web-development',
      };

      const mockTransactionResult = {
        addedCategories: 1,
        removedCategories: 0,
        finalCategories: [
          {
            categoryId: 'web-development',
            categoryName: 'Web Development',
            confidence: 0.9,
            isAiSuggested: true,
          },
        ],
      };

      // Mock implementations
      const { prisma } = await import('@/lib/prisma');
      (prisma.post.findUnique as any).mockResolvedValue(mockPost);
      (prisma.category.findUnique as any).mockResolvedValue(mockCategory);
      (prisma.postCategory.findMany as any).mockResolvedValue([]);
      (prisma.$transaction as any).mockResolvedValue(mockTransactionResult);

      // Act
      const result = await autoTagService.applyAutoTags(mockRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.addedCategories).toBe(1);
      expect(result.data?.finalCategories).toHaveLength(1);
    });

    it('존재하지 않는 포스트에 대해 에러를 반환해야 함', async () => {
      // Arrange
      const mockRequest = {
        postId: 'non-existent-post',
        selectedCategories: [
          {
            categoryId: 'web-development',
            confidence: 0.9,
          },
        ],
        replaceExisting: false,
      };

      // Mock implementations
      const { prisma } = await import('@/lib/prisma');
      (prisma.post.findUnique as any).mockResolvedValue(null);
      (prisma.category.findUnique as any).mockResolvedValue({
        id: 'web-development',
        name: 'Web Development',
      });

      // Act
      const result = await autoTagService.applyAutoTags(mockRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('포스트를 찾을 수 없습니다');
    });
  });

  describe('recommendAndApplyTags', () => {
    it('카테고리 추천 및 자동 적용을 성공적으로 수행해야 함', async () => {
      // Arrange
      const postId = 'test-post-id';
      const autoApply = true;

      const mockPost = {
        id: postId,
        title: 'React Hooks Tutorial',
        content: 'React Hooks 사용법을 알아보겠습니다.',
        status: 'published',
      };

      const mockRecommendations = [
        {
          categoryId: 'web-development',
          categoryName: 'Web Development',
          confidence: 0.9,
          reasoning: 'React 관련 웹 개발 튜토리얼',
          isExisting: true,
          keyTopics: ['React', 'Hooks'],
        },
      ];

      // Mock implementations
      const { prisma } = await import('@/lib/prisma');
      (prisma.post.findUnique as any).mockResolvedValue(mockPost);
      (prisma.postCategory.findMany as any).mockResolvedValue([]);

      // Mock categoryService.recommendCategories
      vi.doMock('@/ai/services/CategoryService', () => ({
        categoryService: {
          recommendCategories: vi.fn().mockResolvedValue({
            success: true,
            data: {
              recommendations: mockRecommendations,
              contentAnalysis: {
                primaryTopic: 'Web Development',
                secondaryTopics: ['React'],
                technicalLevel: 'intermediate',
                contentType: 'tutorial',
                keyTopics: ['React', 'Hooks'],
                technicalTerms: ['React', 'Hooks'],
                frameworksAndTools: ['React'],
              },
              processingMetrics: {
                requestId: 'test-request',
                startTime: Date.now(),
                endTime: Date.now(),
                processingTimeMs: 1000,
                contentLength: 100,
                modelUsed: 'gemini-2.5-flash-lite',
                success: true,
              },
            },
          }),
        },
      }));

      // Act
      const result = await autoTagService.recommendAndApplyTags(
        postId,
        autoApply
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations).toHaveLength(1);
    });
  });

  describe('getPostCategoryStats', () => {
    it('포스트의 카테고리 통계를 반환해야 함', async () => {
      // Arrange
      const postId = 'test-post-id';
      const mockStats = [
        {
          isAiSuggested: true,
          _count: { categoryId: 2 },
          _avg: { confidence: 0.85 },
        },
        {
          isAiSuggested: false,
          _count: { categoryId: 1 },
          _avg: { confidence: null },
        },
      ];

      // Mock implementations
      const { prisma } = await import('@/lib/prisma');
      (prisma.postCategory.groupBy as any).mockResolvedValue(mockStats);

      // Act
      const result = await autoTagService.getPostCategoryStats(postId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.total).toBe(3);
      expect(result.data?.aiSuggested).toBe(2);
      expect(result.data?.manual).toBe(1);
    });
  });
});

describe('Integration Tests', () => {
  it('전체 워크플로우가 정상적으로 작동해야 함', async () => {
    // 이 테스트는 실제 DB와 AI 서비스 연동이 필요한 통합 테스트입니다.
    // 개발 환경에서만 실행되도록 설정할 수 있습니다.

    // 1. 포스트 생성
    // 2. 카테고리 추천 요청
    // 3. 추천 결과 검증
    // 4. 자동 태깅 적용
    // 5. DB 상태 확인

    expect(true).toBe(true); // 플레이스홀더
  });
});
