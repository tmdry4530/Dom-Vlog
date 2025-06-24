// Dom vlog - Seed Data for Phase 1
// 개발 및 테스트를 위한 기본 데이터

import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 기본 프로필 생성 (Phase 1 - 단일 사용자)
    const profile = await prisma.profile.upsert({
      where: { userId: 'user-dom-vlog' },
      update: {},
      create: {
        userId: 'user-dom-vlog',
        email: 'admin@domvlog.com',
        username: 'dom',
        displayName: 'Dom',
        bio: '웹 개발, 블록체인, 암호학에 관심이 많은 개발자입니다.',
        blogTitle: 'Dom vlog',
        blogSubtitle: 'AI가 자동으로 최적화하는 기술 블로그',
        blogDescription: '개발 경험과 기술적 인사이트를 공유하는 공간입니다.',
        website: 'https://domvlog.com',
        github: 'https://github.com/dom',
      },
    });

    console.log('✅ Profile created:', profile.displayName);

    // 기본 카테고리 생성
    const categories = [
      {
        name: 'Web Development',
        slug: 'web-development',
        description: '웹 개발 관련 기술 포스트',
        color: '#3B82F6',
      },
      {
        name: 'Blockchain',
        slug: 'blockchain',
        description: '블록체인 및 암호화폐 기술',
        color: '#10B981',
      },
      {
        name: 'Cryptography',
        slug: 'cryptography',
        description: '암호학 및 보안 기술',
        color: '#8B5CF6',
      },
      {
        name: 'AI/ML',
        slug: 'ai-ml',
        description: '인공지능 및 머신러닝',
        color: '#F59E0B',
      },
      {
        name: 'DevOps',
        slug: 'devops',
        description: '개발 운영 및 인프라',
        color: '#EF4444',
      },
      {
        name: 'Tutorial',
        slug: 'tutorial',
        description: '기술 튜토리얼 및 가이드',
        color: '#6366F1',
      },
      {
        name: 'Review',
        slug: 'review',
        description: '기술 리뷰 및 분석',
        color: '#EC4899',
      },
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: categoryData,
        create: categoryData,
      });
      createdCategories.push(category);
      console.log('✅ Category created:', category.name);
    }

    // 샘플 포스트 생성
    const samplePosts = [
      {
        title: 'Dom vlog 플랫폼 소개',
        slug: 'introducing-dom-vlog',
        content: `# Dom vlog에 오신 것을 환영합니다!

Dom vlog는 AI 기능이 내장된 개인 기술 블로그 플랫폼입니다.

## 주요 기능

### 🤖 AI 자동 스타일링
- 코드 블록과 제목을 자동으로 정리
- 가독성을 80점 이상으로 향상
- 2초 이내 미리보기 제공

### 🚀 SEO 최적화
- 키워드 자동 추출
- 메타태그 자동 생성
- OG 태그 최적화

### 🎯 스마트 카테고리
- AI 기반 카테고리 추천
- 85% 이상의 정확도
- 신뢰도 점수 제공

## 기술 스택

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Supabase, Prisma
- **AI**: Gemini-2.5-flash-lite, LangChain
- **Hosting**: Vercel, Cloudflare CDN

앞으로 더 많은 기능과 개선사항을 제공할 예정입니다!`,
        excerpt:
          'AI 기능이 내장된 개인 기술 블로그 플랫폼 Dom vlog를 소개합니다. 자동 스타일링, SEO 최적화, 스마트 카테고리 추천 기능을 제공합니다.',
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        categoryIds: [createdCategories[0].id, createdCategories[5].id], // Web Development, Tutorial
      },
      {
        title: 'Next.js 15 App Router 시작하기',
        slug: 'getting-started-with-nextjs-15',
        content: `# Next.js 15 App Router 완벽 가이드

Next.js 15의 새로운 App Router를 활용한 현대적인 웹 애플리케이션 개발 방법을 알아보겠습니다.

## App Router의 장점

1. **파일 기반 라우팅**: 직관적인 폴더 구조
2. **서버 컴포넌트**: 향상된 성능
3. **스트리밍**: 점진적 페이지 로딩
4. **중첩 레이아웃**: 코드 재사용성

## 기본 설정

\`\`\`bash
npx create-next-app@latest my-app --app
cd my-app
npm run dev
\`\`\`

## 라우트 생성

\`\`\`typescript
// app/blog/page.tsx
export default function BlogPage() {
  return <h1>블로그 페이지</h1>;
}
\`\`\`

이렇게 간단하게 시작할 수 있습니다!`,
        excerpt:
          'Next.js 15의 새로운 App Router 기능을 활용하여 현대적인 웹 애플리케이션을 개발하는 방법을 단계별로 설명합니다.',
        status: 'PUBLISHED' as const,
        publishedAt: new Date(Date.now() - 86400000), // 1일 전
        categoryIds: [createdCategories[0].id, createdCategories[5].id], // Web Development, Tutorial
      },
    ];

    for (const postData of samplePosts) {
      const { categoryIds, ...postContent } = postData;

      const post = await prisma.post.upsert({
        where: { slug: postData.slug },
        update: {},
        create: {
          ...postContent,
          authorId: profile.id,
          categories: {
            create: categoryIds.map((categoryId) => ({
              categoryId,
            })),
          },
        },
      });

      // SEO 점수 생성
      await prisma.seoScore.upsert({
        where: { postId: post.id },
        update: {},
        create: {
          postId: post.id,
          overallScore: 85,
          readabilityScore: 88,
          performanceScore: 82,
          metaTitle: post.title,
          metaDescription: post.excerpt || '',
          keywords: ['Next.js', 'React', 'Web Development', 'AI'],
          wordCount: post.content.length / 5, // 대략적인 단어 수
          readingTime: Math.ceil(post.content.length / 1000), // 대략적인 읽기 시간
          isProcessed: true,
          processedAt: new Date(),
          aiModel: 'gemini-2.5-flash-lite',
        },
      });

      console.log('✅ Post created:', post.title);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
