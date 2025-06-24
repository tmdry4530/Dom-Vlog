// 환경 변수 확인 테스트
console.log('🔍 환경 변수 상태 확인:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_AI_API_KEY 존재 여부:', !!process.env.GOOGLE_AI_API_KEY);

if (process.env.GOOGLE_AI_API_KEY) {
  console.log('✅ GOOGLE_AI_API_KEY 발견!');
  console.log(
    '🔗 API 키 시작 부분:',
    process.env.GOOGLE_AI_API_KEY.substring(0, 10) + '...'
  );
} else {
  console.log('❌ GOOGLE_AI_API_KEY가 설정되지 않음');
}

// 간단한 API 테스트
async function simpleTest() {
  try {
    const testData = {
      content: '# 테스트\n이것은 간단한 테스트입니다.',
      contentType: 'markdown',
    };

    console.log('\n🚀 API 테스트 시작...');

    // fetch 대신 http 모듈 사용
    const http = require('http');

    const postData = JSON.stringify(testData);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai/style-upgrade',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      console.log('📊 응답 상태:', res.statusCode);
      console.log('📊 응답 헤더:', res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('📋 응답 결과:');
          console.log('  성공:', result.success);
          if (result.success) {
            console.log('  가독성 점수:', result.data.readabilityScore);
            console.log('  처리 시간:', result.data.processingTime, 'ms');

            // Mock response 확인
            if (res.headers['x-mock-response']) {
              console.log('⚠️ 모의 응답 모드입니다');
            } else {
              console.log('✅ 실제 AI API 응답입니다!');
            }
          } else {
            console.log('  오류:', result.error);
          }
        } catch (e) {
          console.log('❌ JSON 파싱 오류:', e.message);
          console.log('원본 응답:', data);
        }
      });
    });

    req.on('error', (e) => {
      console.error('💥 요청 오류:', e.message);
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.error('💥 테스트 오류:', error.message);
  }
}

simpleTest();
