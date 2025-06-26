'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Eye,
  // Heart,
  MessageCircle,
  TrendingUp,
  Share2,
  AlertCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProfileStats } from '@/hooks';

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

// export interface ProfileStatsProps {
//   // props는 더 이상 필요 없음 - 내부에서 데이터를 fetch
// }

export function ProfileStats() {
  const { data, isLoading, error } = useProfileStats();
  const [animatedValues, setAnimatedValues] = useState({
    profileViews: 0,
    postsPublished: 0,
    sharesReceived: 0,
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
          postsPublished: Math.round(
            data.activity.postsPublished * easeOutProgress
          ),
          sharesReceived: Math.round(
            data.activity.sharesReceived * easeOutProgress
          ),
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [data, isLoading]);

  // const formatNumber = (num: number) => {
  //   if (num >= 1000) {
  //     return `${(num / 1000).toFixed(1)}k`;
  //   }
  //   return num.toString();
  // };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse"
          >
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-3">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                통계를 불러올 수 없습니다
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 데이터가 없는 경우
  if (!data) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-3">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                통계 데이터가 없습니다
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                게시글을 작성하면 통계가 표시됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 프로필 조회수 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              총 조회수
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {animatedValues.profileViews.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              +{data.profileViews.percentage}% 이번 주
            </p>
          </CardContent>
        </Card>

        {/* 게시글 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              게시글
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {animatedValues.postsPublished}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              평균 조회수 {data.engagement.averageViews}
            </p>
          </CardContent>
        </Card>

        {/* 공유 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              공유
            </CardTitle>
            <Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {animatedValues.sharesReceived}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              참여율 {data.engagement.engagementRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 상세 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 활동 통계 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              활동 통계
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  댓글
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {data.activity.commentsReceived}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Share2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  공유
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {data.activity.sharesReceived}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  평균 참여율
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {data.engagement.engagementRate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기술 스택 레벨 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              기술 스택 분석
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              게시글 내용 기반 분석
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topSkills.length > 0 ? (
              data.topSkills.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {skill.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {skill.level}%
                      </span>
                      <Badge className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium text-xs">
                        {skill.mentions}회 언급
                      </Badge>
                    </div>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  게시글을 작성하면 기술 스택 분석이 표시됩니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
