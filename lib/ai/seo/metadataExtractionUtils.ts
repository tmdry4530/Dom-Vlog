import { SEOMetrics } from '@/types/seo';

export interface ExtractedMetadata {
  title: string;
  description: string;
  keywords: string[];
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: {
    src: string;
    alt: string;
    title?: string;
  }[];
  links: {
    internal: string[];
    external: string[];
  };
  textContent: string;
  wordCount: number;
  readingTime: number; // 분 단위
}

export interface ContentAnalysis {
  keywordDensity: { [keyword: string]: number };
  topKeywords: { keyword: string; count: number; density: number }[];
  sentenceCount: number;
  paragraphCount: number;
  averageSentenceLength: number;
  readabilityScore: number;
}

/**
 * HTML/Markdown 콘텐츠에서 메타데이터를 추출하는 유틸리티 클래스
 */
export class MetadataExtractionUtils {
  /**
   * 콘텐츠에서 모든 메타데이터를 추출합니다
   */
  static extractAllMetadata(content: string): ExtractedMetadata {
    try {
      const title = this.extractTitle(content);
      const description = this.extractDescription(content);
      const keywords = this.extractKeywords(content);
      const headings = this.extractHeadings(content);
      const images = this.extractImages(content);
      const links = this.extractLinks(content);
      const textContent = this.extractTextContent(content);
      const wordCount = this.countWords(textContent);
      const readingTime = this.calculateReadingTime(wordCount);

      return {
        title,
        description,
        keywords,
        headings,
        images,
        links,
        textContent,
        wordCount,
        readingTime,
      };
    } catch (error) {
      console.error('Metadata extraction failed:', error);
      return this.getDefaultMetadata();
    }
  }

  /**
   * 콘텐츠에서 제목을 추출합니다
   */
  static extractTitle(content: string): string {
    try {
      // HTML H1 태그 추출
      const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (h1Match) {
        return this.cleanText(h1Match[1]);
      }

      // Markdown H1 추출
      const markdownH1Match = content.match(/^#\s+(.+)$/m);
      if (markdownH1Match) {
        return this.cleanText(markdownH1Match[1]);
      }

      // 첫 번째 제목 태그 (H2, H3 등) 추출
      const headingMatch = content.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/i);
      if (headingMatch) {
        return this.cleanText(headingMatch[1]);
      }

      // 기본값
      return '제목 없음';
    } catch (error) {
      console.error('Title extraction failed:', error);
      return '제목 없음';
    }
  }

