/**
 * 프롬프트 변수 치환 및 검증 유틸리티
 * 여러 AI 프롬프트에서 공통으로 사용되는 변수 치환 로직을 통합
 */

export interface PromptVariables {
  [key: string]: string | number | boolean | undefined;
}

export interface PromptValidationResult {
  isValid: boolean;
  missingVariables: string[];
  invalidVariables: { variable: string; reason: string }[];
}

/**
 * 프롬프트 변수 치환 통합 클래스
 */
export class PromptVariableReplacer {
  private static readonly VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

  /**
   * 프롬프트 템플릿에서 변수를 치환합니다
   */
  static replaceVariables(
    template: string,
    variables: PromptVariables
  ): string {
    return template.replace(this.VARIABLE_PATTERN, (match, variableName) => {
      const value = variables[variableName];

      if (value === undefined || value === null) {
        console.warn(`Missing variable: ${variableName}`);
        return match; // 원본 유지
      }

      return String(value);
    });
  }

  /**
   * 프롬프트 템플릿에서 사용된 변수들을 추출합니다
   */
  static extractVariables(template: string): string[] {
    const matches = template.match(this.VARIABLE_PATTERN);
    if (!matches) return [];

    return matches.map((match) => match.replace(/[{}]/g, ''));
  }

  /**
   * 프롬프트 변수 유효성을 검증합니다
   */
  static validateVariables(
    template: string,
    variables: PromptVariables
  ): PromptValidationResult {
    const requiredVariables = this.extractVariables(template);
    const missingVariables: string[] = [];
    const invalidVariables: { variable: string; reason: string }[] = [];

    for (const variable of requiredVariables) {
      const value = variables[variable];

      if (value === undefined || value === null) {
        missingVariables.push(variable);
        continue;
      }

      // 변수별 특수 검증 로직
      const validation = this.validateSpecificVariable(variable, value);
      if (!validation.isValid) {
        invalidVariables.push({
          variable,
          reason: validation.reason || '알 수 없는 오류',
        });
      }
    }

    return {
      isValid: missingVariables.length === 0 && invalidVariables.length === 0,
      missingVariables,
      invalidVariables,
    };
  }

  /**
   * 특정 변수에 대한 개별 검증 로직
   */
  private static validateSpecificVariable(
    variable: string,
    value: unknown
  ): { isValid: boolean; reason?: string } {
    const stringValue = String(value).trim();

    // 공통 검증: 빈 문자열 체크
    if (stringValue === '') {
      return { isValid: false, reason: '빈 값은 허용되지 않습니다' };
    }

    // 변수별 특수 검증
    switch (variable) {
      case 'content':
        return this.validateContent(stringValue);
      case 'title':
        return this.validateTitle(stringValue);
      case 'targetKeywords':
        return this.validateKeywords(stringValue);
      case 'availableCategories':
        return this.validateCategories(stringValue);
      default:
        return { isValid: true };
    }
  }

  private static validateContent(content: string): {
    isValid: boolean;
    reason?: string;
  } {
    if (content.length < 10) {
      return { isValid: false, reason: '콘텐츠가 너무 짧습니다 (최소 10자)' };
    }
    if (content.length > 50000) {
      return { isValid: false, reason: '콘텐츠가 너무 깁니다 (최대 50,000자)' };
    }
    return { isValid: true };
  }

  private static validateTitle(title: string): {
    isValid: boolean;
    reason?: string;
  } {
    if (title.length < 3) {
      return { isValid: false, reason: '제목이 너무 짧습니다 (최소 3자)' };
    }
    if (title.length > 100) {
      return { isValid: false, reason: '제목이 너무 깁니다 (최대 100자)' };
    }
    return { isValid: true };
  }

  private static validateKeywords(keywords: string): {
    isValid: boolean;
    reason?: string;
  } {
    try {
      const keywordArray = JSON.parse(keywords);
      if (!Array.isArray(keywordArray)) {
        return { isValid: false, reason: '키워드는 배열 형태여야 합니다' };
      }
      if (keywordArray.length === 0) {
        return { isValid: false, reason: '최소 1개의 키워드가 필요합니다' };
      }
      return { isValid: true };
    } catch {
      return { isValid: false, reason: '키워드 형식이 올바르지 않습니다' };
    }
  }

  private static validateCategories(categories: string): {
    isValid: boolean;
    reason?: string;
  } {
    try {
      const categoryArray = JSON.parse(categories);
      if (!Array.isArray(categoryArray)) {
        return { isValid: false, reason: '카테고리는 배열 형태여야 합니다' };
      }
      return { isValid: true };
    } catch {
      return { isValid: false, reason: '카테고리 형식이 올바르지 않습니다' };
    }
  }
}

/**
 * 공통 프롬프트 변수 생성기
 */
export class PromptVariableBuilder {
  private variables: PromptVariables = {};

  static create(): PromptVariableBuilder {
    return new PromptVariableBuilder();
  }

  addContent(content: string): this {
    this.variables.content = content;
    return this;
  }

  addTitle(title: string): this {
    this.variables.title = title;
    return this;
  }

  addKeywords(keywords: string[]): this {
    this.variables.targetKeywords = JSON.stringify(keywords);
    return this;
  }

  addCategories(categories: string[]): this {
    this.variables.availableCategories = JSON.stringify(categories);
    return this;
  }

  addCustom(key: string, value: string | number | boolean): this {
    this.variables[key] = value;
    return this;
  }

  build(): PromptVariables {
    return { ...this.variables };
  }
}

/**
 * 프롬프트 템플릿 검증 및 포맷팅 헬퍼
 */
export class PromptTemplateHelper {
  /**
   * 프롬프트 템플릿이 유효한지 검증합니다
   */
  static validateTemplate(template: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 기본 검증
    if (!template.trim()) {
      errors.push('프롬프트 템플릿이 비어있습니다');
    }

    // 변수 구문 검증
    const variableMatches = template.match(/\{\{|\}\}/g);
    if (variableMatches) {
      const openCount = template.match(/\{\{/g)?.length || 0;
      const closeCount = template.match(/\}\}/g)?.length || 0;

      if (openCount !== closeCount) {
        errors.push('변수 구문의 여는 괄호와 닫는 괄호 수가 일치하지 않습니다');
      }
    }

    // 중첩 변수 검증
    const nestedVariables = template.match(/\{\{[^}]*\{\{/g);
    if (nestedVariables) {
      errors.push('중첩된 변수 구문이 발견되었습니다');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 프롬프트 템플릿을 정규화합니다
   */
  static normalizeTemplate(template: string): string {
    return template
      .replace(/\s+/g, ' ') // 여러 공백을 하나로
      .replace(/\n\s*\n/g, '\n') // 빈 줄 정리
      .trim();
  }
}
