import {
  UserFriendlyError,
  LoadingState,
  ProgressUpdate,
  RetryStrategy,
  AiOperation,
} from '@/types/ai';

/**
 * AI 작업 에러 타입
 */
export interface AiError extends Error {
  code?: string;
  retryable?: boolean;
  operation?: string;
}

/**
 * AI 상태 관리 클래스
 * 에러 처리, 로딩 상태 관리, 재시도 전략 등을 담당
 */
export class AiStateManager {
  private static instance: AiStateManager;

  public static getInstance(): AiStateManager {
    if (!AiStateManager.instance) {
      AiStateManager.instance = new AiStateManager();
    }
    return AiStateManager.instance;
  }

  /**
   * AI 에러를 사용자 친화적인 에러로 변환
   */
  handleAiError(error: AiError): UserFriendlyError {
    // 네트워크 오류
    if (error.code === 'NETWORK_ERROR' || error.message.includes('fetch')) {
      return {
        title: '네트워크 오류',
        message: '인터넷 연결을 확인하고 다시 시도해주세요.',
        canRetry: true,
        retryDelay: 3000,
        fallbackOptions: ['오프라인으로 작업하기', '나중에 다시 시도'],
      };
    }

    // API 할당량 초과
    if (error.code === 'QUOTA_EXCEEDED' || error.message.includes('quota')) {
      return {
        title: 'API 사용량 초과',
        message:
          'AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.',
        canRetry: true,
        retryDelay: 60000, // 1분 후 재시도
        fallbackOptions: ['수동으로 편집하기'],
      };
    }

    // 서버 오류
    if (error.code?.startsWith('5') || error.message.includes('500')) {
      return {
        title: '서버 오류',
        message: '서버에 일시적인 문제가 발생했습니다.',
        canRetry: true,
        retryDelay: 5000,
        fallbackOptions: ['수동으로 편집하기', '나중에 다시 시도'],
      };
    }

    // 인증 오류
    if (error.code === 'UNAUTHORIZED' || error.message.includes('401')) {
      return {
        title: '인증 오류',
        message: '로그인이 필요합니다.',
        canRetry: false,
        fallbackOptions: ['로그인하기'],
      };
    }

    // 콘텐츠 오류
    if (error.code === 'INVALID_CONTENT') {
      return {
        title: '콘텐츠 오류',
        message: '콘텐츠를 처리할 수 없습니다. 내용을 확인해주세요.',
        canRetry: false,
        fallbackOptions: ['내용 수정하기', '수동으로 편집하기'],
      };
    }

    // 타임아웃 오류
    if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
      return {
        title: '요청 시간 초과',
        message: '요청 처리 시간이 초과되었습니다.',
        canRetry: true,
        retryDelay: 5000,
        fallbackOptions: ['수동으로 편집하기'],
      };
    }

    // 기본 에러
    return {
      title: 'AI 처리 오류',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      canRetry: error.retryable !== false,
      retryDelay: 3000,
      fallbackOptions: ['수동으로 편집하기', '다시 시도'],
    };
  }

  /**
   * 로딩 상태 추적
   */
  trackLoadingState(operation: AiOperation): LoadingState {
    return {
      isLoading: true,
      progress: 0,
      currentStep: `${operation.type} 처리 중...`,
      estimatedTimeRemaining: operation.estimatedDuration,
    };
  }

  /**
   * 진행 상황 업데이트 생성
   */
  generateProgressUpdates(operations: AiOperation[]): ProgressUpdate[] {
    const totalDuration = operations.reduce(
      (sum, op) => sum + op.estimatedDuration,
      0
    );

    let cumulativeTime = 0;
    return operations.map((operation, index) => {
      const progress = Math.round((cumulativeTime / totalDuration) * 100);
      cumulativeTime += operation.estimatedDuration;

      return {
        step: this.getOperationDisplayName(operation.type),
        progress,
        message: this.getOperationMessage(operation.type),
      };
    });
  }

  /**
   * 재시도 전략 생성
   */
  createRetryStrategy(failedOperation: AiOperation): RetryStrategy {
    const baseStrategies: Record<string, RetryStrategy> = {
      styling: {
        maxRetries: 3,
        backoffMultiplier: 1.5,
        baseDelay: 1000,
      },
      seo: {
        maxRetries: 2,
        backoffMultiplier: 2,
        baseDelay: 2000,
      },
      categories: {
        maxRetries: 3,
        backoffMultiplier: 1.2,
        baseDelay: 1500,
      },
    };

    return (
      baseStrategies[failedOperation.type] || {
        maxRetries: 2,
        backoffMultiplier: 1.5,
        baseDelay: 2000,
      }
    );
  }

  /**
   * 재시도 지연 시간 계산
   */
  calculateRetryDelay(strategy: RetryStrategy, attemptNumber: number): number {
    return Math.min(
      strategy.baseDelay * Math.pow(strategy.backoffMultiplier, attemptNumber),
      30000 // 최대 30초
    );
  }

  /**
   * 로딩 메시지 생성
   */
  getLoadingMessage(operation: AiOperation, progress: number): string {
    const messages = {
      styling: [
        '콘텐츠를 분석하고 있습니다...',
        '코드 블록을 최적화하고 있습니다...',
        '제목 구조를 개선하고 있습니다...',
        '가독성을 향상시키고 있습니다...',
      ],
      seo: [
        '키워드를 분석하고 있습니다...',
        'SEO 점수를 계산하고 있습니다...',
        '메타데이터를 생성하고 있습니다...',
      ],
      categories: [
        '콘텐츠 주제를 분석하고 있습니다...',
        '카테고리를 추천하고 있습니다...',
        '신뢰도를 계산하고 있습니다...',
      ],
    };

    const operationMessages = messages[operation.type] || ['처리 중...'];
    const messageIndex = Math.min(
      Math.floor((progress / 100) * operationMessages.length),
      operationMessages.length - 1
    );

    return operationMessages[messageIndex];
  }

  /**
   * 작업 표시 이름 가져오기
   */
  private getOperationDisplayName(type: string): string {
    const displayNames: Record<string, string> = {
      styling: 'AI 스타일링',
      seo: 'SEO 최적화',
      categories: '카테고리 추천',
    };

    return displayNames[type] || type;
  }

  /**
   * 작업 메시지 가져오기
   */
  private getOperationMessage(type: string): string {
    const messages: Record<string, string> = {
      styling: '콘텐츠 스타일을 개선하고 있습니다',
      seo: 'SEO를 최적화하고 있습니다',
      categories: '적절한 카테고리를 추천하고 있습니다',
    };

    return messages[type] || '처리 중입니다';
  }

  /**
   * 에러 중요도 평가
   */
  getErrorSeverity(error: AiError): 'low' | 'medium' | 'high' | 'critical' {
    if (error.code === 'UNAUTHORIZED') return 'critical';
    if (error.code === 'QUOTA_EXCEEDED') return 'high';
    if (error.code?.startsWith('5')) return 'medium';
    if (error.code === 'TIMEOUT') return 'medium';
    return 'low';
  }

  /**
   * 에러 보고 생성
   */
  generateErrorReport(error: AiError, context: any): any {
    return {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code,
        operation: error.operation,
        stack: error.stack,
      },
      context,
      severity: this.getErrorSeverity(error),
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    };
  }
}

// 싱글톤 인스턴스 내보내기
export const aiStateManager = AiStateManager.getInstance();
