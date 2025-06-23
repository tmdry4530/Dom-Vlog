// 공통 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 추후 확장 예정
// export * from './database'
// export * from './api'
// export * from './blog'
// export * from './user'
// export * from './ai'
