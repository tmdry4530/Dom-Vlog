'use client';

import { useState, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useGlobalStore } from '@/lib/stores/useGlobalStore';

// API helper imports
const API_BASE = '/api';

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Profile related types
export interface Profile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  blogTitle?: string;
  blogDescription?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  settings?: {
    emailNotifications: boolean;
    publicProfile: boolean;
    showEmail: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  username?: string;
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  blogTitle?: string;
  blogDescription?: string;
  socialLinks?: Profile['socialLinks'];
  settings?: Profile['settings'];
}

export interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
}

export interface UseProfileResult extends ProfileState {
  // Profile operations
  getProfile: () => Promise<Profile | null>;
  updateProfile: (data: UpdateProfileData) => Promise<Profile | null>;
  uploadAvatar: (file: File) => Promise<string | null>;
  deleteAvatar: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  checkUsernameAvailability: (username: string) => Promise<boolean>;

  // Validation
  validateEmail: (email: string) => boolean;
  validateWebsite: (url: string) => boolean;
  validateSocialLink: (platform: string, url: string) => boolean;
}

// API helper functions
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      return {
        success: false,
        error: errorData.error || {
          message: errorData.message || 'API 요청 실패',
        },
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : '네트워크 오류',
      },
    };
  }
};

// Profile data transformation
const transformApiProfile = (apiData: any): Profile => {
  return {
    id: apiData.id,
    username: apiData.username || '',
    displayName: apiData.displayName || apiData.name || '',
    email: apiData.email,
    avatar: apiData.avatar,
    bio: apiData.bio,
    website: apiData.website,
    location: apiData.location,
    blogTitle: apiData.blogTitle,
    blogDescription: apiData.blogDescription,
    socialLinks: apiData.socialLinks || {},
    settings: apiData.settings || {
      emailNotifications: true,
      publicProfile: true,
      showEmail: false,
    },
    createdAt: apiData.createdAt || new Date().toISOString(),
    updatedAt: apiData.updatedAt || new Date().toISOString(),
  };
};

// Global store user data transformation
const transformProfileToUser = (profile: Profile) => {
  return {
    id: profile.id,
    name: profile.displayName,
    email: profile.email,
    avatar: profile.avatar,
    bio: profile.bio,
    website: profile.website,
    location: profile.location,
    skills: [], // Default empty array for skills
    interests: [], // Default empty array for interests
  };
};

