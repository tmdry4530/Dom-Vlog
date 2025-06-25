import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/ai/services/CategoryService';
import { categoryRecommendRequestSchema } from '@/lib/validations/ai';
import { ZodError } from 'zod';

/**
 * POST /api/ai/category/recommend
 * 콘텐츠 기반 카테고리 추천
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 본문 파싱
    const body = await request.json();

    // 2. 입력 검증
    const validatedData = categoryRecommendRequestSchema.parse(body);

    // 3. 카테고리 추천 서비스 호출
    const result = await categoryService.recommendCategories(validatedData);

    // 4. 성공 응답
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: {
          recommendations: result.data.recommendations,
          contentAnalysis: result.data.contentAnalysis,
          processingTime: result.data.processingMetrics.processingTimeMs,
          model: result.data.processingMetrics.modelUsed,
        },
      });
    }

    // 5. 서비스 레벨 오류
    return NextResponse.json(
      {
        success: false,
        error: result.error?.message || '카테고리 추천에 실패했습니다.',
        code: result.error?.code || 'UNKNOWN_ERROR',
        retryable: result.error?.retryable || false,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('카테고리 추천 API 오류:', error);

    // Zod 검증 오류
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '입력 데이터가 유효하지 않습니다.',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // JSON 파싱 오류
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: '요청 형식이 올바르지 않습니다.',
        },
        { status: 400 }
      );
    }

    // 기타 오류
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/category/recommend/health
 * 카테고리 추천 서비스 상태 확인
 */
export async function GET() {
  try {
    const healthStatus = await categoryService.healthCheck();

    return NextResponse.json({
      success: true,
      service: 'category-recommendation',
      status: healthStatus.status,
      model: healthStatus.model,
      timestamp: healthStatus.timestamp,
    });
  } catch (error) {
    console.error('카테고리 서비스 헬스체크 실패:', error);

    return NextResponse.json(
      {
        success: false,
        service: 'category-recommendation',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: Date.now(),
      },
      { status: 503 }
    );
  }
}
