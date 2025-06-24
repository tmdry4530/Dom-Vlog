import { z } from 'zod';

// URL 검증 스키마 (선택적)
const urlSchema = z
  .string()
  .url('올바른 URL 형식을 입력해주세요.')
  .optional()
  .or(z.literal(''));

// 프로필 업데이트 스키마
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, '표시 이름은 최소 2자 이상이어야 합니다.')
    .max(50, '표시 이름은 최대 50자까지 가능합니다.')
    .optional(),
  bio: z.string().max(500, '자기소개는 최대 500자까지 가능합니다.').optional(),
  avatar: urlSchema,
  website: urlSchema,
  github: z
    .string()
    .regex(
      /^https:\/\/github\.com\/[a-zA-Z0-9_-]+$/,
      '올바른 GitHub 프로필 URL을 입력해주세요.'
    )
    .optional()
    .or(z.literal('')),
  twitter: z
    .string()
    .regex(
      /^https:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+$/,
      '올바른 Twitter/X 프로필 URL을 입력해주세요.'
    )
    .optional()
    .or(z.literal('')),
  linkedin: z
    .string()
    .regex(
      /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+$/,
      '올바른 LinkedIn 프로필 URL을 입력해주세요.'
    )
    .optional()
    .or(z.literal('')),
  blogTitle: z
    .string()
    .min(1, '블로그 제목을 입력해주세요.')
    .max(100, '블로그 제목은 최대 100자까지 가능합니다.')
    .optional(),
  blogSubtitle: z
    .string()
    .max(200, '블로그 부제목은 최대 200자까지 가능합니다.')
    .optional(),
  blogDescription: z
    .string()
    .max(500, '블로그 설명은 최대 500자까지 가능합니다.')
    .optional(),
});

// 프로필 생성 스키마 (Phase 1에서 초기 프로필 생성용)
export const createProfileSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  username: z
    .string()
    .min(3, '사용자명은 최소 3자 이상이어야 합니다.')
    .max(20, '사용자명은 최대 20자까지 가능합니다.')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      '사용자명은 영문, 숫자, _, - 만 사용 가능합니다.'
    ),
  displayName: z
    .string()
    .min(2, '표시 이름은 최소 2자 이상이어야 합니다.')
    .max(50, '표시 이름은 최대 50자까지 가능합니다.'),
  bio: z.string().max(500, '자기소개는 최대 500자까지 가능합니다.').optional(),
  blogTitle: z
    .string()
    .min(1, '블로그 제목을 입력해주세요.')
    .max(100, '블로그 제목은 최대 100자까지 가능합니다.')
    .default('Dom vlog'),
});

// 타입 추출
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