export function useProfile(): UseProfileResult {
  const [state, setState] = useState<ProfileState>({
    profile: null,
    isLoading: false,
    error: null,
    uploadProgress: 0,
  });

  const { setUser } = useGlobalStore();
  const { showSuccess, showError } = useNotifications();

  // Error handling helper
  const withErrorHandling = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T | null> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const result = await operation();
        setState((prev) => ({ ...prev, isLoading: false }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        showError('오류 발생', errorMessage);
        return null;
      }
    },
    [showError]
  );

  // Validation functions
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateWebsite = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }, []);

  const validateSocialLink = useCallback(
    (platform: string, url: string): boolean => {
      if (!validateWebsite(url)) return false;

      const platformDomains: Record<string, string[]> = {
        github: ['github.com'],
        twitter: ['twitter.com', 'x.com'],
        linkedin: ['linkedin.com'],
        instagram: ['instagram.com'],
      };

      const domains = platformDomains[platform];
      if (!domains) return true; // Unknown platform uses general URL validation

      return domains.some((domain) => url.includes(domain));
    },
    [validateWebsite]
  );

  // Get current user profile
  const getProfile = useCallback(async (): Promise<Profile | null> => {
    return withErrorHandling(async () => {
      const response = await apiRequest<any>('/auth/profile');

      if (!response.success) {
        throw new Error(response.error?.message || '프로필 조회 실패');
      }

      const profile = transformApiProfile(response.data);
      setState((prev) => ({ ...prev, profile }));

      // Update global store
      setUser(transformProfileToUser(profile));

      return profile;
    });
  }, [withErrorHandling, setUser]);

  // Check username availability
  const checkUsernameAvailability = useCallback(
    async (username: string): Promise<boolean> => {
      const result = await withErrorHandling(async () => {
        const response = await apiRequest<{ available: boolean }>(
          `/auth/profile/check-username`,
          {
            method: 'POST',
            body: JSON.stringify({ username }),
          }
        );

        if (!response.success) {
          throw new Error(response.error?.message || '사용자명 확인 실패');
        }

        return response.data?.available || false;
      });

      return result !== null ? result : false;
    },
    [withErrorHandling]
  );

  // Update profile
  const updateProfile = useCallback(
    async (data: UpdateProfileData): Promise<Profile | null> => {
      return withErrorHandling(async () => {
        // Validation
        if (data.website && !validateWebsite(data.website)) {
          throw new Error('유효하지 않은 웹사이트 URL입니다.');
        }

        if (data.socialLinks) {
          for (const [platform, url] of Object.entries(data.socialLinks)) {
            if (url && !validateSocialLink(platform, url)) {
              throw new Error(`유효하지 않은 ${platform} URL입니다.`);
            }
          }
        }

        const response = await apiRequest<any>('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.success) {
          throw new Error(response.error?.message || '프로필 업데이트 실패');
        }

        const updatedProfile = transformApiProfile(response.data);
        setState((prev) => ({ ...prev, profile: updatedProfile }));

        // Update global store
        setUser(transformProfileToUser(updatedProfile));

        showSuccess(
          '프로필 업데이트 완료',
          '프로필이 성공적으로 업데이트되었습니다.'
        );

        return updatedProfile;
      });
    },
    [
      withErrorHandling,
      validateWebsite,
      validateSocialLink,
      setUser,
      showSuccess,
    ]
  );

  // Upload avatar
  const uploadAvatar = useCallback(
    async (file: File): Promise<string | null> => {
      return withErrorHandling(async () => {
        // File validation
        if (!file.type.startsWith('image/')) {
          throw new Error('이미지 파일만 업로드할 수 있습니다.');
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error('파일 크기는 5MB 이하여야 합니다.');
        }

        const formData = new FormData();
        formData.append('avatar', file);

        // Upload progress simulation
        const updateProgress = (progress: number) => {
          setState((prev) => ({ ...prev, uploadProgress: progress }));
        };

        // Simulate upload progress
        for (let i = 0; i <= 90; i += 10) {
          updateProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const response = await fetch(`${API_BASE}/auth/profile/avatar`, {
          method: 'POST',
          body: formData,
        });

        updateProgress(100);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || '아바타 업로드 실패');
        }

        const data = await response.json();
        const avatarUrl = data.data?.avatarUrl;

        if (!avatarUrl) {
          throw new Error('아바타 URL을 받지 못했습니다.');
        }

        // Update profile state
        setState((prev) => ({
          ...prev,
          profile: prev.profile
            ? {
                ...prev.profile,
                avatar: avatarUrl,
                updatedAt: new Date().toISOString(),
              }
            : null,
          uploadProgress: 0,
        }));

        // Update global store
        if (state.profile) {
          const updatedProfile = { ...state.profile, avatar: avatarUrl };
          setUser(transformProfileToUser(updatedProfile));
        }

        showSuccess(
          '아바타 업로드 완료',
          '프로필 이미지가 성공적으로 업데이트되었습니다.'
        );

        return avatarUrl;
      });
    },
    [withErrorHandling, state.profile, setUser, showSuccess]
  );

  // Delete avatar
  const deleteAvatar = useCallback(async (): Promise<boolean> => {
    const result = await withErrorHandling(async () => {
      const response = await apiRequest('/auth/profile/avatar', {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.error?.message || '아바타 삭제 실패');
      }

      // Update profile state
      setState((prev) => ({
        ...prev,
        profile: prev.profile
          ? {
              ...prev.profile,
              avatar: undefined,
              updatedAt: new Date().toISOString(),
            }
          : null,
      }));

      // Update global store
      if (state.profile) {
        const updatedProfile = { ...state.profile, avatar: undefined };
        setUser(transformProfileToUser(updatedProfile));
      }

      showSuccess('아바타 삭제 완료', '프로필 이미지가 삭제되었습니다.');
      return true;
    });

    return result !== null;
  }, [withErrorHandling, state.profile, setUser, showSuccess]);

  // Refresh profile
  const refreshProfile = useCallback(async (): Promise<void> => {
    await getProfile();
  }, [getProfile]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    getProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refreshProfile,
    clearError,
    checkUsernameAvailability,
    validateEmail,
    validateWebsite,
    validateSocialLink,
  };
}
