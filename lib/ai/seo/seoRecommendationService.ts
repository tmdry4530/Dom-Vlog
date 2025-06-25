/**
 * SEO 추천 서비스
 * Gemini AI를 활용한 메타데이터 자동 생성 및 최적화
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  SeoRecommendationRequest,
  SeoRecommendationResponse,
  SeoRecommendationData,
  SeoRecommendationServiceResult,
  GeminiSeoResponse,
  SeoPromptVariables,
  SeoError,
  SEO_ERROR_CODES,
  SeoProcessingMetrics,
} from '@/types/seo';
import {
  SEO_METADATA_PROMPT,
  replacePromptVariables,
  validatePromptVariables,
  DEFAULT_PROMPT_CONFIG,
} from '@/ai/prompts/seo-prompts';
import { geminiConfig } from '@/ai/models/gemini-config';

export class SeoRecommendationService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly config: typeof geminiConfig.seo;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for SEO recommendations');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.config = geminiConfig.seo;
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        topK: this.config.topK,
        topP: this.config.topP,
        maxOutputTokens: this.config.maxTokens,
      },
    });
  }

  /**
   * 콘텐츠 기반 SEO 메타데이터 추천
   */
  async recommendMetadata(
    request: SeoRecommendationRequest
  ): Promise<SeoRecommendationServiceResult<SeoRecommendationData>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      // 입력 검증
      const validationError = this.validateRequest(request);
      if (validationError) {
        return this.createErrorResult(validationError, requestId, startTime);
      }

      // 콘텐츠 길이 제한 확인
      if (request.content.length > this.config.maxContentLength) {
        return this.createErrorResult(
          {
            code: SEO_ERROR_CODES.CONTENT_TOO_LONG,
            message: `Content exceeds maximum length of ${this.config.maxContentLength} characters`,
            retryable: false,
          },
          requestId,
          startTime
        );
      }

      // 프롬프트 변수 준비
      const promptVariables: SeoPromptVariables = {
        content: request.content,
        title: request.title,
        contentType: request.contentType,
        targetKeywords: request.targetKeywords?.join(', ') || '',
        language: request.options?.language || DEFAULT_PROMPT_CONFIG.language,
        maxTitleLength: DEFAULT_PROMPT_CONFIG.maxTitleLength,
        maxDescriptionLength: DEFAULT_PROMPT_CONFIG.maxDescriptionLength,
        includeSchema: request.options?.includeSchema ? 'true' : 'false',
      };

      // 프롬프트 검증
      if (!validatePromptVariables(promptVariables)) {
        return this.createErrorResult(
          {
            code: SEO_ERROR_CODES.INVALID_CONTENT,
            message: 'Required prompt variables are missing',
            retryable: false,
          },
          requestId,
          startTime
        );
      }

      // 프롬프트 생성 및 AI 호출
      const prompt = replacePromptVariables(
        SEO_METADATA_PROMPT,
        promptVariables
      );
      const aiResponse = await this.callGeminiAPI(prompt);

      // AI 응답 파싱
      const parsedResponse = this.parseGeminiResponse(aiResponse);

      // 응답 데이터 구성
      const recommendationData = this.buildRecommendationData(
        parsedResponse,
        request
      );

      // 성능 메트릭 수집
      const metrics = this.createMetrics(
        requestId,
        startTime,
        Date.now(),
        request.content.length,
        true
      );

      return {
        success: true,
        data: recommendationData,
        metrics,
      };
    } catch (error) {
      console.error('SEO recommendation failed:', error);

      const seoError: SeoError = {
        code: SEO_ERROR_CODES.AI_SERVICE_ERROR,
        message:
          error instanceof Error ? error.message : 'Unknown AI service error',
        retryable: this.isRetryableError(error),
        details: {
          error: error instanceof Error ? error.stack : String(error),
        },
      };

      return this.createErrorResult(seoError, requestId, startTime);
    }
  }

  /**
   * 빠른 메타데이터 추천 (기본 옵션 사용)
   */
  async quickRecommend(
    content: string,
    title: string,
    contentType: 'markdown' | 'html' = 'markdown'
  ): Promise<SeoRecommendationServiceResult<SeoRecommendationData>> {
    const request: SeoRecommendationRequest = {
      content,
      title,
      contentType,
      options: {
        generateSlug: true,
        optimizeForMobile: true,
        includeSchema: false,
        language: 'ko',
      },
    };

    return this.recommendMetadata(request);
  }

  /**
   * 키워드 기반 메타데이터 추천
   */
  async recommendWithKeywords(
    content: string,
    title: string,
    targetKeywords: string[],
    options?: SeoRecommendationRequest['options']
  ): Promise<SeoRecommendationServiceResult<SeoRecommendationData>> {
    const request: SeoRecommendationRequest = {
      content,
      title,
      contentType: 'markdown',
      targetKeywords,
      options: {
        generateSlug: true,
        optimizeForMobile: true,
        includeSchema: true,
        language: 'ko',
        ...options,
      },
    };

    return this.recommendMetadata(request);
  }

  // ===== Private Methods =====

  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('quota')) {
          throw new Error('API quota exceeded');
        }
        if (error.message.includes('timeout')) {
          throw new Error('API request timeout');
        }
      }
      throw error;
    }
  }

  private parseGeminiResponse(response: string): GeminiSeoResponse {
    try {
      // JSON 블록 추출
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No JSON block found in AI response');
      }

      const parsedData = JSON.parse(jsonMatch[1]);

      // 필수 필드 검증
      const requiredFields = [
        'metaTitle',
        'metaDescription',
        'keywords',
        'openGraphTitle',
        'openGraphDescription',
        'suggestedSlug',
      ];

      for (const field of requiredFields) {
        if (!parsedData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return parsedData as GeminiSeoResponse;
    } catch (error) {
      console.error('Failed to parse Gemini response:', response);
      throw new Error(
        `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private buildRecommendationData(
    aiResponse: GeminiSeoResponse,
    request: SeoRecommendationRequest
  ): SeoRecommendationData {
    // 신뢰도 점수 계산
    const confidence = this.calculateConfidenceScores(aiResponse, request);

    // 스키마 마크업 생성 (요청된 경우)
    const schema = request.options?.includeSchema
      ? this.generateSchemaMarkup(aiResponse, request)
      : undefined;

    return {
      metaTitle: aiResponse.metaTitle,
      metaDescription: aiResponse.metaDescription,
      keywords: Array.isArray(aiResponse.keywords) ? aiResponse.keywords : [],
      openGraph: {
        title: aiResponse.openGraphTitle,
        description: aiResponse.openGraphDescription,
        type: 'article',
        locale: request.options?.language === 'en' ? 'en_US' : 'ko_KR',
      },
      suggestedSlug: aiResponse.suggestedSlug,
      schema,
      confidence,
    };
  }

  private calculateConfidenceScores(
    aiResponse: GeminiSeoResponse,
    request: SeoRecommendationRequest
  ): SeoRecommendationData['confidence'] {
    // 제목 신뢰도: 길이와 키워드 포함 여부
    const titleScore = this.scoreTitleQuality(aiResponse.metaTitle, request);

    // 설명 신뢰도: 길이와 요약 품질
    const descriptionScore = this.scoreDescriptionQuality(
      aiResponse.metaDescription,
      request
    );

    // 키워드 신뢰도: 관련성과 개수
    const keywordsScore = this.scoreKeywordsQuality(
      aiResponse.keywords,
      request
    );

    // 슬러그 신뢰도: SEO 친화성
    const slugScore = this.scoreSlugQuality(aiResponse.suggestedSlug);

    // 전체 신뢰도: 가중 평균
    const overall = Math.round(
      titleScore * 0.25 +
        descriptionScore * 0.25 +
        keywordsScore * 0.25 +
        slugScore * 0.25
    );

    return {
      overall,
      title: titleScore,
      description: descriptionScore,
      keywords: keywordsScore,
      slug: slugScore,
    };
  }

  private scoreTitleQuality(
    title: string,
    request: SeoRecommendationRequest
  ): number {
    let score = 70; // 기본 점수

    // 길이 검사 (30-60자 최적)
    if (title.length >= 30 && title.length <= 60) {
      score += 15;
    } else if (title.length < 30) {
      score -= 10;
    } else {
      score -= 5;
    }

    // 타겟 키워드 포함 검사
    if (request.targetKeywords) {
      const includesKeyword = request.targetKeywords.some((keyword) =>
        title.toLowerCase().includes(keyword.toLowerCase())
      );
      if (includesKeyword) score += 10;
    }

    // 특수문자와 브랜딩 요소
    if (/[!?:|]/.test(title)) score += 5; // 감정적 어필

    return Math.min(100, Math.max(0, score));
  }

  private scoreDescriptionQuality(
    description: string,
    request: SeoRecommendationRequest
  ): number {
    let score = 70; // 기본 점수

    // 길이 검사 (120-160자 최적)
    if (description.length >= 120 && description.length <= 160) {
      score += 15;
    } else if (description.length < 120) {
      score -= 10;
    } else {
      score -= 5;
    }

    // 키워드 자연스러운 포함
    if (request.targetKeywords) {
      const keywordCount = request.targetKeywords.filter((keyword) =>
        description.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += Math.min(10, keywordCount * 3);
    }

    // 행동 유도 요소 검사
    if (/[알아보|확인|살펴보|방법|가이드|튜토리얼]/.test(description)) {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  private scoreKeywordsQuality(
    keywords: string[],
    request: SeoRecommendationRequest
  ): number {
    let score = 70; // 기본 점수

    // 키워드 개수 검사 (3-8개 최적)
    if (keywords.length >= 3 && keywords.length <= 8) {
      score += 15;
    } else {
      score -= 10;
    }

    // 타겟 키워드와의 관련성
    if (request.targetKeywords) {
      const overlap = keywords.filter((k) =>
        request.targetKeywords?.some(
          (tk) =>
            k.toLowerCase().includes(tk.toLowerCase()) ||
            tk.toLowerCase().includes(k.toLowerCase())
        )
      ).length;
      score += Math.min(15, overlap * 5);
    }

    return Math.min(100, Math.max(0, score));
  }

  private scoreSlugQuality(slug: string): number {
    let score = 70; // 기본 점수

    // 길이 검사 (20-50자 최적)
    if (slug.length >= 20 && slug.length <= 50) {
      score += 15;
    } else if (slug.length < 20) {
      score -= 5;
    } else {
      score -= 10;
    }

    // SEO 친화적 형식 검사
    if (/^[a-z0-9-]+$/.test(slug)) {
      score += 10;
    } else {
      score -= 20;
    }

    // 하이픈 사용 적절성
    const hyphenCount = (slug.match(/-/g) || []).length;
    if (hyphenCount >= 2 && hyphenCount <= 5) {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  private generateSchemaMarkup(
    aiResponse: GeminiSeoResponse,
    request: SeoRecommendationRequest
  ): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: aiResponse.metaTitle,
      description: aiResponse.metaDescription,
      keywords: aiResponse.keywords,
      author: {
        '@type': 'Person',
        name: 'Dom', // TODO: 설정에서 가져오기
      },
      publisher: {
        '@type': 'Organization',
        name: 'Dom Vlog',
        logo: {
          '@type': 'ImageObject',
          url: '/logo.png', // TODO: 실제 로고 URL로 변경
        },
      },
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `/${aiResponse.suggestedSlug}`,
      },
    };
  }

  private validateRequest(request: SeoRecommendationRequest): SeoError | null {
    if (!request.content?.trim()) {
      return {
        code: SEO_ERROR_CODES.INVALID_CONTENT,
        message: 'Content cannot be empty',
        retryable: false,
      };
    }

    if (request.content.length < 100) {
      return {
        code: SEO_ERROR_CODES.CONTENT_TOO_SHORT,
        message: 'Content must be at least 100 characters long',
        retryable: false,
      };
    }

    if (!request.title?.trim()) {
      return {
        code: SEO_ERROR_CODES.INVALID_CONTENT,
        message: 'Title cannot be empty',
        retryable: false,
      };
    }

    if (!['markdown', 'html'].includes(request.contentType)) {
      return {
        code: SEO_ERROR_CODES.INVALID_CONTENT,
        message: 'Content type must be either markdown or html',
        retryable: false,
      };
    }

    return null;
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('503') ||
        message.includes('502')
      );
    }
    return false;
  }

  private generateRequestId(): string {
    return `seo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createMetrics(
    requestId: string,
    startTime: number,
    endTime: number,
    contentLength: number,
    success: boolean,
    errorCode?: string
  ): SeoProcessingMetrics {
    return {
      requestId,
      startTime,
      endTime,
      processingTimeMs: endTime - startTime,
      model: this.config.model,
      contentLength,
      wordsAnalyzed: Math.floor(contentLength / 5), // 평균 단어 길이 5자 가정
      cacheHit: false, // TODO: 캐싱 구현 후 업데이트
      success,
      errorCode,
    };
  }

  private createErrorResult<T>(
    error: SeoError,
    requestId: string,
    startTime: number
  ): SeoRecommendationServiceResult<T> {
    const metrics = this.createMetrics(
      requestId,
      startTime,
      Date.now(),
      0,
      false,
      error.code
    );

    return {
      success: false,
      error,
      metrics,
    };
  }
}

// 싱글톤 인스턴스 생성
export const seoRecommendationService = new SeoRecommendationService();
