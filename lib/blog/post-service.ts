import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/auth-service';
import type {
  ApiResponse,
  PostWithRelations,
  PaginatedResponse,
} from '@/types/database';
import type {
  CreatePostInput,
  UpdatePostInput,
  UpdatePostStatusInput,
  PostFiltersInput,
  PaginationInput,
  CheckSlugInput,
} from '@/lib/validations/post';
import { PostStatus } from '@/lib/generated/prisma';
import {
  validateStatusTransition,
  validatePostRequirements,
  createStatusUpdateData,
  logStatusChange,
  type PostData,
} from './post-status-manager';

/**
 * 포스트 목록 조회 (필터링 및 페이지네이션 지원)
 */
export async function getPosts(
  filters: PostFiltersInput = {},
  pagination: PaginationInput = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }
): Promise<ApiResponse<PaginatedResponse<PostWithRelations>>> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {
      authorId: user.profile?.id, // Phase 1: 본인 포스트만 조회
    };

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
    if (filters.slug) {
      where.slug = filters.slug;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    // 데이터 조회
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
      success: true,
      data: {
        data: posts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error('포스트 목록 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 포스트 단건 조회 (ID 기준)
 */
export async function getPostById(
  id: string
): Promise<ApiResponse<PostWithRelations | null>> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    const post = await prisma.post.findFirst({
      where: {
        id,
        authorId: user.profile?.id, // Phase 1: 본인 포스트만 조회
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

    if (!post) {
      return {
        success: false,
        error: '포스트를 찾을 수 없습니다.',
      };
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error('포스트 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 포스트 단건 조회 (슬러그 기준)
 */
export async function getPostBySlug(
  slug: string
): Promise<ApiResponse<PostWithRelations | null>> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    const post = await prisma.post.findFirst({
      where: {
        slug,
        authorId: user.profile?.id, // Phase 1: 본인 포스트만 조회
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

    if (!post) {
      return {
        success: false,
        error: '포스트를 찾을 수 없습니다.',
      };
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error('포스트 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 포스트 생성
 */
export async function createPost(
  postData: CreatePostInput
): Promise<ApiResponse<PostWithRelations>> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user || !user.profile) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    // 슬러그 중복 확인
    const existingPost = await prisma.post.findUnique({
      where: { slug: postData.slug },
    });

    if (existingPost) {
      return {
        success: false,
        error: '이미 존재하는 슬러그입니다.',
      };
    }

    // 카테고리 존재 확인
    const categories = await prisma.category.findMany({
      where: {
        id: { in: postData.categoryIds },
      },
    });

    if (categories.length !== postData.categoryIds.length) {
      return {
        success: false,
        error: '존재하지 않는 카테고리가 포함되어 있습니다.',
      };
    }

    // 포스트 생성 (트랜잭션 사용)
    const post = await prisma.$transaction(async (tx) => {
      // 포스트 생성
      const newPost = await tx.post.create({
        data: {
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          excerpt: postData.excerpt,
          status: postData.status,
          featuredImage: postData.featuredImage,
          authorId: user.profile!.id,
          publishedAt:
            postData.status === PostStatus.PUBLISHED ? new Date() : null,
        },
      });

      // 카테고리 연결
      await tx.postCategory.createMany({
        data: postData.categoryIds.map((categoryId) => ({
          postId: newPost.id,
          categoryId,
        })),
      });

      // 관계 포함하여 반환
      return await tx.post.findUniqueOrThrow({
        where: { id: newPost.id },
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
    });

    return {
      success: true,
      data: post,
      message: '포스트가 성공적으로 생성되었습니다.',
    };
  } catch (error) {
    console.error('포스트 생성 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 포스트 수정
 */
export async function updatePost(
  id: string,
  postData: UpdatePostInput
): Promise<ApiResponse<PostWithRelations>> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user || !user.profile) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    // 기존 포스트 확인
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        authorId: user.profile.id, // Phase 1: 본인 포스트만 수정 가능
      },
    });

    if (!existingPost) {
      return {
        success: false,
        error: '포스트를 찾을 수 없거나 수정 권한이 없습니다.',
      };
    }

    // 슬러그 중복 확인 (다른 포스트와)
    if (postData.slug && postData.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findFirst({
        where: {
          slug: postData.slug,
          NOT: { id },
        },
      });

      if (slugExists) {
        return {
          success: false,
          error: '이미 존재하는 슬러그입니다.',
        };
      }
    }

    // 카테고리 존재 확인
    if (postData.categoryIds) {
      const categories = await prisma.category.findMany({
        where: {
          id: { in: postData.categoryIds },
        },
      });

      if (categories.length !== postData.categoryIds.length) {
        return {
          success: false,
          error: '존재하지 않는 카테고리가 포함되어 있습니다.',
        };
      }
    }

    // 포스트 수정 (트랜잭션 사용)
    const updatedPost = await prisma.$transaction(async (tx) => {
      // 포스트 기본 정보 수정
      await tx.post.update({
        where: { id },
        data: {
          ...(postData.title && { title: postData.title }),
          ...(postData.slug && { slug: postData.slug }),
          ...(postData.content && { content: postData.content }),
          ...(postData.excerpt !== undefined && { excerpt: postData.excerpt }),
          ...(postData.featuredImage !== undefined && {
            featuredImage: postData.featuredImage || null,
          }),
          updatedAt: new Date(),
        },
      });

      // 카테고리 업데이트
      if (postData.categoryIds) {
        // 기존 카테고리 연결 삭제
        await tx.postCategory.deleteMany({
          where: { postId: id },
        });

        // 새 카테고리 연결 생성
        await tx.postCategory.createMany({
          data: postData.categoryIds.map((categoryId) => ({
            postId: id,
            categoryId,
          })),
        });
      }

      // 관계 포함하여 반환
      return await tx.post.findUniqueOrThrow({
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
    });

    return {
      success: true,
      data: updatedPost,
      message: '포스트가 성공적으로 수정되었습니다.',
    };
  } catch (error) {
    console.error('포스트 수정 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 포스트 상태 변경 (게시/비게시/보관) - 강화된 검증 로직
 */
export async function updatePostStatus(
  id: string,
  statusData: UpdatePostStatusInput
): Promise<ApiResponse<PostWithRelations>> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user || !user.profile) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    // 기존 포스트 확인
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        authorId: user.profile.id, // Phase 1: 본인 포스트만 수정 가능
      },
    });

    if (!existingPost) {
      return {
        success: false,
        error: '포스트를 찾을 수 없거나 수정 권한이 없습니다.',
      };
    }

    // 상태 전이 검증
    const transitionResult = validateStatusTransition(
      existingPost.status as any,
      statusData.status as any
    );

    if (!transitionResult.success) {
      return {
        success: false,
        error: transitionResult.error || '상태 변경이 불가능합니다.',
      };
    }

    // 포스트 데이터 변환 (PostData 형식에 맞게)
    const postData: PostData = {
      id: existingPost.id,
      title: existingPost.title,
      content: existingPost.content,
      slug: existingPost.slug,
      status: existingPost.status as any,
      publishedAt: existingPost.publishedAt,
      createdAt: existingPost.createdAt,
      updatedAt: existingPost.updatedAt,
    };

    // 상태별 필수 조건 검증
    const requirementResult = validatePostRequirements(
      postData,
      statusData.status as any
    );

    if (!requirementResult.isValid) {
      return {
        success: false,
        error: `상태 변경 조건을 만족하지 않습니다: ${requirementResult.errors.join(', ')}`,
      };
    }

    // 슬러그 중복 검사 (PUBLISHED 상태로 변경 시)
    if (statusData.status === PostStatus.PUBLISHED) {
      const slugCheck = await prisma.post.findFirst({
        where: {
          slug: existingPost.slug,
          status: PostStatus.PUBLISHED,
          NOT: { id: existingPost.id },
        },
      });

      if (slugCheck) {
        return {
          success: false,
          error: '동일한 슬러그를 가진 게시된 포스트가 이미 존재합니다.',
        };
      }
    }

    // 상태 업데이트 데이터 생성
    const statusUpdateData = createStatusUpdateData(
      statusData.status as any,
      postData
    );

    // 데이터베이스 업데이트
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: statusUpdateData.status,
        publishedAt: statusUpdateData.publishedAt,
        updatedAt: statusUpdateData.updatedAt,
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

    // 상태 변경 로깅
    logStatusChange(
      id,
      existingPost.status as any,
      statusData.status as any,
      user.profile.id
    );

    const statusMessage = {
      [PostStatus.PUBLISHED]: '게시',
      [PostStatus.DRAFT]: '초안으로 변경',
      [PostStatus.ARCHIVED]: '보관',
    };

    // 경고 메시지 추가
    let message = `포스트가 성공적으로 ${statusMessage[statusData.status]}되었습니다.`;
    if (requirementResult.warnings.length > 0) {
      message += ` 참고사항: ${requirementResult.warnings.join(', ')}`;
    }

    return {
      success: true,
      data: updatedPost,
      message,
    };
  } catch (error) {
    console.error('포스트 상태 변경 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 포스트 삭제
 */
export async function deletePost(id: string): Promise<ApiResponse<null>> {
  try {
    // 인증 확인
    const user = await requireAuth();
    if (!user || !user.profile) {
      return {
        success: false,
        error: '인증이 필요합니다.',
      };
    }

    // 기존 포스트 확인
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        authorId: user.profile.id, // Phase 1: 본인 포스트만 삭제 가능
      },
    });

    if (!existingPost) {
      return {
        success: false,
        error: '포스트를 찾을 수 없거나 삭제 권한이 없습니다.',
      };
    }

    // 포스트 삭제 (CASCADE로 관련 데이터 자동 삭제)
    await prisma.post.delete({
      where: { id },
    });

    return {
      success: true,
      data: null,
      message: '포스트가 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    console.error('포스트 삭제 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 슬러그 중복 확인
 */
export async function checkSlugAvailability(
  slugData: CheckSlugInput
): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const existingPost = await prisma.post.findFirst({
      where: {
        slug: slugData.slug,
        ...(slugData.excludeId && { NOT: { id: slugData.excludeId } }),
      },
    });

    return {
      success: true,
      data: {
        available: !existingPost,
      },
    };
  } catch (error) {
    console.error('슬러그 중복 확인 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 조회수 증가
 */
export async function incrementViewCount(
  id: string
): Promise<ApiResponse<{ viewCount: number }>> {
  try {
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        viewCount: true,
      },
    });

    return {
      success: true,
      data: {
        viewCount: updatedPost.viewCount,
      },
    };
  } catch (error) {
    console.error('조회수 증가 중 오류 발생:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}
