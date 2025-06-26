import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/prisma';

export async function GET() {
  try {
    // 기본 상태 점검
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      version: '1.0.0',
      services: {} as Record<string, { status: string; message?: string }>,
    };

    // 데이터베이스 연결 확인
    try {
      const dbHealth = await connectDatabase();
      healthCheck.services.database = {
        status: dbHealth.success ? 'healthy' : 'unhealthy',
        message: dbHealth.success ? 'Connected' : 'Connection failed',
      };
    } catch (_error) {
      healthCheck.services.database = {
        status: 'unhealthy',
        message: 'Database connection error',
      };
    }

    // AI 서비스 확인 (환경변수만 체크)
    healthCheck.services.ai = {
      status: process.env.GOOGLE_AI_API_KEY ? 'configured' : 'not-configured',
      message: process.env.GOOGLE_AI_API_KEY
        ? 'API key present'
        : 'API key missing',
    };

    // Supabase 설정 확인
    const supabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    healthCheck.services.supabase = {
      status: supabaseConfigured ? 'configured' : 'not-configured',
      message: supabaseConfigured
        ? 'Credentials present'
        : 'Credentials missing',
    };

    // 전체 상태 결정
    const allServicesHealthy = Object.values(healthCheck.services).every(
      (service) =>
        service.status === 'healthy' || service.status === 'configured'
    );

    if (!allServicesHealthy) {
      healthCheck.status = 'degraded';
    }

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}

// 다른 HTTP 메서드는 지원하지 않음
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
