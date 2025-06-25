import {
  createCategoryClassifierModel,
  categoryClassifierConfig,
  handleCategoryClassificationError,
  categoryWeights,
  defaultCategoryMapping,
  performanceConfig,
} from '@/ai/models/category-classifier-config';
import {
  CATEGORY_CLASSIFICATION_PROMPT,
  replacePromptVariables,
  formatAvailableCategories,
  validatePromptVariables,
} from '@/ai/prompts/category-prompts';
import {
  extractTechnicalTerms,
  extractFrameworksAndTools,
} from '@/lib/validations/ai';
import type {
  CategoryRecommendRequest,
  CategoryRecommendResponse,
  CategoryRecommendation,
  CategoryRecommendationResult,
  ContentAnalysis,
  GeminiCategoryResponse,
  ProcessingMetrics,
  CategoryMatch,
} from '@/types/ai';
import { prisma } from '@/lib/prisma';

export class CategoryService {
  private model: any;
  private requestCounter = 0;

  constructor() {
    this.initializeModel();
  }

  /**
   * Gemini 모델 초기화
   */
  private initializeModel() {
    try {
      this.model = createCategoryClassifierModel();
    } catch (error) {
      console.error('CategoryService 초기화 실패:', error);
      throw new Error('카테고리 서비스를 초기화할 수 없습니다.');
    }
  }

  /**
   * 콘텐츠 기반 카테고리 추천
   */
  async recommendCategories(
    request: CategoryRecommendRequest
  ): Promise<CategoryRecommendationResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // 1. 입력 검증
      const isValid = await this.validateRequest(request);
      if (!isValid) {
        throw new Error('유효하지 않은 요청입니다.');
      }

      // 2. 데이터베이스에서 사용 가능한 카테고리 조회
      const availableCategories = await this.getAvailableCategories();

      // 3. AI 모델을 통한 카테고리 분류
      const geminiResponse = await this.classifyWithGemini(
        request,
        availableCategories
      );

      // 4. 결과 후처리 및 신뢰도 조정
      const recommendations = await this.postProcessRecommendations(
        geminiResponse.recommendations,
        request.existingCategories
      );

      // 5. 처리 메트릭 생성
      const processingMetrics = this.createProcessingMetrics(
        requestId,
        startTime,
        request.content.length,
        true
      );

