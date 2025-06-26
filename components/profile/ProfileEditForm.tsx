'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  Save,
  X,
  // Plus,
  User,
  Globe,
  // MapPin,
  Settings,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Link,
  ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
// import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/ui/ImageUpload';

import { useProfile } from '@/hooks/useProfile';
import type { Profile, UpdateProfileData } from '@/hooks/useProfile';

// 프로필 폼 유효성 검사 스키마
const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이하여야 합니다'),
  bio: z.string().max(500, '자기소개는 500자 이하여야 합니다').optional(),
  website: z
    .string()
    .url('유효한 URL을 입력해주세요')
    .optional()
    .or(z.literal('')),
  location: z.string().max(100, '위치는 100자 이하여야 합니다').optional(),
  socialLinks: z
    .object({
      github: z
        .string()
        .url('유효한 GitHub URL을 입력해주세요')
        .optional()
        .or(z.literal('')),
      twitter: z
        .string()
        .url('유효한 Twitter URL을 입력해주세요')
        .optional()
        .or(z.literal('')),
      linkedin: z
        .string()
        .url('유효한 LinkedIn URL을 입력해주세요')
        .optional()
        .or(z.literal('')),
      instagram: z
        .string()
        .url('유효한 Instagram URL을 입력해주세요')
        .optional()
        .or(z.literal('')),
    })
    .optional(),
  settings: z
    .object({
      emailNotifications: z.boolean(),
      publicProfile: z.boolean(),
      showEmail: z.boolean(),
    })
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// 소셜 링크에서 사용자명 추출 함수
const getUsername = (url: string, platform: string): string => {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    switch (platform) {
      case 'github':
        return pathname.replace('/', '') || '';
      case 'twitter':
        return pathname.replace('/', '') || '';
      case 'linkedin':
        return pathname.replace('/in/', '') || '';
      case 'instagram':
        return pathname.replace('/', '') || '';
      default:
        return '';
    }
  } catch {
    // URL이 아닌 경우 사용자명으로 간주
    return url;
  }
};

// 소셜 링크 입력 컴포넌트
interface SocialLinkInputProps {
  icon: React.ReactNode;
  label: string;
  baseUrl: string;
  placeholder: string;
  value: string;
  onChange: (username: string) => void;
  fullUrl: string;
  error?: string;
}

