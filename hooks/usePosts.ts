'use client';

import { useState, useCallback } from 'react';
import { useNotifications } from './useNotifications';

// API용 타입 정의
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  readingTime?: number;
  viewCount?: number;
  commentCount?: number;
  categories?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  author?: {
    name: string;
    avatar?: string;
  };
  featured?: boolean;
  aiEnhanced?: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  categoryIds?: string[];
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

export interface PostFilters {
  status?: string;
  categoryId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  selectedPost: Post | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

export interface UsePostsResult extends PostsState {
  // CRUD 작업
  createPost: (data: CreatePostData) => Promise<Post | null>;
  updatePost: (data: UpdatePostData) => Promise<Post | null>;
  deletePost: (id: string) => Promise<boolean>;
  getPost: (id: string) => Promise<Post | null>;
  getPosts: (
    filters?: PostFilters,
    pagination?: PaginationOptions
  ) => Promise<void>;

  // 상태 관리
  setSelectedPost: (post: Post | null) => void;
  refreshPosts: () => Promise<void>;
  clearError: () => void;

  // 유틸리티
  generateSlug: (title: string) => string;
  estimateReadingTime: (content: string) => number;
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

// 데이터 변환 헬퍼
const transformPostFromAPI = (apiPost: any): Post => {
  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    excerpt: apiPost.excerpt,
    slug: apiPost.slug,
    publishedAt: apiPost.publishedAt || apiPost.createdAt,
    status: apiPost.status,
    readingTime: apiPost.readingTime,
    viewCount: apiPost.viewCount,
    commentCount: apiPost.commentCount || 0,
    categories: apiPost.categories?.map((cat: any) => ({
      id: cat.category?.id || cat.id,
      name: cat.category?.name || cat.name,
      color: cat.category?.color || cat.color,
    })),
    author: apiPost.author
      ? {
          name: apiPost.author.displayName || apiPost.author.username,
          avatar: apiPost.author.avatar,
        }
      : undefined,
    featured: apiPost.featured || false,
    aiEnhanced: apiPost.aiEnhanced || false,
  };
};

export function usePosts(): UsePostsResult {
  const [state, setState] = useState<PostsState>({
    posts: [],
    isLoading: false,
    error: null,
    selectedPost: null,
    pagination: null,
  });

  const { showSuccess, showError } = useNotifications();

  // 에러 클리어
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 상태 업데이트 헬퍼
  const updateState = useCallback((updates: Partial<PostsState>) => {
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

  // 유틸리티 함수들
  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  const estimateReadingTime = useCallback((content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, []);

  // 포스트 목록 조회
  const getPosts = useCallback(
    async (
      filters: PostFilters = {},
      pagination: PaginationOptions = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
    ) => {
      const result = await withErrorHandling(async () => {
        const params = new URLSearchParams();

        // 필터 파라미터 추가
        if (filters.status) params.append('status', filters.status);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.search) params.append('search', filters.search);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        // 페이지네이션 파라미터 추가
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
        if (pagination.sortOrder)
          params.append('sortOrder', pagination.sortOrder);

        const response = await apiCall(`/api/posts?${params.toString()}`);
        return response.data;
      });

      if (result) {
        const transformedPosts = result.data.map(transformPostFromAPI);
        updateState({
          posts: transformedPosts,
          pagination: result.pagination,
        });
      }
    },
    [withErrorHandling, updateState]
  );

  // 단일 포스트 조회
  const getPost = useCallback(
    async (id: string): Promise<Post | null> => {
      const result = await withErrorHandling(async () => {
        const response = await apiCall(`/api/posts/${id}`);
        return response.data;
      });

      if (result) {
        const transformedPost = transformPostFromAPI(result);
        updateState({ selectedPost: transformedPost });
        return transformedPost;
      }

      return null;
    },
    [withErrorHandling, updateState]
  );

  // 포스트 생성
  const createPost = useCallback(
    async (data: CreatePostData): Promise<Post | null> => {
      const result = await withErrorHandling(async () => {
        const response = await apiCall('/api/posts', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        return response.data;
      });

      if (result) {
        const transformedPost = transformPostFromAPI(result);
        setState((prev) => ({
          ...prev,
          posts: [transformedPost, ...prev.posts],
        }));
        showSuccess(
          '포스트 생성 완료',
          '새 포스트가 성공적으로 생성되었습니다.'
        );
        return transformedPost;
      }

      return null;
    },
    [withErrorHandling, updateState, showSuccess]
  );

  // 포스트 수정
  const updatePost = useCallback(
    async (data: UpdatePostData): Promise<Post | null> => {
      const result = await withErrorHandling(async () => {
        const response = await apiCall(`/api/posts/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        return response.data;
      });

      if (result) {
        const transformedPost = transformPostFromAPI(result);
        setState((prev) => ({
          ...prev,
          posts: prev.posts.map((post) =>
            post.id === data.id ? transformedPost : post
          ),
          selectedPost:
            prev.selectedPost?.id === data.id
              ? transformedPost
              : prev.selectedPost,
        }));
        showSuccess('포스트 수정 완료', '포스트가 성공적으로 수정되었습니다.');
        return transformedPost;
      }

      return null;
    },
    [withErrorHandling, updateState, showSuccess]
  );

  // 포스트 삭제
  const deletePost = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await withErrorHandling(async () => {
        await apiCall(`/api/posts/${id}`, {
          method: 'DELETE',
        });
        return true;
      });

      if (result) {
        setState((prev) => ({
          ...prev,
          posts: prev.posts.filter((post) => post.id !== id),
          selectedPost: prev.selectedPost?.id === id ? null : prev.selectedPost,
        }));
        showSuccess('포스트 삭제 완료', '포스트가 성공적으로 삭제되었습니다.');
        return true;
      }

      return false;
    },
    [withErrorHandling, updateState, showSuccess]
  );

  // 선택된 포스트 설정
  const setSelectedPost = useCallback(
    (post: Post | null) => {
      updateState({ selectedPost: post });
    },
    [updateState]
  );

  // 포스트 목록 새로고침
  const refreshPosts = useCallback(async () => {
    await getPosts();
  }, [getPosts]);

  return {
    ...state,
    createPost,
    updatePost,
    deletePost,
    getPost,
    getPosts,
    setSelectedPost,
    refreshPosts,
    clearError,
    generateSlug,
    estimateReadingTime,
  };
}
