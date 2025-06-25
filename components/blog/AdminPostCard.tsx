'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Eye,
  MessageCircle,
  Edit,
  Trash2,
  MoreVertical,
  ExternalLink,
  Copy,
  Archive,
} from 'lucide-react';

import { DeletePostDialog } from './DeletePostDialog';
import type { Post } from '@/hooks/usePosts';

interface AdminPostCardProps {
  post: Post;
  className?: string;
  onEdit?: (post: Post) => void;
  onView?: (post: Post) => void;
  onDeleted?: () => void;
}

export function AdminPostCard({
  post,
  className,
  onEdit,
  onView,
  onDeleted,
}: AdminPostCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleEdit = () => {
    onEdit?.(post);
  };

  const handleView = () => {
    onView?.(post);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const getStatusBadge = () => {
    switch (post.status) {
      case 'published':
        return (
          <Badge variant="default" className="text-xs">
            발행됨
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary" className="text-xs">
            임시저장
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="text-xs">
            보관됨
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card
        className={cn('h-full hover:shadow-md transition-shadow', className)}
      >
        <CardHeader className="space-y-4">
          {/* Header with badges and actions */}
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap gap-1">
              {getStatusBadge()}
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
              {post.featured && <Badge className="text-xs">추천</Badge>}
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="포스트 관리 메뉴"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  미리보기
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  편집
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  링크 복사
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {post.status !== 'archived' && (
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    보관
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <CardTitle className="line-clamp-2">
            <button
              onClick={handleView}
              className="text-left hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
              aria-label={`포스트 미리보기: ${post.title}`}
            >
              {post.title}
            </button>
          </CardTitle>

          {/* Excerpt */}
          <CardDescription className="line-clamp-3">
            {post.excerpt}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              편집
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleView}
              className="flex-1"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              보기
            </Button>
          </div>

          {/* Meta information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <time dateTime={post.publishedAt}>{formattedDate}</time>
                </div>

                {post.readingTime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readingTime}분</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-3">
                {post.viewCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.viewCount.toLocaleString()}</span>
                  </div>
                )}

                {post.commentCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{post.commentCount}</span>
                  </div>
                )}
              </div>

              <div className="text-xs">ID: {post.id}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <DeletePostDialog
        isOpen={deleteDialogOpen}
        postId={post.id}
        postTitle={post.title}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={onDeleted}
      />
    </>
  );
}
