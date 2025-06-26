import { NextRequest, NextResponse } from 'next/server';
import { getUser, getSession } from '@/supabase/server';
import { createClient } from '@/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    console.log('=== Stats API Called ===');

    // 세션과 사용자 정보 확인
    const { session, error: sessionError } = await getSession();
    const { user, error: userError } = await getUser();

    console.log('Session check:', { hasSession: !!session, sessionError });
    console.log('User check:', { hasUser: !!user, userError });

    if (!user || !session) {
      console.log('Authentication failed - no user or session');
      return NextResponse.json(
        {
          error: '인증이 필요합니다',
          debug: {
            hasUser: !!user,
            hasSession: !!session,
            userError: userError
              ? (userError as any)?.message || userError
              : null,
            sessionError: sessionError
              ? (sessionError as any)?.message || sessionError
              : null,
          },
        },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 사용자의 게시글 통계 조회
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, slug, content, view_count, category_id, created_at')
      .eq('author_id', user.id)
      .eq('status', 'published');

    if (postsError) {
      console.error('Posts query error:', postsError);
      return NextResponse.json(
        {
          error: '게시글 데이터를 가져오는데 실패했습니다',
          details: postsError.message,
        },
        { status: 500 }
      );
    }

    console.log(`Found ${posts?.length || 0} posts for user ${user.id}`);

    // 카테고리 정보 조회
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (categoriesError) {
      console.error('Categories query error:', categoriesError);
    }

    // 통계 계산
    const totalPosts = posts?.length || 0;
    const totalViews =
      posts?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;
    const averageViews =
      totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

    // 공유 수 추정 (조회수의 5%)
    const estimatedShares = Math.round(totalViews * 0.05);

    // 참여율 계산 (조회수 기준으로 추정)
    const engagementRate =
      totalViews > 0
        ? Math.min(95, Math.round((estimatedShares / totalViews) * 100))
        : 0;

    // 기술 스택 분석
    const techStackAnalysis = analyzeTechStack(posts || [], categories || []);

    const stats = {
      totalViews,
      totalPosts,
      estimatedShares,
      averageViews,
      engagementRate,
      techStack: techStackAnalysis,
    };

    console.log('Calculated stats:', stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      {
        error: '통계를 가져오는데 실패했습니다',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 기술 스택 분석 함수
function analyzeTechStack(posts: any[], categories: any[]) {
  const techMentions: { [key: string]: number } = {};

  // 카테고리별 기술 스택 맵핑
  const categoryTechMap: { [key: string]: string[] } = {
    frontend: [
      'React',
      'Vue',
      'Angular',
      'JavaScript',
      'TypeScript',
      'CSS',
      'HTML',
    ],
    backend: ['Node.js', 'Python', 'Java', 'Go', 'Rust', 'PHP'],
    database: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
    blockchain: ['Ethereum', 'Solidity', 'Web3', 'DeFi'],
    devops: ['Docker', 'Kubernetes', 'AWS', 'Vercel', 'Nginx'],
  };

  // 일반적인 기술 키워드
  const commonTechs = [
    'React',
    'Next.js',
    'Vue',
    'Angular',
    'JavaScript',
    'TypeScript',
    'Node.js',
    'Python',
    'Java',
    'Go',
    'Rust',
    'PHP',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS',
    'Vercel',
    'Ethereum',
    'Solidity',
    'Web3',
    'DeFi',
  ];

  posts.forEach((post) => {
    // 슬러그에서 기술 추출
    const slug = post.slug || '';
    commonTechs.forEach((tech) => {
      if (slug.toLowerCase().includes(tech.toLowerCase())) {
        techMentions[tech] = (techMentions[tech] || 0) + 1;
      }
    });

    // 제목과 내용에서 기술 추출
    const content = `${post.title || ''} ${post.content || ''}`.toLowerCase();
    commonTechs.forEach((tech) => {
      if (content.includes(tech.toLowerCase())) {
        techMentions[tech] = (techMentions[tech] || 0) + 1;
      }
    });

    // 카테고리 기반 기술 추출
    if (post.category_id) {
      const category = categories.find((c) => c.id === post.category_id);
      if (category) {
        const categorySlug =
          category.slug || category.name?.toLowerCase() || '';
        Object.entries(categoryTechMap).forEach(([catKey, techs]) => {
          if (categorySlug.includes(catKey)) {
            techs.forEach((tech) => {
              techMentions[tech] = (techMentions[tech] || 0) + 1;
            });
          }
        });
      }
    }
  });

  // 상위 기술들을 레벨과 함께 반환
  return Object.entries(techMentions)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tech, count]) => ({
      name: tech,
      level: Math.min(95, Math.round((count / posts.length) * 100 + 20)), // 최소 20%, 최대 95%
      mentions: count,
    }));
}
