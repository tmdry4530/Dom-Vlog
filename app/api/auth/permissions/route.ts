import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAllowedUser } from '@/lib/auth/auth-service';

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

    // isAllowedUser 함수를 auth-service에서 가져와 사용
    const userEmailForCheck = user.email;
    console.log(
      `[Permissions API] User email from getCurrentUser: ${userEmailForCheck}`
    );

    const isUserAllowed = userEmailForCheck
      ? isAllowedUser(userEmailForCheck)
      : false;
    console.log(
      `[Permissions API] Calling isAllowedUser from auth-service. Email: ${userEmailForCheck}, Result: ${isUserAllowed}`
    );

    // 허용된 사용자에게만 모든 권한 부여 (Phase 1: 개인 블로그)
    const permissions = {
      canWrite: isUserAllowed,
      canEdit: isUserAllowed,
      canDelete: isUserAllowed,
      canManage: isUserAllowed,
      isAllowedUser: isUserAllowed, // 이 필드도 동일하게 설정
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
