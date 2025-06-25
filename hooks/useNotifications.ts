import { useCallback } from 'react';
import { toast } from 'sonner';
import { useGlobalStore } from '@/lib/stores/useGlobalStore';
import type { Notification } from '@/lib/stores/useGlobalStore';

export interface UseNotificationsResult {
  notifications: Notification[];
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showCustom: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export function useNotifications(): UseNotificationsResult {
  const {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  } = useGlobalStore();

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      toast.success(title, {
        description: message,
      });
      addNotification({
        type: 'success',
        title,
        message,
      });
    },
    [addNotification]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      toast.error(title, {
        description: message,
      });
      addNotification({
        type: 'error',
        title,
        message,
        duration: 8000, // 에러는 조금 더 오래 표시
      });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      toast.info(title, {
        description: message,
      });
      addNotification({
        type: 'info',
        title,
        message,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      toast.warning(title, {
        description: message,
      });
      addNotification({
        type: 'warning',
        title,
        message,
      });
    },
    [addNotification]
  );

  const showCustom = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const { type, title, message, action } = notification;

      // Sonner 토스트 표시
      const toastAction = action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined;

      switch (type) {
        case 'success':
          toast.success(title, { description: message, action: toastAction });
          break;
        case 'error':
          toast.error(title, { description: message, action: toastAction });
          break;
        case 'info':
          toast.info(title, { description: message, action: toastAction });
          break;
        case 'warning':
          toast.warning(title, { description: message, action: toastAction });
          break;
      }

      // 전역 상태에 추가
      addNotification(notification);
    },
    [addNotification]
  );

  return {
    notifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showCustom,
    removeNotification,
    clearNotifications,
  };
}
