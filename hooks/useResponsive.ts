'use client';

import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  isXLarge: boolean;
  currentBreakpoint: Breakpoint;
  width: number;
  height: number;
}

// Tailwind CSS 기본 브레이크포인트
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export function useResponsive(): UseResponsiveReturn {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // 초기 크기 설정
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = windowSize;

  // 브레이크포인트별 상태
  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;
  const isLarge = width >= breakpoints.xl;
  const isXLarge = width >= breakpoints['2xl'];

  // 현재 브레이크포인트 계산
  const getCurrentBreakpoint = (): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    return 'sm';
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    isXLarge,
    currentBreakpoint: getCurrentBreakpoint(),
    width,
    height,
  };
}

// 특정 브레이크포인트 이상인지 확인하는 훅
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();

  return width >= breakpoints[breakpoint];
}

// 미디어 쿼리 훅 (CSS-in-JS 스타일)
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);

    // 이벤트 리스너 등록
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // 구형 브라우저 지원
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
}

// 화면 방향 감지 훅
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}
