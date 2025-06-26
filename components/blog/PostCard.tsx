import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Clock, Calendar } from 'lucide-react';
import { Post } from '@/hooks/usePosts';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  // 요약문 우선순위: excerpt > content 앞부분
  const getSummary = () => {
    if (post.excerpt) return post.excerpt;
    if (post.content) {
      // content에서 첫 번째 문단을 추출하여 요약으로 사용
      const firstParagraph = post.content.split('\n')[0];
      return firstParagraph.length > 150
        ? firstParagraph.substring(0, 150) + '...'
        : firstParagraph;
    }
    return '내용 미리보기가 없습니다.';
  };

  // 읽기 시간 계산
  const getReadTime = () => {
    if (post.readingTime) return post.readingTime;
    if (post.content) {
      const charCount = post.content.length;
      return Math.ceil(charCount / 200);
    }
    return 5; // 기본값
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\./g, '.');
  };

  // 카테고리 이름 가져오기
  const getCategoryName = () => {
    if (post.categories && post.categories.length > 0) {
      return post.categories[0].name;
    }
    return 'Uncategorized';
  };

  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer rounded-xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          {/* Header with category */}
          <div className="flex items-center justify-between">
            <Badge className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium">
              {getCategoryName()}
            </Badge>
            {post.status === 'DRAFT' && (
              <Badge variant="secondary" className="text-xs">
                초안
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors leading-tight">
            {post.title}
          </h3>

          {/* Summary */}
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {getSummary()}
          </p>

          {/* Footer with metadata */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{getReadTime()}분</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Eye className="w-3 h-3" />
              <span>{(post.viewCount || 0).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
