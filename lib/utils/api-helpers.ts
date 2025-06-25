import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, type UserSession } from '@/lib/auth/auth-service';
import type { ApiResponse as BaseApiResponse } from '@/types/database';

/**
 * API 에러 응답 표준화
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 500,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && typeof details === 'object' ? { details } : {}),
    },
    { status: statusCode }
  );
}

/**
 * API 성공 응답 표준화
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    },
    { status: statusCode }
  );
}

/**
 * 입력값 검증 미들웨어
 */
export async function validateInput<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<
  { success: true; data: T } | { success: false; response: NextResponse }
> {
  try {
    const body = await request.json();
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return {
        success: false,
        response: createErrorResponse(
          '입력값이 올바르지 않습니다.',
          400,
          validationResult.error.errors
        ),
      };
    }

    return {
      success: true,
      data: validationResult.data,
    };
  } catch {
    return {
      success: false,
      response: createErrorResponse('JSON 파싱 오류가 발생했습니다.', 400),
    };
  }
}

/**
 * 쿼리 파라미터 검증
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>,
  paramMap: Record<string, string>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const params: Record<string, unknown> = {};

    Object.entries(paramMap).forEach(([key, paramName]) => {
      const value = searchParams.get(paramName);
      if (value !== null) {
        params[key] = value;
      }
    });

    const validationResult = schema.safeParse(params);

    if (!validationResult.success) {
      return {
        success: false,
        response: createErrorResponse(
          '쿼리 파라미터가 올바르지 않습니다.',
          400,
          validationResult.error.errors
        ),
      };
    }

    return {
      success: true,
      data: validationResult.data,
    };
  } catch {
    return {
      success: false,
      response: createErrorResponse(
        '쿼리 파라미터 처리 중 오류가 발생했습니다.',
        400
      ),
    };
  }
}

/**
 * 인증 확인 미들웨어
 */
export async function checkAuth(): Promise<
  | { success: true; user: UserSession }
  | { success: false; response: NextResponse }
> {
  try {
    const user = await requireAuth();

    if (!user) {
      return {
        success: false,
        response: createErrorResponse('인증이 필요합니다.', 401),
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('인증 확인 중 오류 발생:', error);
    return {
      success: false,
      response: createErrorResponse('인증 확인 중 오류가 발생했습니다.', 500),
    };
  }
}

/**
 * 프로필 소유권 확인
 */
export async function checkProfileOwnership(): Promise<
  | { success: true; user: UserSession; profileId: string }
  | { success: false; response: NextResponse }
> {
  const authResult = await checkAuth();

  if (!authResult.success) {
    return authResult;
  }

  if (!authResult.user.profile) {
    return {
      success: false,
      response: createErrorResponse('프로필이 설정되지 않았습니다.', 400),
    };
  }

  return {
    success: true,
    user: authResult.user,
    profileId: authResult.user.profile.id,
  };
}

/**
 * 리소스 소유권 확인 (Phase 1: 본인 리소스만 접근 가능)
 */
export async function checkResourceOwnership(
  resourceAuthorId: string
): Promise<
  | { success: true; user: UserSession }
  | { success: false; response: NextResponse }
> {
  const ownershipResult = await checkProfileOwnership();

  if (!ownershipResult.success) {
    return ownershipResult;
  }

  if (ownershipResult.profileId !== resourceAuthorId) {
    return {
      success: false,
      response: createErrorResponse(
        '해당 리소스에 접근할 권한이 없습니다.',
        403
      ),
    };
  }

  return {
    success: true,
    user: ownershipResult.user,
  };
}

/**
 * API 핸들러 래퍼 - 공통 에러 처리
 */
export function withErrorHandler(
  handler: (request: NextRequest, params?: any) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context?: { params: any }
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context?.params);
    } catch (error) {
      console.error('API 핸들러 오류:', error);
      return createErrorResponse('서버 내부 오류가 발생했습니다.', 500);
    }
  };
}

/**
 * 경로 파라미터 검증
 */
export function validatePathParams(
  params: Record<string, unknown>,
  requiredParams: string[]
): { success: true } | { success: false; response: NextResponse } {
  for (const param of requiredParams) {
    if (!params[param]) {
      return {
        success: false,
        response: createErrorResponse(
          `필수 파라미터 '${param}'이(가) 누락되었습니다.`,
          400
        ),
      };
    }
  }

  return { success: true };
}

