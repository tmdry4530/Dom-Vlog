import { Metadata } from 'next';
// import { notFound } from 'next/navigation';
import { BlogPostClient } from '@/components/blog/BlogPostClient';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  // TODO: 실제 포스트 데이터를 기반으로 메타데이터 생성
  return {
    title: `${slug} | Dom Vlog`,
    description: `Dom Vlog의 기술 블로그 포스트: ${slug}`,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  return <BlogPostClient slug={slug} />;
}
