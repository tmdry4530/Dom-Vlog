/**
 * 카테고리 추천 기능 테스트 스크립트
 * 실제 Gemini API와 데이터베이스를 사용하여 기능을 검증합니다.
 */

import { categoryService } from '@/ai/services/CategoryService';
import { autoTagService } from '@/ai/services/AutoTagService';
import { prisma } from '@/lib/prisma';
import type { CategoryRecommendRequest } from '@/types/ai';

// 테스트 데이터 샘플
const testPosts = [
  {
    title: 'React Hooks 완벽 가이드',
    content: `
# React Hooks 완벽 가이드

React Hooks는 React 16.8에서 도입된 기능으로, 함수형 컴포넌트에서 상태 관리와 생명주기 기능을 사용할 수 있게 해줍니다.

## 주요 Hooks

### useState
\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect
\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## 커스텀 Hooks

커스텀 Hooks를 만들어 로직을 재사용할 수 있습니다.

\`\`\`javascript
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}
\`\`\`

React Hooks를 사용하면 클래스 컴포넌트 없이도 강력한 기능을 구현할 수 있습니다.
    `,
    contentType: 'markdown' as const,
  },
  {
    title: 'Next.js와 TypeScript로 시작하는 풀스택 개발',
    content: `
# Next.js와 TypeScript로 시작하는 풀스택 개발

Next.js는 React 기반의 풀스택 프레임워크로, 서버사이드 렌더링과 정적 사이트 생성을 지원합니다.

## 프로젝트 설정

\`\`\`bash
npx create-next-app@latest my-app --typescript --tailwind --eslint
cd my-app
npm run dev
\`\`\`

## API Routes

Next.js에서는 \`pages/api\` 또는 \`app/api\` 디렉토리에서 API를 구현할 수 있습니다.

\`\`\`typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];
  
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // 사용자 생성 로직
  const newUser = {
    id: Date.now(),
    name: body.name,
  };
  
  return NextResponse.json(newUser, { status: 201 });
}
\`\`\`

## 데이터베이스 연동

Prisma를 사용하여 PostgreSQL과 연동하는 예제입니다.

\`\`\`typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
\`\`\`

Next.js와 TypeScript의 조합으로 타입 안전한 풀스택 애플리케이션을 구축할 수 있습니다.
    `,
    contentType: 'markdown' as const,
  },
  {
    title: 'Docker와 Kubernetes로 애플리케이션 배포하기',
    content: `
# Docker와 Kubernetes로 애플리케이션 배포하기

컨테이너 기술을 활용하여 애플리케이션을 효율적으로 배포하고 관리하는 방법을 알아보겠습니다.

## Docker 기초

### Dockerfile 작성

\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN \\
  if [ -f package-lock.json ]; then npm ci --only=production; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

## Kubernetes 설정

### Deployment 매니페스트

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nextjs-app
  template:
    metadata:
      labels:
        app: nextjs-app
    spec:
      containers:
      - name: nextjs-app
        image: my-nextjs-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: nextjs-service
spec:
  selector:
    app: nextjs-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
\`\`\`

## CI/CD 파이프라인

GitHub Actions를 사용한 자동 배포 예제입니다.

\`\`\`yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker image
      run: |
        docker build -t my-nextjs-app:${{ github.sha }} .
        docker tag my-nextjs-app:${{ github.sha }} my-nextjs-app:latest
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/nextjs-app nextjs-app=my-nextjs-app:${{ github.sha }}
        kubectl rollout status deployment/nextjs-app
\`\`\`

Docker와 Kubernetes를 활용하면 확장 가능하고 안정적인 애플리케이션 배포가 가능합니다.
    `,
    contentType: 'markdown' as const,
  },
  {
    title: '블록체인과 스마트 컨트랙트 개발 입문',
    content: `
# 블록체인과 스마트 컨트랙트 개발 입문

Ethereum 블록체인에서 Solidity를 사용하여 스마트 컨트랙트를 개발하는 방법을 알아보겠습니다.

## Solidity 기초

### 간단한 스마트 컨트랙트

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(uint256 data);
    
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(x);
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}
\`\`\`

### ERC-20 토큰 구현

\`\`\`solidity
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
\`\`\`

## 개발 환경 설정

### Hardhat 설치 및 설정

\`\`\`bash
npm install --save-dev hardhat
npx hardhat init
\`\`\`

\`\`\`javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    goerli: {
      url: \`https://goerli.infura.io/v3/\${process.env.INFURA_API_KEY}\`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
\`\`\`

## 테스트 작성

\`\`\`javascript
const { expect } = require("chai");

describe("MyToken", function () {
  it("Should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();
    
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();
    
    const ownerBalance = await myToken.balanceOf(owner.address);
    expect(await myToken.totalSupply()).to.equal(ownerBalance);
  });
});
\`\`\`

## Web3.js로 프론트엔드 연동

\`\`\`javascript
import Web3 from 'web3';

const web3 = new Web3(window.ethereum);

async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      return accounts[0];
    } catch (error) {
      console.error('User denied account access');
    }
  }
}

async function callContract() {
  const contractAddress = '0x...';
  const contractABI = [...];
  
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const result = await contract.methods.get().call();
  
  console.log('Stored value:', result);
}
\`\`\`

스마트 컨트랙트 개발을 통해 탈중앙화 애플리케이션(DApp)을 구축할 수 있습니다.
    `,
    contentType: 'markdown' as const,
  },
];

