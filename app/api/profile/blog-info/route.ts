import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 첫 번째 프로필 정보 조회 (Phase 1이므로 단일 사용자)
    const profile = await prisma.profile.findFirst({
      select: {
        displayName: true,
        blogTitle: true,
        blogSubtitle: true,
        avatar: true,
        github: true,
        twitter: true,
        linkedin: true,
        email: true,
      },
    });

    if (!profile) {
      return NextResponse.json({
        success: true,
        data: {
          displayName: 'Dom Vlog',
          blogTitle: 'Dom Vlog',
          blogSubtitle: 'AI 기반 개발자 블로그',
          avatar: null,
          github: null,
          twitter: null,
          linkedin: null,
          email: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('블로그 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '블로그 정보를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
