import { Metadata } from 'next';
import { BlogLayout, Grid, Section } from '@/components/layout/BlogLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Github,
  Twitter,
  Edit,
  FileText,
  Eye,
  MessageCircle,
  TrendingUp,
  Award,
  Target,
  Settings,
  BarChart3,
  Activity,
} from 'lucide-react';

import {
  ProfileEditForm,
  ProfileStats,
  ProfileActivityFeed,
} from '@/components/profile';

export const metadata: Metadata = {
  title: '프로필',
  description: 'Dom Vlog 프로필 및 활동 현황을 확인해보세요.',
};

// 샘플 프로필 데이터
const profileData = {
  name: 'Dom',
  email: 'dom@example.com',
  avatar: '/avatar.jpg',
  bio: '풀스택 개발자이자 블록체인 전문가입니다. AI와 웹 기술을 활용한 혁신적인 솔루션을 개발하고 있습니다.',
  location: '서울, 대한민국',
  website: 'https://domvlog.com',
  joinedAt: '2023-01-15T00:00:00Z',
  social: {
    github: 'https://github.com/dom',
    twitter: 'https://twitter.com/dom',
  },
  skills: [
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Supabase',
    'PostgreSQL',
    'Tailwind CSS',
    'AI/ML',
    'Blockchain',
    'Solidity',
  ],
  interests: ['AI', '블록체인', '웹 개발', 'DevOps', 'UI/UX'],
};

// 통계 데이터
const stats = [
  {
    label: '총 게시글',
    value: '42',
    icon: FileText,
    description: '지금까지 작성한 글',
    trend: '+5 this month',
  },
  {
    label: '총 조회수',
    value: '12.5K',
    icon: Eye,
    description: '누적 조회 수',
    trend: '+15% this month',
  },
  {
    label: '총 댓글',
    value: '256',
    icon: MessageCircle,
    description: '받은 댓글 수',
    trend: '+8 this week',
  },
  {
    label: 'AI 최적화',
    value: '89%',
    icon: TrendingUp,
    description: 'AI 스타일링 적용률',
    trend: 'Improved 5%',
  },
];

// 최근 활동
const recentActivities = [
  {
    type: 'post',
    title: 'Next.js 15 App Router 완벽 가이드',
    description: '새로운 블로그 포스트를 발행했습니다.',
    timestamp: '2024-01-15T09:00:00Z',
    status: 'published',
  },
  {
    type: 'ai_enhancement',
    title: 'Supabase 실시간 데이터베이스',
    description: 'AI가 글 구조를 최적화했습니다.',
    timestamp: '2024-01-14T14:30:00Z',
    status: 'enhanced',
  },
  {
    type: 'comment',
    title: 'TypeScript 5.0 새로운 기능',
    description: '새로운 댓글을 받았습니다.',
    timestamp: '2024-01-13T11:20:00Z',
    status: 'received',
  },
];

// 성취 배지
const achievements = [
  {
    name: '첫 포스트',
    description: '첫 번째 블로그 글 발행',
    icon: Award,
    earned: true,
  },
  {
    name: 'AI 마스터',
    description: 'AI 최적화 50회 달성',
    icon: Target,
    earned: true,
  },
  {
    name: '인기 작가',
    description: '월 1000회 조회수 달성',
    icon: TrendingUp,
    earned: true,
  },
  {
    name: '소통왕',
    description: '댓글 100개 달성',
    icon: MessageCircle,
    earned: false,
  },
];

export default function ProfilePage() {
  const joinedDate = new Date(profileData.joinedAt).toLocaleDateString(
    'ko-KR',
    {
      year: 'numeric',
      month: 'long',
    }
  );

  return (
    <BlogLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <Section>
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <Avatar className="h-24 w-24 mx-auto md:mx-0">
                  <AvatarImage
                    src={profileData.avatar}
                    alt={profileData.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {profileData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profileData.name}</h1>
                    <p className="text-muted-foreground mt-2">
                      {profileData.bio}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profileData.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profileData.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {joinedDate}부터 활동
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={profileData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        웹사이트
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={profileData.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4 mr-1" />
                        GitHub
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={profileData.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-4 w-4 mr-1" />
                        Twitter
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Section>

        {/* Tabbed Interface */}
        <Section>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                개요
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                통계
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                활동
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                설정
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Grid cols={2} gap="lg">
                {/* Skills & Interests */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>기술 스택</CardTitle>
                      <CardDescription>주요 개발 기술과 도구들</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>관심 분야</CardTitle>
                      <CardDescription>주요 관심사와 연구 영역</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profileData.interests.map((interest) => (
                          <Badge key={interest} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>성취 배지</CardTitle>
                    <CardDescription>
                      블로깅 여정에서 얻은 성취들
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.name}
                          className={`p-4 rounded-lg border text-center space-y-3 ${
                            achievement.earned
                              ? 'border-primary/20'
                              : 'opacity-60'
                          }`}
                        >
                          <div
                            className={`mx-auto h-10 w-10 rounded-full flex items-center justify-center ${
                              achievement.earned
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <achievement.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">
                              {achievement.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {achievement.description}
                            </p>
                          </div>
                          {achievement.earned && (
                            <Badge className="text-xs">달성</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <ProfileStats />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <ProfileActivityFeed />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <ProfileEditForm />
            </TabsContent>
          </Tabs>
        </Section>
      </div>
    </BlogLayout>
  );
}
