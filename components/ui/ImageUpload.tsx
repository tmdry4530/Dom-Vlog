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
  placeholder: _placeholder = '이미지를 선택하거나 드래그하여 업로드하세요',
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
    [onUpload, maxSize, acceptedTypes, preview, validateFile]
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
        <div className="relative group w-fit mx-auto">
          <div className="aspect-square w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600">
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
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* 업로드 진행률 */}
      {isUploading && (
        <div className="space-y-3 w-fit mx-auto">
          <div className="aspect-square w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            업로드 중... {uploadProgress}%
          </p>
        </div>
      )}

      {/* 업로드 영역 */}
      {!displayImage && !isUploading && (
        <div className="w-fit mx-auto">
          <div
            className={cn(
              'border-2 border-dashed rounded-full w-24 h-24 flex flex-col items-center justify-center cursor-pointer transition-colors',
              isDragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
              이미지 선택
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            최대 {(maxSize / (1024 * 1024)).toFixed(1)}MB
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
            className="gap-2 text-xs"
          >
            <Upload className="h-3 w-3" />
            {currentImage ? '변경' : '선택'}
          </Button>
          {currentImage && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="gap-2 text-red-600 hover:text-red-700 text-xs"
            >
              <X className="h-3 w-3" />
              제거
            </Button>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
