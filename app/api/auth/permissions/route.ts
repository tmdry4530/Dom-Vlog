import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-service';

export async function GET(_request: NextRequest) {
  try {
    console.log('=== Permissions API Called ===');

    const userResult = await getCurrentUser();
    console.log('getCurrentUser result:', userResult);

    if (!userResult.success || !userResult.data) {
      console.log('No user found, returning default permissions');
      return NextResponse.json(
        {
          success: true,
          data: {
            canWrite: false,
            canEdit: false,
            canDelete: false,
            canManage: false,
            isAllowedUser: false,
          },
        },
        { status: 200 }
      );
    }

    const user = userResult.data;
    console.log('User found:', { id: user.id, email: user.email });

    // 허용된 사용자인지 확인
    const allowedEmails = process.env.ALLOWED_USER_EMAILS;
    console.log('ALLOWED_USER_EMAILS env:', allowedEmails);

    let isAllowedUser = false;

    if (allowedEmails && user.email) {
      const emailList = allowedEmails
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);

      console.log('Email list from env:', emailList);
      console.log('User email (original):', user.email);

      // 사용자 이메일에서 모든 공백 제거 및 소문자 변환
      const normalizedUserEmail = user.email.replace(/\s/g, '').toLowerCase();
      console.log('User email (normalized):', normalizedUserEmail);

      isAllowedUser = emailList.includes(normalizedUserEmail);
      console.log('isAllowedUser (env-based):', isAllowedUser);
    } else {
      // ALLOWED_USER_EMAILS가 설정되지 않은 경우, 모든 인증된 사용자에게 권한 부여 (테스트용)
      isAllowedUser = true;
      console.log(
        'ALLOWED_USER_EMAILS 환경변수가 설정되지 않아 모든 인증된 사용자에게 권한 부여'
      );
    }

    // 허용된 사용자에게만 모든 권한 부여 (Phase 1: 개인 블로그)
    const permissions = {
      canWrite: isAllowedUser,
      canEdit: isAllowedUser,
      canDelete: isAllowedUser,
      canManage: isAllowedUser,
      isAllowedUser,
    };

    console.log('Final permissions:', permissions);

    return NextResponse.json(
      {
        success: true,
        data: permissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('권한 확인 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '권한 확인 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
