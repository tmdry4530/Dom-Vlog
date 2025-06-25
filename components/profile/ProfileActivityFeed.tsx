'use client';

import { useState } from 'react';
import {
  FileText,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Settings,
  Eye,
  Edit,
  Calendar,
  MoreHorizontal,
  Filter,
  RefreshCw,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export interface ActivityItem {
  id: string;
  type:
    | 'post_published'
    | 'post_updated'
    | 'comment_received'
    | 'like_received'
    | 'follow_received'
    | 'profile_updated'
    | 'view_milestone';
  title: string;
  description?: string;
  timestamp: string;
  metadata?: {
    postSlug?: string;
    postTitle?: string;
    commenterName?: string;
    followerName?: string;
    viewCount?: number;
    likeCount?: number;
  };
  isRead?: boolean;
}

export interface ProfileActivityFeedProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

// 모의 활동 데이터
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'post_published',
    title: '새 글이 게시되었습니다',
    description: 'Next.js 15와 App Router로 블로그 만들기',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: {
      postSlug: 'nextjs-15-blog-tutorial',
      postTitle: 'Next.js 15와 App Router로 블로그 만들기',
    },
    isRead: true,
  },
  {
    id: '2',
    type: 'comment_received',
    title: '새 댓글을 받았습니다',
    description: '김개발님이 댓글을 남겼습니다',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    metadata: {
      postSlug: 'typescript-best-practices',
      postTitle: 'TypeScript 모범 사례',
      commenterName: '김개발',
    },
    isRead: true,
  },
  {
    id: '3',
    type: 'like_received',
    title: '좋아요를 받았습니다',
    description: '5명이 좋아요를 눌렀습니다',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    metadata: {
      postSlug: 'react-hooks-guide',
      postTitle: 'React Hooks 완벽 가이드',
      likeCount: 5,
    },
    isRead: false,
  },
  {
    id: '4',
    type: 'follow_received',
    title: '새 팔로워',
    description: '이프론트님이 팔로우하기 시작했습니다',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    metadata: {
      followerName: '이프론트',
    },
    isRead: false,
  },
  {
    id: '5',
    type: 'view_milestone',
    title: '조회수 달성',
    description: '블로그 전체 조회수가 1000회를 돌파했습니다!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      viewCount: 1000,
    },
    isRead: false,
  },
  {
    id: '6',
    type: 'post_updated',
    title: '글이 수정되었습니다',
    description: 'JavaScript ES2024 새로운 기능들',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    metadata: {
      postSlug: 'javascript-es2024',
      postTitle: 'JavaScript ES2024 새로운 기능들',
    },
    isRead: true,
  },
  {
    id: '7',
    type: 'profile_updated',
    title: '프로필이 업데이트되었습니다',
    description: '기술 스택과 자기소개가 수정되었습니다',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

export function ProfileActivityFeed({
  activities = mockActivities,
  isLoading = false,
  onRefresh,
}: ProfileActivityFeedProps) {
  const [filter, setFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post_published':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'post_updated':
        return <Edit className="h-4 w-4 text-orange-600" />;
      case 'comment_received':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'like_received':
        return <Heart className="h-4 w-4 text-red-600" />;
      case 'follow_received':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'profile_updated':
        return <Settings className="h-4 w-4 text-gray-600" />;
      case 'view_milestone':
        return <Eye className="h-4 w-4 text-indigo-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post_published':
        return 'bg-blue-50 border-blue-200';
      case 'post_updated':
        return 'bg-orange-50 border-orange-200';
      case 'comment_received':
        return 'bg-green-50 border-green-200';
      case 'like_received':
        return 'bg-red-50 border-red-200';
      case 'follow_received':
        return 'bg-purple-50 border-purple-200';
      case 'profile_updated':
        return 'bg-gray-50 border-gray-200';
      case 'view_milestone':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityTypeLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post_published':
        return '게시';
      case 'post_updated':
        return '수정';
      case 'comment_received':
        return '댓글';
      case 'like_received':
        return '좋아요';
      case 'follow_received':
        return '팔로우';
      case 'profile_updated':
        return '프로필';
      case 'view_milestone':
        return '조회수';
      default:
        return '활동';
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (showUnreadOnly && activity.isRead) return false;
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  // 간단한 시간 차이 계산 함수
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - past.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}주 전`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}개월 전`;
  };

  const renderActivityContent = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'post_published':
      case 'post_updated':
        return (
          <div className="space-y-1">
            <p className="font-medium text-sm">{activity.title}</p>
            <p className="text-gray-600 text-sm">
              {activity.metadata?.postTitle}
            </p>
          </div>
        );

      case 'comment_received':
        return (
          <div className="space-y-1">
            <p className="font-medium text-sm">{activity.title}</p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">
                {activity.metadata?.commenterName}
              </span>
              님이{' '}
              <span className="font-medium">
                {activity.metadata?.postTitle}
              </span>
              에 댓글을 남겼습니다
            </p>
          </div>
        );

      case 'like_received':
        return (
          <div className="space-y-1">
            <p className="font-medium text-sm">{activity.title}</p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">
                {activity.metadata?.postTitle}
              </span>
              에{' '}
              <span className="font-medium text-red-600">
                {activity.metadata?.likeCount}개
              </span>
              의 좋아요를 받았습니다
            </p>
          </div>
        );

      case 'follow_received':
        return (
          <div className="space-y-1">
            <p className="font-medium text-sm">{activity.title}</p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">
                {activity.metadata?.followerName}
              </span>
              님이 팔로우하기 시작했습니다
            </p>
          </div>
        );

      case 'view_milestone':
        return (
          <div className="space-y-1">
            <p className="font-medium text-sm">{activity.title}</p>
            <p className="text-gray-600 text-sm">
              총{' '}
              <span className="font-medium text-indigo-600">
                {activity.metadata?.viewCount?.toLocaleString()}
              </span>
              회 조회를 달성했습니다!
            </p>
          </div>
        );

      default:
        return (
          <div className="space-y-1">
            <p className="font-medium text-sm">{activity.title}</p>
            {activity.description && (
              <p className="text-gray-600 text-sm">{activity.description}</p>
            )}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            활동 피드
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="post_published">게시</SelectItem>
                <SelectItem value="comment_received">댓글</SelectItem>
                <SelectItem value="like_received">좋아요</SelectItem>
                <SelectItem value="follow_received">팔로우</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showUnreadOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Filter className="h-3 w-3 mr-1" />
              읽지 않음
            </Button>

            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          최근 활동 내역을 확인하세요
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">활동 내역이 없습니다</p>
            <p className="text-sm text-gray-400">
              {showUnreadOnly
                ? '읽지 않은 활동이 없습니다'
                : '새로운 활동을 기다리고 있습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div key={activity.id}>
                <div
                  className={`p-4 rounded-lg border ${getActivityColor(activity.type)} ${
                    !activity.isRead ? 'border-l-4' : ''
                  } transition-colors hover:bg-white/50`}
                >
                  <div className="flex items-start gap-3">
                    {/* 아이콘 */}
                    <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {renderActivityContent(activity)}
                        </div>

                        {/* 메타 정보 */}
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="secondary" className="text-xs">
                            {getActivityTypeLabel(activity.type)}
                          </Badge>
                          {!activity.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      {/* 시간 */}
                      <p className="text-xs text-gray-400 mt-2">
                        {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>

                {index < filteredActivities.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        )}

        {filteredActivities.length > 0 && (
          <div className="text-center pt-4">
            <Button variant="ghost" size="sm">
              더 보기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
