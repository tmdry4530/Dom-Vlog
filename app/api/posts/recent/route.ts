import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 최근 5개 글 조회
    const recentPosts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 5,
    });

    // 데이터 형태 변환
    const posts = recentPosts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      date:
        post.publishedAt
          ?.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replace(/\. /g, '.')
          .replace(/\.$/, '') || '',
    }));

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('최근 글 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '최근 글 데이터를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
