'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ConnectionStatus {
  success: boolean;
  message: string;
  supabaseUrl?: string;
  error?: string;
  details?: string;
  timestamp?: string;
}

export function SupabaseStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/supabase-test');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        message: '연결 테스트 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🔗 Supabase 연결 상태
      </h3>

      <Button
        onClick={checkConnection}
        disabled={isLoading}
        size="sm"
        variant="outline"
        className="mb-4"
      >
        {isLoading ? '연결 확인 중...' : '연결 테스트'}
      </Button>

      {status && (
        <div
          className={`p-4 rounded-md ${
            status.success
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-sm font-medium ${
                status.success
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}
            >
              {status.success ? '✅ 연결 성공' : '❌ 연결 실패'}
            </span>
          </div>

          <p
            className={`text-sm ${
              status.success
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {status.message}
          </p>

          {status.supabaseUrl && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              URL: {status.supabaseUrl}
            </p>
          )}

          {status.details && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {status.details}
            </p>
          )}

          {status.timestamp && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              테스트 시간: {new Date(status.timestamp).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
      )}

      {!status && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          연결 테스트 버튼을 클릭하여 Supabase 연결 상태를 확인해보세요.
        </p>
      )}
    </div>
  );
}
