import { NextRequest, NextResponse } from 'next/server';
import { checkUsernameAvailability } from '@/lib/auth/profile-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자명을 입력해주세요.',
        },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자명은 3자 이상 20자 이하로 입력해주세요.',
        },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자명은 영문, 숫자, _, - 만 사용 가능합니다.',
        },
        { status: 400 }
      );
    }

    // 사용자명 중복 확인
    const result = await checkUsernameAvailability(username);

    return NextResponse.json(
      {
        success: result.success,
        data: result.data,
        error: result.error,
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error('사용자명 중복 확인 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
