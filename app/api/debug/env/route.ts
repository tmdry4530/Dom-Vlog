import { NextResponse } from 'next/server';

export async function GET() {
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    hasGoogleAIKey: !!process.env.GOOGLE_AI_API_KEY,
    googleAIKeyPrefix: process.env.GOOGLE_AI_API_KEY
      ? process.env.GOOGLE_AI_API_KEY.substring(0, 10) + '...'
      : 'NOT_SET',
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: envStatus,
    message: '환경 변수 상태 확인 완료',
  });
}
