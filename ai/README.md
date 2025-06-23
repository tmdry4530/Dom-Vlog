# AI 모듈

Dom vlog의 AI 기능을 담당하는 모듈입니다.

## 구조

```
ai/
├── processors/         # AI 처리 엔진
├── models/            # AI 모델 설정
├── prompts/           # AI 프롬프트 템플릿
└── services/          # AI 서비스 클래스
```

## 주요 기능

- **문서 스타일 향상**: 코드 블록, 제목 구조 자동 정리
- **SEO 최적화**: 키워드 추출, 메타태그 생성
- **카테고리 분류**: 주제 모델링 기반 카테고리 추천

## 사용 예정 기술

- Gemini-2.5-flash-lite
- LangChain 파이프라인
- Vercel AI SDK
