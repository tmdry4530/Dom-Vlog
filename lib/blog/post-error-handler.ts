import { ApiResponse } from '@/types/database';

// 게시글 관련 에러 코드 정의
export const POST_ERROR_CODES = {
  // 인증/권한 에러
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // 리소스 에러
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  SLUG_ALREADY_EXISTS: 'SLUG_ALREADY_EXISTS',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',

  // 검증 에러
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  REQUIRED_FIELDS_MISSING: 'REQUIRED_FIELDS_MISSING',
  INVALID_INPUT_FORMAT: 'INVALID_INPUT_FORMAT',
  CONTENT_TOO_SHORT: 'CONTENT_TOO_SHORT',
  TITLE_TOO_LONG: 'TITLE_TOO_LONG',

  // 비즈니스 로직 에러
  CANNOT_DELETE_PUBLISHED: 'CANNOT_DELETE_PUBLISHED',
  BULK_OPERATION_FAILED: 'BULK_OPERATION_FAILED',

  // 시스템 에러
  DATABASE_ERROR: 'DATABASE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
} as const;

export type PostErrorCode =
  (typeof POST_ERROR_CODES)[keyof typeof POST_ERROR_CODES];

// 에러 정보 인터페이스
export interface PostError {
  code: PostErrorCode;
  message: string;
  details?: unknown;
  field?: string;
  statusCode: number;
}

