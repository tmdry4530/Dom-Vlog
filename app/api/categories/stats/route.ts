import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 카테고리별 포스트 수 조회
    const categoryStats = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        posts: {
          where: {
            post: {
              status: 'PUBLISHED',
            },
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // 데이터 형태 변환
    const categories = categoryStats.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      count: category.posts.length,
    }));

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('카테고리 통계 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '카테고리 데이터를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
