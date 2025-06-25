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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Circle,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { SeoRecommendationData, SEOValidationResult } from '@/types/seo';
import { useSeoOptimization } from '@/hooks/ai/useSeoOptimization';
import { toast } from 'sonner';

interface SeoOptimizationPanelProps {
  content: string;
  title: string;
  initialSeoData?: SeoRecommendationData;
  onApply?: (seoData: SeoRecommendationData) => void;
  className?: string;
}

export function SeoOptimizationPanel({
  content,
  title,
  initialSeoData,
  onApply,
  className = '',
}: SeoOptimizationPanelProps) {
  const {
    generateSeoData,
    validateSeo,
    isGenerating,
    isValidating,
    seoData: hookSeoData,
    validationResult,
    error,
    clearError,
  } = useSeoOptimization();

  const [seoData, setSeoData] = useState<SeoRecommendationData | null>(
    initialSeoData || hookSeoData
  );
  const [editedData, setEditedData] = useState<Partial<SeoRecommendationData>>(
    {}
  );

  const handleGenerate = async () => {
    try {
      clearError();
      const result = await generateSeoData(content, title);
      setSeoData(result);
      setEditedData({});
      toast.success('SEO 추천이 생성되었습니다.');
    } catch (err) {
      console.error('SEO generation failed:', err);
      toast.error('SEO 추천 생성에 실패했습니다.');
    }
  };

  const handleValidate = async () => {
    if (!seoData) return;

    try {
      clearError();
      await validateSeo(content);
      toast.success('SEO 검증이 완료되었습니다.');
    } catch (err) {
      console.error('SEO validation failed:', err);
      toast.error('SEO 검증에 실패했습니다.');
    }
  };

  const handleApply = () => {
    if (!seoData) return;

    const finalData = {
      ...seoData,
      ...editedData,
    };

    onApply?.(finalData);
    toast.success('SEO 설정이 적용되었습니다.');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다.');
  };

  const currentSeoData = seoData ? { ...seoData, ...editedData } : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            SEO 최적화
            {validationResult && (
              <Badge
                variant={
                  validationResult.overallScore >= 80 ? 'default' : 'secondary'
                }
                className="ml-2"
              >
                점수: {validationResult.overallScore}
              </Badge>
            )}
          </div>
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !content.trim() || !title.trim()}
              size="sm"
              variant="outline"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'AI 추천'
              )}
            </Button>
            {currentSeoData && (
              <Button
                onClick={handleValidate}
                disabled={isValidating}
                size="sm"
                variant="outline"
              >
                검증
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          AI가 제안한 SEO 최적화 요소들을 확인하고 수정한 후 적용하세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {validationResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SEO 점수</span>
              <span className="text-sm text-muted-foreground">
                {validationResult.overallScore}/100
              </span>
            </div>
            <Progress value={validationResult.overallScore} className="h-2" />

            {validationResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-destructive">
                  개선 사항
                </span>
                <ul className="space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <Circle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {currentSeoData && (
          <div className="space-y-4">
            {/* 제목 추천 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo-title">SEO 제목</Label>
                <Button
                  onClick={() => handleCopy(currentSeoData.metaTitle)}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <Textarea
                id="seo-title"
                value={editedData.metaTitle ?? currentSeoData.metaTitle}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    metaTitle: e.target.value,
                  })
                }
                placeholder="SEO에 최적화된 제목"
                rows={2}
                maxLength={60}
              />
              <div className="text-xs text-muted-foreground text-right">
                {(editedData.metaTitle ?? currentSeoData.metaTitle).length}
                /60
              </div>
            </div>

            {/* 메타 설명 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta-description">메타 설명</Label>
                <Button
                  onClick={() => handleCopy(currentSeoData.metaDescription)}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <Textarea
                id="meta-description"
                value={
                  editedData.metaDescription ?? currentSeoData.metaDescription
                }
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    metaDescription: e.target.value,
                  })
                }
                placeholder="검색 결과에 표시될 설명"
                rows={3}
                maxLength={160}
              />
              <div className="text-xs text-muted-foreground text-right">
                {
                  (editedData.metaDescription ?? currentSeoData.metaDescription)
                    .length
                }
                /160
              </div>
            </div>

            {/* URL 슬러그 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="url-slug">URL 슬러그</Label>
                <Button
                  onClick={() => handleCopy(currentSeoData.suggestedSlug)}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <Input
                id="url-slug"
                value={editedData.suggestedSlug ?? currentSeoData.suggestedSlug}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    suggestedSlug: e.target.value,
                  })
                }
                placeholder="url-friendly-slug"
              />
            </div>

            {/* 키워드 */}
            <div className="space-y-2">
              <Label>추천 키워드</Label>
              <div className="flex flex-wrap gap-2">
                {currentSeoData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 신뢰도 */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">AI 추천 신뢰도</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={currentSeoData.confidence.overall * 100}
                  className="w-20 h-2"
                />
                <span className="text-sm font-medium">
                  {Math.round(currentSeoData.confidence.overall * 100)}%
                </span>
              </div>
            </div>

            <Separator />

            {/* 적용 버튼 */}
            <div className="flex gap-2">
              <Button onClick={handleApply} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                SEO 설정 적용
              </Button>
              {validationResult && (
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(
                      window.location.origin
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {!currentSeoData && !isGenerating && (
          <div className="text-center py-8 text-muted-foreground">
            AI SEO 추천을 생성하려면 위의 "AI 추천" 버튼을 클릭하세요.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
