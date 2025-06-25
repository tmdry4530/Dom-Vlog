'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  currentImage?: string;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => Promise<void>;
  maxSize?: number; // bytes
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function ImageUpload({
  currentImage,
  onUpload,
  onRemove,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className,
  disabled = false,
  placeholder = '이미지를 선택하거나 드래그하여 업로드하세요',
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `지원되지 않는 파일 형식입니다. (${acceptedTypes.join(', ')})`;
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `파일 크기가 ${maxSizeMB}MB를 초과합니다.`;
    }

    return null;
  };

  // 파일 처리
  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // 미리보기 생성
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // 업로드 진행률 시뮬레이션 (실제로는 업로드 API에서 제공)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 100);

        // 파일 업로드
        const result = await onUpload(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        // 미리보기 정리
        URL.revokeObjectURL(previewUrl);
        setPreview(null);

        return result;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : '업로드 중 오류가 발생했습니다.'
        );
        if (preview) {
          URL.revokeObjectURL(preview);
          setPreview(null);
        }
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [onUpload, maxSize, acceptedTypes, preview]
  );

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  // 이미지 제거
  const handleRemove = useCallback(async () => {
    if (onRemove) {
      try {
        setIsUploading(true);
        await onRemove();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : '이미지 제거 중 오류가 발생했습니다.'
        );
      } finally {
        setIsUploading(false);
      }
    }
  }, [onRemove]);

  // 업로드 영역 클릭
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 현재 이미지 미리보기 */}
      {displayImage && !isUploading && (
        <div className="relative group">
          <div className="aspect-square w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
            <img
              src={displayImage}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-0 right-0 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* 업로드 진행률 */}
      {isUploading && (
        <div className="space-y-2">
          <div className="aspect-square w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-600">
            업로드 중... {uploadProgress}%
          </p>
        </div>
      )}

      {/* 업로드 영역 */}
      {!displayImage && !isUploading && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
          <p className="text-xs text-gray-500">
            최대 {(maxSize / (1024 * 1024)).toFixed(1)}MB,{' '}
            {acceptedTypes.join(', ')}
          </p>
        </div>
      )}

      {/* 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* 액션 버튼들 */}
      {!isUploading && (
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {currentImage ? '이미지 변경' : '이미지 선택'}
          </Button>
          {currentImage && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              제거
            </Button>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
