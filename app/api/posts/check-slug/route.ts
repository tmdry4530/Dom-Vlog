import { NextRequest, NextResponse } from 'next/server';
import { checkSlugAvailability } from '@/lib/blog/post-service';
import { checkSlugSchema } from '@/lib/validations/post';

// 슬러그 중복 확인
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('excludeId');

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: '슬러그를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 입력값 검증
    const validationResult = checkSlugSchema.safeParse({
      slug,
      excludeId: excludeId || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '입력값이 올바르지 않습니다.',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // 슬러그 중복 확인
    const result = await checkSlugAvailability(validationResult.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.data?.available
          ? '사용 가능한 슬러그입니다.'
          : '이미 사용 중인 슬러그입니다.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('슬러그 중복 확인 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
