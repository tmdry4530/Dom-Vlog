import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-service';

export async function GET() {
  try {
    // 현재 사용자 세션 확인
    const result = await getCurrentUser();

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
    console.error('세션 확인 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
