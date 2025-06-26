import { PostCard } from '@/components/blog/PostCard';
import { Post } from '@/hooks/usePosts';

interface BlogPostGridProps {
  posts?: Post[];
  isLoading?: boolean;
}

export function BlogPostGrid({
  posts = [],
  isLoading = false,
}: BlogPostGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-8 pt-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            전체 글
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            개발과 기술에 대한 이야기
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-xl h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-8 pt-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            전체 글
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            개발과 기술에 대한 이야기
          </p>
        </div>

        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            아직 작성된 글이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-4">
      {/* Main Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          전체 글
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          개발과 기술에 대한 이야기
        </p>
      </div>

      {/* Blog Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination - 향후 구현 */}
      {posts.length > 0 && (
        <div className="flex justify-center mt-16">
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white dark:bg-custom-sidebar border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              이전
            </button>
            <button className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg">
              1
            </button>
            <button className="px-4 py-2 bg-white dark:bg-custom-sidebar border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              2
            </button>
            <button className="px-4 py-2 bg-white dark:bg-custom-sidebar border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              3
            </button>
            <button className="px-4 py-2 bg-white dark:bg-custom-sidebar border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
