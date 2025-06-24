// Dom vlog - Database Services
// Phase 1: 데이터베이스 CRUD 작업을 위한 서비스 레이어

import { prisma } from '@/lib/prisma';
import type {
  Profile,
  Category,
  CreatePostInput,
  UpdatePostInput,
  CreateCategoryInput,
  UpdateProfileInput,
  PostWithRelations,
  CategoryWithPostCount,
  PostFilters,
  PaginationParams,
  PaginatedResponse,
} from '@/types/database';

// ===== 프로필 서비스 =====
export const ProfileService = {
  // 프로필 조회
  async getProfile(): Promise<Profile | null> {
    return await prisma.profile.findFirst();
  },

  // 프로필 생성 (Phase 1에서는 단일 프로필)
  async createProfile(data: {
    userId: string;
    email: string;
    username: string;
    displayName: string;
  }): Promise<Profile> {
    return await prisma.profile.create({
      data,
    });
  },

  // 프로필 업데이트
  async updateProfile(id: string, data: UpdateProfileInput): Promise<Profile> {
    return await prisma.profile.update({
      where: { id },
      data,
    });
  },
};

// ===== 카테고리 서비스 =====
export const CategoryService = {
  // 모든 카테고리 조회
  async getAllCategories(): Promise<Category[]> {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  },

  // 포스트 수와 함께 카테고리 조회
  async getCategoriesWithPostCount(): Promise<CategoryWithPostCount[]> {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  // ID로 카테고리 조회
  async getCategoryById(id: string): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: { id },
    });
  },

  // 슬러그로 카테고리 조회
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: { slug },
    });
  },

  // 카테고리 생성
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    return await prisma.category.create({
      data,
    });
  },

  // 카테고리 업데이트
  async updateCategory(
    id: string,
    data: Partial<CreateCategoryInput>
  ): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data,
    });
  },

  // 카테고리 삭제
  async deleteCategory(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  },
};

// ===== 포스트 서비스 =====
export const PostService = {
  // 관계 포함 포스트 조회
  async getPostsWithRelations(
    filters: PostFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<PostWithRelations>> {
    const {
      page,
      limit,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    // 필터 적용
    if (filters.status) where.status = filters.status;
    if (filters.categoryId) {
      where.categories = {
        some: {
          categoryId: filters.categoryId,
        },
      };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { excerpt: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: true,
          categories: {
            include: {
              category: true,
            },
          },
          seoScore: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  // ID로 포스트 조회
  async getPostById(id: string): Promise<PostWithRelations | null> {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        categories: {
          include: {
            category: true,
          },
        },
        seoScore: true,
      },
    });
  },

  // 슬러그로 포스트 조회
  async getPostBySlug(slug: string): Promise<PostWithRelations | null> {
    return await prisma.post.findUnique({
      where: { slug },
      include: {
        author: true,
        categories: {
          include: {
            category: true,
          },
        },
        seoScore: true,
      },
    });
  },

  // 포스트 생성
  async createPost(
    authorId: string,
    data: CreatePostInput
  ): Promise<PostWithRelations> {
    const { categoryIds, ...postData } = data;

    const result = await prisma.post.create({
      data: {
        ...postData,
        authorId,
        categories: {
          create: categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
      },
      include: {
        author: true,
        categories: {
          include: {
            category: true,
          },
        },
        seoScore: true,
      },
    });

    return result as PostWithRelations;
  },

  // 포스트 업데이트
  async updatePost(
    id: string,
    data: UpdatePostInput
  ): Promise<PostWithRelations> {
    const { categoryIds, ...postData } = data;

    // 기존 카테고리 관계 삭제 후 새로 생성
    if (categoryIds) {
      await prisma.postCategory.deleteMany({
        where: { postId: id },
      });
    }

    return await prisma.post.update({
      where: { id },
      data: {
        ...postData,
        ...(categoryIds && {
          categories: {
            create: categoryIds.map((categoryId) => ({
              categoryId,
            })),
          },
        }),
      },
      include: {
        author: true,
        categories: {
          include: {
            category: true,
          },
        },
        seoScore: true,
      },
    });
  },

  // 포스트 삭제
  async deletePost(id: string): Promise<void> {
    await prisma.post.delete({
      where: { id },
    });
  },

  // 조회수 증가
  async incrementViewCount(id: string): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  },

  // 포스트 발행
  async publishPost(id: string): Promise<PostWithRelations> {
    return await prisma.post.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        author: true,
        categories: {
          include: {
            category: true,
          },
        },
        seoScore: true,
      },
    });
  },
};

// ===== SEO 서비스 =====
export const SeoService = {
  // 포스트의 SEO 점수 조회
  async getSeoScoreByPostId(postId: string) {
    return await prisma.seoScore.findUnique({
      where: { postId },
    });
  },

  // SEO 점수 생성 또는 업데이트
  async upsertSeoScore(
    postId: string,
    data: {
      overallScore: number;
      readabilityScore: number;
      performanceScore: number;
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
      openGraphTitle?: string;
      openGraphDescription?: string;
      openGraphImage?: string;
      wordCount?: number;
      readingTime?: number;
      aiModel?: string;
    }
  ) {
    return await prisma.seoScore.upsert({
      where: { postId },
      update: {
        ...data,
        isProcessed: true,
        processedAt: new Date(),
      },
      create: {
        postId,
        ...data,
        isProcessed: true,
        processedAt: new Date(),
      },
    });
  },
};

// ===== 통계 서비스 =====
export const StatsService = {
  // 블로그 전체 통계
  async getBlogStats() {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalCategories,
      avgSeoScore,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.post.aggregate({ _sum: { viewCount: true } }),
      prisma.category.count(),
      prisma.seoScore.aggregate({ _avg: { overallScore: true } }),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews._sum.viewCount || 0,
      totalCategories,
      avgSeoScore: Math.round(avgSeoScore._avg.overallScore || 0),
    };
  },
};
