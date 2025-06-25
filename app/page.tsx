import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlogLayout, Grid, Section } from '@/components/layout/BlogLayout';
import { SupabaseStatus } from '@/components/SupabaseStatus';
import { Sparkles, Rocket, Target, Code, Search, FileText } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI 자동 스타일링',
    description:
      '코드 블록, 제목 구조, 표를 AI가 자동으로 정리해 가독성을 80점 이상으로 향상',
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Rocket,
    title: 'SEO 최적화',
    description:
      '키워드 추출, 메타태그, OG 태그를 AI가 자동 생성하여 검색 노출 극대화',
    color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
  },
  {
    icon: Target,
    title: '스마트 카테고리',
    description:
      '주제 모델링으로 최적의 카테고리를 추천하여 체계적인 블로그 관리',
    color:
      'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  },
];

const stats = [
  {
    icon: Code,
    label: 'AI 스타일링',
    value: '80+점',
    description: '가독성 점수',
  },
  {
    icon: Search,
    label: 'SEO 최적화',
    value: '30%',
    description: '트래픽 증가',
  },
  { icon: FileText, label: '글 작성 시간', value: '50%', description: '단축' },
];

export default function Home() {
  return (
    <BlogLayout>
      {/* Hero Section */}
      <Section className="text-center py-12 md:py-20">
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary" className="mb-4">
              Phase 1 - 개인 사용
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Dom Vlog
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              AI가 자동으로 최적화하는 개인 기술 블로그 플랫폼
            </p>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            글 가독성 향상, SEO 최적화, 카테고리 추천까지 AI가 자동으로
            처리해주는 차세대 블로그 플랫폼입니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button size="lg" className="w-full sm:w-auto">
              블로그 시작하기
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              더 알아보기
            </Button>
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section
        title="핵심 기능"
        subtitle="AI 기술로 더 나은 블로깅 경험을 제공합니다"
        className="py-12"
      >
        <Grid cols={3} gap="lg">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="text-center border-none shadow-sm"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Stats Section */}
      <Section
        title="성과 지표"
        subtitle="데이터로 증명된 Dom Vlog의 효과"
        className="py-12 bg-muted/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-lg"
      >
        <Grid cols={3} gap="md">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="flex justify-center">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </Grid>
      </Section>

      {/* Tech Stack Section */}
      <Section
        title="기술 스택"
        subtitle="최신 기술로 구축된 안정적이고 확장 가능한 플랫폼"
        className="py-12"
      >
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Next.js 15',
            'Supabase',
            'Tailwind CSS',
            'shadcn/ui',
            'Vercel AI SDK',
            'Prisma',
            'TypeScript',
            'Gemini AI',
          ].map((tech) => (
            <Badge key={tech} variant="outline" className="text-sm">
              {tech}
            </Badge>
          ))}
        </div>
      </Section>

      {/* 개발 환경에서만 Supabase 연결 상태 확인 */}
      {process.env.NODE_ENV === 'development' && (
        <Section className="py-6">
          <SupabaseStatus />
        </Section>
      )}
    </BlogLayout>
  );
}
