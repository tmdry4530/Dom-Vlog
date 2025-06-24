import { NextRequest, NextResponse } from 'next/server';
import { StyleEnhancer } from '@/ai/processors/style-enhancer';
import { styleUpgradeRequestSchema } from '@/lib/validations/ai';
import type { StyleUpgradeRequest, StyleUpgradeResponse } from '@/types/ai';

// AI 스타일 업그레이드 API 엔드포인트
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 AI Style Upgrade API 요청 시작');

    // 요청 본문 파싱
    const body = await request.json();
    console.log('📥 요청 데이터:', {
      contentLength: body.content?.length || 0,
      contentType: body.contentType,
      hasOptions: !!body.options,
    });

    // 입력 검증
    const validationResult = styleUpgradeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '입력 데이터가 유효하지 않습니다.',
          message: validationResult.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', '),
        } as StyleUpgradeResponse,
        { status: 400 }
      );
    }

    const styleRequest: StyleUpgradeRequest = validationResult.data;

    // 콘텐츠 길이 체크 (추가 안전장치)
    if (styleRequest.content.length > 50000) {
      return NextResponse.json(
        {
          success: false,
          error: '콘텐츠가 너무 깁니다.',
          message: '최대 50,000자까지 처리 가능합니다.',
        } as StyleUpgradeResponse,
        { status: 413 }
      );
    }

    // 빈 콘텐츠 체크
    if (!styleRequest.content.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: '콘텐츠가 비어있습니다.',
          message: '스타일을 개선할 콘텐츠를 입력해주세요.',
        } as StyleUpgradeResponse,
        { status: 400 }
      );
    }

    // AI 스타일 업그레이드 처리
    const styleEnhancer = new StyleEnhancer();

    // Google AI API 키가 없는 경우 개발 모드에서 모의 응답 제공
    if (
      !process.env.GOOGLE_AI_API_KEY &&
      process.env.NODE_ENV === 'development'
    ) {
      console.warn(
        '⚠️ GOOGLE_AI_API_KEY가 설정되지 않음. 개발 모드 모의 응답을 반환합니다.'
      );

      // 모의 스타일 업그레이드 결과 생성
      const mockResult = {
        processedContent:
          styleRequest.content +
          '\n\n<!-- AI 스타일 업그레이드 적용됨 (모의 응답) -->',
        readabilityScore: {
          score: 85,
          breakdown: {
            headingStructure: 90,
            codeQuality: 80,
            contentClarity: 85,
            technicalAccuracy: 88,
          },
          suggestions: [
            '코드 블록에 언어 지정이 추가되었습니다.',
            '제목 구조가 개선되었습니다.',
            '가독성이 향상되었습니다.',
          ],
        },
        improvements: [
          '코드 블록 포맷팅 개선',
          '제목 구조 최적화',
          '전체적인 가독성 향상',
        ],
        processingMetrics: {
          duration: 250,
          aiCalls: 2,
          tokensUsed: 150,
        },
      };

      const response: StyleUpgradeResponse = {
        success: true,
        data: {
          enhancedContent: mockResult.processedContent,
          readabilityScore: mockResult.readabilityScore.score,
          improvements: mockResult.improvements,
          processingTime: mockResult.processingMetrics.duration,
          metadata: {
            originalLength: styleRequest.content.length,
            enhancedLength: mockResult.processedContent.length,
            improvementRatio: Math.round(
              ((mockResult.readabilityScore.score - 70) / 70) * 100
            ),
          },
        },
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Mock-Response': 'true', // 모의 응답임을 표시
        },
      });
    }

    console.log('🔧 StyleEnhancer 시작...');
    console.log('📋 요청 내용:', {
      contentLength: styleRequest.content.length,
      contentType: styleRequest.contentType,
      options: styleRequest.options,
    });

    let result;
    try {
      result = await styleEnhancer.enhanceContent(styleRequest);
      console.log('✅ StyleEnhancer 완료:', {
        processingTime: result.processingMetrics.duration,
        readabilityScore: result.readabilityScore.score,
      });
    } catch (enhanceError) {
      console.error('❌ StyleEnhancer 상세 오류:', enhanceError);
      console.error(
        '❌ 오류 스택:',
        enhanceError instanceof Error ? enhanceError.stack : 'No stack'
      );
      throw enhanceError;
    }

    // 성공 응답
    const response: StyleUpgradeResponse = {
      success: true,
      data: {
        enhancedContent: result.processedContent,
        readabilityScore: result.readabilityScore.score,
        improvements: result.improvements,
        processingTime: result.processingMetrics.duration,
        metadata: {
          originalLength: styleRequest.content.length,
          enhancedLength: result.processedContent.length,
          improvementRatio: Math.round(
            ((result.readabilityScore.score - 70) / 70) * 100
          ), // 기본 점수 70 대비 개선율
        },
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // AI 응답은 캐시하지 않음
      },
    });
  } catch (error) {
    console.error('❌ AI 스타일 업그레이드 API 오류:', error);
    console.error(
      '오류 스택:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    // 에러 타입별 응답 처리
    if (error instanceof Error) {
      // Gemini API 관련 오류
      if (error.message.includes('API 키')) {
        return NextResponse.json(
          {
            success: false,
            error: 'AI 서비스 설정 오류',
            message: 'AI 서비스에 연결할 수 없습니다.',
          } as StyleUpgradeResponse,
          { status: 503 }
        );
      }

      if (error.message.includes('할당량') || error.message.includes('QUOTA')) {
        return NextResponse.json(
          {
            success: false,
            error: 'AI 서비스 한도 초과',
            message: '일일 사용량이 초과되었습니다. 내일 다시 시도해주세요.',
          } as StyleUpgradeResponse,
          { status: 429 }
        );
      }

      if (
        error.message.includes('요청 한도') ||
        error.message.includes('RATE_LIMIT')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'AI 서비스 요청 한도 초과',
            message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
          } as StyleUpgradeResponse,
          { status: 429 }
        );
      }

      if (error.message.includes('안전') || error.message.includes('SAFETY')) {
        return NextResponse.json(
          {
            success: false,
            error: '콘텐츠 안전 정책 위반',
            message: '제공된 콘텐츠가 안전 가이드라인을 위반했습니다.',
          } as StyleUpgradeResponse,
          { status: 400 }
        );
      }
    }

    // 일반적인 서버 오류
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류',
        message: 'AI 스타일 업그레이드 처리 중 오류가 발생했습니다.',
      } as StyleUpgradeResponse,
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 지원 (CORS)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

