import { ApiResponse } from '@/types/database';

// PostStatus enum values (matching Prisma schema)
export const PostStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];

// 게시글 상태 전이 규칙 정의
export const POST_STATUS_TRANSITIONS = {
  [PostStatus.DRAFT]: [PostStatus.PUBLISHED, PostStatus.ARCHIVED],
  [PostStatus.PUBLISHED]: [PostStatus.DRAFT, PostStatus.ARCHIVED],
  [PostStatus.ARCHIVED]: [PostStatus.DRAFT, PostStatus.PUBLISHED],
} as const;

// 상태별 필수 조건 정의
export const POST_STATUS_REQUIREMENTS = {
  [PostStatus.DRAFT]: {
    minFields: ['title'],
    optional: true,
  },
  [PostStatus.PUBLISHED]: {
    minFields: ['title', 'content', 'slug'],
    optional: false,
  },
  [PostStatus.ARCHIVED]: {
    minFields: ['title'],
    optional: true,
  },
} as const;

export interface PostStatusValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PostData {
  id: string;
  title?: string | null;
  content?: string | null;
  slug?: string | null;
  status: PostStatus;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 게시글 상태 전이 검증
 */
export function validateStatusTransition(
  currentStatus: PostStatus,
  newStatus: PostStatus
): ApiResponse<boolean> {
  // 동일한 상태로의 전이는 허용하지 않음
  if (currentStatus === newStatus) {
    return {
      success: false,
      error: `게시글이 이미 ${getStatusDisplayName(newStatus)} 상태입니다.`,
    };
  }

  // 허용된 상태 전이인지 확인
  const allowedTransitions = POST_STATUS_TRANSITIONS[currentStatus];
  if (!(allowedTransitions as readonly PostStatus[]).includes(newStatus)) {
    return {
      success: false,
      error: `${getStatusDisplayName(currentStatus)}에서 ${getStatusDisplayName(
        newStatus
      )}(으)로 상태 변경할 수 없습니다.`,
    };
  }

  return {
    success: true,
    data: true,
  };
}

/**
 * 게시글 상태별 필수 조건 검증
 */
export function validatePostRequirements(
  post: PostData,
  targetStatus: PostStatus
): PostStatusValidationResult {
  const requirements = POST_STATUS_REQUIREMENTS[targetStatus];
  const errors: string[] = [];
  const warnings: string[] = [];

  // 필수 필드 검증
  for (const field of requirements.minFields) {
    const value = post[field as keyof PostData];

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${getFieldDisplayName(field)}은(는) 필수 입력 항목입니다.`);
    }
  }

  // 게시 상태별 추가 검증
  if (targetStatus === PostStatus.PUBLISHED) {
    // 슬러그 중복 검사는 서비스 레이어에서 수행
    if (post.content && post.content.trim().length < 10) {
      warnings.push('게시글 내용이 너무 짧습니다. 최소 10자 이상 권장합니다.');
    }

    if (post.title && post.title.length > 100) {
      warnings.push('제목이 너무 깁니다. 100자 이하 권장합니다.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 게시글 상태 업데이트 데이터 생성
 */
export function createStatusUpdateData(
  newStatus: PostStatus,
  currentData: Partial<PostData>
): Partial<PostData> {
  const updateData: Partial<PostData> = {
    status: newStatus,
    updatedAt: new Date(),
  };

  // 게시 상태에 따른 추가 필드 설정
  switch (newStatus) {
    case PostStatus.PUBLISHED:
      if (!currentData.publishedAt) {
        updateData.publishedAt = new Date();
      }
      break;

    case PostStatus.DRAFT:
      // 초안으로 변경 시 publishedAt은 유지 (재게시 가능성 고려)
      break;

    case PostStatus.ARCHIVED:
      // 아카이브 시 특별한 처리 없음
      break;
  }

  return updateData;
}

/**
 * 상태 변경 이벤트 로깅
 */
export function logStatusChange(
  postId: string,
  oldStatus: PostStatus,
  newStatus: PostStatus,
  userId?: string
): void {
  const logData = {
    postId,
    oldStatus,
    newStatus,
    userId,
    timestamp: new Date().toISOString(),
    action: 'POST_STATUS_CHANGE',
  };

  console.log('게시글 상태 변경:', JSON.stringify(logData, null, 2));

  // TODO: 향후 감사 로그 시스템으로 전송
  // auditLogger.log('POST_STATUS_CHANGE', logData);
}

/**
 * 게시글 상태 일괄 검증
 */
export function validateBulkStatusChange(
  posts: PostData[],
  targetStatus: PostStatus
): {
  validPosts: string[];
  invalidPosts: { id: string; errors: string[] }[];
  warnings: { id: string; warnings: string[] }[];
} {
  const validPosts: string[] = [];
  const invalidPosts: { id: string; errors: string[] }[] = [];
  const warnings: { id: string; warnings: string[] }[] = [];

  for (const post of posts) {
    // 상태 전이 검증
    const transitionResult = validateStatusTransition(
      post.status,
      targetStatus
    );
    if (!transitionResult.success) {
      invalidPosts.push({
        id: post.id,
        errors: [transitionResult.error || '상태 전이 불가'],
      });
      continue;
    }

    // 필수 조건 검증
    const requirementResult = validatePostRequirements(post, targetStatus);
    if (!requirementResult.isValid) {
      invalidPosts.push({
        id: post.id,
        errors: requirementResult.errors,
      });
    } else {
      validPosts.push(post.id);
      if (requirementResult.warnings.length > 0) {
        warnings.push({
          id: post.id,
          warnings: requirementResult.warnings,
        });
      }
    }
  }

  return {
    validPosts,
    invalidPosts,
    warnings,
  };
}

/**
 * 상태 표시명 반환
 */
function getStatusDisplayName(status: PostStatus): string {
  const statusNames = {
    [PostStatus.DRAFT]: '초안',
    [PostStatus.PUBLISHED]: '게시됨',
    [PostStatus.ARCHIVED]: '아카이브됨',
  };

  return statusNames[status] || status;
}

/**
 * 필드 표시명 반환
 */
function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    title: '제목',
    content: '내용',
    slug: '슬러그',
    status: '상태',
  };

  return fieldNames[field] || field;
}

/**
 * 게시글 상태별 통계 계산
 */
export function calculatePostStatistics(posts: PostData[]): {
  total: number;
  byStatus: Record<PostStatus, number>;
  recentlyPublished: number;
  recentlyUpdated: number;
} {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const byStatus = {
    [PostStatus.DRAFT]: 0,
    [PostStatus.PUBLISHED]: 0,
    [PostStatus.ARCHIVED]: 0,
  };

  let recentlyPublished = 0;
  let recentlyUpdated = 0;

  for (const post of posts) {
    byStatus[post.status]++;

    if (post.publishedAt && post.publishedAt >= oneWeekAgo) {
      recentlyPublished++;
    }

    if (post.updatedAt >= oneWeekAgo) {
      recentlyUpdated++;
    }
  }

  return {
    total: posts.length,
    byStatus,
    recentlyPublished,
    recentlyUpdated,
  };
}
