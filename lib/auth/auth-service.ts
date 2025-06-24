import { createClient } from '@/supabase/server';
import { prisma } from '@/lib/prisma';
import type { LoginInput } from '@/lib/validations/auth';
import type { ApiResponse } from '@/types/database';

// 인증 관련 에러 타입
export interface AuthError {
  code: string;
  message: string;
}

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
 * 로그인 처리
 */
export async function signIn(
  loginData: LoginInput
): Promise<ApiResponse<UserSession>> {
  try {
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
