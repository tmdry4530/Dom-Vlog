import { describe, it, expect, beforeEach, vi } from 'vitest';
import { seoValidationService } from '@/lib/ai/seo/seoValidationService';
import type { SEOValidationRequest } from '@/types/seo';

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              readabilityScore: 85,
              keywordRelevance: 80,
              structureScore: 90,
              suggestions: [
                '제목 구조를 개선하세요',
                'Alt 텍스트를 추가하세요',
              ],
            }),
        },
      }),
    }),
  })),
}));

describe('SEOValidationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateSEO', () => {
    it('should validate basic HTML content successfully', async () => {
      const request: SEOValidationRequest = {
        content: `
          <h1>테스트 제목</h1>
          <h2>소제목 1</h2>
          <p>이것은 테스트 콘텐츠입니다. 충분한 길이의 콘텐츠를 작성하여 SEO 점수를 높여보겠습니다. 추가적인 내용을 더 작성해서 300자 이상의 콘텐츠를 만들어보겠습니다.</p>
          <h2>소제목 2</h2>
          <p>두 번째 단락입니다. <a href="/internal-link">내부 링크</a>와 <a href="https://external.com">외부 링크</a>를 포함합니다.</p>
          <img src="test.jpg" alt="테스트 이미지" />
        `,
        metadata: {
          title: '테스트 페이지 제목',
          description:
            '이것은 테스트 페이지의 메타 설명입니다. SEO 최적화를 위해 적절한 길이로 작성된 설명입니다. 이 설명은 검색 결과에 표시됩니다.',
          keywords: ['테스트', 'SEO', '검증'],
        },
      };

      const result = await seoValidationService.validateSEO(request);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      expect(typeof result.passed).toBe('boolean');
      expect(result.metrics).toBeDefined();
      expect(result.metrics.contentScore).toBeGreaterThan(0);
      expect(result.metrics.technicalScore).toBeGreaterThan(0);
      expect(result.metrics.metadataScore).toBeGreaterThan(0);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.validatedAt).toBeDefined();
    });

    it('should handle content with good SEO structure', async () => {
      const request: SEOValidationRequest = {
        content: `
          <h1>완벽한 SEO 제목</h1>
          <h2>잘 구조화된 소제목</h2>
          <h3>세부 제목</h3>
          <p>이것은 매우 긴 콘텐츠입니다. 충분한 키워드 밀도와 좋은 구조를 가지고 있습니다. 
             개발자들을 위한 기술 블로그 콘텐츠로써 유용한 정보를 제공합니다. 
             이 콘텐츠는 SEO 최적화가 잘 되어 있으며, 검색 엔진에서 좋은 점수를 받을 것입니다.</p>
          <h2>추가 정보</h2>
          <p>더 많은 정보와 <a href="/related-post">관련 포스트</a> 링크를 제공합니다.</p>
          <img src="featured.jpg" alt="특성 이미지 설명" />
          <img src="diagram.jpg" alt="다이어그램 설명" />
        `,
        metadata: {
          title: '완벽한 SEO 최적화 가이드',
          description:
            '이 포스트는 SEO 최적화에 대한 완벽한 가이드를 제공합니다. 기술 블로그를 운영하는 개발자들에게 유용한 팁과 전략을 소개합니다.',
          keywords: ['SEO', '최적화', '기술블로그', '개발자'],
        },
      };

      const result = await seoValidationService.validateSEO(request);

      expect(result.overallScore).toBeGreaterThan(70);
      expect(result.metrics.contentScore).toBeGreaterThan(70);
      expect(result.metrics.technicalScore).toBeGreaterThan(70);
      expect(result.metrics.metadataScore).toBeGreaterThan(70);
    });

    it('should handle content with poor SEO structure', async () => {
      const request: SEOValidationRequest = {
        content: '<p>짧은 콘텐츠</p>',
        metadata: {
          title: '제목',
          description: '짧음',
        },
      };

      const result = await seoValidationService.validateSEO(request);

      expect(result.overallScore).toBeLessThan(80);
      expect(result.passed).toBe(false);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle content without metadata', async () => {
      const request: SEOValidationRequest = {
        content: `
          <h1>제목만 있는 콘텐츠</h1>
          <p>메타데이터가 없는 콘텐츠입니다. 이 경우에도 기본적인 SEO 분석이 수행되어야 합니다.</p>
        `,
      };

      const result = await seoValidationService.validateSEO(request);

      expect(result).toBeDefined();
      expect(result.metrics.metadataScore).toBeLessThan(70);
      expect(result.suggestions).toContain('메타 제목과 설명을 최적화하세요');
    });

    it('should handle AI analysis failure gracefully', async () => {
      // Mock AI failure
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('AI service failed'));
      vi.mocked(seoValidationService as any).genAI = {
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent,
        }),
      };

      const request: SEOValidationRequest = {
        content: '<h1>테스트</h1><p>콘텐츠</p>',
        metadata: {
          title: '테스트',
          description: '테스트 설명',
        },
      };

      const result = await seoValidationService.validateSEO(request);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      // Should still provide basic analysis even if AI fails
    });

    it('should validate different content types', async () => {
      const markdownContent = `
        # 마크다운 제목
        
        ## 소제목
        
        이것은 마크다운 형식의 콘텐츠입니다.
        
        - 목록 아이템 1
        - 목록 아이템 2
        
        [링크](https://example.com)
      `;

      const request: SEOValidationRequest = {
        content: markdownContent,
        metadata: {
          title: '마크다운 테스트',
          description: '마크다운 콘텐츠의 SEO 검증 테스트입니다.',
        },
      };

      const result = await seoValidationService.validateSEO(request);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
    });
  });

  describe('scoring algorithm', () => {
    it('should give higher scores for well-structured content', async () => {
      const goodContent: SEOValidationRequest = {
        content: `
          <h1>메인 제목</h1>
          <h2>섹션 1</h2>
          <h3>서브섹션</h3>
          <p>충분한 길이의 콘텐츠로 SEO에 좋은 점수를 받을 수 있습니다. 이 콘텐츠는 적절한 제목 구조와 충분한 텍스트를 포함하고 있습니다.</p>
          <h2>섹션 2</h2>
          <p>추가 콘텐츠와 <a href="/link">내부 링크</a>를 포함합니다.</p>
          <img src="image.jpg" alt="이미지 설명" />
        `,
        metadata: {
          title: '잘 최적화된 제목입니다',
          description:
            '이것은 적절한 길이의 메타 설명으로, SEO에 최적화되어 있으며 검색 결과에서 사용자의 관심을 끌 수 있도록 작성되었습니다.',
          keywords: ['SEO', '최적화', '콘텐츠'],
        },
      };

      const poorContent: SEOValidationRequest = {
        content: '<p>짧은 글</p>',
        metadata: {
          title: '제목',
          description: '짧음',
        },
      };

      const goodResult = await seoValidationService.validateSEO(goodContent);
      const poorResult = await seoValidationService.validateSEO(poorContent);

      expect(goodResult.overallScore).toBeGreaterThan(poorResult.overallScore);
    });

    it('should check pass/fail threshold correctly', async () => {
      const request: SEOValidationRequest = {
        content: '<h1>테스트</h1><p>기본 콘텐츠</p>',
        metadata: {
          title: '테스트',
          description: '테스트 설명',
        },
      };

      const result = await seoValidationService.validateSEO(request);

      if (result.overallScore >= 80) {
        expect(result.passed).toBe(true);
      } else {
        expect(result.passed).toBe(false);
      }
    });
  });
});
