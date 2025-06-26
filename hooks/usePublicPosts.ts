'use client';

import { useState, useEffect, useCallback } from 'react';

// 공개 포스트용 타입 정의
export interface PublicPost {
  id: string;
  title: string;
  content: string;
  enhancedContent?: string;
  excerpt?: string;
  slug: string;
  publishedAt: string;
  viewCount: number;
  author: {
    displayName: string;
    avatar?: string;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
      color?: string;
    };
  }>;
}

export interface PublicPostsState {
  posts: PublicPost[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

export interface UsePublicPostsResult extends PublicPostsState {
  fetchPosts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  refreshPosts: () => Promise<void>;
  clearError: () => void;
}

export function usePublicPosts(): UsePublicPostsResult {
  const [state, setState] = useState<PublicPostsState>({
    posts: [],
    isLoading: false,
    error: null,
    pagination: null,
  });

  // 에러 클리어
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 포스트 목록 조회
  const fetchPosts = useCallback(
    async (
      params: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      } = {}
    ) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const searchParams = new URLSearchParams();

        // 기본값 설정
        searchParams.append('page', (params.page || 1).toString());
        searchParams.append('limit', (params.limit || 10).toString());
        searchParams.append('sortBy', params.sortBy || 'publishedAt');
        searchParams.append('sortOrder', params.sortOrder || 'desc');

        // 옵션 파라미터
        if (params.search) searchParams.append('search', params.search);
        if (params.categoryId)
          searchParams.append('categoryId', params.categoryId);

        const response = await fetch(
          `/api/posts/public?${searchParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error || '포스트를 불러오는 중 오류가 발생했습니다.'
          );
        }

        setState((prev) => ({
          ...prev,
          posts: data.data.data,
          pagination: data.data.pagination,
          isLoading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.';

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));

        console.error('공개 포스트 조회 오류:', error);
      }
    },
    []
  );

  // 포스트 목록 새로고침
  const refreshPosts = useCallback(async () => {
    await fetchPosts();
  }, [fetchPosts]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    ...state,
    fetchPosts,
    refreshPosts,
    clearError,
  };
}
