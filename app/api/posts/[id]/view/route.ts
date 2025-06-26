import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    // 포스트 존재 확인 및 조회수 증가
    const post = await prisma.post.update({
      where: {
        id,
        status: 'PUBLISHED', // 공개된 포스트만
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        viewCount: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          viewCount: post.viewCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('조회수 증가 오류:', error);

    // 포스트가 없거나 권한이 없는 경우도 조용히 처리
    return NextResponse.json(
      {
        success: false,
        error: '조회수 증가에 실패했습니다.',
      },
      { status: 404 }
    );
  }
}
