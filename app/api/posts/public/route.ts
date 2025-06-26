import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostStatus } from '@/lib/generated/prisma';

// 공개 포스트 목록 조회 (인증 불필요)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // 기본 조건: 공개된 포스트만
    const where: any = {
      status: PostStatus.PUBLISHED,
    };

    // 특정 슬러그로 검색
    if (slug) {
      where.slug = slug;
    }

    // 검색어가 있는 경우
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 카테고리 필터
    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId,
        },
      };
    }

    // 데이터 조회
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          seoScore: {
            select: {
              overallScore: true,
              readabilityScore: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: slug ? 0 : skip, // 슬러그 검색시는 페이지네이션 무시
        take: slug ? 1 : limit, // 슬러그 검색시는 1개만
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data: {
          data: posts,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('공개 포스트 조회 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
