'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, RefreshCw, Tag, Info } from 'lucide-react';
import {
  CategoryRecommendation,
  SelectedCategory,
  UseCategoryRecommendationReturn,
} from '@/types/ai';
import { useCategoryRecommendation } from '@/hooks/ai/useCategoryRecommendation';
import { toast } from 'sonner';

interface CategoryRecommendationPanelProps {
  title: string;
  content: string;
  postId?: string;
  initialRecommendations?: CategoryRecommendation[];
  onApply?: (categories: SelectedCategory[]) => void;
  className?: string;
}

export function CategoryRecommendationPanel({
  title,
  content,
  postId,
  initialRecommendations,
  onApply,
  className = '',
}: CategoryRecommendationPanelProps) {
  const {
    recommendCategories,
    applyCategories,
    isRecommending,
    isApplying,
    recommendations: hookRecommendations,
    error,
    clearError,
  } = useCategoryRecommendation();

  const [recommendations, setRecommendations] = useState<
    CategoryRecommendation[]
  >(initialRecommendations || hookRecommendations);
  const [selectedCategories, setSelectedCategories] = useState<
    SelectedCategory[]
  >([]);

  const handleRecommend = async () => {
    try {
      clearError();
      const result = await recommendCategories(title, content);
      setRecommendations(result);

      // 높은 신뢰도의 카테고리들을 자동 선택
      const autoSelected = result
        .filter((rec) => rec.confidence > 0.8)
        .map((rec) => ({
          id: rec.categoryId,
          name: rec.categoryName,
          confidence: rec.confidence,
        }));

      setSelectedCategories(autoSelected);
      toast.success('카테고리 추천이 생성되었습니다.');
    } catch (err) {
      console.error('Category recommendation failed:', err);
      toast.error('카테고리 추천 생성에 실패했습니다.');
    }
  };

  const handleCategoryToggle = (
    recommendation: CategoryRecommendation,
    checked: boolean
  ) => {
    if (checked) {
      const newCategory: SelectedCategory = {
        id: recommendation.categoryId,
        name: recommendation.categoryName,
        confidence: recommendation.confidence,
      };
      setSelectedCategories((prev) => [...prev, newCategory]);
    } else {
      setSelectedCategories((prev) =>
        prev.filter((cat) => cat.id !== recommendation.categoryId)
      );
    }
  };

  const handleApply = async () => {
    if (selectedCategories.length === 0) {
      toast.error('적용할 카테고리를 선택해주세요.');
      return;
    }

    try {
      if (postId) {
        await applyCategories(postId, selectedCategories);
        toast.success('카테고리가 포스트에 적용되었습니다.');
      }

      onApply?.(selectedCategories);
      toast.success('카테고리 설정이 적용되었습니다.');
    } catch (err) {
      console.error('Category application failed:', err);
      toast.error('카테고리 적용에 실패했습니다.');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadgeVariant = (
    confidence: number
  ): 'default' | 'secondary' | 'destructive' => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          AI 카테고리 추천
          {selectedCategories.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {selectedCategories.length}개 선택됨
            </Badge>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={handleRecommend}
              disabled={isRecommending || !title.trim() || !content.trim()}
              size="sm"
              variant="outline"
            >
              {isRecommending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'AI 추천'
              )}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          AI가 콘텐츠 분석을 통해 적절한 카테고리를 추천합니다. 원하는
          카테고리를 선택하여 적용하세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              신뢰도가 높은 카테고리일수록 더 정확한 추천입니다.
            </div>

            <div className="space-y-3">
              {recommendations.map((recommendation) => {
                const isSelected = selectedCategories.some(
                  (cat) => cat.id === recommendation.categoryId
                );

                return (
                  <div
                    key={recommendation.categoryId}
                    className={`p-4 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`category-${recommendation.categoryId}`}
                        checked={isSelected}
                        onCheckedChange={(checked: boolean) =>
                          handleCategoryToggle(recommendation, checked)
                        }
                        className="mt-1"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={`category-${recommendation.categoryId}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {recommendation.categoryName}
                            {recommendation.isExisting && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                기존
                              </Badge>
                            )}
                          </label>

                          <div className="flex items-center gap-2">
                            <Progress
                              value={recommendation.confidence * 100}
                              className="w-16 h-2"
                            />
                            <Badge
                              variant={getConfidenceBadgeVariant(
                                recommendation.confidence
                              )}
                              className="text-xs"
                            >
                              {Math.round(recommendation.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>

                        {recommendation.reasoning && (
                          <p className="text-xs text-muted-foreground">
                            {recommendation.reasoning}
                          </p>
                        )}

                        {recommendation.keyTopics &&
                          recommendation.keyTopics.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {recommendation.keyTopics.map((topic, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCategories.length > 0 && (
              <>
                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">선택된 카테고리</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="default"
                        className="text-sm"
                      >
                        {category.name}
                        <span className="ml-1 opacity-70">
                          ({Math.round(category.confidence * 100)}%)
                        </span>
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="w-full"
                  >
                    {isApplying ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    카테고리 적용
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {recommendations.length === 0 && !isRecommending && (
          <div className="text-center py-8 text-muted-foreground">
            AI 카테고리 추천을 생성하려면 위의 "AI 추천" 버튼을 클릭하세요.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
