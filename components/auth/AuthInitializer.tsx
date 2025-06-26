'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Hydration이 완료되고 인증이 초기화될 때까지 기본 레이아웃만 표시
  if (!isHydrated || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
