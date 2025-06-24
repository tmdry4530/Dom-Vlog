import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/blog/post-service';
import {
  createPostSchema,
  postFiltersSchema,
  paginationSchema,
} from '@/lib/validations/post';

// 포스트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 필터 파라미터 파싱 및 검증
    const filterParams = {
      status: searchParams.get('status') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    const filterValidation = postFiltersSchema.safeParse(filterParams);
    if (!filterValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 필터 파라미터입니다.',
          details: filterValidation.error.errors,
        },
        { status: 400 }
      );
    }

    // 페이지네이션 파라미터 파싱 및 검증
    const paginationParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const paginationValidation = paginationSchema.safeParse(paginationParams);
    if (!paginationValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 페이지네이션 파라미터입니다.',
          details: paginationValidation.error.errors,
        },
        { status: 400 }
      );
    }

    // 포스트 목록 조회
    const result = await getPosts(
      filterValidation.data,
      paginationValidation.data
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.error === '인증이 필요합니다.' ? 401 : 500 }
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
    console.error('포스트 목록 조회 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// 포스트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력값 검증
    const validationResult = createPostSchema.safeParse(body);
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

    // 포스트 생성
    const result = await createPost(validationResult.data);

    if (!result.success) {
      let statusCode = 500;
      if (result.error === '인증이 필요합니다.') {
        statusCode = 401;
      } else if (
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
      { status: 201 }
    );
  } catch (error) {
    console.error('포스트 생성 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
