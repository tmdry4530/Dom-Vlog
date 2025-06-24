#!/usr/bin/env node

/**
 * 실제 Google AI API 연동 테스트 스크립트
 *
 * 사용법:
 * 1. .env.local 파일에 GOOGLE_AI_API_KEY 설정
 * 2. npm run dev (개발 서버 실행)
 * 3. node scripts/test-real-ai.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일에서 환경 변수 로드
try {
  const envPath = join(__dirname, '..', '.env.local');
  const envContent = readFileSync(envPath, 'utf8');

  envContent.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  });

  console.log('✅ .env.local 파일 로드 완료');
  console.log(
    '🔍 로드된 GOOGLE_AI_API_KEY:',
    process.env.GOOGLE_AI_API_KEY ? 'YES' : 'NO'
  );
  if (process.env.GOOGLE_AI_API_KEY) {
    console.log(
      '🔗 API 키 시작 부분:',
      process.env.GOOGLE_AI_API_KEY.substring(0, 10) + '...'
    );
  }
} catch (error) {
  console.error('❌ .env.local 파일을 찾을 수 없습니다.');
  console.log(
    '📝 먼저 .env.local 파일을 생성하고 GOOGLE_AI_API_KEY를 설정해주세요.'
  );
  process.exit(1);
}

async function testRealAI() {
  console.log('🚀 실제 AI API 연동 테스트 시작...\n');

  // API 키 확인
  if (
    !process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY === 'your_actual_api_key_here'
  ) {
    console.error('❌ GOOGLE_AI_API_KEY가 설정되지 않았습니다.');
    console.log(
      '📝 Google AI Studio (https://makersuite.google.com/app/apikey)에서 API 키를 발급받아 .env.local에 설정해주세요.\n'
    );
    return;
  }

  console.log('✅ API 키 확인 완료');
  console.log(
    '🔗 API 키:',
    process.env.GOOGLE_AI_API_KEY.substring(0, 10) + '...\n'
  );

  // 테스트 콘텐츠
  const testContent = `# JavaScript 비동기 처리

JavaScript에서 비동기 처리는 매우 중요한 개념입니다.

## Promise 사용법

\`\`\`js
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("데이터 로드 완료");
    }, 1000);
  });
}
\`\`\`

## async/await 패턴

async/await를 사용하면 더 깔끔한 코드를 작성할 수 있습니다.

\`\`\`javascript
async function getData() {
  try {
    const result = await fetchData();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

이렇게 사용하면 비동기 코드를 동기 코드처럼 작성할 수 있습니다.`;

  const testRequest = {
    content: testContent,
    contentType: 'markdown',
    options: {
      enhanceCodeBlocks: true,
      improveHeadingStructure: true,
      includeTableOfContents: true,
    },
  };

  try {
    console.log('📤 AI 스타일 업그레이드 요청 전송...');
    console.log('📊 원본 콘텐츠 길이:', testContent.length, '자\n');

    const response = await fetch('http://localhost:3000/api/ai/style-upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest),
    });

    console.log('📨 응답 상태:', response.status);
    console.log('📊 응답 헤더:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log();

    const result = await response.json();

    if (result.success) {
      console.log('🎉 실제 AI API 연동 성공!\n');

      console.log('📈 결과 요약:');
      console.log('  가독성 점수:', result.data.readabilityScore);
      console.log('  처리 시간:', result.data.processingTime, 'ms');
      console.log('  원본 길이:', result.data.metadata.originalLength, '자');
      console.log('  개선 후 길이:', result.data.metadata.enhancedLength, '자');
      console.log('  개선율:', result.data.metadata.improvementRatio + '%\n');

      console.log('🔧 개선사항:');
      result.data.improvements.forEach((improvement, index) => {
        console.log(`  ${index + 1}. ${improvement}`);
      });
      console.log();

      console.log('📝 개선된 콘텐츠 (처음 500자):');
      console.log('─'.repeat(50));
      console.log(result.data.enhancedContent.substring(0, 500) + '...');
      console.log('─'.repeat(50));

      // Mock response 헤더 확인
      const isMockResponse = response.headers.get('X-Mock-Response');
      if (isMockResponse) {
        console.log(
          '\n⚠️  모의 응답 모드입니다. GOOGLE_AI_API_KEY가 제대로 설정되지 않았거나 개발 모드입니다.'
        );
      } else {
        console.log('\n✅ 실제 Google AI API 응답입니다!');
      }
    } else {
      console.error('❌ AI API 연동 실패:');
      console.error('  오류:', result.error);
      console.error('  메시지:', result.message);
    }
  } catch (error) {
    console.error('💥 테스트 중 오류 발생:');
    console.error('  오류 타입:', error.name);
    console.error('  오류 메시지:', error.message);

    if (error.message.includes('fetch')) {
      console.log(
        '\n💡 힌트: 개발 서버가 실행 중인지 확인하세요 (npm run dev)'
      );
    }
  }
}

// 전역 fetch 폴리필 (Node.js 18 미만용)
if (!globalThis.fetch) {
  const { default: fetch } = await import('node-fetch');
  globalThis.fetch = fetch;
}

testRealAI().catch(console.error);
