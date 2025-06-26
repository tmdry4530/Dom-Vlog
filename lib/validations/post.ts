import { z } from 'zod';
import { PostStatus } from '@/lib/generated/prisma';

// 슬러그 검증 (URL 친화적)
const slugSchema = z
  .string()
  .min(1, '슬러그를 입력해주세요.')
  .max(100, '슬러그는 최대 100자까지 가능합니다.')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    '슬러그는 소문자, 숫자, 하이픈만 사용 가능하며 하이픈으로 시작하거나 끝날 수 없습니다.'
  );

// 포스트 생성 스키마
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(200, '제목은 최대 200자까지 가능합니다.'),
  slug: slugSchema,
  content: z
    .string()
    .min(10, '내용은 최소 10자 이상이어야 합니다.')
    .max(50000, '내용은 최대 50,000자까지 가능합니다.'),
  excerpt: z.string().max(500, '요약은 최대 500자까지 가능합니다.').optional(),
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
  featuredImage: z.string().url('올바른 이미지 URL을 입력해주세요.').optional(),
  categoryIds: z
    .array(z.string().cuid('올바른 카테고리 ID 형식이 아닙니다.'))
    .min(1, '최소 하나의 카테고리를 선택해주세요.')
    .max(5, '최대 5개의 카테고리까지 선택 가능합니다.'),
});

// 포스트 수정 스키마
export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(200, '제목은 최대 200자까지 가능합니다.')
    .optional(),
  slug: slugSchema.optional(),
  content: z
    .string()
    .min(10, '내용은 최소 10자 이상이어야 합니다.')
    .max(50000, '내용은 최대 50,000자까지 가능합니다.')
    .optional(),
  excerpt: z.string().max(500, '요약은 최대 500자까지 가능합니다.').optional(),
  featuredImage: z
    .string()
    .url('올바른 이미지 URL을 입력해주세요.')
    .optional()
    .or(z.literal('')),
  categoryIds: z
    .array(z.string().cuid('올바른 카테고리 ID 형식이 아닙니다.'))
    .min(1, '최소 하나의 카테고리를 선택해주세요.')
    .max(5, '최대 5개의 카테고리까지 선택 가능합니다.')
    .optional(),
});

// 포스트 상태 변경 스키마
export const updatePostStatusSchema = z.object({
  status: z.nativeEnum(PostStatus),
});

// 포스트 목록 조회 필터 스키마
export const postFiltersSchema = z.object({
  status: z.nativeEnum(PostStatus).optional(),
  categoryId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
  slug: z.string().max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// 페이지네이션 스키마
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z
    .enum(['title', 'createdAt', 'updatedAt', 'publishedAt', 'viewCount'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 슬러그 중복 확인 스키마
export const checkSlugSchema = z.object({
  slug: slugSchema,
  excludeId: z.string().cuid().optional(),
});

// 타입 추출
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type UpdatePostStatusInput = z.infer<typeof updatePostStatusSchema>;
export type PostFiltersInput = z.infer<typeof postFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CheckSlugInput = z.infer<typeof checkSlugSchema>;