// GET 메서드 - API 상태 및 정보 제공
export async function GET() {
  return NextResponse.json(
    {
      name: 'AI Style Upgrade API',
      version: '1.0.0',
      description: 'AI를 사용하여 블로그 글의 스타일과 가독성을 개선합니다.',
      endpoints: {
        POST: {
          description: '콘텐츠 스타일 업그레이드 수행',
          parameters: {
            content: 'string (required) - 개선할 콘텐츠',
            contentType: "'markdown' | 'html' (required) - 콘텐츠 타입",
            options: {
              includeTableOfContents: 'boolean (optional) - 목차 생성 여부',
              enhanceCodeBlocks: 'boolean (optional) - 코드 블록 개선 여부',
              improveHeadingStructure:
                'boolean (optional) - 제목 구조 개선 여부',
              optimizeForSEO: 'boolean (optional) - SEO 최적화 여부',
            },
          },
          responses: {
            200: 'StyleUpgradeResponse - 성공적인 처리 결과',
            400: 'StyleUpgradeResponse - 잘못된 요청',
            413: 'StyleUpgradeResponse - 콘텐츠 크기 초과',
            429: 'StyleUpgradeResponse - 요청 한도 초과',
            500: 'StyleUpgradeResponse - 서버 오류',
            503: 'StyleUpgradeResponse - AI 서비스 오류',
          },
        },
      },
      limits: {
        maxContentLength: 50000,
        rateLimit: '10 requests per minute',
      },
      supportedFeatures: [
        '마크다운 및 HTML 콘텐츠 처리',
        '코드 블록 포맷팅 개선',
        '제목 구조 최적화',
        '가독성 점수 계산',
        '개선 사항 추출',
        '목차 자동 생성',
        'SEO 친화적 구조 개선',
      ],
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // API 정보는 1시간 캐시
      },
    }
  );
}
