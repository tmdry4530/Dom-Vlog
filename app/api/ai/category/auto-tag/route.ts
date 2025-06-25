import { NextRequest, NextResponse } from 'next/server';
import { autoTagService } from '@/ai/services/AutoTagService';
import { autoTagRequestSchema } from '@/lib/validations/ai';
import { ZodError } from 'zod';

/**
 * POST /api/ai/category/auto-tag
 * 선택된 카테고리를 포스트에 자동 적용
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 본문 파싱
    const body = await request.json();

    // 2. 입력 검증
    const validatedData = autoTagRequestSchema.parse(body);

    // 3. 자동 태깅 서비스 호출
    const result = await autoTagService.applyAutoTags(validatedData);

    // 4. 성공 응답
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: `${result.data.addedCategories}개 카테고리가 추가되었습니다.`,
      });
    }

    // 5. 서비스 레벨 오류
    return NextResponse.json(
      {
        success: false,
        error: result.error || '자동 태깅에 실패했습니다.',
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('자동 태깅 API 오류:', error);

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
 * DELETE /api/ai/category/auto-tag
 * 포스트의 카테고리 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');
    const categoryIds = url.searchParams.get('categoryIds')?.split(',') || [];
    const onlyAiSuggested = url.searchParams.get('onlyAiSuggested') === 'true';

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          error: 'postId는 필수 매개변수입니다.',
        },
        { status: 400 }
      );
    }

    if (categoryIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'categoryIds는 필수 매개변수입니다.',
        },
        { status: 400 }
      );
    }

    const result = await autoTagService.removePostCategories(
      postId,
      categoryIds,
      onlyAiSuggested
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          removedCount: result.removedCount,
        },
        message: `${result.removedCount}개 카테고리가 삭제되었습니다.`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error || '카테고리 삭제에 실패했습니다.',
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('카테고리 삭제 API 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
