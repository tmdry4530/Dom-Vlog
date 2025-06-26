import { useState, useEffect } from 'react';
import { ProfileStatsData } from '@/components/profile/ProfileStats';
import { useAuth } from '@/hooks/useAuth';

export function useProfileStats() {
  const [data, setData] = useState<ProfileStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // 인증이 로딩 중이거나 사용자가 없으면 실행하지 않음
    if (authLoading || !user) {
      if (!authLoading && !user) {
        setError('로그인이 필요합니다.');
        setIsLoading(false);
      }
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching stats for user:', user?.id); // 디버깅용

        const response = await fetch('/api/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 쿠키 포함
        });

        console.log(
          'Stats API response:',
          response.status,
          response.statusText
        ); // 디버깅용

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Stats API error response:', errorText); // 디버깅용

          if (response.status === 401) {
            throw new Error('인증이 필요합니다.');
          }
          throw new Error('통계 데이터를 가져오는데 실패했습니다.');
        }

        const statsData = await response.json();
        console.log('Stats data received:', statsData); // 디버깅용
        setData(statsData);
      } catch (error) {
        console.error('Stats fetch error:', error);
        setError(
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, authLoading]);

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      setData(null);
      setIsLoading(true);
      setError(null);
      // 위의 useEffect가 다시 실행됨
    },
  };
}
