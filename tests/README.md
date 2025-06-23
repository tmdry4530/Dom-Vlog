# 테스트

Dom vlog 프로젝트의 테스트 파일들입니다.

## 구조

```
tests/
├── __mocks__/      # 모의 객체
├── unit/           # 단위 테스트
├── integration/    # 통합 테스트
└── e2e/           # E2E 테스트
```

## 테스트 도구

- **단위 테스트**: Vitest
- **E2E 테스트**: Playwright
- **테스트 라이브러리**: @testing-library/react

## 실행 방법

```bash
# 모든 테스트 실행
npm test

# 단위 테스트만 실행
npm run test:unit

# E2E 테스트 실행
npm run test:e2e
```
