import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    console.log('=== Auth Status Debug ===');

    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log('User:', user?.id, user?.email);
    console.log('Auth Error:', authError);
    console.log('Session:', session?.access_token ? 'EXISTS' : 'NONE');
    console.log('Session Error:', sessionError);

    return NextResponse.json({
      user: user
        ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
          }
        : null,
      authError: authError?.message || null,
      hasSession: !!session?.access_token,
      sessionError: sessionError?.message || null,
    });
  } catch (error) {
    console.error('Auth status debug error:', error);
    return NextResponse.json(
      {
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
