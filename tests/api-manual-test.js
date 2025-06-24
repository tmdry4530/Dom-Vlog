/**
 * AI 스타일 업그레이드 API 수동 테스트 스크립트
 *
 * 실제 서버가 실행 중일 때 사용하여 API 동작을 확인합니다.
 * node tests/api-manual-test.js 명령으로 실행
 */

const API_BASE_URL = 'http://localhost:3000';

async function testGetEndpoint() {
  console.log('🔍 Testing GET /api/ai/style-upgrade...');

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/style-upgrade`);
    const data = await response.json();

    console.log('✅ GET Response:', {
      status: response.status,
      data: data,
    });

    return response.ok;
  } catch (error) {
    console.error('❌ GET Error:', error.message);
    return false;
  }
}

async function testPostEndpoint() {
  console.log('🔍 Testing POST /api/ai/style-upgrade...');

  const testRequest = {
    content: `
# Test Document

This is a test document for AI style upgrade.

## Introduction

Here's some sample content with **bold** and *italic* text.

## Code Example

\`\`\`
function hello() {
  console.log("Hello World");
}
\`\`\`

## Conclusion

This concludes our test document.
    `.trim(),
    contentType: 'markdown',
    options: {
      enhanceCodeBlocks: true,
      generateTOC: true,
      improveHeadings: true,
    },
  };

  try {
    console.log(
      '📤 Sending request with content length:',
      testRequest.content.length
    );

    const response = await fetch(`${API_BASE_URL}/api/ai/style-upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest),
    });

    const data = await response.json();

    console.log('✅ POST Response:', {
      status: response.status,
      success: data.success,
      hasEnhancedContent: !!data.enhancedContent,
      hasReadabilityScore: !!data.readabilityScore,
      enhancedContentLength: data.enhancedContent?.length || 0,
      readabilityScore: data.readabilityScore?.overallScore || 'N/A',
    });

    if (data.enhancedContent) {
      console.log('\n📝 Enhanced Content Preview:');
      console.log(data.enhancedContent.substring(0, 300) + '...');
    }

    if (data.readabilityScore) {
      console.log('\n📊 Readability Analysis:');
      console.log('Overall Score:', data.readabilityScore.overallScore);
      console.log(
        'Suggestions:',
        data.readabilityScore.suggestions?.slice(0, 3)
      );
    }

    return response.ok;
  } catch (error) {
    console.error('❌ POST Error:', error.message);
    return false;
  }
}

async function testErrorHandling() {
  console.log('🔍 Testing error handling...');

  const invalidRequest = {
    content: '', // 빈 콘텐츠
    contentType: 'invalid', // 잘못된 타입
    options: {},
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/style-upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidRequest),
    });

    const data = await response.json();

    console.log('✅ Error handling response:', {
      status: response.status,
      success: data.success,
      error: data.error,
    });

    return !response.ok; // 에러가 적절히 처리되었는지 확인
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Manual Tests...\n');

  const results = {
    get: await testGetEndpoint(),
    post: await testPostEndpoint(),
    errorHandling: await testErrorHandling(),
  };

  console.log('\n📊 Test Results Summary:');
  console.log('GET Endpoint:', results.get ? '✅ PASS' : '❌ FAIL');
  console.log('POST Endpoint:', results.post ? '✅ PASS' : '❌ FAIL');
  console.log('Error Handling:', results.errorHandling ? '✅ PASS' : '❌ FAIL');

  const allPassed = Object.values(results).every((result) => result);
  console.log(
    '\nOverall Result:',
    allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'
  );

  return allPassed;
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testGetEndpoint,
  testPostEndpoint,
  testErrorHandling,
  runAllTests,
};
