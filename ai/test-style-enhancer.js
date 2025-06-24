// AI 스타일 업그레이드 기능 테스트 스크립트
// 이 파일은 개발/테스트 목적으로만 사용됩니다.

// 테스트 데이터
const testMarkdown = `
# 테스트 제목

이것은 테스트 블로그 글입니다.

## 코드 예제

\`\`\`
function hello() {
  console.log("Hello World");
}
\`\`\`

### 리스트 예제

- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

## 결론

이 글은 AI 스타일 업그레이드 기능을 테스트하기 위한 샘플입니다.
`;

// 기본 테스트 함수
async function testStyleEnhancer() {
  console.log('🚀 AI 스타일 업그레이드 테스트 시작...\n');

  try {
    // 환경 변수 확인
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('❌ GOOGLE_AI_API_KEY 환경 변수가 설정되지 않았습니다.');
      console.log('📝 .env.local 파일에 다음을 추가하세요:');
      console.log('   GOOGLE_AI_API_KEY=your_api_key_here\n');
      return;
    }

    // ES 모듈 dynamic import 사용
    const { StyleEnhancer } = await import('./processors/style-enhancer.js');

    const enhancer = new StyleEnhancer();

    // 테스트 요청 준비
    const request = {
      content: testMarkdown,
      contentType: 'markdown',
      options: {
        includeTableOfContents: true,
        enhanceCodeBlocks: true,
        improveHeadingStructure: true,
        optimizeForSEO: false,
      },
    };

    console.log('📄 입력 콘텐츠:');
    console.log('---');
    console.log(testMarkdown);
    console.log('---\n');

    console.log('⏱️  AI 처리 시작...');
    const startTime = Date.now();

    // AI 스타일 업그레이드 실행
    const result = await enhancer.enhanceContent(request);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log('✅ AI 처리 완료!\n');

    // 결과 출력
    console.log('📊 처리 결과:');
    console.log(`⏱️  처리 시간: ${processingTime}ms`);
    console.log(`📈 가독성 점수: ${result.readabilityScore.score}/100`);
    console.log('\n📝 개선된 콘텐츠:');
    console.log('---');
    console.log(result.processedContent);
    console.log('---\n');

    console.log('🔍 가독성 세부 점수:');
    console.log(
      `   제목 구조: ${result.readabilityScore.breakdown.headingStructure}/100`
    );
    console.log(
      `   코드 포맷팅: ${result.readabilityScore.breakdown.codeBlockFormatting}/100`
    );
    console.log(
      `   문단 흐름: ${result.readabilityScore.breakdown.paragraphFlow}/100`
    );
    console.log(
      `   리스트 구성: ${result.readabilityScore.breakdown.listOrganization}/100`
    );
    console.log(
      `   전체 명확성: ${result.readabilityScore.breakdown.overallClarity}/100`
    );

    if (result.improvements.length > 0) {
      console.log('\n💡 개선 사항:');
      result.improvements.forEach((improvement, index) => {
        console.log(`   ${index + 1}. ${improvement}`);
      });
    }

    if (result.readabilityScore.suggestions.length > 0) {
      console.log('\n🎯 AI 추천사항:');
      result.readabilityScore.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    }

    // 성능 검증
    console.log('\n📊 성능 검증:');
    if (processingTime <= 2000) {
      console.log('✅ 처리 시간 요구사항 충족 (≤ 2초)');
    } else {
      console.log('⚠️  처리 시간이 요구사항을 초과했습니다 (> 2초)');
    }

    // 가독성 점수 검증
    if (result.readabilityScore.score >= 80) {
      console.log('✅ 가독성 점수 요구사항 충족 (≥ 80점)');
    } else {
      console.log('⚠️  가독성 점수가 요구사항을 충족하지 못했습니다 (< 80점)');
    }

    console.log('\n🎉 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);

    if (error.message.includes('API 키')) {
      console.log('\n💡 해결 방법:');
      console.log(
        '1. Google AI Studio에서 API 키를 생성하세요: https://makersuite.google.com/app/apikey'
      );
      console.log('2. .env.local 파일에 GOOGLE_AI_API_KEY를 설정하세요');
    }
  }
}

// 모듈이 직접 실행될 때만 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  testStyleEnhancer();
}

export { testStyleEnhancer };