/**
 * 서비스 결과를 API 응답으로 변환
 */
export function convertServiceResultToResponse<T>(
  result: BaseApiResponse<T>,
  successStatusCode: number = 200
): NextResponse {
  if (!result.success) {
    // 에러 메시지에 따른 상태 코드 매핑
    let statusCode = 500;

    if (result.error === '인증이 필요합니다.') {
      statusCode = 401;
    } else if (
      result.error?.includes('권한이 없습니다') ||
      result.error?.includes('접근할 수 없습니다')
    ) {
      statusCode = 403;
    } else if (
      result.error?.includes('찾을 수 없습니다') ||
      result.error?.includes('존재하지 않습니다')
    ) {
      statusCode = 404;
    } else if (
      result.error?.includes('이미 존재합니다') ||
      result.error?.includes('올바르지 않습니다') ||
      result.error?.includes('필수') ||
      result.error?.includes('형식')
    ) {
      statusCode = 400;
    }

    return createErrorResponse(result.error || 'Unknown error', statusCode);
  }

  return createSuccessResponse(result.data, result.message, successStatusCode);
}

/**
 * 레이트 리미팅을 위한 키 생성
 */
export function createRateLimitKey(
  request: NextRequest,
  identifier: string
): string {
  // NextRequest에는 ip 속성이 없으므로 headers에서 IP를 추출
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${identifier}:${ip}:${userAgent}`;
}

/**
 * CORS 헤더 설정
 */
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  return response;
}

export type ApiResponse<T = unknown> = BaseApiResponse<T>;

export function createApiResponse<T>(
  data?: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createApiError(
  error: string,
  statusCode = 500
): ApiResponse<never> & { statusCode: number } {
  return {
    success: false,
    error,
    statusCode,
  };
}

export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): boolean {
  return allowedMethods.includes(request.method || 'GET');
}

export function extractPathParams(
  url: string,
  pattern: string
): Record<string, string> {
  const urlParts = url.split('/');
  const patternParts = pattern.split('/');
  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i];
    if (part?.startsWith('[') && part.endsWith(']')) {
      const paramName = part.slice(1, -1);
      const value = urlParts[i];
      if (value) {
        params[paramName] = value;
      }
    }
  }

  return params;
}

export async function handleApiError(
  error: unknown,
  context?: string
): Promise<Response> {
  console.error(`API 오류 ${context ? `(${context})` : ''}:`, error);

  let statusCode = 500;
  let message = '서버 내부 오류가 발생했습니다.';

  if (error instanceof Error) {
    // 특정 오류 유형별 처리
    if (
      error.message.includes('unauthorized') ||
      error.message.includes('인증')
    ) {
      statusCode = 401;
      message = '인증이 필요합니다.';
    } else if (
      error.message.includes('forbidden') ||
      error.message.includes('권한')
    ) {
      statusCode = 403;
      message = '접근 권한이 없습니다.';
    } else if (
      error.message.includes('not found') ||
      error.message.includes('찾을 수 없')
    ) {
      statusCode = 404;
      message = '요청한 리소스를 찾을 수 없습니다.';
    } else if (
      error.message.includes('validation') ||
      error.message.includes('유효하지')
    ) {
      statusCode = 400;
      message = '입력 데이터가 유효하지 않습니다.';
    }
  }

  try {
    return new Response(JSON.stringify(createApiError(message, statusCode)), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: '응답 생성 실패' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function parseRequestBody<T>(
  request: NextRequest
): Promise<T | null> {
  try {
    const contentType = request.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      return null;
    }

    const text = await request.text();
    if (!text.trim()) {
      return null;
    }

    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function corsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://dom-vlog.vercel.app',
    // 추가 허용 도메인들...
  ];

  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin
      ? origin
      : allowedOrigins[0]!,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function createJsonResponse<T>(
  data: ApiResponse<T>,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // 기본적인 HTML 태그 제거
    .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
    .replace(/on\w+=/gi, ''); // 이벤트 핸들러 제거
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function rateLimitCheck(
  identifier: string,
  _limit = 10,
  _windowMs = 60000
): Promise<boolean> {
  // 실제 구현에서는 Redis나 메모리 저장소 사용
  // 현재는 기본적인 구현만 제공
  const _now = Date.now();
  const _key = `rate_limit_${identifier}`;

  // 실제 환경에서는 외부 저장소 사용
  // 여기서는 간단한 메모리 기반 구현
  return true; // 임시로 항상 허용
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

export function logApiRequest(
  method: string,
  url: string,
  userAgent?: string,
  ip?: string
): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent} (${ip})`);
}

