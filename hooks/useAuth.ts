'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import type { UserSession } from '@/lib/auth/auth-service';
import { signInWithOAuth, type OAuthProvider } from '@/lib/auth/auth-service';

// 인증 상태 인터페이스
export interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;
}

// 로그인 입력 데이터
export interface LoginData {
  email: string;
  password: string;
}

// useAuth 결과 인터페이스
export interface UseAuthResult extends AuthState {
  login: (data: LoginData) => Promise<boolean>;
  loginWithOAuth: (
    provider: OAuthProvider
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
  logout: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

// API 헬퍼 함수
const apiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP Error: ${response.status}`);
  }

  if (!data.success) {
    throw new Error(data.error || '요청이 실패했습니다.');
  }

  return data;
};

// 사용자 정보 타입
export interface User {
  id: string;
  email: string;
  profile?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export function useAuth(): UseAuthResult {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    isInitialized: false,
  });

  const { showSuccess, showError } = useNotifications();

  // 에러 클리어
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 상태 업데이트 헬퍼
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // 에러 처리 헬퍼
  const withErrorHandling = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T | null> => {
      try {
        updateState({ error: null, isLoading: true });
        const result = await operation();
        updateState({ isLoading: false });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.';
        updateState({ error: errorMessage, isLoading: false });
        showError('오류 발생', errorMessage);
        return null;
      }
    },
    [updateState, showError]
  );

  // 세션 확인
  const checkAuth = useCallback(async () => {
    const result = await withErrorHandling(async () => {
      const response = await apiCall('/api/auth/session');
      return response.data as UserSession | null;
    });

    updateState({
      user: result,
      isAuthenticated: !!result,
      isInitialized: true,
    });
  }, [withErrorHandling, updateState]);

  // 로그인
  const login = useCallback(
    async (data: LoginData): Promise<boolean> => {
      const result = await withErrorHandling(async () => {
        const response = await apiCall('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        return response.data as UserSession;
      });

      if (result) {
        updateState({
          user: result,
          isAuthenticated: true,
        });
        showSuccess('로그인 성공', '환영합니다!');
        return true;
      }

      return false;
    },
    [withErrorHandling, updateState, showSuccess]
  );

  // 로그아웃
  const logout = useCallback(async (): Promise<boolean> => {
    const result = await withErrorHandling(async () => {
      await apiCall('/api/auth/logout', {
        method: 'POST',
      });
      return true;
    });

    if (result) {
      updateState({
        user: null,
        isAuthenticated: false,
      });
      showSuccess('로그아웃 완료', '안전하게 로그아웃되었습니다.');
      return true;
    }

    return false;
  }, [withErrorHandling, updateState, showSuccess]);

  // OAuth 소셜 로그인
  const loginWithOAuth = useCallback(
    async (
      provider: OAuthProvider
    ): Promise<{ success: boolean; url?: string; error?: string }> => {
      try {
        updateState({ error: null, isLoading: true });
        const result = await signInWithOAuth(provider);
        updateState({ isLoading: false });

        if (result.success && result.data) {
          showSuccess(
            `${provider === 'github' ? 'GitHub' : 'Google'} 로그인`,
            '리다이렉트 중...'
          );
          return { success: true, url: result.data.url };
        } else {
          const errorMessage = result.error || '소셜 로그인에 실패했습니다.';
          updateState({ error: errorMessage });
          showError('로그인 실패', errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '소셜 로그인 중 오류가 발생했습니다.';
        updateState({ error: errorMessage, isLoading: false });
        showError('오류 발생', errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [updateState, showSuccess, showError]
  );

  // 세션 갱신
  const refreshSession = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  // 초기화
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 세션 자동 갱신 (10분마다)
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (state.isAuthenticated) {
          refreshSession();
        }
      },
      10 * 60 * 1000
    ); // 10분

    return () => clearInterval(interval);
  }, [state.isAuthenticated, refreshSession]);

  return {
    ...state,
    login,
    loginWithOAuth,
    logout,
    checkAuth,
    refreshSession,
    clearError,
  };
}
