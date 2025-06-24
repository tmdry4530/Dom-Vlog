/**
 * AI 스타일 업그레이드 API 상세 테스트
 * 실제 응답 데이터를 자세히 확인합니다.
 */

const API_BASE_URL = 'http://localhost:3000';

async function testDetailedResponse() {
  console.log('📋 Testing detailed API response...');

  const testRequest = {
    content: `
# My Technical Blog Post

This is a sample blog post about JavaScript.

## Introduction

JavaScript is a powerful programming language.

## Code Example

function greet(name) {
  console.log("Hello, " + name);
}

## Advanced Topics

### Async Programming

Async/await makes asynchronous code easier to read.

### Error Handling

Try-catch blocks help handle errors gracefully.

## Conclusion

JavaScript continues to evolve.
    `.trim(),
    contentType: 'markdown',
    options: {
      enhanceCodeBlocks: true,
      generateTOC: true,
      improveHeadings: true,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/style-upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest),
    });

    const data = await response.json();

    console.log('\n📊 Response Status:', response.status);
    console.log('✅ Success:', data.success);

    if (data.success && data.data) {
      console.log('\n📝 Enhanced Content:');
      console.log('Original Length:', testRequest.content.length);
      console.log('Enhanced Length:', data.data.enhancedContent?.length || 0);
      console.log('Processing Time:', data.data.processingTime, 'ms');

      if (data.data.enhancedContent) {
        console.log('\n📄 Enhanced Content Preview:');
        console.log(data.data.enhancedContent);
      }

      if (data.data.readabilityScore) {
        console.log('\n📊 Readability Score:', data.data.readabilityScore);
      }

      if (data.data.improvements) {
        console.log('\n🔧 Improvements Applied:');
        data.data.improvements.forEach((improvement, index) => {
          console.log(`${index + 1}. ${improvement}`);
        });
      }

      if (data.data.metadata) {
        console.log('\n📈 Metadata:');
        console.log(
          'Improvement Ratio:',
          data.data.metadata.improvementRatio + '%'
        );
      }

      // Mock response 여부 확인
      const isMockResponse = response.headers.get('X-Mock-Response') === 'true';
      console.log('\n🎭 Mock Response:', isMockResponse ? 'Yes' : 'No');
    } else {
      console.log('\n❌ Error Response:', data);
    }

    return response.ok;
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('\n⏱️ Testing API Performance...');

  const testContent = `
# Performance Test

This is a performance test with multiple sections.

## Section 1
Content here.

## Section 2
More content here.

\`\`\`javascript
function test() {
  return "performance";
}
\`\`\`

## Section 3
Final section.
  `.trim();

  const testRequest = {
    content: testContent,
    contentType: 'markdown',
    options: {},
  };

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/style-upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest),
    });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const data = await response.json();

    console.log('⏱️ Total Request Time:', totalTime, 'ms');
    console.log(
      '🔧 Server Processing Time:',
      data.data?.processingTime || 'N/A',
      'ms'
    );
    console.log(
      '🌐 Network Time:',
      totalTime - (data.data?.processingTime || 0),
      'ms'
    );

    // 성능 요구사항 확인 (2초 이내)
    const performanceOk = totalTime < 2000;
    console.log(
      '✅ Performance Check:',
      performanceOk ? 'PASS (<2s)' : 'FAIL (>=2s)'
    );

    return performanceOk;
  } catch (error) {
    console.error('❌ Performance Test Error:', error.message);
    return false;
  }
}

async function runDetailedTests() {
  console.log('🔍 Starting Detailed API Tests...\n');

  const results = {
    detailed: await testDetailedResponse(),
    performance: await testPerformance(),
  };

  console.log('\n📊 Detailed Test Results:');
  console.log('Detailed Response:', results.detailed ? '✅ PASS' : '❌ FAIL');
  console.log('Performance Test:', results.performance ? '✅ PASS' : '❌ FAIL');

  const allPassed = Object.values(results).every((result) => result);
  console.log(
    '\nOverall Result:',
    allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'
  );

  return allPassed;
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  runDetailedTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testDetailedResponse,
  testPerformance,
  runDetailedTests,
};