export function generateRequestId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaultLimit = 20,
  maxLimit = 100
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(
    maxLimit,
    Math.max(
      1,
      parseInt(searchParams.get('limit') || defaultLimit.toString(), 10)
    )
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export type SortParams = {
  field: string;
  direction: 'asc' | 'desc';
};

export function parseSortParams(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField = 'createdAt',
  defaultDirection: 'asc' | 'desc' = 'desc'
): SortParams {
  const field = searchParams.get('sortBy') || defaultField;
  const direction =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultDirection;

  // 허용된 필드인지 확인
  if (!allowedFields.includes(field)) {
    return { field: defaultField, direction: defaultDirection };
  }

  // 방향 유효성 검증
  if (!['asc', 'desc'].includes(direction)) {
    return { field, direction: defaultDirection };
  }

  return { field, direction };
}

export function createMetaPagination(
  total: number,
  page: number,
  limit: number
): {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const pages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          reject(error);
          return;
        }
        await sleep(delay * attempt);
      }
    }
  });
}

// 공통 HTTP 상태 코드 매핑
const ERROR_STATUS_MAP: Record<string, number> = {
  '인증이 필요합니다.': 401,
  '권한이 없습니다': 403,
  '접근할 수 없습니다': 403,
  '찾을 수 없습니다': 404,
  '존재하지 않습니다': 404,
  '이미 존재합니다': 400,
  '올바르지 않습니다': 400,
  필수: 400,
  형식: 400,
} as const;

/**
 * 표준화된 API 응답 생성기
 */
export class ApiResponseBuilder {
  static success<T>(
    data?: T,
    message?: string,
    statusCode: number = 200
  ): NextResponse {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }

  static error(
    error: string,
    statusCode?: number,
    details?: unknown
  ): NextResponse {
    const resolvedStatusCode = statusCode || this.getStatusCodeFromError(error);

    return NextResponse.json(
      {
        success: false,
        error,
        details,
        timestamp: new Date().toISOString(),
      },
      { status: resolvedStatusCode }
    );
  }

  static validation(
    message: string,
    errors: Record<string, string[]>
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
        validationErrors: errors,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  private static getStatusCodeFromError(error: string): number {
    for (const [keyword, statusCode] of Object.entries(ERROR_STATUS_MAP)) {
      if (error.includes(keyword)) {
        return statusCode;
      }
    }
    return 500; // 기본값
  }
}

/**
 * 공통 검증 로직
 */
export class ValidationHelper {
  static checkRequired(
    params: Record<string, unknown>,
    requiredFields: string[]
  ): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};

    for (const field of requiredFields) {
      const value = params[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = [`${field}은(는) 필수 입력 항목입니다.`];
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateStringLength(
    value: string,
    fieldName: string,
    min?: number,
    max?: number
  ): string[] {
    const errors: string[] = [];

    if (min && value.length < min) {
      errors.push(`${fieldName}은(는) ${min}자 이상이어야 합니다.`);
    }

    if (max && value.length > max) {
      errors.push(`${fieldName}은(는) ${max}자 이하여야 합니다.`);
    }

    return errors;
  }

  static validatePattern(
    value: string,
    pattern: RegExp,
    fieldName: string,
    message: string
  ): string[] {
    return pattern.test(value) ? [] : [`${fieldName}: ${message}`];
  }
}

/**
 * API 라우트 핸들러 래퍼
 */
export function withApiHandler<T extends Record<string, unknown>>(
  handler: (params: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      const params = Object.fromEntries(searchParams.entries()) as T;

      return await handler(params);
    } catch (error) {
      console.error('API 핸들러 오류:', error);
      return ApiResponseBuilder.error('서버 내부 오류가 발생했습니다.', 500);
    }
  };
}
