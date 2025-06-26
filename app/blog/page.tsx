import { Metadata } from 'next';
import { BlogPageClient } from '@/components/blog/BlogPageClient';

export const metadata: Metadata = {
  title: '블로그',
  description: 'Dom Vlog의 기술 블로그 포스트들을 확인해보세요.',
};

export default function BlogPage() {
  return <BlogPageClient />;
}
