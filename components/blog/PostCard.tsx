import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Eye,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

interface PostCardProps {
  post: {
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
  };
  className?: string;
  variant?: 'default' | 'featured' | 'compact';
}

export function PostCard({
  post,
  className,
  variant = 'default',
}: PostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const cardVariants = {
    default: 'h-full',
    featured:
      'h-full border-primary/20 bg-gradient-to-br from-background to-muted/30',
    compact: 'h-auto',
  };

  return (
    <Card className={cn(cardVariants[variant], className)}>
      <CardHeader className="space-y-4">
        {/* Category badges and AI indicator */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {post.categories?.slice(0, 2).map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: category.color + '20',
                  color: category.color,
                }}
              >
                {category.name}
              </Badge>
            ))}
            {post.aiEnhanced && (
              <Badge variant="outline" className="text-xs border-primary/30">
                AI 최적화
              </Badge>
            )}
          </div>

          {post.featured && variant === 'featured' && (
            <Badge className="text-xs">추천</Badge>
          )}
        </div>

        {/* Title */}
        <CardTitle className="line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
            aria-label={`블로그 포스트: ${post.title}`}
          >
            {post.title}
          </Link>
        </CardTitle>

        {/* Excerpt */}
        <CardDescription
          className={cn(
            'line-clamp-3',
            variant === 'compact' && 'line-clamp-2'
          )}
        >
          {post.excerpt}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Author info */}
        {post.author && variant !== 'compact' && (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{post.author.name}</p>
            </div>
          </div>
        )}

        <Separator />

        {/* Meta information */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <time dateTime={post.publishedAt} className="sr-only">
                {formattedDate}
              </time>
              <span aria-label={`게시일: ${formattedDate}`}>
                {formattedDate}
              </span>
            </div>

            {post.readingTime && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span aria-label={`예상 읽기 시간: ${post.readingTime}분`}>
                  {post.readingTime}분
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {post.viewCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span aria-label={`조회수: ${post.viewCount}회`}>
                  {post.viewCount.toLocaleString()}
                </span>
              </div>
            )}

            {post.commentCount !== undefined && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span aria-label={`댓글 수: ${post.commentCount}개`}>
                  {post.commentCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Read more link for screen readers */}
        <div className="sr-only">
          <Link
            href={`/blog/${post.slug}`}
            aria-label={`${post.title} 전문 읽기`}
          >
            전문 읽기
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Featured post card variant
export function FeaturedPostCard({
  post,
  className,
}: Omit<PostCardProps, 'variant'>) {
  return <PostCard post={post} variant="featured" className={className} />;
}

// Compact post card variant
export function CompactPostCard({
  post,
  className,
}: Omit<PostCardProps, 'variant'>) {
  return <PostCard post={post} variant="compact" className={className} />;
}
