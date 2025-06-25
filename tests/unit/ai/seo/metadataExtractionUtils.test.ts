import { describe, it, expect } from 'vitest';
import { MetadataExtractionUtils } from '@/lib/ai/seo/metadataExtractionUtils';
import type {
  ExtractedMetadata,
  ContentAnalysis,
} from '@/lib/ai/seo/metadataExtractionUtils';

describe('MetadataExtractionUtils', () => {
  describe('extractTitle', () => {
    it('should extract HTML H1 title', () => {
      const content = '<h1>메인 제목</h1><p>내용</p>';
      const title = MetadataExtractionUtils.extractTitle(content);
      expect(title).toBe('메인 제목');
    });

    it('should extract Markdown H1 title', () => {
      const content = '# 마크다운 제목\n\n내용입니다.';
      const title = MetadataExtractionUtils.extractTitle(content);
      expect(title).toBe('마크다운 제목');
    });

    it('should fallback to H2 if no H1', () => {
      const content = '<h2>두 번째 제목</h2><p>내용</p>';
      const title = MetadataExtractionUtils.extractTitle(content);
      expect(title).toBe('두 번째 제목');
    });

    it('should return default for no headings', () => {
      const content = '<p>제목이 없는 내용</p>';
      const title = MetadataExtractionUtils.extractTitle(content);
      expect(title).toBe('제목 없음');
    });
  });

  describe('extractDescription', () => {
    it('should extract first few sentences as description', () => {
      const content = `
        <h1>제목</h1>
        <p>첫 번째 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다. 네 번째 문장입니다.</p>
      `;
      const description = MetadataExtractionUtils.extractDescription(content);
      expect(description).toBe(
        '첫 번째 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다'
      );
    });

    it('should truncate long descriptions', () => {
      const longContent = '<p>' + 'A'.repeat(200) + '.</p>';
      const description =
        MetadataExtractionUtils.extractDescription(longContent);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(description.endsWith('...')).toBe(true);
    });

    it('should extend short descriptions', () => {
      const content =
        '<p>짧은 문장. 또 다른 문장. 추가 문장. 더 많은 내용.</p>';
      const description = MetadataExtractionUtils.extractDescription(content);
      expect(description.length).toBeGreaterThan(20);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from content', () => {
      const content = `
        <h1>React 개발 가이드</h1>
        <p>React는 프론트엔드 개발을 위한 라이브러리입니다. 
           컴포넌트 기반 개발과 상태 관리가 핵심입니다.</p>
      `;
      const keywords = MetadataExtractionUtils.extractKeywords(content);

      expect(keywords).toContain('react');
      expect(keywords).toContain('개발');
      expect(keywords).toContain('컴포넌트');
      expect(keywords.length).toBeGreaterThan(0);
    });

    it('should prioritize title keywords', () => {
      const content = `
        <h1>TypeScript 기초</h1>
        <p>일반적인 내용이 여기에 있습니다. 프로그래밍 언어에 대한 설명입니다.</p>
      `;
      const keywords = MetadataExtractionUtils.extractKeywords(content);

      expect(keywords[0]).toBe('typescript');
    });

    it('should filter out stop words', () => {
      const content = '<p>그리고 이것은 하지만 그런데 있다 없다 하다</p>';
      const keywords = MetadataExtractionUtils.extractKeywords(content);

      expect(keywords).not.toContain('그리고');
      expect(keywords).not.toContain('하지만');
      expect(keywords).not.toContain('있다');
    });
  });

  describe('extractHeadings', () => {
    it('should extract HTML headings', () => {
      const content = `
        <h1>Main Title</h1>
        <h2>Section 1</h2>
        <h2>Section 2</h2>
        <h3>Subsection</h3>
      `;
      const headings = MetadataExtractionUtils.extractHeadings(content);

      expect(headings.h1).toEqual(['Main Title']);
      expect(headings.h2).toEqual(['Section 1', 'Section 2']);
      expect(headings.h3).toEqual(['Subsection']);
    });

    it('should extract Markdown headings', () => {
      const content = `
        # Main Title
        ## Section 1
        ## Section 2
        ### Subsection
      `;
      const headings = MetadataExtractionUtils.extractHeadings(content);

      expect(headings.h1).toEqual(['Main Title']);
      expect(headings.h2).toEqual(['Section 1', 'Section 2']);
      expect(headings.h3).toEqual(['Subsection']);
    });
  });

  describe('extractImages', () => {
    it('should extract HTML images', () => {
      const content = `
        <img src="image1.jpg" alt="첫 번째 이미지" title="이미지 제목" />
        <img src="image2.png" alt="두 번째 이미지" />
      `;
      const images = MetadataExtractionUtils.extractImages(content);

      expect(images).toHaveLength(2);
      expect(images[0]).toEqual({
        src: 'image1.jpg',
        alt: '첫 번째 이미지',
        title: '이미지 제목',
      });
      expect(images[1]).toEqual({
        src: 'image2.png',
        alt: '두 번째 이미지',
      });
    });

    it('should extract Markdown images', () => {
      const content = '![대체 텍스트](image.jpg)';
      const images = MetadataExtractionUtils.extractImages(content);

      expect(images).toHaveLength(1);
      expect(images[0]).toEqual({
        src: 'image.jpg',
        alt: '대체 텍스트',
      });
    });
  });

  describe('extractLinks', () => {
    it('should distinguish internal and external links', () => {
      const content = `
        <a href="/internal-page">내부 링크</a>
        <a href="https://external.com">외부 링크</a>
        <a href="http://another-external.org">또 다른 외부 링크</a>
      `;
      const links = MetadataExtractionUtils.extractLinks(content);

      expect(links.internal).toEqual(['/internal-page']);
      expect(links.external).toEqual([
        'https://external.com',
        'http://another-external.org',
      ]);
    });

    it('should extract Markdown links', () => {
      const content = '[내부 링크](/page) [외부 링크](https://example.com)';
      const links = MetadataExtractionUtils.extractLinks(content);

      expect(links.internal).toEqual(['/page']);
      expect(links.external).toEqual(['https://example.com']);
    });
  });

  describe('extractTextContent', () => {
    it('should remove HTML tags', () => {
      const content = '<h1>제목</h1><p><strong>굵은</strong> 텍스트</p>';
      const textContent = MetadataExtractionUtils.extractTextContent(content);

      expect(textContent).toBe('제목 굵은 텍스트');
    });

    it('should remove Markdown syntax', () => {
      const content = `
        # 제목
        
        **굵은 글씨**와 *기울임*이 있습니다.
        
        \`\`\`javascript
        console.log('코드');
        \`\`\`
        
        [링크](url)와 ![이미지](img.jpg)도 있습니다.
      `;
      const textContent = MetadataExtractionUtils.extractTextContent(content);

      expect(textContent).toContain('제목');
      expect(textContent).toContain('굵은 글씨');
      expect(textContent).toContain('기울임');
      expect(textContent).toContain('링크');
      expect(textContent).not.toContain('**');
      expect(textContent).not.toContain('```');
      expect(textContent).not.toContain('[');
    });
  });

  describe('countWords', () => {
    it('should count Korean and English words', () => {
      const text = '안녕하세요 hello world 테스트입니다';
      const wordCount = MetadataExtractionUtils.countWords(text);

      // 한글: 안녕하세요(2) + 테스트입니다(3) = 5/2 = 3
      // 영어: hello(1) + world(1) = 2
      // 총합: 3 + 2 = 5
      expect(wordCount).toBe(5);
    });

    it('should handle empty text', () => {
      const wordCount = MetadataExtractionUtils.countWords('');
      expect(wordCount).toBe(0);
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time correctly', () => {
      const readingTime200 = MetadataExtractionUtils.calculateReadingTime(200);
      const readingTime100 = MetadataExtractionUtils.calculateReadingTime(100);

      expect(readingTime200).toBe(1);
      expect(readingTime100).toBe(1);
    });

    it('should have minimum reading time of 1 minute', () => {
      const readingTime = MetadataExtractionUtils.calculateReadingTime(50);
      expect(readingTime).toBe(1);
    });
  });

  describe('analyzeContent', () => {
    it('should provide comprehensive content analysis', () => {
      const content = `
        <h1>React 튜토리얼</h1>
        <p>React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다. 
           React를 사용하면 복잡한 UI를 간단한 컴포넌트로 나누어 관리할 수 있습니다.</p>
        <p>이 튜토리얼에서는 React의 기본 개념을 학습하겠습니다.</p>
      `;

      const analysis = MetadataExtractionUtils.analyzeContent(content);

      expect(analysis.topKeywords.length).toBeGreaterThan(0);
      expect(analysis.sentenceCount).toBeGreaterThan(0);
      expect(analysis.paragraphCount).toBeGreaterThan(0);
      expect(analysis.averageSentenceLength).toBeGreaterThan(0);
      expect(analysis.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(analysis.readabilityScore).toBeLessThanOrEqual(100);

      // React가 상위 키워드에 포함되어야 함
      const topKeywordTexts = analysis.topKeywords.map((k) => k.keyword);
      expect(topKeywordTexts).toContain('react');
    });
  });

  describe('extractAllMetadata', () => {
    it('should extract complete metadata from content', () => {
      const content = `
        <h1>완벽한 메타데이터 테스트</h1>
        <h2>소제목</h2>
        <p>이것은 테스트 콘텐츠입니다. 메타데이터 추출을 위한 샘플 텍스트입니다.</p>
        <p>추가 단락입니다. <a href="/internal">내부 링크</a>와 <a href="https://external.com">외부 링크</a>가 있습니다.</p>
        <img src="test.jpg" alt="테스트 이미지" />
      `;

      const metadata = MetadataExtractionUtils.extractAllMetadata(content);

      expect(metadata.title).toBe('완벽한 메타데이터 테스트');
      expect(metadata.description).toContain('테스트 콘텐츠');
      expect(metadata.keywords.length).toBeGreaterThan(0);
      expect(metadata.headings.h1).toEqual(['완벽한 메타데이터 테스트']);
      expect(metadata.headings.h2).toEqual(['소제목']);
      expect(metadata.images).toHaveLength(1);
      expect(metadata.links.internal).toEqual(['/internal']);
      expect(metadata.links.external).toEqual(['https://external.com']);
      expect(metadata.textContent.length).toBeGreaterThan(0);
      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.readingTime).toBeGreaterThanOrEqual(1);
    });

    it('should handle extraction errors gracefully', () => {
      // 빈 콘텐츠나 오류 상황
      const metadata = MetadataExtractionUtils.extractAllMetadata('');

      expect(metadata.title).toBe('제목 없음');
      expect(metadata.description).toBe('설명 없음');
      expect(metadata.keywords).toEqual([]);
      expect(metadata.wordCount).toBe(0);
      expect(metadata.readingTime).toBe(1);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed HTML gracefully', () => {
      const malformedContent =
        '<h1>제목<p>닫히지 않은 태그<img src="test.jpg">';
      const metadata =
        MetadataExtractionUtils.extractAllMetadata(malformedContent);

      expect(metadata.title).toBe('제목');
      expect(metadata).toBeDefined();
    });

    it('should handle very short content', () => {
      const shortContent = '짧음';
      const metadata = MetadataExtractionUtils.extractAllMetadata(shortContent);

      expect(metadata.title).toBe('제목 없음');
      expect(metadata.description).toBe('설명 없음');
      expect(metadata.wordCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle content with special characters', () => {
      const specialContent =
        '<h1>제목!@#$%</h1><p>특수문자 & entities &amp; 테스트</p>';
      const metadata =
        MetadataExtractionUtils.extractAllMetadata(specialContent);

      expect(metadata.title).toBe('제목!@#$%');
      expect(metadata.textContent).toContain('특수문자');
    });
  });
});
