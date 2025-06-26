'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Clock, Eye, Calendar, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BlogPostClientProps {
  slug: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  enhancedContent?: string;
  excerpt?: string;
  publishedAt: string;
  viewCount: number;
  author: {
    displayName: string;
    avatar?: string;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
      color?: string;
    };
  }>;
}

export function BlogPostClient({ slug }: BlogPostClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/posts/public?slug=${encodeURIComponent(slug)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError('포스트를 찾을 수 없습니다.');
          } else {
            setError('포스트를 불러오는 중 오류가 발생했습니다.');
          }
          return;
        }

        const data = await response.json();
        if (data.success && data.data?.data?.length > 0) {
          setPost(data.data.data[0]);
          // 조회수 증가
          incrementViewCount(data.data.data[0].id);
        } else {
          setError('포스트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('포스트 로딩 오류:', error);
        setError('포스트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isHydrated) {
      fetchPost();
    }
  }, [isHydrated, slug]);

  const incrementViewCount = async (postId: string) => {
    try {
      await fetch(`/api/posts/${postId}/view`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('조회수 증가 오류:', error);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const goBack = () => {
    router.back();
  };

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200; // 평균 읽기 속도
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime}분 읽기`;
  };

  // hydration이 완료되기 전까지는 로딩 상태로 렌더링
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <Header toggleMobileSidebar={() => {}} />
        <div className="flex">
          <Sidebar isMobileSidebarOpen={false} toggleMobileSidebar={() => {}} />
          <main className="flex-1 lg:ml-80 pt-14">
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
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
          <div className="max-w-4xl mx-auto p-6">
            {/* 뒤로가기 버튼 */}
            <div className="mb-6">
              <Button
                onClick={goBack}
                variant="ghost"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로가기
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="p-6 text-center">
                  <div className="text-red-600 dark:text-red-400 mb-4">
                    <h2 className="text-xl font-semibold mb-2">오류 발생</h2>
                    <p>{error}</p>
                  </div>
                  <Button
                    onClick={() => router.push('/blog')}
                    variant="outline"
                  >
                    블로그 목록으로 돌아가기
                  </Button>
                </CardContent>
              </Card>
            ) : post ? (
              <article className="space-y-8">
                {/* 헤더 섹션 */}
                <header className="space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                      {post.title}
                    </h1>

                    {post.excerpt && (
                      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* 메타 정보 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>
                          <User className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span>{post.author.displayName}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(post.publishedAt), 'yyyy년 M월 d일', {
                          locale: ko,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatReadingTime(post.content)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.viewCount.toLocaleString()}회</span>
                    </div>
                  </div>

                  {/* 카테고리 */}
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map(({ category }) => (
                        <Badge
                          key={category.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </header>

                {/* 본문 */}
                <Card>
                  <CardContent className="p-8">
                    <div
                      className="prose prose-gray dark:prose-invert max-w-none prose-lg"
                      dangerouslySetInnerHTML={{
                        __html: post.enhancedContent || post.content,
                      }}
                    />
                  </CardContent>
                </Card>
              </article>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