  /**
   * 콘텐츠에서 설명을 추출합니다
   */
  static extractDescription(content: string): string {
    try {
      const textContent = this.extractTextContent(content);
      const sentences = textContent
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);

      if (sentences.length === 0) {
        return '설명 없음';
      }

      // 첫 2-3 문장을 조합하여 설명 생성
      const description = sentences.slice(0, 3).join('. ').trim();

      // 적절한 길이로 자르기 (150-160자)
      if (description.length > 160) {
        return description.substring(0, 157) + '...';
      }

      if (description.length < 50) {
        // 너무 짧으면 더 많은 문장 추가
        const extendedDescription = sentences.slice(0, 5).join('. ').trim();

        if (extendedDescription.length > 160) {
          return extendedDescription.substring(0, 157) + '...';
        }

        return extendedDescription;
      }

      return description;
    } catch (error) {
      console.error('Description extraction failed:', error);
      return '설명 없음';
    }
  }

  /**
   * 콘텐츠에서 키워드를 추출합니다
   */
  static extractKeywords(content: string): string[] {
    try {
      const textContent = this.extractTextContent(content);
      const words = textContent
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2);

      // 불용어 제거
      const stopWords = new Set([
        '그리고',
        '하지만',
        '그런데',
        '하지만',
        '그래서',
        '또한',
        '이것',
        '그것',
        '저것',
        '있다',
        '없다',
        '하다',
        '되다',
        '이다',
        '아니다',
        '같다',
        '다르다',
        '많다',
        '적다',
        'the',
        'and',
        'or',
        'but',
        'in',
        'on',
        'at',
        'to',
        'for',
        'of',
        'with',
        'by',
        'this',
        'that',
        'these',
        'those',
        'is',
        'are',
        'was',
        'were',
        'be',
        'been',
        'being',
      ]);

      const filteredWords = words.filter((word) => !stopWords.has(word));

      // 단어 빈도 계산
      const wordCount: { [word: string]: number } = {};
      filteredWords.forEach((word) => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      // 빈도순 정렬 후 상위 키워드 선택
      const sortedKeywords = Object.entries(wordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);

      // 제목에서 키워드 추출 (가중치 부여)
      const title = this.extractTitle(content).toLowerCase();
      const titleWords = title
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word));

      // 제목 키워드를 우선 순위로 배치
      const finalKeywords = [
        ...titleWords.filter((word) => !sortedKeywords.includes(word)),
        ...sortedKeywords,
      ].slice(0, 8);

      return finalKeywords;
    } catch (error) {
      console.error('Keywords extraction failed:', error);
      return [];
    }
  }

  /**
   * 콘텐츠에서 제목 구조를 추출합니다
   */
  static extractHeadings(content: string): {
    h1: string[];
    h2: string[];
    h3: string[];
  } {
    try {
      const headings = {
        h1: [] as string[],
        h2: [] as string[],
        h3: [] as string[],
      };

      // HTML 제목 태그 추출
      const h1Matches = content.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
      const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
      const h3Matches = content.match(/<h3[^>]*>(.*?)<\/h3>/gi) || [];

      headings.h1 = h1Matches.map((match) =>
        this.cleanText(match.replace(/<\/?h1[^>]*>/gi, ''))
      );
      headings.h2 = h2Matches.map((match) =>
        this.cleanText(match.replace(/<\/?h2[^>]*>/gi, ''))
      );
      headings.h3 = h3Matches.map((match) =>
        this.cleanText(match.replace(/<\/?h3[^>]*>/gi, ''))
      );

      // Markdown 제목 추출
      const lines = content.split('\n');
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('# ')) {
          headings.h1.push(this.cleanText(trimmedLine.substring(2)));
        } else if (trimmedLine.startsWith('## ')) {
          headings.h2.push(this.cleanText(trimmedLine.substring(3)));
        } else if (trimmedLine.startsWith('### ')) {
          headings.h3.push(this.cleanText(trimmedLine.substring(4)));
        }
      });

      return headings;
    } catch (error) {
      console.error('Headings extraction failed:', error);
      return { h1: [], h2: [], h3: [] };
    }
  }

  /**
   * 콘텐츠에서 이미지 정보를 추출합니다
   */
  static extractImages(
    content: string
  ): { src: string; alt: string; title?: string }[] {
    try {
      const images: { src: string; alt: string; title?: string }[] = [];

      // HTML 이미지 태그 추출
      const imgMatches = content.match(/<img[^>]*>/gi) || [];
      imgMatches.forEach((imgTag) => {
        const srcMatch = imgTag.match(/src\s*=\s*["']([^"']*)["']/i);
        const altMatch = imgTag.match(/alt\s*=\s*["']([^"']*)["']/i);
        const titleMatch = imgTag.match(/title\s*=\s*["']([^"']*)["']/i);

        if (srcMatch) {
          images.push({
            src: srcMatch[1],
            alt: altMatch ? altMatch[1] : '',
            title: titleMatch ? titleMatch[1] : undefined,
          });
        }
      });

      // Markdown 이미지 추출
      const markdownImgMatches =
        content.match(/!\[([^\]]*)\]\(([^)]*)\)/g) || [];
      markdownImgMatches.forEach((match) => {
        const parts = match.match(/!\[([^\]]*)\]\(([^)]*)\)/);
        if (parts) {
          images.push({
            src: parts[2],
            alt: parts[1],
          });
        }
      });

      return images;
    } catch (error) {
      console.error('Images extraction failed:', error);
      return [];
    }
  }

  /**
   * 콘텐츠에서 링크를 추출합니다
   */
  static extractLinks(content: string): {
    internal: string[];
    external: string[];
  } {
    try {
      const links = {
        internal: [] as string[],
        external: [] as string[],
      };

      // HTML 링크 추출
      const linkMatches =
        content.match(/<a[^>]*href\s*=\s*["']([^"']*)["'][^>]*>/gi) || [];
      linkMatches.forEach((linkTag) => {
        const hrefMatch = linkTag.match(/href\s*=\s*["']([^"']*)["']/i);
        if (hrefMatch) {
          const url = hrefMatch[1];
          if (this.isExternalUrl(url)) {
            links.external.push(url);
          } else {
            links.internal.push(url);
          }
        }
      });

      // Markdown 링크 추출
      const markdownLinkMatches =
        content.match(/\[([^\]]*)\]\(([^)]*)\)/g) || [];
      markdownLinkMatches.forEach((match) => {
        const parts = match.match(/\[([^\]]*)\]\(([^)]*)\)/);
        if (parts) {
          const url = parts[2];
          if (this.isExternalUrl(url)) {
            links.external.push(url);
          } else {
            links.internal.push(url);
          }
        }
      });

      // 중복 제거
      links.internal = [...new Set(links.internal)];
      links.external = [...new Set(links.external)];

      return links;
    } catch (error) {
      console.error('Links extraction failed:', error);
      return { internal: [], external: [] };
    }
  }

  /**
   * 콘텐츠에서 순수 텍스트를 추출합니다
   */
  static extractTextContent(content: string): string {
    try {
      // HTML 태그 제거
      let textContent = content.replace(/<[^>]*>/g, ' ');

      // Markdown 문법 제거
      textContent = textContent
        .replace(/#{1,6}\s+/g, '') // 제목
        .replace(/\*\*([^*]+)\*\*/g, '$1') // 굵은 글씨
        .replace(/\*([^*]+)\*/g, '$1') // 기울임
        .replace(/`([^`]+)`/g, '$1') // 인라인 코드
        .replace(/```[\s\S]*?```/g, '') // 코드 블록
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 이미지
        .replace(/^[-*+]\s+/gm, '') // 목록
        .replace(/^\d+\.\s+/gm, '') // 번호 목록
        .replace(/^>\s+/gm, '') // 인용구
        .replace(/---+/g, '') // 구분선
        .replace(/\s+/g, ' ') // 여러 공백을 하나로
        .trim();

      return textContent;
    } catch (error) {
      console.error('Text content extraction failed:', error);
      return '';
    }
  }

  /**
   * 텍스트의 단어 수를 계산합니다
   */
  static countWords(text: string): number {
    try {
      if (!text.trim()) return 0;

      // 한글과 영어 단어 계산
      const koreanChars = text.match(/[가-힣]/g) || [];
      const englishWords = text.match(/[a-zA-Z]+/g) || [];

      // 한글은 글자 수 / 2, 영어는 단어 수
      return Math.ceil(koreanChars.length / 2) + englishWords.length;
    } catch (error) {
      console.error('Word count failed:', error);
      return 0;
    }
  }

  /**
   * 읽기 시간을 계산합니다 (분 단위)
   */
  static calculateReadingTime(wordCount: number): number {
    try {
      // 평균 읽기 속도: 분당 200단어 (한국어 기준)
      const wordsPerMinute = 200;
      return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    } catch (error) {
      console.error('Reading time calculation failed:', error);
      return 1;
    }
  }

  /**
   * 콘텐츠를 상세 분석합니다
   */
  static analyzeContent(content: string): ContentAnalysis {
    try {
      const textContent = this.extractTextContent(content);
      const words = textContent
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2);

      // 키워드 밀도 계산
      const wordCount: { [word: string]: number } = {};
      words.forEach((word) => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      const totalWords = words.length;
      const keywordDensity: { [keyword: string]: number } = {};
      Object.entries(wordCount).forEach(([word, count]) => {
        keywordDensity[word] = (count / totalWords) * 100;
      });

      // 상위 키워드
      const topKeywords = Object.entries(wordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([keyword, count]) => ({
          keyword,
          count,
          density: keywordDensity[keyword],
        }));

      // 문장 분석
      const sentences = textContent
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      const sentenceCount = sentences.length;
      const averageSentenceLength =
        sentenceCount > 0 ? Math.round(totalWords / sentenceCount) : 0;

      // 단락 수 계산
      const paragraphCount = content.split(/\n\s*\n/).length;

      // 간단한 가독성 점수 (Flesch Reading Ease 유사)
      const readabilityScore = this.calculateReadabilityScore(
        totalWords,
        sentenceCount,
        averageSentenceLength
      );

      return {
        keywordDensity,
        topKeywords,
        sentenceCount,
        paragraphCount,
        averageSentenceLength,
        readabilityScore,
      };
    } catch (error) {
      console.error('Content analysis failed:', error);
      return {
        keywordDensity: {},
        topKeywords: [],
        sentenceCount: 0,
        paragraphCount: 0,
        averageSentenceLength: 0,
        readabilityScore: 0,
      };
    }
  }

  /**
   * URL이 외부 링크인지 확인합니다
   */
  private static isExternalUrl(url: string): boolean {
    return /^https?:\/\//.test(url);
  }

  /**
   * HTML 태그와 특수 문자를 제거합니다
   */
  private static cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-zA-Z0-9#]+;/g, '')
      .trim();
  }

  /**
   * 가독성 점수를 계산합니다
   */
  private static calculateReadabilityScore(
    wordCount: number,
    sentenceCount: number,
    averageSentenceLength: number
  ): number {
    try {
      if (sentenceCount === 0 || wordCount === 0) return 0;

      // 간단한 가독성 공식 (0-100 점수)
      let score = 100;

      // 문장 길이 패널티
      if (averageSentenceLength > 20) {
        score -= (averageSentenceLength - 20) * 2;
      }

      // 너무 짧은 문장 패널티
      if (averageSentenceLength < 5) {
        score -= (5 - averageSentenceLength) * 3;
      }

      // 문장 수 고려
      if (sentenceCount < 3) {
        score -= 20;
      }

      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      console.error('Readability score calculation failed:', error);
      return 50;
    }
  }

  /**
   * 기본 메타데이터를 반환합니다
   */
  private static getDefaultMetadata(): ExtractedMetadata {
    return {
      title: '제목 없음',
      description: '설명 없음',
      keywords: [],
      headings: { h1: [], h2: [], h3: [] },
      images: [],
      links: { internal: [], external: [] },
      textContent: '',
      wordCount: 0,
      readingTime: 1,
    };
  }
}
