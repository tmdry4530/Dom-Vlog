'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  Save,
  X,
  Plus,
  User,
  Globe,
  MapPin,
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/ui/ImageUpload';

import { useProfile } from '@/hooks/useProfile';
import type { Profile, UpdateProfileData } from '@/hooks/useProfile';

// 프로필 폼 유효성 검사 스키마
const profileSchema = z.object({
  name: z
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
  skills: z
    .array(z.string())
    .max(20, '기술 스택은 최대 20개까지 추가할 수 있습니다'),
  interests: z
    .array(z.string())
    .max(20, '관심사는 최대 20개까지 추가할 수 있습니다'),
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

export interface ProfileEditFormProps {
  onSave?: (profile: Profile) => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ onSave, onCancel }: ProfileEditFormProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const {
    profile,
    isLoading,
    error,
    uploadProgress,
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
      name: profile?.name || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
      location: profile?.location || '',
      skills: profile?.skills || [],
      interests: profile?.interests || [],
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
        name: profile.name,
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
        skills: profile.skills,
        interests: profile.interests,
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
      name: data.name,
      bio: data.bio || undefined,
      website: data.website || undefined,
      location: data.location || undefined,
      skills: data.skills,
      interests: data.interests,
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

  // 기술 스택 추가
  const addSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setValue('skills', [...formData.skills, trimmedSkill], {
        shouldDirty: true,
      });
      setNewSkill('');
    }
  };

  // 기술 스택 제거
  const removeSkill = (skillToRemove: string) => {
    setValue(
      'skills',
      formData.skills.filter((skill) => skill !== skillToRemove),
      { shouldDirty: true }
    );
  };

  // 관심사 추가
  const addInterest = () => {
    const trimmedInterest = newInterest.trim();
    if (trimmedInterest && !formData.interests.includes(trimmedInterest)) {
      setValue('interests', [...formData.interests, trimmedInterest], {
        shouldDirty: true,
      });
      setNewInterest('');
    }
  };

  // 관심사 제거
  const removeInterest = (interestToRemove: string) => {
    setValue(
      'interests',
      formData.interests.filter((interest) => interest !== interestToRemove),
      { shouldDirty: true }
    );
  };

  // 아바타 업로드
  const handleAvatarUpload = async (file: File) => {
    const result = await uploadAvatar(file);
    if (result) {
      return result;
    }
    throw new Error('아바타 업로드에 실패했습니다.');
  };

  // 아바타 삭제
  const handleAvatarDelete = async () => {
    await deleteAvatar();
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">프로필 편집</h1>
            <p className="text-gray-600 mt-1">개인 정보와 설정을 관리하세요</p>
          </div>
          <div className="flex gap-2">
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

        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-red-600 font-medium">
                  오류가 발생했습니다
                </div>
                <div className="text-red-500 text-sm mt-1">{error}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearError}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 아바타 및 기본 정보 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 아바타 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  프로필 이미지
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  currentImage={profile.avatar}
                  onUpload={handleAvatarUpload}
                  onRemove={handleAvatarDelete}
                  placeholder="프로필 이미지를 업로드하세요"
                />
              </CardContent>
            </Card>

            {/* 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>이메일 알림</Label>
                    <p className="text-sm text-gray-500">
                      새로운 댓글이나 알림을 이메일로 받습니다
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>공개 프로필</Label>
                    <p className="text-sm text-gray-500">
                      다른 사용자들이 프로필을 볼 수 있습니다
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>이메일 공개</Label>
                    <p className="text-sm text-gray-500">
                      프로필에서 이메일 주소를 공개합니다
                    </p>
                  </div>
                  <Switch
                    checked={formData.settings?.showEmail}
                    onCheckedChange={(checked) =>
                      setValue('settings.showEmail', checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 우측: 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 이름 */}
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="이름을 입력하세요"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* 자기소개 */}
                <div className="space-y-2">
                  <Label htmlFor="bio">자기소개</Label>
                  <Textarea
                    id="bio"
                    {...register('bio')}
                    placeholder="자신을 소개해보세요..."
                    className={errors.bio ? 'border-red-500' : ''}
                    rows={4}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>

                {/* 웹사이트 */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    웹사이트
                  </Label>
                  <Input
                    id="website"
                    {...register('website')}
                    placeholder="https://example.com"
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-600">
                      {errors.website.message}
                    </p>
                  )}
                </div>

                {/* 위치 */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    위치
                  </Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="서울, 대한민국"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 기술 스택 */}
            <Card>
              <CardHeader>
                <CardTitle>기술 스택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="새 기술 추가"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSkill}
                    disabled={!newSkill.trim() || formData.skills.length >= 20}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {errors.skills && (
                  <p className="text-sm text-red-600">
                    {errors.skills.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 관심사 */}
            <Card>
              <CardHeader>
                <CardTitle>관심사</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => removeInterest(interest)}
                    >
                      {interest} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="새 관심사 추가"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInterest();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInterest}
                    disabled={
                      !newInterest.trim() || formData.interests.length >= 20
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {errors.interests && (
                  <p className="text-sm text-red-600">
                    {errors.interests.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 소셜 링크 */}
            <Card>
              <CardHeader>
                <CardTitle>소셜 링크</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    {...register('socialLinks.github')}
                    placeholder="https://github.com/username"
                    className={
                      errors.socialLinks?.github ? 'border-red-500' : ''
                    }
                  />
                  {errors.socialLinks?.github && (
                    <p className="text-sm text-red-600">
                      {errors.socialLinks.github.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    {...register('socialLinks.twitter')}
                    placeholder="https://twitter.com/username"
                    className={
                      errors.socialLinks?.twitter ? 'border-red-500' : ''
                    }
                  />
                  {errors.socialLinks?.twitter && (
                    <p className="text-sm text-red-600">
                      {errors.socialLinks.twitter.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    {...register('socialLinks.linkedin')}
                    placeholder="https://linkedin.com/in/username"
                    className={
                      errors.socialLinks?.linkedin ? 'border-red-500' : ''
                    }
                  />
                  {errors.socialLinks?.linkedin && (
                    <p className="text-sm text-red-600">
                      {errors.socialLinks.linkedin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...register('socialLinks.instagram')}
                    placeholder="https://instagram.com/username"
                    className={
                      errors.socialLinks?.instagram ? 'border-red-500' : ''
                    }
                  />
                  {errors.socialLinks?.instagram && (
                    <p className="text-sm text-red-600">
                      {errors.socialLinks.instagram.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
