import { NextRequest, NextResponse } from 'next/server';
import { autoTagService } from '@/ai/services/AutoTagService';
import { z } from 'zod';
import { ZodError } from 'zod';

// 요청 스키마 정의
const recommendAndApplyRequestSchema = z.object({
  postId: z.string().min(1, '포스트 ID는 필수입니다.'),
  autoApply: z.boolean().optional().default(false),
  confidenceThreshold: z.number().min(0).max(1).optional().default(0.8),
});

/**
 * POST /api/ai/category/recommend-and-apply
 * 포스트에 대한 카테고리 추천 및 선택적 자동 적용
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 본문 파싱
    const body = await request.json();

    // 2. 입력 검증
    const validatedData = recommendAndApplyRequestSchema.parse(body);

    // 3. 카테고리 추천 및 자동 적용 서비스 호출
    const result = await autoTagService.recommendAndApplyTags(
      validatedData.postId,
      validatedData.autoApply
    );

    // 4. 성공 응답
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          recommendations: result.recommendations || [],
          applied: result.applied || false,
          autoApplyEnabled: validatedData.autoApply,
          confidenceThreshold: validatedData.confidenceThreshold,
        },
        message: result.applied
          ? '카테고리가 추천되고 자동으로 적용되었습니다.'
          : '카테고리가 추천되었습니다.',
      });
    }

    // 5. 서비스 레벨 오류
    return NextResponse.json(
      {
        success: false,
        error: result.error || '카테고리 추천 및 자동 적용에 실패했습니다.',
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('카테고리 추천 및 자동 적용 API 오류:', error);

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
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/category/recommend-and-apply/stats
 * 포스트의 카테고리 통계 조회
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          error: 'postId는 필수 매개변수입니다.',
        },
        { status: 400 }
      );
    }

    const result = await autoTagService.getPostCategoryStats(postId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error || '카테고리 통계 조회에 실패했습니다.',
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('카테고리 통계 조회 API 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