// 에러 메시지 매핑
export const ERROR_MESSAGES: Record<PostErrorCode, string> = {
  [POST_ERROR_CODES.UNAUTHORIZED]: '인증이 필요합니다.',
  [POST_ERROR_CODES.FORBIDDEN]: '해당 작업을 수행할 권한이 없습니다.',
  [POST_ERROR_CODES.POST_NOT_FOUND]: '포스트를 찾을 수 없습니다.',
  [POST_ERROR_CODES.SLUG_ALREADY_EXISTS]: '이미 사용 중인 슬러그입니다.',
  [POST_ERROR_CODES.CATEGORY_NOT_FOUND]: '카테고리를 찾을 수 없습니다.',
  [POST_ERROR_CODES.INVALID_STATUS_TRANSITION]:
    '유효하지 않은 상태 전이입니다.',
  [POST_ERROR_CODES.REQUIRED_FIELDS_MISSING]:
    '필수 입력 항목이 누락되었습니다.',
  [POST_ERROR_CODES.INVALID_INPUT_FORMAT]: '입력 형식이 올바르지 않습니다.',
  [POST_ERROR_CODES.CONTENT_TOO_SHORT]: '게시글 내용이 너무 짧습니다.',
  [POST_ERROR_CODES.TITLE_TOO_LONG]: '제목이 너무 깁니다.',
  [POST_ERROR_CODES.CANNOT_DELETE_PUBLISHED]:
    '게시된 포스트는 삭제할 수 없습니다.',
  [POST_ERROR_CODES.BULK_OPERATION_FAILED]: '일괄 작업 중 일부가 실패했습니다.',
  [POST_ERROR_CODES.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',
  [POST_ERROR_CODES.AI_SERVICE_ERROR]: 'AI 서비스 오류가 발생했습니다.',
  [POST_ERROR_CODES.EXTERNAL_API_ERROR]: '외부 API 오류가 발생했습니다.',
};

// HTTP 상태 코드 매핑
export const ERROR_STATUS_CODES: Record<PostErrorCode, number> = {
  [POST_ERROR_CODES.UNAUTHORIZED]: 401,
  [POST_ERROR_CODES.FORBIDDEN]: 403,
  [POST_ERROR_CODES.POST_NOT_FOUND]: 404,
  [POST_ERROR_CODES.SLUG_ALREADY_EXISTS]: 409,
  [POST_ERROR_CODES.CATEGORY_NOT_FOUND]: 404,
  [POST_ERROR_CODES.INVALID_STATUS_TRANSITION]: 400,
  [POST_ERROR_CODES.REQUIRED_FIELDS_MISSING]: 400,
  [POST_ERROR_CODES.INVALID_INPUT_FORMAT]: 400,
  [POST_ERROR_CODES.CONTENT_TOO_SHORT]: 400,
  [POST_ERROR_CODES.TITLE_TOO_LONG]: 400,
  [POST_ERROR_CODES.CANNOT_DELETE_PUBLISHED]: 409,
  [POST_ERROR_CODES.BULK_OPERATION_FAILED]: 207, // Multi-Status
  [POST_ERROR_CODES.DATABASE_ERROR]: 500,
  [POST_ERROR_CODES.AI_SERVICE_ERROR]: 502,
  [POST_ERROR_CODES.EXTERNAL_API_ERROR]: 502,
};

/**
 * 게시글 에러 생성
 */
export function createPostError(
  code: PostErrorCode,
  customMessage?: string,
  details?: unknown,
  field?: string
): PostError {
  return {
    code,
    message: customMessage || ERROR_MESSAGES[code],
    details,
    field,
    statusCode: ERROR_STATUS_CODES[code],
  };
}

/**
 * 게시글 에러를 ApiResponse로 변환
 */
export function postErrorToApiResponse<T = null>(
  error: PostError
): ApiResponse<T> {
  return {
    success: false,
    error: error.message,
    ...(error.details && typeof error.details === 'object'
      ? { details: error.details }
      : {}),
  };
}

/**
 * Prisma 에러를 게시글 에러로 변환
 */
export function handlePrismaError(error: unknown): PostError {
  // 에러 타입 확인
  const prismaError = error as {
    code?: string;
    meta?: Record<string, unknown>;
  };

  // Prisma 에러 코드별 처리
  switch (prismaError.code) {
    case 'P2002':
      // Unique constraint failed
      const target = (prismaError.meta?.target as string[])?.[0];
      if (target === 'slug') {
        return createPostError(
          POST_ERROR_CODES.SLUG_ALREADY_EXISTS,
          undefined,
          { constraint: 'slug' }
        );
      }
      return createPostError(
        POST_ERROR_CODES.DATABASE_ERROR,
        '중복된 값이 존재합니다.',
        prismaError.meta
      );

    case 'P2025':
      // Record not found
      return createPostError(POST_ERROR_CODES.POST_NOT_FOUND);

    case 'P2003':
      // Foreign key constraint failed
      return createPostError(
        POST_ERROR_CODES.CATEGORY_NOT_FOUND,
        '연결된 리소스를 찾을 수 없습니다.',
        prismaError.meta
      );

    case 'P2034':
      // Transaction failed due to write conflict
      return createPostError(
        POST_ERROR_CODES.DATABASE_ERROR,
        '동시성 충돌이 발생했습니다. 다시 시도해주세요.'
      );

    default:
      console.error('Unhandled Prisma error:', prismaError);
      return createPostError(
        POST_ERROR_CODES.DATABASE_ERROR,
        '데이터베이스 작업 중 오류가 발생했습니다.',
        { prismaError: prismaError.code }
      );
  }
}

/**
 * 일반 에러를 게시글 에러로 변환
 */
export function handleGenericError(
  error: unknown,
  operation: string
): PostError {
  const errorObj = error as { code?: string; message?: string };

  // 네트워크 에러
  if (errorObj.code === 'ECONNREFUSED' || errorObj.code === 'ENOTFOUND') {
    return createPostError(
      POST_ERROR_CODES.EXTERNAL_API_ERROR,
      '외부 서비스 연결에 실패했습니다.'
    );
  }

  // 타임아웃 에러
  if (errorObj.code === 'ETIMEDOUT') {
    return createPostError(
      POST_ERROR_CODES.EXTERNAL_API_ERROR,
      '요청 시간이 초과되었습니다.'
    );
  }

  // AI 서비스 관련 에러
  if (errorObj.message?.includes('AI') || errorObj.message?.includes('model')) {
    return createPostError(
      POST_ERROR_CODES.AI_SERVICE_ERROR,
      'AI 서비스 처리 중 오류가 발생했습니다.'
    );
  }

  console.error(`Unhandled error in ${operation}:`, error);
  return createPostError(
    POST_ERROR_CODES.DATABASE_ERROR,
    `${operation} 중 예상치 못한 오류가 발생했습니다.`
  );
}

/**
 * 비즈니스 로직 검증 에러 처리
 */
export function validateBusinessRules(
  operation: string,
  data: Record<string, unknown>
): PostError | null {
  switch (operation) {
    case 'delete_published_post':
      if (data.status === 'PUBLISHED') {
        return createPostError(
          POST_ERROR_CODES.CANNOT_DELETE_PUBLISHED,
          '게시된 포스트는 삭제할 수 없습니다. 먼저 초안으로 변경해주세요.'
        );
      }
      break;

    case 'publish_empty_content':
      if (!data.content || data.content.trim().length < 10) {
        return createPostError(
          POST_ERROR_CODES.CONTENT_TOO_SHORT,
          '게시하려면 최소 10자 이상의 내용이 필요합니다.',
          undefined,
          'content'
        );
      }
      break;

    case 'validate_title_length':
      if (data.title && data.title.length > 100) {
        return createPostError(
          POST_ERROR_CODES.TITLE_TOO_LONG,
          '제목은 100자를 초과할 수 없습니다.',
          { currentLength: data.title.length, maxLength: 100 },
          'title'
        );
      }
      break;
  }

  return null;
}

/**
 * 에러 로깅 및 모니터링
 */
export function logPostError(
  error: PostError,
  context: {
    operation: string;
    userId?: string;
    postId?: string;
    timestamp?: Date;
  }
): void {
  const logData = {
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      ...(error.details && typeof error.details === 'object'
        ? { details: error.details }
        : {}),
      ...(error.field ? { field: error.field } : {}),
    },
    context: {
      ...context,
      timestamp: context.timestamp || new Date(),
    },
  };

  // 에러 레벨에 따른 로깅
  if (error.statusCode >= 500) {
    console.error('CRITICAL POST ERROR:', JSON.stringify(logData, null, 2));
  } else if (error.statusCode >= 400) {
    console.warn('POST ERROR:', JSON.stringify(logData, null, 2));
  } else {
    console.info('POST INFO:', JSON.stringify(logData, null, 2));
  }

  // TODO: 향후 모니터링 시스템으로 전송
  // monitoringService.reportError(logData);
}

