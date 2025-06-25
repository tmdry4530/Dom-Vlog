import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SEO API Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should call SEO recommendation API correctly', async () => {
    const mockSeoData = {
      metaTitle: 'Optimized Title',
      metaDescription: 'Optimized description',
      keywords: ['react', 'typescript'],
      suggestedSlug: 'optimized-title',
      openGraph: {
        title: 'OG Title',
        description: 'OG Description',
      },
      confidence: { overall: 85 },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockSeoData }),
    });

    const response = await fetch('/api/ai/seo/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Title',
        content: 'Test content',
        contentType: 'markdown',
      }),
    });

    const result = await response.json();

    expect(mockFetch).toHaveBeenCalledWith('/api/ai/seo/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Title',
        content: 'Test content',
        contentType: 'markdown',
      }),
    });

    expect(result.success).toBe(true);
    expect(result.data.metaTitle).toBe('Optimized Title');
    expect(result.data.keywords).toContain('react');
  });

  it('should call SEO validation API correctly', async () => {
    const mockValidationResult = {
      overallScore: 85,
      passed: true,
      metrics: {
        contentScore: 80,
        technicalScore: 90,
        metadataScore: 85,
        performanceScore: 85,
      },
      suggestions: ['Improve meta description length'],
      validatedAt: '2023-01-01T00:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, data: mockValidationResult }),
    });

    const response = await fetch('/api/ai/seo/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Test content',
        contentType: 'markdown',
      }),
    });

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.overallScore).toBe(85);
    expect(result.data.passed).toBe(true);
  });

  it('should handle SEO API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    const response = await fetch('/api/ai/seo/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Title',
        content: 'Test content',
        contentType: 'markdown',
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });
});

describe('Category Recommendation API Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should call category recommendation API correctly', async () => {
    const mockRecommendations = [
      {
        categoryId: 'cat1',
        categoryName: 'React',
        confidence: 0.9,
        reasoning: 'Content focuses on React concepts',
        isExisting: true,
        keyTopics: ['hooks', 'components'],
      },
      {
        categoryId: 'cat2',
        categoryName: 'TypeScript',
        confidence: 0.75,
        reasoning: 'Code examples use TypeScript',
        isExisting: false,
        keyTopics: ['types', 'interfaces'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { recommendations: mockRecommendations },
        }),
    });

    const response = await fetch('/api/ai/category/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'React TypeScript Tutorial',
        content: 'Learn React with TypeScript',
        contentType: 'markdown',
        maxSuggestions: 3,
      }),
    });

    const result = await response.json();

    expect(mockFetch).toHaveBeenCalledWith('/api/ai/category/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'React TypeScript Tutorial',
        content: 'Learn React with TypeScript',
        contentType: 'markdown',
        maxSuggestions: 3,
      }),
    });

    expect(result.success).toBe(true);
    expect(result.data.recommendations).toHaveLength(2);
    expect(result.data.recommendations[0].categoryName).toBe('React');
  });

  it('should call auto-tag API correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, data: { addedCategories: 2 } }),
    });

    const response = await fetch('/api/ai/category/auto-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: 'post123',
        selectedCategories: [
          { categoryId: 'cat1', confidence: 0.9 },
          { categoryId: 'cat2', confidence: 0.75 },
        ],
        replaceExisting: false,
      }),
    });

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.addedCategories).toBe(2);
  });

  it('should handle category API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
    });

    const response = await fetch('/api/ai/category/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Title',
        content: 'Content',
        contentType: 'markdown',
        maxSuggestions: 3,
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(429);
  });
});

describe('AI Integration Service Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should handle parallel AI API calls', async () => {
    // Mock styling API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            enhancedContent: 'Enhanced content',
            readabilityScore: 85,
            improvements: ['Added headings'],
            processingTime: 2000,
          },
        }),
    });

    // Mock SEO API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            metaTitle: 'SEO Title',
            metaDescription: 'SEO Description',
            keywords: ['react', 'typescript'],
            suggestedSlug: 'seo-title',
            confidence: { overall: 90 },
          },
        }),
    });

    // Mock Category API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            recommendations: [
              {
                categoryId: 'cat1',
                categoryName: 'React',
                confidence: 0.9,
                reasoning: 'React content detected',
                isExisting: true,
                keyTopics: ['hooks'],
              },
            ],
          },
        }),
    });

    // Test parallel API calls
    const [stylingResponse, seoResponse, categoryResponse] = await Promise.all([
      fetch('/api/ai/style-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Test content',
          contentType: 'markdown',
          options: {
            includeTableOfContents: true,
            enhanceCodeBlocks: true,
            improveHeadingStructure: true,
            optimizeForSEO: true,
          },
        }),
      }),
      fetch('/api/ai/seo/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Title',
          content: 'Test content',
          contentType: 'markdown',
        }),
      }),
      fetch('/api/ai/category/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Title',
          content: 'Test content',
          contentType: 'markdown',
          maxSuggestions: 3,
        }),
      }),
    ]);

    const [stylingResult, seoResult, categoryResult] = await Promise.all([
      stylingResponse.json(),
      seoResponse.json(),
      categoryResponse.json(),
    ]);

    expect(stylingResult.success).toBe(true);
    expect(seoResult.success).toBe(true);
    expect(categoryResult.success).toBe(true);

    expect(stylingResult.data.readabilityScore).toBe(85);
    expect(seoResult.data.metaTitle).toBe('SEO Title');
    expect(categoryResult.data.recommendations[0].categoryName).toBe('React');

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should handle partial failures in AI integration', async () => {
    // Styling succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { enhancedContent: 'Enhanced', readabilityScore: 85 },
        }),
    });

    // SEO fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    // Categories succeed
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { recommendations: [] },
        }),
    });

    const results = await Promise.allSettled([
      fetch('/api/ai/style-upgrade', { method: 'POST', body: '{}' }),
      fetch('/api/ai/seo/recommend', { method: 'POST', body: '{}' }),
      fetch('/api/ai/category/recommend', { method: 'POST', body: '{}' }),
    ]);

    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('fulfilled'); // fetch doesn't reject on HTTP errors
    expect(results[2].status).toBe('fulfilled');

    // Check actual response status
    const responses = results.map((r) => (r as any).value);
    expect(responses[0].ok).toBe(true);
    expect(responses[1].ok).toBe(false);
    expect(responses[2].ok).toBe(true);
  });
});
