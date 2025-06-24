import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentProfile,
  updateProfile,
  createProfile,
  getProfileStats,
} from '@/lib/auth/profile-service';
import {
  updateProfileSchema,
  createProfileSchema,
} from '@/lib/validations/profile';

// 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    if (includeStats) {
      // 통계 포함한 프로필 조회
      const result = await getProfileStats();

      return NextResponse.json(
        {
          success: result.success,
          data: result.data,
          error: result.error,
          message: result.message,
        },
        { status: result.success ? 200 : 401 }
      );
    } else {
      // 기본 프로필 조회
      const result = await getCurrentProfile();

      return NextResponse.json(
        {
          success: result.success,
          data: result.data,
          error: result.error,
          message: result.message,
        },
        { status: result.success ? 200 : 401 }
      );
    }
  } catch (error) {
    console.error('프로필 조회 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// 프로필 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력값 검증
    const validationResult = createProfileSchema.safeParse(body);
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

    // 프로필 생성
    const result = await createProfile(validationResult.data);

    return NextResponse.json(
      {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
      },
      { status: result.success ? 201 : 400 }
    );
  } catch (error) {
    console.error('프로필 생성 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// 프로필 수정
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력값 검증
    const validationResult = updateProfileSchema.safeParse(body);
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

    // 프로필 업데이트
    const result = await updateProfile(validationResult.data);

    return NextResponse.json(
      {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error('프로필 수정 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