/**
 * 에러 복구 전략 제안
 */
export function suggestErrorRecovery(error: PostError): string[] {
  const suggestions: string[] = [];

  switch (error.code) {
    case POST_ERROR_CODES.SLUG_ALREADY_EXISTS:
      suggestions.push('다른 슬러그를 사용해보세요');
      suggestions.push('제목을 변경하면 자동으로 새로운 슬러그가 생성됩니다');
      break;

    case POST_ERROR_CODES.REQUIRED_FIELDS_MISSING:
      suggestions.push('누락된 필수 항목을 입력해주세요');
      suggestions.push('임시 저장 후 나중에 완성할 수 있습니다');
      break;

    case POST_ERROR_CODES.CONTENT_TOO_SHORT:
      suggestions.push('내용을 더 자세히 작성해주세요');
      suggestions.push('초안으로 저장하여 나중에 완성할 수 있습니다');
      break;

    case POST_ERROR_CODES.CANNOT_DELETE_PUBLISHED:
      suggestions.push('포스트를 초안으로 변경한 후 삭제하세요');
      suggestions.push('아카이브 상태로 변경하여 숨길 수 있습니다');
      break;

    case POST_ERROR_CODES.DATABASE_ERROR:
      suggestions.push('잠시 후 다시 시도해주세요');
      suggestions.push('문제가 지속되면 관리자에게 문의하세요');
      break;

    case POST_ERROR_CODES.AI_SERVICE_ERROR:
      suggestions.push('AI 기능 없이 수동으로 작업을 완료할 수 있습니다');
      suggestions.push('잠시 후 AI 기능을 다시 시도해주세요');
      break;
  }

  return suggestions;
}

/**
 * 에러 발생 시 사용자 친화적 메시지 생성
 */
export function generateUserFriendlyMessage(error: PostError): {
  title: string;
  message: string;
  suggestions: string[];
  severity: 'error' | 'warning' | 'info';
} {
  const suggestions = suggestErrorRecovery(error);

  let severity: 'error' | 'warning' | 'info' = 'error';
  if (error.statusCode < 500) {
    severity = error.statusCode < 400 ? 'info' : 'warning';
  }

  const titles: Record<PostErrorCode, string> = {
    [POST_ERROR_CODES.UNAUTHORIZED]: '로그인 필요',
    [POST_ERROR_CODES.FORBIDDEN]: '권한 없음',
    [POST_ERROR_CODES.POST_NOT_FOUND]: '포스트 없음',
    [POST_ERROR_CODES.SLUG_ALREADY_EXISTS]: '슬러그 중복',
    [POST_ERROR_CODES.CATEGORY_NOT_FOUND]: '카테고리 없음',
    [POST_ERROR_CODES.INVALID_STATUS_TRANSITION]: '상태 변경 불가',
    [POST_ERROR_CODES.REQUIRED_FIELDS_MISSING]: '필수 항목 누락',
    [POST_ERROR_CODES.INVALID_INPUT_FORMAT]: '입력 형식 오류',
    [POST_ERROR_CODES.CONTENT_TOO_SHORT]: '내용 부족',
    [POST_ERROR_CODES.TITLE_TOO_LONG]: '제목 너무 긺',
    [POST_ERROR_CODES.CANNOT_DELETE_PUBLISHED]: '삭제 불가',
    [POST_ERROR_CODES.BULK_OPERATION_FAILED]: '일괄 작업 실패',
    [POST_ERROR_CODES.DATABASE_ERROR]: '시스템 오류',
    [POST_ERROR_CODES.AI_SERVICE_ERROR]: 'AI 서비스 오류',
    [POST_ERROR_CODES.EXTERNAL_API_ERROR]: '외부 서비스 오류',
  };

  return {
    title: titles[error.code],
    message: error.message,
    suggestions,
    severity,
  };
}
