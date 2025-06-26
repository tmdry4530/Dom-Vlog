'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Search,
  Github,
  Twitter,
  Star,
  Home,
  Tag,
  BookOpen,
  X,
  Loader2,
  Linkedin,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import {
  useBlogStats,
  useCategoryStats,
  useRecentPosts,
  useBlogInfo,
} from '@/hooks/useBlogStats';

interface SidebarProps {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
}

// 숫자 포맷팅 함수
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export function Sidebar({
  isMobileSidebarOpen,
  toggleMobileSidebar,
}: SidebarProps) {
  const [_isHydrated, setIsHydrated] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { stats, isLoading: statsLoading } = useBlogStats();
  const { categories, isLoading: categoriesLoading } = useCategoryStats();
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts();
  const { blogInfo, isLoading: blogInfoLoading } = useBlogInfo();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-30 lg:hidden"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-6 hide-scrollbar transition-all duration-300 z-40
          w-80 lg:block
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="relative h-full">
          {/* Close button for mobile */}
          <button
            onClick={toggleMobileSidebar}
            className="absolute top-4 right-4 lg:hidden text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="사이드바 닫기"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Right Star Icon (Desktop only) */}
          <div className="absolute top-4 right-4 hidden lg:block">
            <Star className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </div>

          <div className="space-y-8 pt-4">
            {/* Profile Section */}
            <div className="flex flex-col items-center text-center space-y-3">
              <Avatar className="w-20 h-20 border-2 border-gray-200 dark:border-gray-600">
                <AvatarImage
                  src={
                    blogInfo?.avatar || '/placeholder.svg?height=80&width=80'
                  }
                />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-lg font-medium">
                  {blogInfoLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    blogInfo?.displayName?.slice(0, 2).toUpperCase() || 'DV'
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                {blogInfoLoading ? (
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {blogInfo?.blogTitle || 'Dom Vlog'}
                  </h3>
                )}
                {blogInfoLoading ? (
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {blogInfo?.blogSubtitle || 'AI 기반 개발자 블로그'}
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center space-x-4">
              <a
                href={blogInfo?.github || 'https://github.com'}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  blogInfo?.github
                    ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
                }`}
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={blogInfo?.twitter || 'https://twitter.com'}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  blogInfo?.twitter
                    ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
                }`}
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={blogInfo?.linkedin || 'https://linkedin.com'}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  blogInfo?.linkedin
                    ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
                }`}
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={
                  blogInfo?.email
                    ? `mailto:${blogInfo.email}`
                    : 'mailto:contact@example.com'
                }
                className={`transition-colors ${
                  blogInfo?.email
                    ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
                }`}
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>

            {/* Statistics */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
              {statsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 text-sm">
                    <span>전체 글</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {stats?.totalPosts || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 text-sm">
                    <span>오늘 조회</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {stats?.todayViews || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 text-sm">
                    <span>총 조회</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {formatNumber(stats?.totalViews || 0)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="검색..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-300 dark:focus:border-gray-500 rounded-lg"
                suppressHydrationWarning
              />
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h4 className="text-gray-900 dark:text-white text-sm font-semibold">
                카테고리
              </h4>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <ul className="space-y-2">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/category/${category.id}`}
                          className="flex items-center justify-between text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md px-2 py-1 transition-colors text-sm"
                        >
                          <span>{category.name}</span>
                          <span className="text-gray-400 dark:text-gray-500">
                            ({category.count})
                          </span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">
                      카테고리가 없습니다
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Blog Menu */}
            <div className="space-y-4">
              <h4 className="text-gray-900 dark:text-white text-sm font-semibold">
                메뉴
              </h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md px-2 py-2 transition-colors text-sm"
                  >
                    <Home className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                    홈
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md px-2 py-2 transition-colors text-sm"
                  >
                    <Tag className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                    블로그
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md px-2 py-2 transition-colors text-sm"
                  >
                    <BookOpen className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                    프로필
                  </Link>
                </li>
              </ul>
            </div>

            {/* Recent Posts */}
            <div className="space-y-4">
              <h4 className="text-gray-900 dark:text-white text-sm font-semibold">
                최근 글
              </h4>
              {postsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <ul className="space-y-3">
                  {recentPosts.length > 0 ? (
                    recentPosts.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md p-2 transition-colors"
                        >
                          <h5 className="text-gray-900 dark:text-white text-sm font-medium line-clamp-2 mb-1">
                            {post.title}
                          </h5>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {post.date}
                          </p>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">
                      최근 글이 없습니다
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
