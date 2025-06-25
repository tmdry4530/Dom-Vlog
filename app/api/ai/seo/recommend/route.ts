/**
 * SEO 메타데이터 추천 API 엔드포인트
 * POST /api/ai/seo/recommend
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { seoRecommendationService } from '@/lib/ai/seo/seoRecommendationService';
import {
  SeoRecommendationRequest,
  SeoRecommendationResponse,
  SEO_ERROR_CODES,
} from '@/types/seo';

// 요청 검증 스키마
const recommendRequestSchema = z.object({
  content: z.string().min(100, 'Content must be at least 100 characters long'),
  title: z.string().min(1, 'Title is required'),
  contentType: z.enum(['markdown', 'html']),
  targetKeywords: z.array(z.string()).optional(),
  options: z
    .object({
      generateSlug: z.boolean().optional(),
      optimizeForMobile: z.boolean().optional(),
      includeSchema: z.boolean().optional(),
      language: z.enum(['ko', 'en']).optional(),
    })
    .optional(),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<SeoRecommendationResponse>> {
  try {
    // 요청 본문 파싱
    const body = await request.json();

    // 입력 검증
    const validationResult = recommendRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const requestData: SeoRecommendationRequest = validationResult.data;

    // SEO 추천 서비스 호출
    const result =
      await seoRecommendationService.recommendMetadata(requestData);

    if (!result.success) {
      // 에러 타입에 따른 HTTP 상태 코드 결정
      let statusCode = 500;
      if (result.error?.code === SEO_ERROR_CODES.INVALID_CONTENT) {
        statusCode = 400;
      } else if (result.error?.code === SEO_ERROR_CODES.CONTENT_TOO_LONG) {
        statusCode = 413;
      } else if (result.error?.code === SEO_ERROR_CODES.API_QUOTA_EXCEEDED) {
        statusCode = 429;
      } else if (result.error?.code === SEO_ERROR_CODES.TIMEOUT_ERROR) {
        statusCode = 408;
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || 'SEO recommendation failed',
          details: result.error,
          processing: result.metrics
            ? {
                timeMs: result.metrics.processingTimeMs,
                model: result.metrics.model,
                wordsAnalyzed: result.metrics.wordsAnalyzed,
              }
            : undefined,
        },
        { status: statusCode }
      );
    }

    // 성공 응답
    const response: SeoRecommendationResponse = {
      success: true,
      data: result.data!,
      processing: result.metrics
        ? {
            timeMs: result.metrics.processingTimeMs,
            model: result.metrics.model,
            wordsAnalyzed: result.metrics.wordsAnalyzed,
          }
        : undefined,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('SEO recommendation API error:', error);

    // 예상치 못한 에러 처리
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: {
          code: SEO_ERROR_CODES.PROCESSING_FAILED,
          message:
            'An unexpected error occurred while processing SEO recommendation',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}

// GET 메서드는 지원하지 않음
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only supports POST requests',
    },
    { status: 405 }
  );
}

// 요청 크기 제한 (1MB)
export const maxDuration = 30; // 30초 타임아웃
export const runtime = 'nodejs';
