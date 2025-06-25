const fetch = require('node:fetch');

async function testAIStyleUpgrade() {
  try {
    console.log('🚀 AI Style Upgrade API 테스트 시작...');

    const response = await fetch('http://localhost:3000/api/ai/style-upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content:
          '# 테스트 문서\n\n이것은 AI 스타일 업그레이드 테스트입니다.\n\n```js\nconsole.log("Hello World");\n```\n\n## 두 번째 섹션\n\n내용이 더 있습니다.',
        contentType: 'markdown',
        options: {
          enhanceCodeBlocks: true,
          improveHeadingStructure: true,
          includeTableOfContents: false,
        },
      }),
    });

    console.log('📊 응답 상태:', response.status);
    console.log(
      '📊 응답 헤더:',
      Object.fromEntries(response.headers.entries())
    );

    const result = await response.json();
    console.log('📋 응답 결과:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ API 테스트 성공!');
      console.log('📈 가독성 점수:', result.data.readabilityScore);
      console.log('⏱️ 처리 시간:', result.data.processingTime, 'ms');
      console.log('🔧 개선사항:', result.data.improvements);
    } else {
      console.log('❌ API 테스트 실패:', result.error);
    }
  } catch (error) {
    console.error('💥 테스트 중 오류 발생:', error.message);
  }
}

testAIStyleUpgrade();
