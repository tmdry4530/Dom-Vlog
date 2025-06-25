'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  Calendar,
  Share2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface ProfileStatsData {
  profileViews: {
    total: number;
    thisWeek: number;
    percentage: number;
  };
  socialStats: {
    followers: number;
    following: number;
    connections: number;
  };
  activity: {
    postsPublished: number;
    commentsReceived: number;
    likesReceived: number;
    sharesReceived: number;
  };
  engagement: {
    averageViews: number;
    averageLikes: number;
    engagementRate: number;
  };
  topSkills: Array<{
    name: string;
    level: number;
    mentions: number;
  }>;
  recentActivity: Array<{
    type: 'view' | 'like' | 'comment' | 'follow';
    count: number;
    date: string;
  }>;
}

export interface ProfileStatsProps {
  data?: ProfileStatsData;
  isLoading?: boolean;
}

// 모의 데이터 (실제로는 API에서 가져올 데이터)
const mockStatsData: ProfileStatsData = {
  profileViews: {
    total: 2847,
    thisWeek: 156,
    percentage: 12.3,
  },
  socialStats: {
    followers: 89,
    following: 142,
    connections: 67,
  },
  activity: {
    postsPublished: 24,
    commentsReceived: 187,
    likesReceived: 523,
    sharesReceived: 89,
  },
  engagement: {
    averageViews: 127,
    averageLikes: 21,
    engagementRate: 16.5,
  },
  topSkills: [
    { name: 'TypeScript', level: 95, mentions: 12 },
    { name: 'React', level: 90, mentions: 18 },
    { name: 'Next.js', level: 85, mentions: 8 },
    { name: 'Node.js', level: 80, mentions: 6 },
    { name: 'Blockchain', level: 75, mentions: 4 },
  ],
  recentActivity: [
    { type: 'view', count: 23, date: '2024-01-15' },
    { type: 'like', count: 12, date: '2024-01-14' },
    { type: 'comment', count: 5, date: '2024-01-14' },
    { type: 'follow', count: 3, date: '2024-01-13' },
    { type: 'view', count: 31, date: '2024-01-12' },
  ],
};

export function ProfileStats({
  data = mockStatsData,
  isLoading = false,
}: ProfileStatsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    profileViews: 0,
    followers: 0,
    postsPublished: 0,
    likesReceived: 0,
  });

  // 숫자 애니메이션 효과
  useEffect(() => {
    if (!isLoading && data) {
      const duration = 1000; // 1초
      const steps = 50;
      const stepDuration = duration / steps;

      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);

        setAnimatedValues({
          profileViews: Math.round(data.profileViews.total * easeOutProgress),
          followers: Math.round(data.socialStats.followers * easeOutProgress),
          postsPublished: Math.round(
            data.activity.postsPublished * easeOutProgress
          ),
          likesReceived: Math.round(
            data.activity.likesReceived * easeOutProgress
          ),
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [data, isLoading]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="h-3 w-3" />;
      case 'like':
        return <Heart className="h-3 w-3" />;
      case 'comment':
        return <MessageCircle className="h-3 w-3" />;
      case 'follow':
        return <Users className="h-3 w-3" />;
      default:
        return <BarChart3 className="h-3 w-3" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'view':
        return '조회';
      case 'like':
        return '좋아요';
      case 'comment':
        return '댓글';
      case 'follow':
        return '팔로우';
      default:
        return '활동';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 프로필 조회수 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">프로필 조회수</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(animatedValues.profileViews)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">
                +{data.profileViews.percentage}%
              </span>
              <span>이번 주</span>
            </div>
          </CardContent>
        </Card>

        {/* 팔로워 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">팔로워</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{animatedValues.followers}</div>
            <p className="text-xs text-muted-foreground">
              {data.socialStats.following}명 팔로잉
            </p>
          </CardContent>
        </Card>

        {/* 게시글 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">게시글</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {animatedValues.postsPublished}
            </div>
            <p className="text-xs text-muted-foreground">
              평균 {data.engagement.averageViews}회 조회
            </p>
          </CardContent>
        </Card>

        {/* 총 좋아요 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 좋아요</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(animatedValues.likesReceived)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.engagement.engagementRate}% 참여율
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상위 기술 스택 */}
        <Card>
          <CardHeader>
            <CardTitle>상위 기술 스택</CardTitle>
            <p className="text-sm text-muted-foreground">
              게시글에서 언급된 빈도 기준
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topSkills.map((skill, index) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {skill.mentions}회 언급
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {skill.level}%
                  </span>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <p className="text-sm text-muted-foreground">
              지난 7일간의 활동 내역
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {getActivityLabel(activity.type)} {activity.count}회
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 참여 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>참여 통계</CardTitle>
          <p className="text-sm text-muted-foreground">
            전체 활동에 대한 상세 분석
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.activity.commentsReceived}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MessageCircle className="h-3 w-3" />
                받은 댓글
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.activity.likesReceived}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Heart className="h-3 w-3" />
                받은 좋아요
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.activity.sharesReceived}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Share2 className="h-3 w-3" />
                공유됨
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.socialStats.connections}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="h-3 w-3" />
                연결
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
