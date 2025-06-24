import type { ReadabilityScore } from '@/types/ai';

/**
 * 가독성 분석을 위한 메인 프롬프트
 */
export const READABILITY_ANALYSIS_PROMPT = `
당신은 기술 문서의 가독성을 평가하는 전문가입니다. 다음 마크다운 콘텐츠를 분석하고 가독성 점수를 매겨주세요.

평가 기준:
1. 제목 구조 (H1-H6 적절한 계층)
2. 코드 블록 품질 (언어 지정, 가독성)
3. 기술 용어 명확성
4. 전체적인 문서 구조

응답은 반드시 다음 JSON 형식으로만 작성하세요:
{
  "title_structure": 85,
  "code_quality": 92,
  "terminology_clarity": 78,
  "overall_structure": 88,
  "overall_score": 86,
  "suggestions": ["제목 계층을 더 체계적으로 구성하세요", "기술 용어에 대한 설명을 추가하세요"]
}

분석할 콘텐츠:
{{content}}
`;

/**
 * 개선 우선순위 분석 프롬프트
 */
export const IMPROVEMENT_PRIORITY_PROMPT = `
다음 가독성 분석 결과를 바탕으로 개선 우선순위를 정해주세요:

가독성 점수:
- 제목 구조: {{title_structure}}
- 코드 품질: {{code_quality}}
- 용어 명확성: {{terminology_clarity}}
- 전체 구조: {{overall_structure}}

개선이 가장 시급한 순서대로 3가지 영역을 선택하고 구체적인 방법을 제시하세요.
`;

/**
 * 사후 평가 프롬프트
 */
export const POST_IMPROVEMENT_PROMPT = `
다음은 스타일 개선 전과 후의 콘텐츠입니다. 개선 효과를 평가해주세요:

개선 전:
{{original_content}}

개선 후:
{{improved_content}}

다음 JSON 형식으로 평가해주세요:
{
  "improvement_score": 85,
  "key_improvements": ["코드 블록 가독성 향상", "제목 구조 개선"],
  "remaining_issues": ["용어 설명 부족"],
  "final_score": 88
}
`;

/**
 * 가독성 점수 응답을 파싱하는 함수
 */
export function parseReadabilityScore(
  response: string
): ReadabilityScore | null {
  try {
    // JSON 부분만 추출
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('JSON 형식의 응답을 찾을 수 없습니다:', response);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 필수 필드 검증
    const required = [
      'title_structure',
      'code_quality',
      'terminology_clarity',
      'overall_structure',
      'overall_score',
    ];
    for (const field of required) {
      if (typeof parsed[field] !== 'number') {
        console.warn(
          `필수 필드 ${field}가 누락되거나 잘못된 타입입니다:`,
          parsed
        );
        return null;
      }
    }

    return {
      score: Math.max(0, Math.min(100, parsed.overall_score)),
      breakdown: {
        headingStructure: Math.max(0, Math.min(100, parsed.title_structure)),
        codeBlockFormatting: Math.max(0, Math.min(100, parsed.code_quality)),
        paragraphFlow: Math.max(0, Math.min(100, parsed.terminology_clarity)),
        listOrganization: Math.max(0, Math.min(100, parsed.overall_structure)),
        overallClarity: Math.max(0, Math.min(100, parsed.overall_score)),
      },
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (error) {
    console.error('가독성 점수 파싱 오류:', error);
    return null;
  }
}

/**
 * 프롬프트에 변수를 대체하는 헬퍼 함수
 */
export function replacePromptVariables(
  prompt: string,
  variables: Record<string, string | number>
): string {
  let result = prompt;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(
      new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
      String(value)
    );
  }
  return result;
}

/**
 * 기본 가독성 임계값
 */
export const READABILITY_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  FAIR: 70,
  POOR: 60,
} as const;

/**
 * 가독성 점수에 따른 등급 반환
 */
export function getReadabilityGrade(score: number): string {
  if (score >= READABILITY_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= READABILITY_THRESHOLDS.GOOD) return 'Good';
  if (score >= READABILITY_THRESHOLDS.FAIR) return 'Fair';
  if (score >= READABILITY_THRESHOLDS.POOR) return 'Poor';
  return 'Very Poor';
}

/**
 * 기본 가독성 점수 생성
 */
export function createDefaultReadabilityScore(): ReadabilityScore {
  return {
    score: 70,
    breakdown: {
      headingStructure: 70,
      codeBlockFormatting: 70,
      paragraphFlow: 70,
      listOrganization: 70,
      overallClarity: 70,
    },
    suggestions: ['AI 분석을 실행할 수 없어 기본 점수를 반환했습니다.'],
  };
}
