import { createClient } from '@/supabase/server';
import { prisma } from '@/lib/prisma';
import type { LoginInput } from '@/lib/validations/auth';
import type { ApiResponse } from '@/types/database';

// 인증 관련 에러 타입
export interface AuthError {
  code: string;
  message: string;
}

// OAuth 제공자 타입
export type OAuthProvider = 'github' | 'google';

// 사용자 세션 정보 타입
export interface UserSession {
  id: string;
  email: string;
  profile?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

/**
 * 허용된 사용자인지 확인 (개인 블로그용 화이트리스트)
 * 이메일 주소와 환경 변수에 등록된 이메일 목록을 비교합니다.
 * 비교 시에는 양쪽 모두 모든 공백을 제거하고 소문자로 변환하여 일치 여부를 확인합니다.
 * @param email 확인할 이메일 주소
 * @returns 허용된 사용자인 경우 true, 그렇지 않으면 false
 */
export function isAllowedUser(email: string): boolean {
  const allowedEmails = process.env.ALLOWED_USER_EMAILS;

  if (!allowedEmails) {
    console.error('ALLOWED_USER_EMAILS 환경변수가 설정되지 않았습니다.');
    return false;
  }

  // 쉼표로 구분된 이메일 목록 파싱 (각 이메일의 공백 제거 및 소문자 변환)
  const emailList = allowedEmails
    .split(',')
    .map((e) => e.trim().replace(/\s/g, '').toLowerCase()) // 이메일 자체 내의 공백도 제거
    .filter((e) => e.length > 0);

  // 비교할 입력 이메일도 모든 공백 제거 및 소문자 변환
  const normalizedUserEmail = email.replace(/\s/g, '').toLowerCase();

  return emailList.includes(normalizedUserEmail);
}

/**
 * OAuth 로그인 리다이렉트 URL 생성 (클라이언트 사이드용)
 */
export function getOAuthRedirectUrl(provider: OAuthProvider): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/auth/callback?provider=${provider}`;
}

/**
 * OAuth 로그인 처리 (클라이언트 사이드용)
 * 이 함수는 클라이언트에서 호출되어야 합니다
 */
export async function signInWithOAuth(
  provider: OAuthProvider
): Promise<ApiResponse<{ url: string }>> {
  try {
    // 클라이언트 사이드에서만 동작
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: '이 함수는 클라이언트에서만 호출할 수 있습니다.',
      };
    }

    // 동적 import로 클라이언트 supabase 가져오기
    const { supabase } = await import('@/supabase/client');

    const redirectTo = getOAuthRedirectUrl(provider);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.url) {
      return {
        success: false,
        error: 'OAuth URL을 생성할 수 없습니다.',
      };
    }

    return {
      success: true,
      data: { url: data.url },
      message: `${provider === 'github' ? 'GitHub' : 'Google'}으로 로그인 중입니다...`,
    };
  } catch (error) {
    console.error(`${provider} OAuth 로그인 중 오류 발생:`, error);
    return {
      success: false,
      error: '소셜 로그인 중 오류가 발생했습니다.',
    };
  }
}

/**
 * OAuth 콜백 처리 (서버 사이드)
 */
export async function handleOAuthCallback(
  code: string,
  provider: OAuthProvider
): Promise<ApiResponse<UserSession>> {
  try {
    const supabase = await createClient();

    // OAuth 토큰 교환
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'OAuth 로그인에 실패했습니다.',
      };
    }

    // 허용된 사용자인지 확인
    const userEmailForCheck = data.user.email;
    console.log(
      `[handleOAuthCallback] Checking if user is allowed. Email: ${userEmailForCheck}`
    );
    if (!userEmailForCheck || !isAllowedUser(userEmailForCheck)) {
      console.log(
        `[handleOAuthCallback] User not allowed or email missing. Email: ${userEmailForCheck}, isAllowed: ${
          userEmailForCheck ? isAllowedUser(userEmailForCheck) : 'N/A'
        }`
      );
      return {
        success: false,
        error: '이 블로그에 접근할 권한이 없습니다.',
      };
    }
    console.log('[handleOAuthCallback] User is allowed.');

    // 기존 프로필 확인 또는 생성
    let profile = await prisma.profile.findFirst({
      where: { email: data.user.email },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
    });

    // 새 사용자인 경우 프로필 생성
    if (!profile && data.user.email) {
      // OAuth 사용자 메타데이터에서 정보 추출
      const userMetadata = data.user.user_metadata || {};
      const username =
        userMetadata.user_name ||
        userMetadata.preferred_username ||
        data.user.email.split('@')[0];

      const displayName =
        userMetadata.full_name || userMetadata.name || username;

      const avatar = userMetadata.avatar_url || userMetadata.picture || null;

      try {
        profile = await prisma.profile.create({
          data: {
            userId: data.user.id,
            email: data.user.email,
            username,
            displayName,
            avatar,
          },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        });
      } catch (profileError) {
        console.error('프로필 생성 중 오류:', profileError);
        // 프로필 생성에 실패해도 로그인은 성공으로 처리
      }
    }

    const userSession: UserSession = {
      id: data.user.id,
      email: data.user.email!,
      profile: profile
        ? {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            avatar: profile.avatar || undefined,
          }
        : undefined,
    };

    return {
      success: true,
      data: userSession,
      message: `${provider === 'github' ? 'GitHub' : 'Google'} 로그인이 완료되었습니다.`,
    };
  } catch (error) {
    console.error(`${provider} OAuth 콜백 처리 중 오류 발생:`, error);
    return {
      success: false,
      error: '소셜 로그인 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 로그인 처리
 */
export async function signIn(
  loginData: LoginInput
): Promise<ApiResponse<UserSession>> {
  try {
    // 허용된 사용자인지 먼저 확인
    if (!isAllowedUser(loginData.email)) {
      return {
        success: false,
        error: '이 블로그에 접근할 권한이 없습니다.',
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: '로그인에 실패했습니다.',
      };
    }

    // 프로필 정보 조회
    const profile = await prisma.profile.findFirst({
      where: { email: data.user.email },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
    });

    const userSession: UserSession = {
      id: data.user.id,
      email: data.user.email!,
      profile: profile
        ? {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            avatar: profile.avatar || undefined,
          }
        : undefined,
    };

    return {
      success: true,
      data: userSession,
      message: '로그인이 완료되었습니다.',
    };
  } catch (error) {
    console.error('로그인 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

/**
 * 로그아웃 처리
 */
export async function signOut(): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: null,
      message: '로그아웃이 완료되었습니다.',
    };
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 현재 사용자 세션 확인
 */
export async function getCurrentUser(): Promise<
  ApiResponse<UserSession | null>
> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!user) {
      return {
        success: true,
        data: null,
        message: '인증되지 않은 사용자입니다.',
      };
    }

    // 프로필 정보 조회
    const profile = await prisma.profile.findFirst({
      where: { email: user.email },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
    });

    const userSession: UserSession = {
      id: user.id,
      email: user.email!,
      profile: profile
        ? {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            avatar: profile.avatar || undefined,
          }
        : undefined,
    };

    return {
      success: true,
      data: userSession,
    };
  } catch (error) {
    console.error('사용자 세션 확인 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 인증 필요 여부 확인 (미들웨어 유틸리티)
 */
export async function requireAuth(): Promise<UserSession | null> {
  const result = await getCurrentUser();

  if (!result.success || !result.data) {
    return null;
  }

  return result.data;
}

/**
 * 비밀번호 변경
 */
export async function changePassword(
  newPassword: string
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: null,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  } catch (error) {
    console.error('비밀번호 변경 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}
