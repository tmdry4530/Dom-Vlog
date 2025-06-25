import { Metadata } from 'next';
import { BlogLayout } from '@/components/layout/BlogLayout';
import { PostList } from '@/components/blog/PostList';

export const metadata: Metadata = {
  title: '블로그',
  description: 'Dom Vlog의 기술 블로그 포스트들을 확인해보세요.',
};

// 샘플 데이터 (추후 실제 데이터베이스에서 가져올 예정)
const samplePosts = [
  {
    id: '1',
    title: 'Next.js 15 App Router 완벽 가이드',
    excerpt:
      'Next.js 15의 새로운 App Router를 활용하여 현대적인 웹 애플리케이션을 구축하는 방법을 알아봅시다. 파일 기반 라우팅부터 레이아웃, 로딩 상태, 에러 처리까지 실무에서 바로 사용할 수 있는 패턴들을 소개합니다.',
    slug: 'nextjs-15-app-router-guide',
    publishedAt: '2024-01-15T09:00:00Z',
    readingTime: 12,
    viewCount: 1250,
    commentCount: 8,
    categories: [
      { id: 'nextjs', name: 'Next.js', color: '#000000' },
      { id: 'react', name: 'React', color: '#61DAFB' },
    ],
    author: {
      name: 'Dom',
      avatar: '/avatar.jpg',
    },
    featured: true,
    aiEnhanced: true,
  },
  {
    id: '2',
    title: 'Supabase와 함께하는 실시간 데이터베이스',
    excerpt:
      'Supabase를 사용하여 실시간으로 데이터가 동기화되는 애플리케이션을 만들어봅시다. PostgreSQL의 강력함과 실시간 기능을 동시에 활용하는 방법을 상세히 다룹니다.',
    slug: 'supabase-realtime-database',
    publishedAt: '2024-01-10T14:30:00Z',
    readingTime: 15,
    viewCount: 890,
    commentCount: 12,
    categories: [
      { id: 'supabase', name: 'Supabase', color: '#3ECF8E' },
      { id: 'database', name: 'Database', color: '#F59E0B' },
    ],
    author: {
      name: 'Dom',
      avatar: '/avatar.jpg',
    },
    featured: true,
    aiEnhanced: true,
  },
  {
    id: '3',
    title: 'Tailwind CSS 고급 패턴과 최적화',
    excerpt:
      'Tailwind CSS를 더 효율적으로 사용하기 위한 고급 기법들을 알아봅시다. 커스텀 컴포넌트 설계, 다크모드 구현, 성능 최적화까지 실무에서 필요한 모든 것을 다룹니다.',
    slug: 'tailwind-css-advanced-patterns',
    publishedAt: '2024-01-05T11:15:00Z',
    readingTime: 10,
    viewCount: 650,
    commentCount: 5,
    categories: [
      { id: 'css', name: 'CSS', color: '#1572B6' },
      { id: 'tailwind', name: 'Tailwind', color: '#06B6D4' },
    ],
    author: {
      name: 'Dom',
      avatar: '/avatar.jpg',
    },
    aiEnhanced: true,
  },
  {
    id: '4',
    title: 'TypeScript 5.0 새로운 기능 살펴보기',
    excerpt:
      'TypeScript 5.0에서 추가된 새로운 기능들을 실제 예제와 함께 알아봅시다. decorators, const assertions, template literal types 등 개발 생산성을 높여주는 기능들을 중심으로 설명합니다.',
    slug: 'typescript-5-new-features',
    publishedAt: '2023-12-28T16:45:00Z',
    readingTime: 8,
    viewCount: 420,
    commentCount: 3,
    categories: [
      { id: 'typescript', name: 'TypeScript', color: '#3178C6' },
      { id: 'javascript', name: 'JavaScript', color: '#F7DF1E' },
    ],
    author: {
      name: 'Dom',
      avatar: '/avatar.jpg',
    },
    aiEnhanced: false,
  },
  {
    id: '5',
    title: 'AI 기반 코드 리뷰 자동화 시스템 구축',
    excerpt:
      'GitHub Actions와 OpenAI API를 활용하여 AI가 자동으로 코드 리뷰를 수행하는 시스템을 만들어봅시다. 코드 품질 향상과 개발 효율성을 동시에 얻을 수 있는 방법을 소개합니다.',
    slug: 'ai-code-review-automation',
    publishedAt: '2023-12-20T13:20:00Z',
    readingTime: 18,
    viewCount: 780,
    commentCount: 15,
    categories: [
      { id: 'ai', name: 'AI', color: '#FF6B6B' },
      { id: 'automation', name: 'Automation', color: '#4ECDC4' },
      { id: 'devops', name: 'DevOps', color: '#45B7D1' },
    ],
    author: {
      name: 'Dom',
      avatar: '/avatar.jpg',
    },
    aiEnhanced: true,
  },
];

const sampleCategories = [
  { id: 'nextjs', name: 'Next.js', color: '#000000', count: 1 },
  { id: 'react', name: 'React', color: '#61DAFB', count: 1 },
  { id: 'supabase', name: 'Supabase', color: '#3ECF8E', count: 1 },
  { id: 'database', name: 'Database', color: '#F59E0B', count: 1 },
  { id: 'css', name: 'CSS', color: '#1572B6', count: 1 },
  { id: 'tailwind', name: 'Tailwind', color: '#06B6D4', count: 1 },
  { id: 'typescript', name: 'TypeScript', color: '#3178C6', count: 1 },
  { id: 'javascript', name: 'JavaScript', color: '#F7DF1E', count: 1 },
  { id: 'ai', name: 'AI', color: '#FF6B6B', count: 1 },
  { id: 'automation', name: 'Automation', color: '#4ECDC4', count: 1 },
  { id: 'devops', name: 'DevOps', color: '#45B7D1', count: 1 },
];

const featuredPosts = samplePosts.filter((post) => post.featured);

export default function BlogPage() {
  return (
    <BlogLayout>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">블로그</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            개발 경험과 지식을 공유하는 기술 블로그입니다. AI가 자동으로
            최적화한 고품질 콘텐츠를 만나보세요.
          </p>
        </div>

        <PostList
          posts={samplePosts}
          featuredPosts={featuredPosts}
          categories={sampleCategories}
          showFeatured={true}
          showSearch={true}
          showFilters={true}
          layout="grid"
          itemsPerPage={6}
        />
      </div>
    </BlogLayout>
  );
}
