'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Eye, FileText, Tag, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { usePosts } from '@/hooks/usePosts';
import { useNotifications } from '@/hooks/useNotifications';
import type { Post, CreatePostData, UpdatePostData } from '@/hooks/usePosts';

// 폼 유효성 검사 스키마
const postSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이하여야 합니다'),
  content: z.string().min(10, '내용은 최소 10자 이상 입력해주세요'),
  excerpt: z.string().max(300, '요약은 300자 이하여야 합니다').optional(),
  categories: z
    .array(z.string())
    .max(5, '카테고리는 최대 5개까지 선택할 수 있습니다'),
  status: z.enum(['draft', 'published']),
});

type PostFormData = z.infer<typeof postSchema>;

export interface PostEditorProps {
  postId?: string;
  initialData?: Post;
  onSave?: (post: Post) => void;
  onCancel?: () => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export function PostEditor({
  postId,
  initialData,
  onSave,
  onCancel,
  autoSave = true,
  autoSaveInterval = 30000, // 30초
}: PostEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  const { createPost, updatePost, isLoading } = usePosts();
  const { showSuccess, showError } = useNotifications();

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      categories: initialData?.categories?.map((cat) => cat.id) || [],
      status: initialData?.status || 'draft',
    },
    mode: 'onChange',
  });

  // 폼 데이터 감시
  const formData = watch();

  // 자동 저장 로직
  const autoSavePost = useCallback(
    async (data: PostFormData) => {
      if (!isDirty || !isValid) return;

      try {
        setSaveStatus('saving');

        if (postId) {
          const updateData: UpdatePostData = { ...data, id: postId };
          await updatePost(updateData);
        } else {
          await createPost(data as CreatePostData);
        }

        setLastSaved(new Date());
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
        showError('자동 저장 실패', '잠시 후 다시 시도됩니다.');
      }
    },
    [postId, updatePost, createPost, isDirty, isValid, showError]
  );

  // 수동 저장
  const onSubmit = async (data: PostFormData) => {
    try {
      setSaveStatus('saving');

      let result: Post | null = null;

      if (postId) {
        const updateData: UpdatePostData = { ...data, id: postId };
        result = await updatePost(updateData);
      } else {
        result = await createPost(data as CreatePostData);
      }

      if (result) {
        setLastSaved(new Date());
        setSaveStatus('saved');
        showSuccess('저장 완료', '포스트가 성공적으로 저장되었습니다.');
        onSave?.(result);
        reset(data); // 저장 후 폼 dirty 상태 초기화
      }
    } catch (error) {
      setSaveStatus('error');
      showError('저장 실패', '포스트 저장 중 오류가 발생했습니다.');
    }
  };

  // 자동 저장 타이머
  useEffect(() => {
    if (!autoSave) return;

    const timer = setInterval(() => {
      if (isDirty && isValid) {
        autoSavePost(formData);
      }
    }, autoSaveInterval);

    return () => clearInterval(timer);
  }, [autoSave, autoSaveInterval, isDirty, isValid, formData, autoSavePost]);

  // 자동 요약 생성
  const generateExcerpt = useCallback(() => {
    const content = formData.content;
    if (content && content.length > 150) {
      const excerpt = content.substring(0, 147) + '...';
      setValue('excerpt', excerpt, { shouldDirty: true });
    }
  }, [formData.content, setValue]);

  // 저장 상태 표시
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            저장 중...
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Save className="h-4 w-4" />
            {lastSaved && `${lastSaved.toLocaleTimeString()}에 저장됨`}
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <FileText className="h-4 w-4" />
            저장 실패
          </div>
        );
      default:
        return null;
    }
  };

  // 카테고리 목록 (임시 데이터)
  const availableCategories = [
    'Next.js',
    'React',
    'TypeScript',
    'JavaScript',
    'CSS',
    'Node.js',
    'Database',
    'DevOps',
    'AI/ML',
    'Web Development',
    'Mobile',
    'Backend',
    'Frontend',
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {postId ? '포스트 편집' : '새 포스트 작성'}
          </h1>
          <div className="flex items-center gap-4">
            {renderSaveStatus()}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewMode ? '편집' : '미리보기'}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </>
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  취소
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 편집 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="포스트 제목을 입력하세요"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <Label htmlFor="content">내용 *</Label>
              {isPreviewMode ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="prose prose-gray max-w-none">
                      {formData.content ? (
                        <pre className="whitespace-pre-wrap font-sans">
                          {formData.content}
                        </pre>
                      ) : (
                        <p className="text-gray-500">내용을 입력하세요...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Textarea
                  id="content"
                  {...register('content')}
                  placeholder="Markdown 또는 일반 텍스트로 내용을 작성하세요..."
                  className={`min-h-[400px] ${errors.content ? 'border-red-500' : ''}`}
                />
              )}
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 발행 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  발행 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'draft' | 'published') =>
                      setValue('status', value, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">임시저장</SelectItem>
                      <SelectItem value="published">발행</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 요약 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  요약
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="excerpt">포스트 요약</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateExcerpt}
                    >
                      자동 생성
                    </Button>
                  </div>
                  <Textarea
                    id="excerpt"
                    {...register('excerpt')}
                    placeholder="포스트 요약을 입력하세요 (선택사항)"
                    className={`${errors.excerpt ? 'border-red-500' : ''}`}
                    rows={3}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-600">
                      {errors.excerpt.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 카테고리 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  카테고리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>선택된 카테고리</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((categoryId) => (
                      <Badge
                        key={categoryId}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          const newCategories = formData.categories.filter(
                            (id) => id !== categoryId
                          );
                          setValue('categories', newCategories, {
                            shouldDirty: true,
                          });
                        }}
                      >
                        {categoryId} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>사용 가능한 카테고리</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories
                      .filter((cat) => !formData.categories.includes(cat))
                      .map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            if (formData.categories.length < 5) {
                              const newCategories = [
                                ...formData.categories,
                                category,
                              ];
                              setValue('categories', newCategories, {
                                shouldDirty: true,
                              });
                            }
                          }}
                        >
                          {category} +
                        </Badge>
                      ))}
                  </div>
                </div>

                {errors.categories && (
                  <p className="text-sm text-red-600">
                    {errors.categories.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
