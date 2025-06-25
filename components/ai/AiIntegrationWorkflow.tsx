'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Search,
  Tag,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAiIntegration } from '@/hooks/ai/useAiIntegration';
import { SeoOptimizationPanel } from './SeoOptimizationPanel';
import { CategoryRecommendationPanel } from './CategoryRecommendationPanel';
import {
  AiIntegrationRequest,
  AiIntegrationResult,
  SelectedCategory,
} from '@/types/ai';
import { SeoRecommendationData } from '@/types/seo';
import { toast } from 'sonner';

interface AiIntegrationWorkflowProps {
  title: string;
  content: string;
  postId?: string;
  onApply?: (result: AiIntegrationResult) => void;
  onSeoApply?: (seoData: SeoRecommendationData) => void;
  onCategoryApply?: (categories: SelectedCategory[]) => void;
  className?: string;
}

interface WorkflowStep {
  id: 'styling' | 'seo' | 'categories';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
}

export function AiIntegrationWorkflow({
  title,
  content,
  postId,
  onApply,
  onSeoApply,
  onCategoryApply,
  className = '',
}: AiIntegrationWorkflowProps) {
  const { processContent, isProcessing, result, error, progress, clearError } =
    useAiIntegration();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'styling',
      label: 'AI 스타일링',
      icon: Brain,
      status: 'pending',
      progress: 0,
    },
    {
      id: 'seo',
      label: 'SEO 최적화',
      icon: Search,
      status: 'pending',
      progress: 0,
    },
    {
      id: 'categories',
      label: '카테고리 추천',
      icon: Tag,
      status: 'pending',
      progress: 0,
    },
  ]);

  const updateStepStatus = useCallback(
    (stepId: string, status: WorkflowStep['status'], progress: number = 0) => {
      setWorkflowSteps((prev) =>
        prev.map((step) =>
          step.id === stepId ? { ...step, status, progress } : step
        )
      );
    },
    []
  );

  const handleIntegratedProcess = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      clearError();

      // Reset workflow steps
      setWorkflowSteps((prev) =>
        prev.map((step) => ({ ...step, status: 'pending', progress: 0 }))
      );

      const request: AiIntegrationRequest = {
        title,
        content,
        enableStyling: true,
        enableSeo: true,
        enableCategories: true,
      };

      // Simulate step progress updates
      const progressInterval = setInterval(() => {
        setWorkflowSteps((prev) =>
          prev.map((step) => {
            if (step.status === 'pending') {
              return { ...step, status: 'running', progress: 10 };
            } else if (step.status === 'running' && step.progress < 90) {
              return { ...step, progress: step.progress + 15 };
            }
            return step;
          })
        );
      }, 500);

      const integrationResult = await processContent(request);

      clearInterval(progressInterval);

      // Update final status based on results
      if (integrationResult.styling?.success) {
        updateStepStatus('styling', 'completed', 100);
      } else {
        updateStepStatus('styling', 'error', 0);
      }

      if (integrationResult.seo?.success) {
        updateStepStatus('seo', 'completed', 100);
      } else {
        updateStepStatus('seo', 'error', 0);
      }

      if (integrationResult.categories?.success) {
        updateStepStatus('categories', 'completed', 100);
      } else {
        updateStepStatus('categories', 'error', 0);
      }

      onApply?.(integrationResult);

      if (integrationResult.overallSuccess) {
        toast.success('AI 통합 처리가 완료되었습니다!');
        setActiveTab('results');
      } else {
        toast.warning(
          '일부 AI 기능에서 오류가 발생했습니다. 개별 탭에서 확인해보세요.'
        );
      }
    } catch (err) {
      console.error('AI integration failed:', err);
      toast.error('AI 통합 처리에 실패했습니다.');

      // Mark all as error
      setWorkflowSteps((prev) =>
        prev.map((step) => ({ ...step, status: 'error', progress: 0 }))
      );
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    const Icon = step.icon;

    if (step.status === 'running') {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    } else if (step.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (step.status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    } else {
      return <Icon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const overallProgress =
    workflowSteps.reduce((acc, step) => acc + step.progress, 0) /
    workflowSteps.length;
  const completedSteps = workflowSteps.filter(
    (step) => step.status === 'completed'
  ).length;
  const errorSteps = workflowSteps.filter(
    (step) => step.status === 'error'
  ).length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          AI 통합 워크플로우
          {isProcessing && (
            <div className="flex items-center gap-2 ml-auto">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">처리 중...</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          AI를 활용한 콘텐츠 스타일링, SEO 최적화, 카테고리 추천을 한 번에
          처리합니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overview Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleIntegratedProcess}
              disabled={isProcessing || !title.trim() || !content.trim()}
              size="lg"
              className="px-8"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  AI 처리 중...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  AI 통합 처리 시작
                </>
              )}
            </Button>

            {(isProcessing || result) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  완료: {completedSteps}
                </div>
                {errorSteps > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    오류: {errorSteps}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress Overview */}
          {(isProcessing || result) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">전체 진행률</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflowSteps.map((step) => (
              <Card key={step.id} className="p-4">
                <div className="flex items-center gap-3">
                  {getStepIcon(step)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{step.label}</div>
                    {step.status === 'running' && (
                      <Progress value={step.progress} className="h-1 mt-2" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="categories">카테고리</TabsTrigger>
            <TabsTrigger value="results">결과</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">예상 처리 시간</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  평균 5-10초 (콘텐츠 길이에 따라 변동)
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">향상 예상 효과</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  가독성 +20%, SEO 점수 +30%, 카테고리 정확도 +85%
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seo">
            <SeoOptimizationPanel
              content={content}
              title={title}
              initialSeoData={result?.seo?.data}
              onApply={onSeoApply}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryRecommendationPanel
              title={title}
              content={content}
              postId={postId}
              initialRecommendations={result?.categories?.data}
              onApply={onCategoryApply}
            />
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {result.overallSuccess ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className="font-medium">
                    {result.overallSuccess
                      ? '모든 AI 처리 완료'
                      : '일부 처리 완료'}
                  </span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    처리 시간: {result.processedAt.toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid gap-4">
                  {result.styling && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4" />
                        <span className="font-medium">AI 스타일링</span>
                        {result.styling.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      {result.styling.success ? (
                        <p className="text-sm text-muted-foreground">
                          가독성 점수: {result.styling.data?.readabilityScore}
                          /100
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">
                          오류: {result.styling.error}
                        </p>
                      )}
                    </Card>
                  )}

                  {result.seo && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-4 h-4" />
                        <span className="font-medium">SEO 최적화</span>
                        {result.seo.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      {result.seo.success ? (
                        <p className="text-sm text-muted-foreground">
                          키워드 {result.seo.data?.keywords.length}개 추출됨
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">
                          오류: {result.seo.error}
                        </p>
                      )}
                    </Card>
                  )}

                  {result.categories && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4" />
                        <span className="font-medium">카테고리 추천</span>
                        {result.categories.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      {result.categories.success ? (
                        <p className="text-sm text-muted-foreground">
                          {result.categories.data?.length}개 카테고리 추천됨
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">
                          오류: {result.categories.error}
                        </p>
                      )}
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                AI 처리를 시작하면 여기에 결과가 표시됩니다.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
