import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth/auth-service';
import { loginSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력값 검증
    const validationResult = loginSchema.safeParse(body);
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

    // 로그인 처리
    const result = await signIn(validationResult.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 401 }
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
    console.error('로그인 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
