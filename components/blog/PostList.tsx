'use client';

import { useState } from 'react';
import { PostCard, FeaturedPostCard, CompactPostCard } from './PostCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Grid, Section } from '@/components/layout/BlogLayout';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';
import { Search, Grid3X3, List, Filter } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  slug: string;
  publishedAt: string;
  readingTime?: number;
  viewCount?: number;
  commentCount?: number;
  categories?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  author?: {
    name: string;
    avatar?: string;
  };
  featured?: boolean;
  aiEnhanced?: boolean;
}

interface PostListProps {
  posts: Post[];
  featuredPosts?: Post[];
  categories?: Array<{
    id: string;
    name: string;
    color?: string;
    count?: number;
  }>;
  className?: string;
  showFeatured?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  layout?: 'grid' | 'list';
  itemsPerPage?: number;
}

export function PostList({
  posts,
  featuredPosts = [],
  categories = [],
  className,
  showFeatured = true,
  showSearch = true,
  showFilters = true,
  layout: initialLayout = 'grid',
  itemsPerPage = 12,
}: PostListProps) {
  const { isMobile } = useResponsive();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>(initialLayout);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter posts based on search and category
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      post.categories?.some((cat) => cat.id === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page when filters change
  const handleFilterChange = (newCategory: string | null) => {
    setSelectedCategory(newCategory);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Featured Posts */}
      {showFeatured && featuredPosts.length > 0 && (
        <Section title="추천 글" subtitle="AI가 엄선한 고품질 콘텐츠">
          <Grid cols={isMobile ? 1 : 2} gap="lg">
            {featuredPosts.slice(0, 2).map((post) => (
              <FeaturedPostCard key={post.id} post={post} />
            ))}
          </Grid>
        </Section>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="글 제목이나 내용으로 검색..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="pl-10"
              aria-label="블로그 포스트 검색"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Category Filters */}
          {showFilters && categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant={selectedCategory === null ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => handleFilterChange(null)}
              >
                전체
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? 'default' : 'secondary'
                  }
                  className="cursor-pointer"
                  style={{
                    backgroundColor:
                      selectedCategory === category.id
                        ? category.color
                        : undefined,
                  }}
                  onClick={() => handleFilterChange(category.id)}
                >
                  {category.name}
                  {category.count && ` (${category.count})`}
                </Badge>
              ))}
            </div>
          )}

          {/* Layout Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={layout === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('grid')}
              aria-label="그리드 레이아웃으로 보기"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('list')}
              aria-label="리스트 레이아웃으로 보기"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          총 {filteredPosts.length}개의 글
          {searchQuery && ` (${posts.length}개 중 검색 결과)`}
        </p>
        {totalPages > 1 && (
          <p>
            {currentPage} / {totalPages} 페이지
          </p>
        )}
      </div>

      {/* Post Grid/List */}
      {paginatedPosts.length > 0 ? (
        <div className="space-y-6">
          {layout === 'grid' ? (
            <Grid cols={isMobile ? 1 : 2} gap="lg" className="lg:grid-cols-3">
              {paginatedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </Grid>
          ) : (
            <div className="space-y-4">
              {paginatedPosts.map((post) => (
                <CompactPostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                aria-label="이전 페이지"
              >
                이전
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;

                  if (pageNumber > totalPages) return null;

                  return (
                    <Button
                      key={pageNumber}
                      variant={
                        currentPage === pageNumber ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      aria-label={`${pageNumber}페이지로 이동`}
                      aria-current={
                        currentPage === pageNumber ? 'page' : undefined
                      }
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                aria-label="다음 페이지"
              >
                다음
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">
            {searchQuery || selectedCategory
              ? '검색 조건에 맞는 글이 없습니다.'
              : '아직 작성된 글이 없습니다.'}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              필터 초기화
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
