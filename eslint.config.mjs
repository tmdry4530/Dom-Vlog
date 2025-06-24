import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      // 생성된 파일들
      'lib/generated/**',
      'prisma/generated/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',

      // 설정 파일들
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',

      // 의존성
      'node_modules/**',

      // 환경 파일들
      '.env*',

      // 테스트 관련 (선택적)
      'tests/**/*.js',
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.spec.js',
      '**/*.spec.ts',
    ],
  },
  {
    rules: {
      // TypeScript 관련 규칙 완화
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];

export default eslintConfig;
