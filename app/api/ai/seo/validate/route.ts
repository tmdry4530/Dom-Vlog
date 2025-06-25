import { NextRequest, NextResponse } from 'next/server';
import { seoValidationService } from '@/lib/ai/seo/seoValidationService';
import { seoValidationRequestSchema } from '@/lib/validations/ai';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 데이터 검증
    const validatedData = seoValidationRequestSchema.parse(body);

    // SEO 검증 수행
    const validationResult =
      await seoValidationService.validateSEO(validatedData);

    return NextResponse.json({
      success: true,
      data: validationResult,
    });
  } catch (error) {
    console.error('SEO validation API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'SEO 검증 중 알 수 없는 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SEO Validation API',
    usage: 'POST /api/ai/seo/validate',
    parameters: {
      content: 'string (required) - HTML/Markdown content to validate',
      metadata: 'object (optional) - title, description, keywords',
      url: 'string (optional) - URL for validation',
    },
    example: {
      content: '<h1>제목</h1><p>콘텐츠...</p>',
      metadata: {
        title: '페이지 제목',
        description: '페이지 설명',
        keywords: ['키워드1', '키워드2'],
      },
    },
  });
}
