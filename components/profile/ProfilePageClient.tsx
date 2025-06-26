'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Award,
  Target,
  Settings,
  BarChart3,
  MessageCircle,
  TrendingUp,
  Loader2,
} from 'lucide-react';

import { ProfileEditForm, ProfileStats } from '@/components/profile';

// 샘플 프로필 데이터
const profileData = {
  name: 'Dom',
  email: 'dom@example.com',
  avatar: '/placeholder.svg',
  bio: '풀스택 개발자이자 블록체인 전문가입니다. AI와 웹 기술을 활용한 혁신적인 솔루션을 개발하고 있습니다.',
  location: '서울, 대한민국',
  website: 'https://domvlog.com',
  joinedAt: '2023-01-15T00:00:00Z',
  social: {
    github: 'https://github.com/dom',
    twitter: 'https://twitter.com/dom',
    linkedin: 'https://linkedin.com/in/dom',
    instagram: 'https://instagram.com/dom',
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

export function ProfilePageClient() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const joinedDate = new Date(profileData.joinedAt).toLocaleDateString(
    'ko-KR',
    {
      year: 'numeric',
      month: 'long',
    }
  );

  // hydration이 완료되기 전까지는 서버와 동일한 상태로 렌더링
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <Header toggleMobileSidebar={() => {}} />
        <div className="flex">
          <Sidebar isMobileSidebarOpen={false} toggleMobileSidebar={() => {}} />
          <main className="flex-1 lg:ml-80 pt-14">
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">프로필</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  프로필 및 활동 현황을 확인해보세요.
                </p>
              </div>
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Header toggleMobileSidebar={toggleMobileSidebar} />
      <div className="flex">
        <Sidebar
          isMobileSidebarOpen={isMobileSidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <main className="flex-1 lg:ml-80 pt-14">
          <div className="p-6 max-w-6xl mx-auto">
            {/* Main Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">프로필</h1>
              <p className="text-gray-600 dark:text-gray-400">
                개발자 정보 및 활동 현황
              </p>
            </div>

            <div className="space-y-8">
              {/* Profile Header */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    <Avatar className="h-32 w-32 mx-auto lg:mx-0 border-4 border-gray-100 dark:border-gray-700">
                      <AvatarImage
                        src={profileData.avatar}
                        alt={profileData.name}
                      />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {profileData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center lg:text-left space-y-6">
                      <div className="space-y-3">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                          {profileData.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                          {profileData.bio}
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {profileData.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {profileData.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {joinedDate}부터 활동
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                        {profileData.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <a
                              href={profileData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              웹사이트
                            </a>
                          </Button>
                        )}
                        {profileData.social?.github && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <a
                              href={profileData.social.github}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              GitHub
                            </a>
                          </Button>
                        )}
                        {profileData.social?.twitter && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <a
                              href={profileData.social.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Twitter className="h-4 w-4 mr-2" />
                              Twitter
                            </a>
                          </Button>
                        )}
                        {profileData.social?.linkedin && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <a
                              href={profileData.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Linkedin className="h-4 w-4 mr-2" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                        {profileData.social?.instagram && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <a
                              href={profileData.social.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram className="h-4 w-4 mr-2" />
                              Instagram
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabbed Interface */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                  >
                    <User className="h-4 w-4" />
                    개요
                  </TabsTrigger>
                  <TabsTrigger
                    value="statistics"
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                  >
                    <BarChart3 className="h-4 w-4" />
                    통계
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                  >
                    <Settings className="h-4 w-4" />
                    설정
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-8 mt-8">
                  {/* 기술 스택 및 성취 배지 */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Skills & Interests */}
                    <div className="space-y-8">
                      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardHeader className="pb-6">
                          <CardTitle className="text-gray-900 dark:text-white">
                            기술 스택
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            주요 개발 기술과 도구들
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-3">
                            {profileData.skills.map((skill) => (
                              <Badge
                                key={skill}
                                className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardHeader className="pb-6">
                          <CardTitle className="text-gray-900 dark:text-white">
                            관심 분야
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            주요 관심사와 연구 영역
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-3">
                            {profileData.interests.map((interest) => (
                              <Badge
                                key={interest}
                                variant="secondary"
                                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Achievements */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-gray-900 dark:text-white">
                          성취 배지
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          블로깅 여정에서 얻은 성취들
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 gap-4">
                          {achievements.map((achievement) => (
                            <div
                              key={achievement.name}
                              className={`p-4 rounded-lg border text-center space-y-3 transition-all ${
                                achievement.earned
                                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50'
                                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                              }`}
                            >
                              <div
                                className={`mx-auto h-10 w-10 rounded-full flex items-center justify-center ${
                                  achievement.earned
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                }`}
                              >
                                <achievement.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                                  {achievement.name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {achievement.description}
                                </p>
                              </div>
                              {achievement.earned && (
                                <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                                  달성
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="statistics" className="space-y-8 mt-8">
                  <ProfileStats />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-8 mt-8">
                  <ProfileEditForm />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
