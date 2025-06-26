import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/client';

export async function GET() {
  try {
    // Supabase 설정 확인
    const { data: _data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 연결 오류',
        details: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 성공',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      note: 'OAuth 제공자는 Supabase Dashboard에서 활성화해야 합니다.',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '설정 확인 중 오류 발생',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
