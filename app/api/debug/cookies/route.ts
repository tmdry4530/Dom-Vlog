import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(_request: NextRequest) {
  try {
    console.log('=== Cookie Debug ===');

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    console.log('All cookies:', allCookies);

    // Supabase 관련 쿠키 찾기
    const supabaseCookies = allCookies.filter(
      (cookie) =>
        cookie.name.includes('supabase') ||
        cookie.name.includes('sb-') ||
        cookie.name.includes('auth')
    );

    console.log('Supabase cookies:', supabaseCookies);

    return NextResponse.json({
      totalCookies: allCookies.length,
      allCookies: allCookies.map((c) => ({
        name: c.name,
        hasValue: !!c.value,
      })),
      supabaseCookies: supabaseCookies.map((c) => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value?.length || 0,
      })),
    });
  } catch (error) {
    console.error('Cookie debug error:', error);
    return NextResponse.json(
      {
        error: 'Cookie debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