const SocialLinkInput = ({
  icon,
  label,
  baseUrl,
  placeholder,
  value,
  onChange,
  fullUrl,
  error,
}: SocialLinkInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="relative">
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
            {baseUrl}
          </span>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-l-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            placeholder={placeholder}
          />
        </div>
        {fullUrl && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Link className="h-3 w-3" />
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
            >
              {fullUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export interface ProfileEditFormProps {
  onSave?: (profile: Profile) => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ onSave, onCancel }: ProfileEditFormProps) {
  const {
    profile,
    isLoading,
    error,
    uploadProgress: _uploadProgress,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    clearError,
  } = useProfile();

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
      location: profile?.location || '',
      socialLinks: {
        github: profile?.socialLinks?.github || '',
        twitter: profile?.socialLinks?.twitter || '',
        linkedin: profile?.socialLinks?.linkedin || '',
        instagram: profile?.socialLinks?.instagram || '',
      },
      settings: {
        emailNotifications: profile?.settings?.emailNotifications ?? true,
        publicProfile: profile?.settings?.publicProfile ?? true,
        showEmail: profile?.settings?.showEmail ?? false,
      },
    },
    mode: 'onChange',
  });

  const formData = watch();

  // 프로필 데이터가 변경되면 폼 초기화
  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
        socialLinks: {
          github: profile.socialLinks?.github || '',
          twitter: profile.socialLinks?.twitter || '',
          linkedin: profile.socialLinks?.linkedin || '',
          instagram: profile.socialLinks?.instagram || '',
        },
        settings: {
          emailNotifications: profile.settings?.emailNotifications ?? true,
          publicProfile: profile.settings?.publicProfile ?? true,
          showEmail: profile.settings?.showEmail ?? false,
        },
      });
    }
  }, [profile, reset]);

  // 폼 제출
  const onSubmit = async (data: ProfileFormData) => {
    const updateData: UpdateProfileData = {
      displayName: data.displayName,
      bio: data.bio || undefined,
      website: data.website || undefined,
      location: data.location || undefined,
      socialLinks: {
        github: data.socialLinks?.github || undefined,
        twitter: data.socialLinks?.twitter || undefined,
        linkedin: data.socialLinks?.linkedin || undefined,
        instagram: data.socialLinks?.instagram || undefined,
      },
      settings: data.settings,
    };

    const result = await updateProfile(updateData);
    if (result) {
      onSave?.(result);
      reset(data); // 폼 dirty 상태 초기화
    }
  };

  // 아바타 업로드
  const handleAvatarUpload = async (file: File) => {
    const result = await uploadAvatar(file);
    if (result) {
      // 아바타 업로드 성공 시 UI 업데이트는 useProfile 훅에서 처리
      return result;
    }
    throw new Error('아바타 업로드에 실패했습니다.');
  };

  // 아바타 삭제
  const handleAvatarDelete = async () => {
    await deleteAvatar();
  };

  // 에러 메시지 컴포넌트
  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{message}</p>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 전역 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="h-4 w-4 mr-1" />
            닫기
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 기본 정보 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <User className="h-5 w-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 아바타 업로드 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                프로필 사진
              </Label>
              <div className="flex justify-center">
                <ImageUpload
                  currentImage={profile?.avatar}
                  onUpload={handleAvatarUpload}
                  onRemove={handleAvatarDelete}
                />
              </div>
            </div>

            {/* 이름 */}
            <div className="space-y-2">
              <Label
                htmlFor="displayName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                이름 *
              </Label>
              <Input
                id="displayName"
                {...register('displayName')}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                placeholder="이름을 입력하세요"
              />
              <ErrorMessage message={errors.displayName?.message} />
            </div>

            {/* 자기소개 */}
            <div className="space-y-2">
              <Label
                htmlFor="bio"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                자기소개
              </Label>
              <Textarea
                id="bio"
                {...register('bio')}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                placeholder="자기소개를 입력하세요"
                rows={3}
              />
              <ErrorMessage message={errors.bio?.message} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.bio?.length || 0}/500
              </p>
            </div>

            {/* 웹사이트 */}
            <div className="space-y-2">
              <Label
                htmlFor="website"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                웹사이트
              </Label>
              <Input
                id="website"
                {...register('website')}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                placeholder="https://example.com"
              />
              <ErrorMessage message={errors.website?.message} />
            </div>

            {/* 위치 */}
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                위치
              </Label>
              <Input
                id="location"
                {...register('location')}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                placeholder="서울, 대한민국"
              />
              <ErrorMessage message={errors.location?.message} />
            </div>
          </CardContent>
        </Card>

        {/* 소셜 링크 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Globe className="h-5 w-5" />
              소셜 링크
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              사용자명만 입력하시면 자동으로 전체 링크가 생성됩니다.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <SocialLinkInput
              icon={<Github className="h-4 w-4" />}
              label="GitHub"
              baseUrl="https://github.com/"
              placeholder="username"
              value={getUsername(formData.socialLinks?.github || '', 'github')}
              onChange={(username) => {
                const fullUrl = username
                  ? `https://github.com/${username}`
                  : '';
                setValue('socialLinks.github', fullUrl);
              }}
              fullUrl={formData.socialLinks?.github || ''}
              error={errors.socialLinks?.github?.message}
            />

            <SocialLinkInput
              icon={<Twitter className="h-4 w-4" />}
              label="Twitter / X"
              baseUrl="https://twitter.com/"
              placeholder="username"
              value={getUsername(
                formData.socialLinks?.twitter || '',
                'twitter'
              )}
              onChange={(username) => {
                const fullUrl = username
                  ? `https://twitter.com/${username}`
                  : '';
                setValue('socialLinks.twitter', fullUrl);
              }}
              fullUrl={formData.socialLinks?.twitter || ''}
              error={errors.socialLinks?.twitter?.message}
            />

            <SocialLinkInput
              icon={<Linkedin className="h-4 w-4" />}
              label="LinkedIn"
              baseUrl="https://linkedin.com/in/"
              placeholder="username"
              value={getUsername(
                formData.socialLinks?.linkedin || '',
                'linkedin'
              )}
              onChange={(username) => {
                const fullUrl = username
                  ? `https://linkedin.com/in/${username}`
                  : '';
                setValue('socialLinks.linkedin', fullUrl);
              }}
              fullUrl={formData.socialLinks?.linkedin || ''}
              error={errors.socialLinks?.linkedin?.message}
            />

            <SocialLinkInput
              icon={<Instagram className="h-4 w-4" />}
              label="Instagram"
              baseUrl="https://instagram.com/"
              placeholder="username"
              value={getUsername(
                formData.socialLinks?.instagram || '',
                'instagram'
              )}
              onChange={(username) => {
                const fullUrl = username
                  ? `https://instagram.com/${username}`
                  : '';
                setValue('socialLinks.instagram', fullUrl);
              }}
              fullUrl={formData.socialLinks?.instagram || ''}
              error={errors.socialLinks?.instagram?.message}
            />
          </CardContent>
        </Card>

        {/* 개인정보 설정 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Settings className="h-5 w-5" />
              개인정보 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  이메일 알림
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  새로운 활동에 대한 이메일 알림을 받습니다
                </p>
              </div>
              <Switch
                checked={formData.settings?.emailNotifications}
                onCheckedChange={(checked) =>
                  setValue('settings.emailNotifications', checked, {
                    shouldDirty: true,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  공개 프로필
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  다른 사용자가 프로필을 볼 수 있습니다
                </p>
              </div>
              <Switch
                checked={formData.settings?.publicProfile}
                onCheckedChange={(checked) =>
                  setValue('settings.publicProfile', checked, {
                    shouldDirty: true,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  이메일 주소 공개
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  프로필에 이메일 주소를 표시합니다
                </p>
              </div>
              <Switch
                checked={formData.settings?.showEmail}
                onCheckedChange={(checked) =>
                  setValue('settings.showEmail', checked, { shouldDirty: true })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  취소
                </Button>
              )}
              <Button
                type="submit"
                disabled={!isDirty || !isValid || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    변경 사항 저장
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