async function testCategoryRecommendation() {
  console.log('🚀 카테고리 추천 기능 테스트 시작\n');

  try {
    // 1. 데이터베이스 연결 확인
    console.log('📊 데이터베이스 연결 확인...');
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
    });
    console.log(`✅ ${categories.length}개 카테고리 발견:`, categories.map(c => c.name).join(', '));

    // 2. CategoryService 헬스체크
    console.log('\n🔍 CategoryService 헬스체크...');
    const healthStatus = await categoryService.healthCheck();
    console.log('✅ 서비스 상태:', healthStatus);

    // 3. 각 테스트 포스트에 대해 카테고리 추천 테스트
    for (let i = 0; i < testPosts.length; i++) {
      const testPost = testPosts[i];
      console.log(`\n📝 테스트 ${i + 1}: "${testPost.title}"`);

      const request: CategoryRecommendRequest = {
        title: testPost.title,
        content: testPost.content,
        contentType: testPost.contentType,
        maxSuggestions: 3,
      };

      console.log('⏳ 카테고리 추천 요청 중...');
      const startTime = Date.now();
      
      const result = await categoryService.recommendCategories(request);
      
      const endTime = Date.now();
      console.log(`⚡ 처리 시간: ${endTime - startTime}ms`);

      if (result.success && result.data) {
        console.log('✅ 추천 성공!');
        console.log('📊 콘텐츠 분석:');
        console.log(`  - 주요 주제: ${result.data.contentAnalysis.primaryTopic}`);
        console.log(`  - 기술 수준: ${result.data.contentAnalysis.technicalLevel}`);
        console.log(`  - 콘텐츠 타입: ${result.data.contentAnalysis.contentType}`);
        console.log(`  - 핵심 키워드: ${result.data.contentAnalysis.keyTopics.join(', ')}`);
        
        console.log('\n🎯 추천 카테고리:');
        result.data.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec.categoryName} (신뢰도: ${(rec.confidence * 100).toFixed(1)}%)`);
          console.log(`     이유: ${rec.reasoning}`);
          console.log(`     키워드: ${rec.keyTopics.join(', ')}`);
        });
      } else {
        console.log('❌ 추천 실패:', result.error);
      }

      // 잠시 대기 (API 호출 제한 방지)
      if (i < testPosts.length - 1) {
        console.log('\n⏸️  다음 테스트까지 2초 대기...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🏁 테스트 완료');
  }
}

async function testAutoTagging() {
  console.log('\n🏷️  자동 태깅 기능 테스트 시작\n');

  try {
    // 1. 테스트용 포스트 생성 (실제 DB에 있는 포스트 사용)
    const posts = await prisma.post.findMany({
      take: 2,
      select: {
        id: true,
        title: true,
        content: true,
      },
    });

    if (posts.length === 0) {
      console.log('⚠️  테스트할 포스트가 없습니다. 먼저 포스트를 생성해주세요.');
      return;
    }

    for (const post of posts) {
      console.log(`\n📝 포스트 테스트: "${post.title}"`);

      // 2. 카테고리 추천 및 자동 적용 테스트
      console.log('⏳ 카테고리 추천 및 자동 적용 중...');
      
      const result = await autoTagService.recommendAndApplyTags(post.id, false);

      if (result.success) {
        console.log('✅ 추천 성공!');
        
        if (result.recommendations && result.recommendations.length > 0) {
          console.log('\n🎯 추천된 카테고리:');
          result.recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec.categoryName} (신뢰도: ${(rec.confidence * 100).toFixed(1)}%)`);
          });

          // 3. 수동으로 카테고리 적용 테스트
          const highConfidenceCategories = result.recommendations.filter(rec => rec.confidence >= 0.7);
          
          if (highConfidenceCategories.length > 0) {
            console.log('\n🏷️  신뢰도 높은 카테고리 자동 적용 중...');
            
            const applyResult = await autoTagService.applyAutoTags({
              postId: post.id,
              selectedCategories: highConfidenceCategories.map(rec => ({
                categoryId: rec.categoryId,
                confidence: rec.confidence,
              })),
              replaceExisting: false,
            });

            if (applyResult.success && applyResult.data) {
              console.log(`✅ ${applyResult.data.addedCategories}개 카테고리가 자동 적용되었습니다.`);
              
              // 4. 카테고리 통계 조회
              const statsResult = await autoTagService.getPostCategoryStats(post.id);
              if (statsResult.success && statsResult.data) {
                console.log('\n📊 카테고리 통계:');
                console.log(`  - 전체: ${statsResult.data.total}개`);
                console.log(`  - AI 추천: ${statsResult.data.aiSuggested}개`);
                console.log(`  - 수동 추가: ${statsResult.data.manual}개`);
                console.log(`  - 평균 신뢰도: ${(statsResult.data.averageConfidence * 100).toFixed(1)}%`);
              }
            } else {
              console.log('❌ 자동 적용 실패:', applyResult.error);
            }
          }
        } else {
          console.log('ℹ️  추천된 카테고리가 없습니다.');
        }
      } else {
        console.log('❌ 추천 실패:', result.error);
      }
    }

  } catch (error) {
    console.error('❌ 자동 태깅 테스트 중 오류 발생:', error);
  }
}

// 스크립트 실행
async function main() {
  console.log('🎯 Dom Vlog 카테고리 추천 시스템 테스트\n');
  console.log('=' .repeat(60));

  await testCategoryRecommendation();
  
  console.log('\n' + '=' .repeat(60));
  
  await testAutoTagging();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 모든 테스트가 완료되었습니다!');
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main().catch(console.error);
}

export { testCategoryRecommendation, testAutoTagging }; 