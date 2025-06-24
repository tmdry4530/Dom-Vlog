// Dom vlog - Test Setup
// 테스트 환경 설정 및 초기화

import { beforeAll, afterAll } from 'vitest';

// 환경 변수 설정
if (!process.env.NODE_ENV) {
  Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./test.db';
}

beforeAll(async () => {
  // 테스트 시작 전 전역 설정
  console.log('🚀 Starting test suite...');
});

afterAll(async () => {
  // 테스트 종료 후 정리
  console.log('✅ Test suite completed');
});
