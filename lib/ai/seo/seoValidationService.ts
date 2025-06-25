import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  SEOValidationResult,
  SEOMetrics,
  LighthouseResult,
  SEOValidationRequest,
} from '@/types/seo';

class SEOValidationService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for SEO validation');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * 콘텐츠의 SEO 점수를 자동으로 검증합니다
   */
  async validateSEO(
    request: SEOValidationRequest
  ): Promise<SEOValidationResult> {
    try {
      const metrics = await this.analyzeSEOMetrics(
        request.content,
        request.metadata
      );
      const aiAnalysis = await this.getAIAnalysis(
        request.content,
        request.metadata
      );

      const overallScore = this.calculateOverallScore(metrics, aiAnalysis);
      const suggestions = this.generateSuggestions(metrics, aiAnalysis);

      return {
        overallScore,
        passed: overallScore >= 80,
        metrics: {
          contentScore: metrics.contentScore,
          technicalScore: metrics.technicalScore,
          metadataScore: metrics.metadataScore,
          performanceScore: 85, // 기본값 (실제 Lighthouse 연동 시 대체)
        },
        suggestions,
        validatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('SEO validation failed:', error);
      throw new Error('SEO 검증 중 오류가 발생했습니다');
    }
  }

  /**
   * 콘텐츠에서 SEO 메트릭을 분석합니다
   */
  private async analyzeSEOMetrics(
    content: string,
    metadata?: any
  ): Promise<
    SEOMetrics & {
      contentScore: number;
      technicalScore: number;
      metadataScore: number;
    }
  > {
    // HTML 파싱을 위한 간단한 분석
    const titleMatches = content.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
    const h1Count = titleMatches.length;
    const h2Count = (content.match(/<h2[^>]*>.*?<\/h2>/gi) || []).length;
    const h3Count = (content.match(/<h3[^>]*>.*?<\/h3>/gi) || []).length;

    const imageAltTextCount = (
      content.match(/<img[^>]*alt\s*=\s*["'][^"']*["'][^>]*>/gi) || []
    ).length;
    const internalLinksCount = (
      content.match(/<a[^>]*href\s*=\s*["'][^"']*["'][^>]*>/gi) || []
    ).length;
    const externalLinksCount = (
      content.match(/<a[^>]*href\s*=\s*["']https?:\/\/[^"']*["'][^>]*>/gi) || []
    ).length;

    // 텍스트 콘텐츠 추출
    const textContent = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const contentLength = textContent.length;

    // 키워드 밀도 분석
    const words = textContent.toLowerCase().match(/\b\w+\b/g) || [];
    const keywordDensity: { [keyword: string]: number } = {};
    const totalWords = words.length;

    words.forEach((word) => {
      if (word.length > 3) {
        keywordDensity[word] = (keywordDensity[word] || 0) + 1;
      }
    });

    // 밀도를 백분율로 변환
    Object.keys(keywordDensity).forEach((keyword) => {
      keywordDensity[keyword] = (keywordDensity[keyword] / totalWords) * 100;
    });

    // 점수 계산
    const contentScore = this.calculateContentScore({
      contentLength,
      h1Count,
      h2Count,
      h3Count,
    });

    const technicalScore = this.calculateTechnicalScore({
      imageAltTextCount,
      internalLinksCount,
      externalLinksCount,
    });

    const metadataScore = this.calculateMetadataScore(metadata);

    return {
      titleLength: metadata?.title?.length || 0,
      metaDescriptionLength: metadata?.description?.length || 0,
      headingStructure: { h1Count, h2Count, h3Count },
      imageAltTextCount,
      internalLinksCount,
      externalLinksCount,
      contentLength,
      keywordDensity,
      contentScore,
      technicalScore,
      metadataScore,
    };
  }

  /**
   * AI를 사용하여 콘텐츠를 분석합니다
   */
  private async getAIAnalysis(
    content: string,
    metadata?: any
  ): Promise<{
    readabilityScore: number;
    keywordRelevance: number;
    structureScore: number;
    suggestions: string[];
  }> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    });

    const prompt = `
콘텐츠의 SEO 관점에서 다음을 분석해주세요:

**콘텐츠:**
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

**메타데이터:**
${metadata ? JSON.stringify(metadata, null, 2) : '없음'}

다음 형식으로 응답해주세요:
{
  "readabilityScore": 0-100,
  "keywordRelevance": 0-100,
  "structureScore": 0-100,
  "suggestions": ["개선사항1", "개선사항2", "개선사항3"]
}

평가 기준:
- readabilityScore: 가독성, 문장 구조, 단락 구성
- keywordRelevance: 키워드 최적화, 의미적 연관성
- structureScore: 제목 구조, 논리적 흐름
- suggestions: 구체적인 SEO 개선 제안
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSON 응답 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          readabilityScore: Math.min(
            100,
            Math.max(0, analysis.readabilityScore || 0)
          ),
          keywordRelevance: Math.min(
            100,
            Math.max(0, analysis.keywordRelevance || 0)
          ),
          structureScore: Math.min(
            100,
            Math.max(0, analysis.structureScore || 0)
          ),
          suggestions: Array.isArray(analysis.suggestions)
            ? analysis.suggestions
            : [],
        };
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    // 기본값 반환
    return {
      readabilityScore: 70,
      keywordRelevance: 70,
      structureScore: 70,
      suggestions: ['콘텐츠 구조를 개선하세요', '키워드 최적화가 필요합니다'],
    };
  }

  /**
   * 콘텐츠 점수를 계산합니다
   */
  private calculateContentScore(metrics: {
    contentLength: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
  }): number {
    let score = 0;

    // 콘텐츠 길이 (30%)
    if (metrics.contentLength >= 300) score += 30;
    else if (metrics.contentLength >= 150) score += 20;
    else score += 10;

    // H1 태그 (25%)
    if (metrics.h1Count === 1) score += 25;
    else if (metrics.h1Count > 1) score += 15;
    else score += 5;

    // 제목 구조 (25%)
    if (metrics.h2Count >= 2 && metrics.h3Count >= 1) score += 25;
    else if (metrics.h2Count >= 1) score += 15;
    else score += 5;

    // 기본 점수 (20%)
    score += 20;

    return Math.min(100, score);
  }

  /**
   * 기술적 점수를 계산합니다
   */
  private calculateTechnicalScore(metrics: {
    imageAltTextCount: number;
    internalLinksCount: number;
    externalLinksCount: number;
  }): number {
    let score = 0;

    // 이미지 Alt 텍스트 (40%)
    if (metrics.imageAltTextCount > 0) score += 40;
    else score += 20;

    // 내부 링크 (30%)
    if (metrics.internalLinksCount >= 2) score += 30;
    else if (metrics.internalLinksCount >= 1) score += 20;
    else score += 10;

    // 기본 점수 (30%)
    score += 30;

    return Math.min(100, score);
  }

  /**
   * 메타데이터 점수를 계산합니다
   */
  private calculateMetadataScore(metadata?: any): number {
    if (!metadata) return 50;

    let score = 0;

    // 제목 (40%)
    if (
      metadata.title &&
      metadata.title.length >= 10 &&
      metadata.title.length <= 60
    ) {
      score += 40;
    } else if (metadata.title) {
      score += 20;
    }

    // 설명 (40%)
    if (
      metadata.description &&
      metadata.description.length >= 120 &&
      metadata.description.length <= 160
    ) {
      score += 40;
    } else if (metadata.description) {
      score += 20;
    }

    // 키워드 (20%)
    if (metadata.keywords && metadata.keywords.length > 0) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * 전체 점수를 계산합니다
   */
  private calculateOverallScore(
    metrics: {
      contentScore: number;
      technicalScore: number;
      metadataScore: number;
    },
    aiAnalysis: {
      readabilityScore: number;
      keywordRelevance: number;
      structureScore: number;
    }
  ): number {
    const weights = {
      content: 0.25,
      technical: 0.2,
      metadata: 0.2,
      readability: 0.15,
      keywordRelevance: 0.1,
      structure: 0.1,
    };

    const weightedScore =
      metrics.contentScore * weights.content +
      metrics.technicalScore * weights.technical +
      metrics.metadataScore * weights.metadata +
      aiAnalysis.readabilityScore * weights.readability +
      aiAnalysis.keywordRelevance * weights.keywordRelevance +
      aiAnalysis.structureScore * weights.structure;

    return Math.round(weightedScore);
  }

  /**
   * 개선 제안을 생성합니다
   */
  private generateSuggestions(
    metrics: {
      contentScore: number;
      technicalScore: number;
      metadataScore: number;
    },
    aiAnalysis: { suggestions: string[] }
  ): string[] {
    const suggestions: string[] = [...aiAnalysis.suggestions];

    if (metrics.contentScore < 80) {
      suggestions.push('콘텐츠 길이를 늘리고 제목 구조를 개선하세요');
    }

    if (metrics.technicalScore < 80) {
      suggestions.push('이미지에 Alt 텍스트를 추가하고 내부 링크를 늘려보세요');
    }

    if (metrics.metadataScore < 80) {
      suggestions.push('메타 제목과 설명을 최적화하세요');
    }

    return suggestions.slice(0, 5); // 최대 5개 제안
  }
}

export const seoValidationService = new SEOValidationService();
