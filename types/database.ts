// Dom vlog - Database Types
// Phase 1: 단일 사용자 블로그 데이터베이스 타입 정의

import type {
  Profile,
  Post,
  Category,
  PostCategory,
  SeoScore,
  PostStatus,
} from '@/lib/generated/prisma';

// 기본 모델 타입 재내보내기
export type {
  Profile,
  Post,
  Category,
  PostCategory,
  SeoScore,
  PostStatus,
} from '@/lib/generated/prisma';

// 확장된 타입 정의
export interface PostWithRelations extends Post {
  author: Profile;
  categories: Array<PostCategory & { category: Category }>;
  seoScore?: SeoScore | null;
}

export interface CategoryWithPostCount extends Category {
  _count: {
    posts: number;
  };
}

export interface ProfileWithStats extends Profile {
  _count: {
    posts: number;
  };
  stats?: {
    totalViews: number;
    publishedPosts: number;
    draftPosts: number;
    avgSeoScore: number;
  };
}

// SEO 관련 타입
export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
}

export interface SeoAnalysisResult {
  overallScore: number;
  readabilityScore: number;
  performanceScore: number;
  wordCount: number;
  readingTime: number;
  suggestions: string[];
  seoData: SeoData;
}

// AI 카테고리 추천 관련 타입
export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  confidence: number;
  isNew: boolean;
}

export interface PostAnalysis {
  categories: CategorySuggestion[];
  seo: SeoAnalysisResult;
  enhancedContent: string;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 필터링 타입
export interface PostFilters {
  status?: PostStatus;
  categoryId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// 폼 입력 타입
export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  featuredImage?: string;
  categoryIds: string[];
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  blogTitle?: string;
  blogSubtitle?: string;
  blogDescription?: string;
}

// 통계 타입
export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalCategories: number;
  avgSeoScore: number;
  topCategories: Array<{
    category: Category;
    postCount: number;
  }>;
  recentPosts: PostWithRelations[];
}

// 검색 결과 타입
export interface SearchResult {
  type: 'post' | 'category';
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  relevanceScore: number;
}

// 에러 타입
export interface DatabaseError {
  code: string;
  message: string;
  field?: string;
  constraint?: string;
}
