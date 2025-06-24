/**
 * AI 스타일 업그레이드 API 통합 테스트
 *
 * 이 테스트는 실제 AI API 호출 없이 모의 데이터로 검증합니다.
 * 실제 API 키가 필요한 테스트는 별도로 수행해야 합니다.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { StyleEnhancer } from '../ai/processors/style-enhancer';

describe('AI Style Upgrade API Integration Tests', () => {
  let styleEnhancer: StyleEnhancer;

  beforeAll(() => {
    // 환경 변수 모킹
    process.env.GOOGLE_AI_API_KEY = 'mock-api-key';
    styleEnhancer = new StyleEnhancer();
  });

  afterAll(() => {
    delete process.env.GOOGLE_AI_API_KEY;
  });

  describe('StyleEnhancer Class Tests', () => {
    it('should initialize properly', () => {
      expect(styleEnhancer).toBeDefined();
      expect(typeof styleEnhancer.enhanceContent).toBe('function');
      expect(typeof styleEnhancer.analyzeReadability).toBe('function');
    });

    it('should extract code blocks correctly', () => {
      const content = `
# Test Document

Here is some code:

\`\`\`javascript
function test() {
  console.log('Hello World');
}
\`\`\`

And some more text.

\`\`\`python
def hello():
    print("Hello Python")
\`\`\`
      `;

      const codeBlocks = styleEnhancer.extractCodeBlocks(content);
      expect(codeBlocks).toHaveLength(2);
      expect(codeBlocks[0]).toContain('javascript');
      expect(codeBlocks[1]).toContain('python');
    });

    it('should extract headings correctly', () => {
      const content = `
# Main Title
## Section 1
### Subsection 1.1
## Section 2
#### Deep Section
      `;

      const headings = styleEnhancer.extractHeadings(content);
      expect(headings).toHaveLength(5);
      expect(headings[0]).toEqual({ level: 1, text: 'Main Title' });
      expect(headings[1]).toEqual({ level: 2, text: 'Section 1' });
      expect(headings[2]).toEqual({ level: 3, text: 'Subsection 1.1' });
    });

    it('should preprocess content correctly', async () => {
      const markdownContent = `
# Test Title

This is a test document with **bold** text and *italic* text.

\`\`\`javascript
console.log('test');
\`\`\`
      `;

      const processed = await styleEnhancer.preprocessContent(
        markdownContent,
        'markdown'
      );
      expect(processed).toContain('# Test Title');
      expect(processed).toContain('**bold**');
      expect(processed).toContain('*italic*');
      expect(processed).toContain('```javascript');
    });

    it('should handle HTML to Markdown conversion', async () => {
      const htmlContent = `
<h1>Test Title</h1>
<p>This is a <strong>bold</strong> paragraph.</p>
<pre><code>console.log('test');</code></pre>
      `;

      const processed = await styleEnhancer.preprocessContent(
        htmlContent,
        'html'
      );
      expect(processed).toContain('# Test Title');
      expect(processed).toContain('**bold**');
      expect(processed).toContain('console.log'); // 코드 내용이 포함되어 있는지 확인
    });
  });

  describe('Content Processing Tests', () => {
    it('should process content with postprocessContent method', async () => {
      const content = `
# Main Document

## Introduction
This is the introduction.

## Getting Started
How to get started.

### Prerequisites
What you need.

### Installation
How to install.

## Usage
How to use it.
      `;

      const processed = await styleEnhancer.postprocessContent(content);
      expect(processed).toContain('# Main Document');
      expect(processed).toContain('## Introduction');
      expect(processed).toContain('## Getting Started');
      // 목차가 생성되는지 확인 (3개 이상의 제목이 있으므로)
      expect(processed).toContain('## 목차');
    });

    it('should not generate TOC for content with few headings', async () => {
      const content = `
# Main Document

## Only Section
This is the only section.
      `;

      const processed = await styleEnhancer.postprocessContent(content);
      expect(processed).not.toContain('## 목차');
      expect(processed).toContain('# Main Document');
    });

    it('should optimize code blocks during postprocessing', async () => {
      const content = `
\`\`\`
function test() {
  console.log('Hello');
}
\`\`\`
      `;

      const processed = await styleEnhancer.postprocessContent(content);
      expect(processed).toContain('```javascript');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid markdown gracefully', async () => {
      const invalidContent = `
# Broken Markdown

[Invalid link](

\`\`\`
Unclosed code block
      `;

      try {
        const processed = await styleEnhancer.preprocessContent(
          invalidContent,
          'markdown'
        );
        expect(processed).toBeDefined();
        expect(typeof processed).toBe('string');
      } catch (error) {
        // Should not throw errors for invalid markdown
        expect(error).toBeUndefined();
      }
    });

    it('should handle empty content', async () => {
      const emptyContent = '';

      const processed = await styleEnhancer.preprocessContent(
        emptyContent,
        'markdown'
      );
      expect(processed).toBe('');
    });

    it('should handle very long content', async () => {
      const longContent = 'a'.repeat(10000) + '\n# Title\n' + 'b'.repeat(10000);

      const processed = await styleEnhancer.preprocessContent(
        longContent,
        'markdown'
      );
      expect(processed).toBeDefined();
      expect(processed.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should process content within reasonable time', async () => {
      const testContent = `
# Performance Test Document

## Section 1
Lorem ipsum dolor sit amet, consectetur adipiscing elit.

\`\`\`javascript
function performanceTest() {
  for (let i = 0; i < 1000; i++) {
    console.log('Processing item', i);
  }
}
\`\`\`

## Section 2
More content here.

### Subsection 2.1
Even more content.

## Section 3
Final section.
      `;

      const startTime = Date.now();
      const processed = await styleEnhancer.preprocessContent(
        testContent,
        'markdown'
      );
      const endTime = Date.now();

      const processingTime = endTime - startTime;

      expect(processed).toBeDefined();
      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});

// API 엔드포인트 테스트 (실제 서버 실행 시)
describe('API Endpoint Tests (requires running server)', () => {
  const API_BASE_URL = 'http://localhost:3000';

  it('should handle POST request to /api/ai/style-upgrade', async () => {
    // 이 테스트는 실제 서버가 실행 중일 때만 작동합니다
    console.log('API endpoint test requires running server at', API_BASE_URL);

    const testRequest = {
      content: '# Test\n\nThis is a test document.',
      contentType: 'markdown',
      options: {
        enhanceCodeBlocks: true,
        generateTOC: true,
        improveHeadings: true,
      },
    };

    // 실제 테스트는 fetch 또는 axios를 사용하여 수행
    // const response = await fetch(`${API_BASE_URL}/api/ai/style-upgrade`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(testRequest)
    // });

    // expect(response.ok).toBe(true);
    // const result = await response.json();
    // expect(result.enhancedContent).toBeDefined();
    // expect(result.readabilityScore).toBeDefined();
  });

  it('should handle GET request to /api/ai/style-upgrade', async () => {
    // API 정보 조회 테스트
    console.log('GET endpoint test - API information');

    // const response = await fetch(`${API_BASE_URL}/api/ai/style-upgrade`);
    // expect(response.ok).toBe(true);
    // const info = await response.json();
    // expect(info.name).toBe('AI Style Upgrade API');
  });
});

export { StyleEnhancer };
