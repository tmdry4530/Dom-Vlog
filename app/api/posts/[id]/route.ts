import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost } from '@/lib/blog/post-service';
import { updatePostSchema } from '@/lib/validations/post';

// 포스트 단건 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '포스트 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    const result = await getPostById(id);

    if (!result.success) {
      let statusCode = 500;
      if (result.error === '인증이 필요합니다.') {
        statusCode = 401;
      } else if (result.error === '포스트를 찾을 수 없습니다.') {
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
    console.error('포스트 조회 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// 포스트 수정
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
    const validationResult = updatePostSchema.safeParse(body);
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

    // 포스트 수정
    const result = await updatePost(id, validationResult.data);

    if (!result.success) {
      let statusCode = 500;
      if (result.error === '인증이 필요합니다.') {
        statusCode = 401;
      } else if (
        result.error === '포스트를 찾을 수 없거나 수정 권한이 없습니다.' ||
        result.error === '이미 존재하는 슬러그입니다.' ||
        result.error === '존재하지 않는 카테고리가 포함되어 있습니다.'
      ) {
        statusCode = 400;
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
    console.error('포스트 수정 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// 포스트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '포스트 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    const result = await deletePost(id);

    if (!result.success) {
      let statusCode = 500;
      if (result.error === '인증이 필요합니다.') {
        statusCode = 401;
      } else if (
        result.error === '포스트를 찾을 수 없거나 삭제 권한이 없습니다.'
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
    console.error('포스트 삭제 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
