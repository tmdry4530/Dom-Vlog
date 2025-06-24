import MarkdownIt from 'markdown-it';
import type { GenerativeModel } from '@google/generative-ai';
import type {
  StyleUpgradeRequest,
  AIProcessingResult,
  ReadabilityScore,
  IContentProcessor,
} from '@/types/ai';
import {
  createStyleUpgradeModel,
  createReadabilityAnalyzerModel,
  handleGeminiError,
} from '@/ai/models/gemini-config';
import {
  STYLE_UPGRADE_PROMPT,
  replacePromptVariables as replaceStyleVariables,
} from '@/ai/prompts/style-prompts';
import {
  READABILITY_ANALYSIS_PROMPT,
  parseReadabilityScore,
  createDefaultReadabilityScore,
  replacePromptVariables,
} from '@/ai/prompts/readability-prompts';
import { sanitizeContent } from '@/lib/validations/ai';

// 마크다운 파서 초기화
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export class StyleEnhancer implements IContentProcessor {
  private readonly styleModel: GenerativeModel | null;
  private readonly readabilityModel: GenerativeModel | null;

  constructor() {
    try {
      this.styleModel = createStyleUpgradeModel();
      this.readabilityModel = createReadabilityAnalyzerModel();
    } catch (error) {
      console.error('StyleEnhancer 초기화 오류:', error);
      // 개발 모드에서는 null로 설정하여 모의 응답 사용
      if (process.env.NODE_ENV === 'development') {
        console.warn('개발 모드: AI 모델 초기화 실패, 모의 응답 모드로 설정');
        this.styleModel = null;
        this.readabilityModel = null;
      } else {
        throw error;
      }
    }
  }

  /**
   * 메인 스타일 업그레이드 함수
   */
  async enhanceContent(
    request: StyleUpgradeRequest
  ): Promise<AIProcessingResult> {
    const startTime = Date.now();

    try {
      // 1. 콘텐츠 전처리
      const preprocessedContent = await this.preprocessContent(
        request.content,
        request.contentType
      );

      // 2. AI 기반 스타일 개선
      const enhancedContent = await this.performStyleUpgrade(
        preprocessedContent,
        request
      );

      // 3. 가독성 점수 계산
      const readabilityScore = await this.analyzeReadability(enhancedContent);

      // 4. 후처리
      const finalContent = await this.postprocessContent(enhancedContent);

      // 5. 개선사항 추출
      const improvements = this.extractImprovements(
        request.content,
        finalContent,
        readabilityScore
      );

      const endTime = Date.now();

      return {
        processedContent: finalContent,
        readabilityScore,
        processingMetrics: {
          startTime,
          endTime,
          duration: endTime - startTime,
        },
        improvements,
      };
    } catch (error) {
      console.error('스타일 개선 처리 중 오류:', error);
      throw new Error('콘텐츠 스타일 개선 중 오류가 발생했습니다.');
    }
  }

  /**
   * 콘텐츠 전처리
   */
  async preprocessContent(
    content: string,
    contentType: 'markdown' | 'html'
  ): Promise<string> {
    try {
      // 보안 정제
      let processedContent = sanitizeContent(content);

      // HTML을 마크다운으로 변환 (필요시)
      if (contentType === 'html') {
        processedContent = this.convertHtmlToMarkdown(processedContent);
      }

      // 기본적인 마크다운 정제
      processedContent = this.normalizeMarkdown(processedContent);

      return processedContent;
    } catch (error) {
      console.error('콘텐츠 전처리 오류:', error);
      return content; // 실패 시 원본 반환
    }
  }

  /**
   * AI 기반 스타일 업그레이드 수행
   */
  private async performStyleUpgrade(
    content: string,
    request: StyleUpgradeRequest
  ): Promise<string> {
    try {
      // 프롬프트 변수 준비
      const promptVariables = {
        content,
        contentType: request.contentType,
        includeTableOfContents:
          request.options?.includeTableOfContents?.toString() || 'false',
        enhanceCodeBlocks:
          request.options?.enhanceCodeBlocks?.toString() || 'true',
        improveHeadingStructure:
          request.options?.improveHeadingStructure?.toString() || 'true',
        optimizeForSEO: request.options?.optimizeForSEO?.toString() || 'false',
      };

      // 프롬프트 생성
      const { system, user } = replaceStyleVariables(
        STYLE_UPGRADE_PROMPT,
        promptVariables
      );

      // AI 모델 호출 (개발 모드에서 모델이 null인 경우 처리)
      if (!this.styleModel) {
        console.warn('AI 모델이 없음, 기본 처리 적용');
        return content; // 원본 콘텐츠 반환
      }

      const result = await this.styleModel.generateContent(
        `${system}\n\n${user}`
      );

      const response = result.response.text();

      // 응답에서 개선된 콘텐츠 추출
      const enhancedContent = this.extractEnhancedContent(response);

      return enhancedContent || content; // 추출 실패 시 원본 반환
    } catch (error) {
      console.error('AI 스타일 업그레이드 오류:', error);
      handleGeminiError(error);
    }
  }

  /**
   * 가독성 분석
   */
  async analyzeReadability(content: string): Promise<ReadabilityScore> {
    try {
      // 프롬프트 변수 준비
      const promptVariables = {
        content: content,
        contentType: 'markdown',
      };

      // 프롬프트 생성 (문자열 대체)
      const prompt = replacePromptVariables(
        READABILITY_ANALYSIS_PROMPT,
        promptVariables
      );

      // AI 모델 호출 (개발 모드에서 모델이 null인 경우 처리)
      if (!this.readabilityModel) {
        console.warn('가독성 분석 모델이 없음, 기본 점수 반환');
        return createDefaultReadabilityScore();
      }

      const result = await this.readabilityModel.generateContent(prompt);

      const response = result.response.text();

      // 응답 파싱
      const parsedScore = parseReadabilityScore(response);

      if (parsedScore) {
        return {
          score: parsedScore.score,
          breakdown: parsedScore.breakdown,
          suggestions: parsedScore.suggestions,
        };
      } else {
        // 파싱 실패 시 기본 점수 반환
        console.warn('가독성 점수 파싱 실패, 기본 점수 사용');
        return createDefaultReadabilityScore();
      }
    } catch (error) {
      console.error('가독성 분석 오류:', error);
      return createDefaultReadabilityScore();
    }
  }

  /**
   * 콘텐츠 후처리
   */
  async postprocessContent(content: string): Promise<string> {
    try {
      // 마크다운 구문 검증 및 수정
      let processedContent = this.validateMarkdownSyntax(content);

      // 코드 블록 최적화
      processedContent = this.optimizeCodeBlocks(processedContent);

      // 링크 및 이미지 최적화
      processedContent = this.optimizeLinksAndImages(processedContent);

      // 목차 자동 삽입 (제목이 3개 이상인 경우)
      processedContent = this.insertTableOfContents(processedContent);

      // 최종 정제
      processedContent = processedContent.trim();

      return processedContent;
    } catch (error) {
      console.error('콘텐츠 후처리 오류:', error);
      return content; // 실패 시 원본 반환
    }
  }

  /**
   * 코드 블록 추출
   */
  extractCodeBlocks(content: string): string[] {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = content.match(codeBlockRegex);
    return matches || [];
  }

  /**
   * 제목 추출
   */
  extractHeadings(content: string): Array<{ level: number; text: string }> {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: Array<{ level: number; text: string }> = [];

    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
      });
    }

    return headings;
  }

  /**
   * HTML을 마크다운으로 변환 (기본적인 변환)
   */
  private convertHtmlToMarkdown(html: string): string {
    return html
      .replace(
        /<h([1-6])>(.*?)<\/h[1-6]>/gi,
        (_, level, text) => `${'#'.repeat(parseInt(level))} ${text}`
      )
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(
        /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
        '![$2]($1)'
      )
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '') // 나머지 HTML 태그 제거
      .replace(/\n{3,}/g, '\n\n'); // 과도한 개행 정리
  }

  /**
   * 마크다운 정규화
   */
  private normalizeMarkdown(content: string): string {
    return content
      .replace(/\r\n/g, '\n') // 개행 문자 통일
      .replace(/\t/g, '    ') // 탭을 공백으로 변환
      .replace(/[ \t]+$/gm, '') // 행 끝 공백 제거
      .replace(/\n{3,}/g, '\n\n') // 과도한 개행 정리
      .trim();
  }

  /**
   * AI 응답에서 개선된 콘텐츠 추출
   */
  private extractEnhancedContent(response: string): string | null {
    try {
      // "개선된 콘텐츠" 섹션 찾기
      const contentMatch = response.match(
        /## 개선된 콘텐츠\s*([\s\S]*?)(?=##|$)/i
      );

      if (contentMatch && contentMatch[1]) {
        return contentMatch[1].trim();
      }

      // 전체 응답이 마크다운인 경우
      if (response.includes('#') || response.includes('```')) {
        return response.trim();
      }

      return null;
    } catch (error) {
      console.error('개선된 콘텐츠 추출 오류:', error);
      return null;
    }
  }

  /**
   * 개선사항 추출
   */
  private extractImprovements(
    original: string,
    enhanced: string,
    readabilityScore: ReadabilityScore
  ): string[] {
    const improvements: string[] = [];

    // 제목 개선 확인
    const originalHeadings = this.extractHeadings(original);
    const enhancedHeadings = this.extractHeadings(enhanced);

    if (enhancedHeadings.length > originalHeadings.length) {
      improvements.push('제목 구조가 개선되었습니다.');
    }

    // 코드 블록 개선 확인
    const originalCodeBlocks = this.extractCodeBlocks(original);
    const enhancedCodeBlocks = this.extractCodeBlocks(enhanced);

    if (enhancedCodeBlocks.length > originalCodeBlocks.length) {
      improvements.push('코드 블록 포맷팅이 향상되었습니다.');
    }

    // 길이 증가 확인 (설명 추가)
    if (enhanced.length > original.length * 1.1) {
      improvements.push('설명과 구조가 보강되었습니다.');
    }

    // 가독성 점수 기반 개선사항 추가
    improvements.push(...readabilityScore.suggestions);

    return improvements;
  }

  /**
   * 마크다운 구문 검증
   */
  private validateMarkdownSyntax(content: string): string {
    try {
      // 마크다운 파싱 테스트
      md.render(content);
      return content;
    } catch {
      console.warn('마크다운 구문 오류 감지, 기본 정제 적용');

      // 기본적인 구문 수정
      return content
        .replace(/#+\s*$/gm, '') // 빈 헤딩 제거
        .replace(/```\s*\n\s*```/g, '') // 빈 코드 블록 제거
        .replace(/\[([^\]]*)\]\(\s*\)/g, '$1') // 빈 링크 정리
        .trim();
    }
  }

  /**
   * 코드 블록 최적화
   */
  private optimizeCodeBlocks(content: string): string {
    return content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      // 언어가 없으면 추측 시도
      if (!lang) {
        lang = this.guessCodeLanguage(code);
      }

      // 코드 정리
      const cleanCode = code
        .replace(/^\n+/, '') // 앞쪽 빈 줄 제거
        .replace(/\n+$/, '') // 뒤쪽 빈 줄 제거
        .replace(/\t/g, '  '); // 탭을 공백으로 변환

      return `\`\`\`${lang}\n${cleanCode}\n\`\`\``;
    });
  }

  /**
   * 코드 언어 추측
   */
  private guessCodeLanguage(code: string): string {
    const trimmedCode = code.trim().toLowerCase();

    // JavaScript/TypeScript
    if (
      trimmedCode.includes('function') ||
      trimmedCode.includes('=>') ||
      trimmedCode.includes('const') ||
      trimmedCode.includes('let')
    ) {
      return trimmedCode.includes('interface') || trimmedCode.includes('type ')
        ? 'typescript'
        : 'javascript';
    }

    // Python
    if (
      trimmedCode.includes('def ') ||
      trimmedCode.includes('import ') ||
      trimmedCode.includes('print(')
    ) {
      return 'python';
    }

    // HTML
    if (
      trimmedCode.includes('<html') ||
      trimmedCode.includes('<!doctype') ||
      trimmedCode.includes('<div')
    ) {
      return 'html';
    }

    // CSS
    if (
      trimmedCode.includes('{') &&
      trimmedCode.includes(':') &&
      trimmedCode.includes(';')
    ) {
      return 'css';
    }

    // JSON
    if (
      (trimmedCode.startsWith('{') && trimmedCode.endsWith('}')) ||
      (trimmedCode.startsWith('[') && trimmedCode.endsWith(']'))
    ) {
      return 'json';
    }

    // SQL
    if (
      trimmedCode.includes('select') ||
      trimmedCode.includes('from') ||
      trimmedCode.includes('where')
    ) {
      return 'sql';
    }

    return 'text'; // 기본값
  }

  /**
   * 링크 및 이미지 최적화
   */
  private optimizeLinksAndImages(content: string): string {
    return (
      content
        // 중복 공백이 있는 링크 정리
        .replace(/\[\s+([^\]]+)\s+\]/g, '[$1]')
        // 빈 링크 제거
        .replace(/\[([^\]]*)\]\(\s*\)/g, '$1')
        // 이미지 alt 텍스트 개선
        .replace(/!\[\]\(([^)]+)\)/g, '![이미지]($1)')
        // 상대 경로 링크 확인 (절대 경로로 변환하지는 않고 경고만)
        .replace(/\[([^\]]+)\]\(\.\.?\/[^)]+\)/g, (match) => {
          console.warn('상대 경로 링크 발견:', match);
          return match;
        })
    );
  }

  /**
   * 목차 자동 삽입
   */
  private insertTableOfContents(content: string): string {
    try {
      const headings = this.extractHeadings(content);

      // 제목이 3개 미만이면 목차 생성하지 않음
      if (headings.length < 3) {
        return content;
      }

      // 이미 목차가 있는지 확인
      if (
        content.includes('## 목차') ||
        content.includes('# Table of Contents')
      ) {
        return content;
      }

      // 목차 생성
      const toc = this.generateTableOfContents(headings);

      // 첫 번째 H1 제목 뒤에 목차 삽입
      const firstH1Match = content.match(/^#[^#].*$/m);
      if (firstH1Match) {
        const insertIndex =
          content.indexOf(firstH1Match[0]) + firstH1Match[0].length;
        return (
          content.slice(0, insertIndex) +
          '\n\n' +
          toc +
          '\n' +
          content.slice(insertIndex)
        );
      }

      // H1이 없으면 맨 앞에 삽입
      return toc + '\n\n' + content;
    } catch (error) {
      console.error('목차 삽입 오류:', error);
      return content;
    }
  }

  /**
   * 목차 생성
   */
  private generateTableOfContents(
    headings: Array<{ level: number; text: string }>
  ): string {
    const tocLines = ['## 목차', ''];

    headings.forEach((heading) => {
      // H1은 목차에서 제외 (문서 제목이므로)
      if (heading.level === 1) return;

      // 적절한 들여쓰기 생성
      const indent = '  '.repeat(heading.level - 2);

      // 앵커 링크 생성 (한글 포함 지원)
      const anchor = this.createAnchorLink(heading.text);

      // 목차 항목 추가
      tocLines.push(`${indent}- [${heading.text}](#${anchor})`);
    });

    return tocLines.join('\n');
  }

  /**
   * 앵커 링크 생성
   */
  private createAnchorLink(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거 (한글 유지)
      .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
      .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
  }
}
