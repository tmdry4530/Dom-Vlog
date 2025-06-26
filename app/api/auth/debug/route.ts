import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/client';

export async function GET() {
  try {
    // 현재 세션 상태 확인
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    // 사용자 정보 확인
    const { data: userData, error: userError } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
      session: {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userEmail: sessionData.session?.user?.email || null,
        sessionError: sessionError?.message || null,
      },
      user: {
        hasUser: !!userData.user,
        userEmail: userData.user?.email || null,
        userError: userError?.message || null,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '디버그 정보 조회 중 오류 발생',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