      return {
        success: true,
        data: {
          recommendations,
          contentAnalysis: geminiResponse.contentAnalysis,
          processingMetrics,
        },
      };
    } catch (error) {
      console.error('카테고리 추천 실패:', error);

      const processingMetrics = this.createProcessingMetrics(
        requestId,
        startTime,
        request.content.length,
        false
      );

      return {
        success: false,
        error: {
          code: 'CATEGORY_RECOMMENDATION_FAILED',
          message: error instanceof Error ? error.message : '알 수 없는 오류',
          retryable: true,
        },
      };
    }
  }

  /**
   * Gemini AI를 통한 카테고리 분류
   */
  private async classifyWithGemini(
    request: CategoryRecommendRequest,
    availableCategories: any[]
  ): Promise<GeminiCategoryResponse> {
    try {
      // 프롬프트 변수 준비
      const promptVariables = {
        title: request.title,
        content: this.truncateContent(request.content),
        contentType: request.contentType,
        availableCategories: formatAvailableCategories(availableCategories),
        maxSuggestions: request.maxSuggestions || 3,
        existingCategories: request.existingCategories?.join(', '),
      };

      // 프롬프트 검증
      if (!validatePromptVariables(promptVariables)) {
        throw new Error('프롬프트 변수 검증 실패');
      }

      // 프롬프트 생성
      const prompt = replacePromptVariables(
        CATEGORY_CLASSIFICATION_PROMPT,
        promptVariables
      );

      // Gemini 모델 호출
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSON 응답 파싱
      const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
      }

      const geminiData = JSON.parse(jsonMatch[1]);

      // 응답 검증 및 정규화
      return this.validateAndNormalizeGeminiResponse(geminiData);
    } catch (error) {
      console.error('Gemini 분류 오류:', error);
      handleCategoryClassificationError(error);
    }
  }

  /**
   * 추천 결과 후처리
   */
  private async postProcessRecommendations(
    recommendations: CategoryRecommendation[],
    existingCategories?: string[]
  ): Promise<CategoryRecommendation[]> {
    let processedRecommendations = [...recommendations];

    // 1. 기존 카테고리 필터링
    if (existingCategories && existingCategories.length > 0) {
      processedRecommendations = processedRecommendations.filter(
        (rec) => !existingCategories.includes(rec.categoryId)
      );
    }

    // 2. 도메인별 가중치 적용
    processedRecommendations = processedRecommendations.map((rec) => ({
      ...rec,
      confidence: this.applyDomainWeights(rec.categoryId, rec.confidence),
    }));

    // 3. 신뢰도 순 정렬 및 중복 제거
    processedRecommendations = this.deduplicateRecommendations(
      processedRecommendations
    );

    // 4. 신뢰도 임계값 필터링
    processedRecommendations = processedRecommendations.filter(
      (rec) => rec.confidence >= performanceConfig.confidenceThreshold
    );

    // 5. 카테고리 ID 유효성 검증
    const validatedRecommendations = await this.validateCategoryIds(
      processedRecommendations
    );

    return validatedRecommendations.slice(0, 3); // 최대 3개 반환
  }

  /**
   * 도메인별 가중치 적용
   */
  private applyDomainWeights(categoryId: string, confidence: number): number {
    const weight =
      categoryWeights[categoryId as keyof typeof categoryWeights] || 1.0;
    const adjustedConfidence = Math.min(confidence * weight, 1.0);
    return Math.round(adjustedConfidence * 100) / 100; // 소수점 2자리
  }

  /**
   * 추천 결과 중복 제거
   */
  private deduplicateRecommendations(
    recommendations: CategoryRecommendation[]
  ): CategoryRecommendation[] {
    const seen = new Set<string>();
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .filter((rec) => {
        if (seen.has(rec.categoryId)) {
          return false;
        }
        seen.add(rec.categoryId);
        return true;
      });
  }

  /**
   * 카테고리 ID 유효성 검증
   */
  private async validateCategoryIds(
    recommendations: CategoryRecommendation[]
  ): Promise<CategoryRecommendation[]> {
    const categoryIds = recommendations.map((rec) => rec.categoryId);

    const existingCategories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const existingCategoryIds = new Set(
      existingCategories.map((cat) => cat.id)
    );

    return recommendations.filter((rec) =>
      existingCategoryIds.has(rec.categoryId)
    );
  }

  /**
   * 사용 가능한 카테고리 조회
   */
  private async getAvailableCategories() {
    return await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * 요청 검증
   */
  private async validateRequest(
    request: CategoryRecommendRequest
  ): Promise<boolean> {
    // 기본 필드 검증
    if (!request.title?.trim() || !request.content?.trim()) {
      return false;
    }

    // 콘텐츠 길이 검증
    if (request.content.length < 50 || request.content.length > 50000) {
      return false;
    }

    // 콘텐츠 타입 검증
    if (!['markdown', 'html'].includes(request.contentType)) {
      return false;
    }

    return true;
  }

  /**
   * 콘텐츠 길이 제한
   */
  private truncateContent(content: string): string {
    const maxLength = categoryClassifierConfig.maxContentLength;
    if (content.length <= maxLength) {
      return content;
    }

    // 의미 있는 단위로 자르기 (문단, 문장 기준)
    const truncated = content.substring(0, maxLength);
    const lastParagraph = truncated.lastIndexOf('\n\n');
    const lastSentence = truncated.lastIndexOf('.');

    if (lastParagraph > maxLength * 0.8) {
      return truncated.substring(0, lastParagraph);
    } else if (lastSentence > maxLength * 0.8) {
      return truncated.substring(0, lastSentence + 1);
    }

    return truncated + '...';
  }

  /**
   * Gemini 응답 검증 및 정규화
   */
  private validateAndNormalizeGeminiResponse(
    data: any
  ): GeminiCategoryResponse {
    // 기본 구조 검증
    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      throw new Error(
        'AI 응답 형식이 잘못되었습니다: recommendations 필드 누락'
      );
    }

    if (!data.contentAnalysis) {
      throw new Error(
        'AI 응답 형식이 잘못되었습니다: contentAnalysis 필드 누락'
      );
    }

    // 추천 결과 정규화
    const normalizedRecommendations: CategoryRecommendation[] =
      data.recommendations.map((rec: any, index: number) => {
        if (
          !rec.categoryId ||
          !rec.categoryName ||
          typeof rec.confidence !== 'number'
        ) {
          throw new Error(
            `추천 결과 ${index + 1}번의 필수 필드가 누락되었습니다.`
          );
        }

        return {
          categoryId: String(rec.categoryId),
          categoryName: String(rec.categoryName),
          confidence: Math.max(0, Math.min(1, Number(rec.confidence))),
          reasoning: String(rec.reasoning || '추천 이유 없음'),
          isExisting: true, // DB에서 검증 후 설정
          keyTopics: Array.isArray(rec.keyTopics) ? rec.keyTopics : [],
        };
      });

    // 콘텐츠 분석 정규화
    const normalizedContentAnalysis: ContentAnalysis = {
      primaryTopic: String(data.contentAnalysis.primaryTopic || '알 수 없음'),
      secondaryTopics: Array.isArray(data.contentAnalysis.secondaryTopics)
        ? data.contentAnalysis.secondaryTopics
        : [],
      technicalLevel: ['beginner', 'intermediate', 'advanced'].includes(
        data.contentAnalysis.technicalLevel
      )
        ? data.contentAnalysis.technicalLevel
        : 'intermediate',
      contentType: [
        'tutorial',
        'review',
        'analysis',
        'guide',
        'news',
        'other',
      ].includes(data.contentAnalysis.contentType)
        ? data.contentAnalysis.contentType
        : 'other',
      keyTopics: Array.isArray(data.contentAnalysis.keyTopics)
        ? data.contentAnalysis.keyTopics
        : [],
      technicalTerms: Array.isArray(data.contentAnalysis.technicalTerms)
        ? data.contentAnalysis.technicalTerms
        : [],
      frameworksAndTools: Array.isArray(data.contentAnalysis.frameworksAndTools)
        ? data.contentAnalysis.frameworksAndTools
        : [],
    };

    return {
      recommendations: normalizedRecommendations,
      contentAnalysis: normalizedContentAnalysis,
    };
  }

  /**
   * 처리 메트릭 생성
   */
  private createProcessingMetrics(
    requestId: string,
    startTime: number,
    contentLength: number,
    success: boolean
  ): ProcessingMetrics {
    const endTime = Date.now();

    return {
      requestId,
      startTime,
      endTime,
      processingTimeMs: endTime - startTime,
      contentLength,
      modelUsed: categoryClassifierConfig.model,
      success,
    };
  }

  /**
   * 요청 ID 생성
   */
  private generateRequestId(): string {
    this.requestCounter++;
    const timestamp = Date.now();
    return `cat-${timestamp}-${this.requestCounter}`;
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck(): Promise<{
    status: string;
    model: string;
    timestamp: number;
  }> {
    try {
      // 간단한 테스트 요청
      const testContent = 'React hooks test content for health check';
      const result = await this.model.generateContent(
        `Analyze this: ${testContent}`
      );
      await result.response;

      return {
        status: 'healthy',
        model: categoryClassifierConfig.model,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        model: categoryClassifierConfig.model,
        timestamp: Date.now(),
      };
    }
  }
}

// 싱글톤 인스턴스 생성
export const categoryService = new CategoryService();
