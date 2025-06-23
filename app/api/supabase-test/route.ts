import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    // 환경변수 검증
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase 환경변수가 설정되지 않았습니다.',
          details:
            'NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 .env.local에 설정해주세요.',
        },
        { status: 500 }
      );
    }

    // Supabase 클라이언트 생성 및 연결 테스트
    const supabase = await createClient();

    // 간단한 인증 상태 확인으로 연결 테스트
    const { error: authError } = await supabase.auth.getUser();

    // 인증 에러가 아닌 연결 에러만 체크 (사용자가 로그인하지 않은 것은 정상)
    if (authError && authError.message !== 'Auth session missing!') {
      throw authError;
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 성공! 데이터베이스가 정상적으로 연결되었습니다.',
      supabaseUrl: supabaseUrl.replace(/\/$/g, ''),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Supabase 연결 테스트 실패:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Supabase 연결에 실패했습니다.',
        details:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
