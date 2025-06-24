import { NextRequest, NextResponse } from 'next/server';
import { updatePostStatus } from '@/lib/blog/post-service';
import { updatePostStatusSchema } from '@/lib/validations/post';

// 포스트 상태 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '포스트 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 입력값 검증
    const validationResult = updatePostStatusSchema.safeParse(body);
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

    // 포스트 상태 변경
    const result = await updatePostStatus(id, validationResult.data);

    if (!result.success) {
      let statusCode = 500;
      if (result.error === '인증이 필요합니다.') {
        statusCode = 401;
      } else if (
        result.error === '포스트를 찾을 수 없거나 수정 권한이 없습니다.'
      ) {
        statusCode = 404;
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('포스트 상태 변경 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
