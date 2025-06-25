import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AiIntegrationWorkflow } from '@/components/ai/AiIntegrationWorkflow';
import * as aiIntegrationHook from '@/hooks/ai/useAiIntegration';

// Mock the AI integration hook
vi.mock('@/hooks/ai/useAiIntegration');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }
}));

const mockProcessContent = vi.fn();
const mockClearError = vi.fn();

describe('AI 통합 워크플로우 테스트', () => {
  const defaultProps = {
    title: 'Test Title',
    content: 'Test content for AI processing',
    postId: 'test-post-id',
    onApply: vi.fn(),
    onSeoApply: vi.fn(),
    onCategoryApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the AI integration hook
    vi.spyOn(aiIntegrationHook, 'useAiIntegration').mockReturnValue({
      processContent: mockProcessContent,
      isProcessing: false,
      result: null,
      error: null,
      progress: 0,
      clearError: mockClearError,
    });
  });

  it('초기 상태에서 올바르게 렌더링된다', () => {
    render(<AiIntegrationWorkflow {...defaultProps} />);
    
    expect(screen.getByText('AI 통합 워크플로우')).toBeInTheDocument();
    expect(screen.getByText('AI 통합 처리 시작')).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('빈 제목/내용으로 처리 시도시 에러 토스트가 표시된다', async () => {
    const { toast } = await import('sonner');
    
    render(<AiIntegrationWorkflow {...defaultProps} title="" content="" />);
    
    const startButton = screen.getByText('AI 통합 처리 시작');
    fireEvent.click(startButton);
    
    expect(toast.error).toHaveBeenCalledWith('제목과 내용을 입력해주세요.');
    expect(mockProcessContent).not.toHaveBeenCalled();
  });

  it('정상적인 AI 통합 처리가 실행된다', async () => {
    const mockResult = {
      overallSuccess: true,
      styling: { success: true, data: { readabilityScore: 85 } },
      seo: { success: true, data: { keywords: ['Next.js', 'React'] } },
      categories: { success: true, data: [{ name: 'Frontend', confidence: 0.9 }] },
      processedAt: new Date(),
    };

    mockProcessContent.mockResolvedValue(mockResult);

    render(<AiIntegrationWorkflow {...defaultProps} />);
    
    const startButton = screen.getByText('AI 통합 처리 시작');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(mockProcessContent).toHaveBeenCalledWith({
        title: defaultProps.title,
        content: defaultProps.content,
        enableStyling: true,
        enableSeo: true,
        enableCategories: true,
      });
    });
  });

  it('처리 중 상태에서 UI가 올바르게 업데이트된다', () => {
    vi.spyOn(aiIntegrationHook, 'useAiIntegration').mockReturnValue({
      processContent: mockProcessContent,
      isProcessing: true,
      result: null,
      error: null,
      progress: 45,
      clearError: mockClearError,
    });

    render(<AiIntegrationWorkflow {...defaultProps} />);
    
    expect(screen.getByText('AI 처리 중...')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('에러 상태에서 에러 메시지가 표시된다', () => {
    const errorMessage = 'AI 서비스 연결 실패';
    
    vi.spyOn(aiIntegrationHook, 'useAiIntegration').mockReturnValue({
      processContent: mockProcessContent,
      isProcessing: false,
      result: null,
      error: errorMessage,
      progress: 0,
      clearError: mockClearError,
    });

    render(<AiIntegrationWorkflow {...defaultProps} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('성공적인 결과가 표시된다', () => {
    const mockResult = {
      overallSuccess: true,
      styling: { 
        success: true, 
        data: { readabilityScore: 88 } 
      },
      seo: { 
        success: true, 
        data: { keywords: ['TypeScript', 'React', 'Frontend'] } 
      },
      categories: { 
        success: true, 
        data: [
          { name: 'Frontend', confidence: 0.92 },
          { name: 'TypeScript', confidence: 0.87 }
        ] 
      },
      processedAt: new Date(),
    };

    vi.spyOn(aiIntegrationHook, 'useAiIntegration').mockReturnValue({
      processContent: mockProcessContent,
      isProcessing: false,
      result: mockResult,
      error: null,
      progress: 100,
      clearError: mockClearError,
    });

    render(<AiIntegrationWorkflow {...defaultProps} />);
    
    // 결과 탭 클릭
    const resultsTab = screen.getByText('결과');
    fireEvent.click(resultsTab);
    
    expect(screen.getByText('모든 AI 처리 완료')).toBeInTheDocument();
    expect(screen.getByText('가독성 점수: 88/100')).toBeInTheDocument();
    expect(screen.getByText('키워드 3개 추출됨')).toBeInTheDocument();
    expect(screen.getByText('2개 카테고리 추천됨')).toBeInTheDocument();
  });

  it('부분 실패 결과가 올바르게 표시된다', () => {
    const mockResult = {
      overallSuccess: false,
      styling: { 
        success: true, 
        data: { readabilityScore: 82 } 
      },
      seo: { 
        success: false, 
        error: 'SEO API 일시적 오류' 
      },
      categories: { 
        success: true, 
        data: [{ name: 'Backend', confidence: 0.85 }] 
      },
      processedAt: new Date(),
    };

    vi.spyOn(aiIntegrationHook, 'useAiIntegration').mockReturnValue({
      processContent: mockProcessContent,
      isProcessing: false,
      result: mockResult,
      error: null,
      progress: 100,
      clearError: mockClearError,
    });

    render(<AiIntegrationWorkflow {...defaultProps} />);
    
    // 결과 탭 클릭
    const resultsTab = screen.getByText('결과');
    fireEvent.click(resultsTab);
    
    expect(screen.getByText('일부 처리 완료')).toBeInTheDocument();
    expect(screen.getByText('가독성 점수: 82/100')).toBeInTheDocument();
    expect(screen.getByText('오류: SEO API 일시적 오류')).toBeInTheDocument();
    expect(screen.getByText('1개 카테고리 추천됨')).toBeInTheDocument();
  });

  it('탭 전환이 정상적으로 작동한다', () => {
    render(<AiIntegrationWorkflow {...defaultProps} />);
    
    // SEO 탭 클릭
    const seoTab = screen.getByText('SEO');
    fireEvent.click(seoTab);
    
    expect(screen.getByText('SEO 추천 생성')).toBeInTheDocument();
    
    // 카테고리 탭 클릭
    const categoriesTab = screen.getByText('카테고리');
    fireEvent.click(categoriesTab);
    
    expect(screen.getByText('카테고리 추천 생성')).toBeInTheDocument();
  });

  it('콜백 함수들이 올바르게 호출된다', async () => {
    const mockResult = {
      overallSuccess: true,
      styling: { success: true, data: { readabilityScore: 85 } },
      seo: { success: true, data: { keywords: ['test'] } },
      categories: { success: true, data: [{ name: 'Test', confidence: 0.9 }] },
      processedAt: new Date(),
    };

    mockProcessContent.mockResolvedValue(mockResult);
    const { toast } = await import('sonner');

    render(<AiIntegrationWorkflow {...defaultProps} />);
    
    const startButton = screen.getByText('AI 통합 처리 시작');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(defaultProps.onApply).toHaveBeenCalledWith(mockResult);
      expect(toast.success).toHaveBeenCalledWith('AI 통합 처리가 완료되었습니다!');
    });
  });

  it('처리 실패시 에러 처리가 올바르게 된다', async () => {
    const error = new Error('네트워크 연결 오류');
    mockProcessContent.mockRejectedValue(error);
    const { toast } = await import('sonner');

    render(<AiIntegrationWorkflow {...defaultProps} />);
    
    const startButton = screen.getByText('AI 통합 처리 시작');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('AI 통합 처리에 실패했습니다.');
    });
  });
});

describe('AI 통합 워크플로우 성능 테스트', () => {
  it('대용량 콘텐츠 처리 성능 테스트', async () => {
    const largeContent = 'Large content text. '.repeat(1000); // 약 20KB
    
    const mockResult = {
      overallSuccess: true,
      styling: { success: true, data: { readabilityScore: 80 } },
      seo: { success: true, data: { keywords: ['performance'] } },
      categories: { success: true, data: [{ name: 'Performance', confidence: 0.85 }] },
      processedAt: new Date(),
    };

    const processPromise = Promise.resolve(mockResult);
    mockProcessContent.mockReturnValue(processPromise);

    const props = {
      title: 'Performance Test',
      content: largeContent,
      onApply: vi.fn(),
    };

    render(<AiIntegrationWorkflow {...props} />);
    
    const startTime = performance.now();
    
    const startButton = screen.getByText('AI 통합 처리 시작');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(mockProcessContent).toHaveBeenCalled();
    });
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    // UI 반응성 테스트 (100ms 이내)
    expect(processingTime).toBeLessThan(100);
  });

  it('동시 처리 요청에 대한 중복 방지 테스트', async () => {
    vi.spyOn(aiIntegrationHook, 'useAiIntegration').mockReturnValue({
      processContent: mockProcessContent,
      isProcessing: true, // 이미 처리 중
      result: null,
      error: null,
      progress: 50,
      clearError: mockClearError,
    });

    render(<AiIntegrationWorkflow {...{ 
      title: 'Test', 
      content: 'Test content',
      onApply: vi.fn() 
    }} />);
    
    const startButton = screen.getByText('AI 처리 중...');
    
    // 처리 중일 때는 버튼이 비활성화됨
    expect(startButton).toBeDisabled();
  });
}); 