'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

import { usePosts } from '@/hooks/usePosts';
import { useNotifications } from '@/hooks/useNotifications';

export interface DeletePostDialogProps {
  isOpen: boolean;
  postId: string;
  postTitle: string;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeletePostDialog({
  isOpen,
  postId,
  postTitle,
  onOpenChange,
  onDeleted,
}: DeletePostDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const { deletePost } = usePosts();
  const { showSuccess, showError } = useNotifications();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const success = await deletePost(postId);

      if (success) {
        showSuccess(
          '포스트 삭제 완료',
          `"${postTitle}" 포스트가 삭제되었습니다.`
        );
        onDeleted?.();
        onOpenChange(false);
      } else {
        showError('삭제 실패', '포스트 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      showError('삭제 실패', '포스트 삭제 중 예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            포스트 삭제 확인
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>다음 포스트를 정말 삭제하시겠습니까?</p>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="font-medium text-sm text-gray-900">{postTitle}</p>
              </div>
              <p className="text-sm text-red-600">
                <strong>주의:</strong> 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
