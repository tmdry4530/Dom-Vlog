'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BlogPostGrid } from '@/components/blog/BlogPostGrid';
import { usePublicPosts, type PublicPost } from '@/hooks/usePublicPosts';
import { Post } from '@/hooks/usePosts';

// PublicPost를 Post로 변환하는 함수
const convertPublicPostToPost = (publicPost: PublicPost): Post => ({
  id: publicPost.id,
  title: publicPost.title,
  content: publicPost.content,
  excerpt: publicPost.excerpt || '',
  slug: publicPost.slug,
  publishedAt: publicPost.publishedAt,
  status: 'PUBLISHED' as const,
  readingTime: Math.ceil(publicPost.content.split(' ').length / 200),
  viewCount: publicPost.viewCount,
  commentCount: 0,
  categories: publicPost.categories.map(({ category }) => ({
    id: category.id,
    name: category.name,
    color: category.color,
  })),
  author: {
    name: publicPost.author.displayName,
    avatar: publicPost.author.avatar,
  },
  featured: false,
  aiEnhanced: !!publicPost.enhancedContent,
});

export function BlogPageClient() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { posts: publicPosts, isLoading } = usePublicPosts();

  // PublicPost를 Post로 변환
  const posts = publicPosts.map(convertPublicPostToPost);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // hydration이 완료되기 전까지는 서버와 동일한 상태로 렌더링
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <Header toggleMobileSidebar={() => {}} />
        <div className="flex">
          <Sidebar isMobileSidebarOpen={false} toggleMobileSidebar={() => {}} />
          <main className="flex-1 lg:ml-80 pt-14">
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">블로그</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  기술 블로그 포스트들을 확인해보세요.
                </p>
              </div>
              <BlogPostGrid posts={[]} isLoading={true} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Header toggleMobileSidebar={toggleMobileSidebar} />
      <div className="flex">
        <Sidebar
          isMobileSidebarOpen={isMobileSidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <main className="flex-1 lg:ml-80 pt-14">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">블로그</h1>
              <p className="text-gray-600 dark:text-gray-400">
                기술 블로그 포스트들을 확인해보세요.
              </p>
            </div>
            <BlogPostGrid posts={posts} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
