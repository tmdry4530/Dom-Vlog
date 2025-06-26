'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface AuthPermissions {
  canWrite: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
  isAllowedUser: boolean;
  isLoading: boolean;
}

export function useAuthPermissions(): AuthPermissions {
  const { user, isLoading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<AuthPermissions>({
    canWrite: false,
    canEdit: false,
    canDelete: false,
    canManage: false,
    isAllowedUser: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkPermissions = async () => {
      console.log('=== useAuthPermissions: checkPermissions called ===');
      console.log(
        'authLoading:',
        authLoading,
        'user:',
        user ? { id: user.id, email: user.email } : null
      );

      if (authLoading) {
        console.log('Auth still loading, setting permissions loading state');
        setPermissions((prev) => ({ ...prev, isLoading: true }));
        return;
      }

      if (!user) {
        console.log('No user found, setting all permissions to false');
        setPermissions({
          canWrite: false,
          canEdit: false,
          canDelete: false,
          canManage: false,
          isAllowedUser: false,
          isLoading: false,
        });
        return;
      }

      try {
        console.log('Making permissions API call...');
        // 허용된 사용자인지 서버에서 확인
        const response = await fetch('/api/auth/permissions');
        const data = await response.json();

        console.log('Permissions API response:', data);

        if (data.success) {
          const newPermissions = {
            canWrite: data.data.canWrite || false,
            canEdit: data.data.canEdit || false,
            canDelete: data.data.canDelete || false,
            canManage: data.data.canManage || false,
            isAllowedUser: data.data.isAllowedUser || false,
            isLoading: false,
          };

          console.log('Setting new permissions:', newPermissions);
          setPermissions(newPermissions);
        } else {
          console.log('Permissions API returned error:', data.error);
          // 권한 확인 실패 시 모든 권한 거부
          setPermissions({
            canWrite: false,
            canEdit: false,
            canDelete: false,
            canManage: false,
            isAllowedUser: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('권한 확인 중 오류:', error);
        setPermissions({
          canWrite: false,
          canEdit: false,
          canDelete: false,
          canManage: false,
          isAllowedUser: false,
          isLoading: false,
        });
      }
    };

    checkPermissions();
  }, [user, authLoading]);

  return permissions;
}
