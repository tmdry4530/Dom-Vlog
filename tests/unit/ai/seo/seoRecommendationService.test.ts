/**
 * SEO 추천 서비스 단위 테스트
 * TDD 방식으로 작성된 테스트 케이스
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from 'vitest';
import { SeoRecommendationService } from '@/lib/ai/seo/seoRecommendationService';
import { SeoRecommendationRequest, SEO_ERROR_CODES } from '@/types/seo';

// Mock Gemini API
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn(),
    }),
  })),
  HarmCategory: {},
  HarmBlockThreshold: {},
}));

describe('SeoRecommendationService', () => {
  let service: SeoRecommendationService;
  let mockGenerateContent: any;

  const validRequest: SeoRecommendationRequest = {
    content:
      '이것은 테스트 콘텐츠입니다. React 컴포넌트에 대해 설명하는 긴 글입니다. 이 글은 100자가 넘어야 하므로 더 많은 내용을 추가합니다.',
    title: 'React 컴포넌트 가이드',
    contentType: 'markdown',
    targetKeywords: ['React', '컴포넌트'],
    options: {
      generateSlug: true,
      includeSchema: true,
      language: 'ko',
    },
  };

  beforeAll(() => {
    // 환경 변수 설정
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterAll(() => {
    delete process.env.GEMINI_API_KEY;
  });

  beforeEach(async () => {
    // Mock 초기화
    const { GoogleGenerativeAI } = vi.mocked(
      await import('@google/generative-ai')
    );

    mockGenerateContent = vi.fn();

    (GoogleGenerativeAI as any).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));

    service = new SeoRecommendationService();
  });

  describe('recommendMetadata', () => {
    it('유효한 요청에 대해 성공적으로 SEO 메타데이터를 추천해야 한다', async () => {
      // Given
      const mockAiResponse = `\`\`\`json
{
  "metaTitle": "React 컴포넌트 완벽 가이드 - 개발자를 위한 실무 노하우",
  "metaDescription": "React 컴포넌트의 기초부터 고급 활용법까지 실무에서 바로 적용할 수 있는 개발 가이드를 제공합니다. 함수형 컴포넌트, Hook, 최적화 기법을 포함한 완전한 학습 자료입니다.",
  "keywords": ["React", "컴포넌트", "JavaScript", "프론트엔드", "개발"],
  "openGraphTitle": "React 컴포넌트 완벽 가이드",
  "openGraphDescription": "React 컴포넌트 개발의 모든 것을 담은 실무 중심 가이드",
  "suggestedSlug": "react-component-complete-guide",
  "reasoning": "검색 의도와 키워드 최적화를 고려한 추천"
}
\`\`\``;

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockAiResponse,
        },
      });

      // When
      const result = await service.recommendMetadata(validRequest);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.metaTitle).toBe(
        'React 컴포넌트 완벽 가이드 - 개발자를 위한 실무 노하우'
      );
      expect(result.data!.keywords).toContain('React');
      expect(result.data!.keywords).toContain('컴포넌트');
      expect(result.data!.suggestedSlug).toBe('react-component-complete-guide');
      expect(result.data!.confidence.overall).toBeGreaterThan(0);
      expect(result.metrics).toBeDefined();
      expect(result.metrics!.success).toBe(true);
    });

    it('빈 콘텐츠에 대해 오류를 반환해야 한다', async () => {
      // Given
      const invalidRequest = {
        ...validRequest,
        content: '',
      };

      // When
      const result = await service.recommendMetadata(invalidRequest);

      // Then
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(SEO_ERROR_CODES.INVALID_CONTENT);
      expect(result.error?.message).toContain('Content cannot be empty');
    });

    it('너무 짧은 콘텐츠에 대해 오류를 반환해야 한다', async () => {
      // Given
      const invalidRequest = {
        ...validRequest,
        content: '짧은 글',
      };

      // When
      const result = await service.recommendMetadata(invalidRequest);

      // Then
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(SEO_ERROR_CODES.CONTENT_TOO_SHORT);
    });

    it('너무 긴 콘텐츠에 대해 오류를 반환해야 한다', async () => {
      // Given
      const invalidRequest = {
        ...validRequest,
        content: 'a'.repeat(20000), // 20KB 콘텐츠
      };

      // When
      const result = await service.recommendMetadata(invalidRequest);

      // Then
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(SEO_ERROR_CODES.CONTENT_TOO_LONG);
    });

    it('AI API 오류 시 적절한 에러를 반환해야 한다', async () => {
      // Given
      mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'));

      // When
      const result = await service.recommendMetadata(validRequest);

      // Then
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(SEO_ERROR_CODES.AI_SERVICE_ERROR);
      expect(result.error?.retryable).toBe(false);
    });

    it('잘못된 AI 응답 형식에 대해 오류를 반환해야 한다', async () => {
      // Given
      const invalidAiResponse = 'Invalid JSON response';
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => invalidAiResponse,
        },
      });

      // When
      const result = await service.recommendMetadata(validRequest);

      // Then
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(SEO_ERROR_CODES.AI_SERVICE_ERROR);
      expect(result.error?.message).toContain('Failed to parse AI response');
    });

    it('필수 필드가 누락된 AI 응답에 대해 오류를 반환해야 한다', async () => {
      // Given
      const incompleteAiResponse = `\`\`\`json
{
  "metaTitle": "제목만 있는 응답",
  "keywords": ["키워드"]
}
\`\`\``;

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => incompleteAiResponse,
        },
      });

      // When
      const result = await service.recommendMetadata(validRequest);

      // Then
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Missing required field');
    });
  });

  describe('quickRecommend', () => {
    it('기본 옵션으로 빠른 추천을 수행해야 한다', async () => {
      // Given
      const content =
        '테스트 콘텐츠입니다. 충분히 긴 내용으로 100자가 넘도록 작성합니다. 빠른 추천 기능을 테스트하기 위한 내용입니다.';
      const title = '빠른 추천 테스트';

      const mockAiResponse = `\`\`\`json
{
  "metaTitle": "빠른 추천 테스트 - 완벽 가이드",
  "metaDescription": "빠른 추천 기능을 통해 생성된 메타데이터입니다.",
  "keywords": ["추천", "테스트"],
  "openGraphTitle": "빠른 추천 테스트",
  "openGraphDescription": "빠른 추천 기능 테스트",
  "suggestedSlug": "quick-recommendation-test"
}
\`\`\``;

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockAiResponse,
        },
      });

      // When
      const result = await service.quickRecommend(content, title);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.metaTitle).toBeDefined();
      expect(result.data?.suggestedSlug).toBeDefined();
    });
  });

  describe('recommendWithKeywords', () => {
    it('지정된 키워드를 고려한 추천을 수행해야 한다', async () => {
      // Given
      const content =
        '키워드 기반 추천 테스트입니다. React와 TypeScript에 대한 내용을 포함하고 있으며, 충분히 긴 내용으로 작성되었습니다.';
      const title = '키워드 기반 추천';
      const targetKeywords = ['React', 'TypeScript'];

      const mockAiResponse = `\`\`\`json
{
  "metaTitle": "React TypeScript 키워드 기반 추천 가이드",
  "metaDescription": "React와 TypeScript를 활용한 키워드 기반 추천 시스템입니다.",
  "keywords": ["React", "TypeScript", "키워드", "추천"],
  "openGraphTitle": "React TypeScript 추천 가이드",
  "openGraphDescription": "키워드 기반 추천 시스템",
  "suggestedSlug": "react-typescript-keyword-recommendation"
}
\`\`\``;

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockAiResponse,
        },
      });

      // When
      const result = await service.recommendWithKeywords(
        content,
        title,
        targetKeywords
      );

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.keywords).toContain('React');
      expect(result.data?.keywords).toContain('TypeScript');
      expect(result.data?.schema).toBeDefined(); // includeSchema: true 기본값
    });
  });

  describe('신뢰도 점수 계산', () => {
    it('높은 품질의 응답에 대해 높은 신뢰도 점수를 부여해야 한다', async () => {
      // Given
      const highQualityRequest = {
        ...validRequest,
        targetKeywords: ['React', '컴포넌트', 'JavaScript'],
      };

      const highQualityResponse = `\`\`\`json
{
  "metaTitle": "React 컴포넌트 완벽 가이드 - JavaScript 개발자를 위한 실무 노하우",
  "metaDescription": "React 컴포넌트의 기초부터 고급 활용법까지 JavaScript 개발자를 위한 실무에서 바로 적용할 수 있는 완전한 개발 가이드를 제공합니다. 함수형 컴포넌트와 Hook을 중심으로 설명합니다.",
  "keywords": ["React", "컴포넌트", "JavaScript", "Hook", "프론트엔드"],
  "openGraphTitle": "React 컴포넌트 완벽 가이드",
  "openGraphDescription": "JavaScript 개발자를 위한 React 컴포넌트 실무 가이드",
  "suggestedSlug": "react-component-complete-guide-javascript"
}
\`\`\``;

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => highQualityResponse,
        },
      });

      // When
      const result = await service.recommendMetadata(highQualityRequest);

      // Then
      expect(result.success).toBe(true);
      expect(result.data!.confidence.overall).toBeGreaterThan(80);
      expect(result.data!.confidence.title).toBeGreaterThan(75);
      expect(result.data!.confidence.keywords).toBeGreaterThan(75);
    });

    it('낮은 품질의 응답에 대해 낮은 신뢰도 점수를 부여해야 한다', async () => {
      // Given
      const lowQualityResponse = `\`\`\`json
{
  "metaTitle": "제목",
  "metaDescription": "짧은 설명",
  "keywords": ["k"],
  "openGraphTitle": "제목",
  "openGraphDescription": "설명",
  "suggestedSlug": "title"
}
\`\`\``;

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => lowQualityResponse,
        },
      });

      // When
      const result = await service.recommendMetadata(validRequest);

      // Then
      expect(result.success).toBe(true);
      expect(result.data!.confidence.overall).toBeLessThan(70);
      expect(result.data!.confidence.title).toBeLessThan(70);
      expect(result.data!.confidence.description).toBeLessThan(70);
    });
  });

  describe('스키마 마크업 생성', () => {
    it('요청 시 적절한 스키마 마크업을 생성해야 한다', async () => {
      // Given
      const requestWithSchema = {
        ...validRequest,
        options: {
          ...validRequest.options,
          includeSchema: true,
        },
      };

      const mockAiResponse = `\`\`\`json
{
  "metaTitle": "React 컴포넌트 가이드",
  "metaDescription": "React 컴포넌트에 대한 완전한 가이드",
  "keywords": ["React", "컴포넌트"],
  "openGraphTitle": "React 컴포넌트 가이드",
  "openGraphDescription": "React 컴포넌트 가이드",
  "suggestedSlug": "react-component-guide"
}
\`\`\``;

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockAiResponse,
        },
      });

      // When
      const result = await service.recommendMetadata(requestWithSchema);

      // Then
      expect(result.success).toBe(true);
      expect(result.data!.schema).toBeDefined();
      expect(result.data!.schema!['@context']).toBe('https://schema.org');
      expect(result.data!.schema!['@type']).toBe('BlogPosting');
      expect(result.data!.schema!.headline).toBe('React 컴포넌트 가이드');
    });
  });

  describe('성능 메트릭', () => {
    it('모든 요청에 대해 성능 메트릭을 수집해야 한다', async () => {
      // Given
      const mockAiResponse = `\`\`\`json
{
  "metaTitle": "제목",
  "metaDescription": "설명입니다. 충분히 긴 설명으로 작성하여 검증을 통과하도록 합니다.",
  "keywords": ["키워드"],
  "openGraphTitle": "OG 제목",
  "openGraphDescription": "OG 설명",
  "suggestedSlug": "test-slug"
}
\`\`\``;

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockAiResponse,
        },
      });

      // When
      const result = await service.recommendMetadata(validRequest);

      // Then
      expect(result.metrics).toBeDefined();
      expect(result.metrics!.requestId).toMatch(/^seo_\d+_[a-z0-9]+$/);
      expect(result.metrics!.processingTimeMs).toBeGreaterThan(0);
      expect(result.metrics!.contentLength).toBe(validRequest.content.length);
      expect(result.metrics!.wordsAnalyzed).toBeGreaterThan(0);
      expect(result.metrics!.success).toBe(true);
    });
  });
});
