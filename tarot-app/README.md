# 🌙 타로 상담 웹서비스

78장 타로 덱 기반의 자기성찰 타로 상담 앱입니다.  
Next.js 15 App Router + TypeScript + TailwindCSS로 구현되었습니다.

> ⚠️ **면책 고지**: 본 서비스는 오락 및 자기성찰 목적으로만 제공됩니다.  
> 중요한 결정은 반드시 관련 분야 전문가와 상의하세요.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 3카드 스프레드 | 과거·현재·미래 흐름 탐색 |
| 켈틱 크로스 스프레드 | 10장으로 상황 전체를 심층 분석 |
| 자동 추천 | 질문 텍스트 분석 → 최적 스프레드 자동 선택 |
| Fisher-Yates 셔플 | 암호학적으로 편향 없는 랜덤 드로우 |
| 정/역방향 | 카드마다 50/50 확률로 방향 결정 |
| 세션 재현성 | 같은 sessionId로 새로고침 시 동일 결과 유지 (localStorage) |
| 템플릿 리딩 | 포지션·카드 메타 조합으로 Markdown 리딩 생성 |
| LLM 연동 | `.env.local` 설정 시 AI 리딩 자동 전환 (선택) |
| 위기 감지 | 위기 키워드 감지 → 안전 안내 화면 전환 (1393 등) |
| 상담 기록 | localStorage 기반 최근 50개 세션 히스토리 |

---

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
cd tarot-app
npm install
```

### 2. (선택) AI 리딩 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 Azure OpenAI 또는 OpenAI 호환 값을 입력하세요 (없으면 템플릿 리딩으로 자동 동작):

```env
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-12-01-preview

# 또는 OpenAI 호환 API
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 4. 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## 🗂 폴더 구조

```
tarot-app/
├── app/
│   ├── layout.tsx               # 루트 레이아웃 + 면책 문구
│   ├── globals.css              # 전역 스타일
│   ├── page.tsx                 # / 홈 (질문 입력 + 스프레드 선택)
│   ├── shuffle/
│   │   └── page.tsx             # /shuffle 셔플 애니메이션
│   ├── reading/
│   │   └── [sessionId]/
│   │       └── page.tsx         # /reading/:sessionId 결과 + 리딩
│   ├── history/
│   │   └── page.tsx             # /history 상담 기록
│   └── api/
│       ├── draw/route.ts        # POST /api/draw
│       └── read/route.ts        # POST /api/read
│
├── components/
│   ├── Disclaimer.tsx           # 항상 표시되는 면책 푸터
│   ├── CrisisBanner.tsx         # 위기 감지 → 안전 안내 화면
│   ├── CardTile.tsx             # 개별 카드 UI (정/역 표시)
│   ├── CardModal.tsx            # 카드 상세 모달
│   ├── ThreeCardSpread.tsx      # 3카드 스프레드 레이아웃
│   ├── CelticCrossSpread.tsx    # 켈틱 크로스 레이아웃
│   ├── ReadingViewer.tsx        # Markdown 리딩 렌더러
│   └── ShuffleAnimation.tsx     # 셔플 애니메이션
│
├── lib/
│   ├── tarotDeck.ts             # 덱 로딩 (JSON import)
│   ├── spreadConfig.ts          # 스프레드 포지션 정의 + 자동추천
│   ├── draw.ts                  # Fisher-Yates 셔플 + 드로우 로직
│   ├── session.ts               # localStorage 세션 저장/로드
│   ├── crisisDetector.ts        # 위기 키워드 감지
│   ├── reading.ts               # 템플릿 리딩 생성 + LLM 폴백
│   └── llm.ts                   # OpenAI 호환 LLM 인터페이스 (선택)
│
├── types/
│   └── tarot.ts                 # TypeScript 타입 정의 전체
│
├── src/data/
│   └── tarot_deck_78_ko.json    # 78장 타로 덱 데이터
│
├── .env.local.example           # 환경변수 예시
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🎴 스프레드 포지션

### 3카드 스프레드
| 위치 | 포지션 |
|------|--------|
| 왼쪽 | 과거 (영향을 준 에너지) |
| 중앙 | 현재 (지금 이 순간) |
| 오른쪽 | 미래 (흐름이 이어질 방향) |

### 켈틱 크로스 (10장)
| # | 포지션 | 설명 |
|---|--------|------|
| 1 | 현재(상황) | 핵심 에너지 |
| 2 | 도전(장애) | 가로막는 힘 |
| 3 | 근본(기저) | 무의식의 뿌리 |
| 4 | 과거(영향) | 지나간 에너지 |
| 5 | 의식(목표/가능성) | 추구하는 방향 |
| 6 | 가까운 미래 | 가까운 전개 |
| 7 | 나(태도) | 내면의 자세 |
| 8 | 외부(환경) | 주변·사회적 영향 |
| 9 | 희망/두려움 | 바라거나 두려운 것 |
| 10 | 결과(전개) | 최종 결과 |

---

## 🔮 리딩 구조

생성된 Markdown 리딩은 다음 섹션을 포함합니다:

1. **질문 요약** — 1~2문장
2. **핵심 키워드** — 3~6개
3. **스프레드 설명** — 선택된 스프레드와 포지션 의미
4. **포지션별 리딩** — 이미지 리딩 / 키워드 리딩 / 통합
5. **전체 스토리 통합** — 1~2문단
6. **행동 제안** — 1~3개
7. **주의할 함정** — 1~2개
8. **저널링 질문** — 2개

---

## 🛡 안전 기능

- **위기 키워드 감지**: "죽고싶다", "자살", "자해" 등 감지 → 리딩 차단 + 안전 안내
  - 📞 자살예방상담전화 **1393** (24시간)
  - 📞 정신건강위기상담전화 **1577-0199**
  - 📞 응급 **119 / 112**
- **면책 문구**: 모든 화면 하단에 고정 표시
- **확정 표현 금지**: "가능성", "경향", "~할 수 있습니다" 톤 유지

---

## 🧩 LLM 연동 (선택)

`lib/llm.ts`에 Azure OpenAI와 OpenAI 호환 인터페이스가 분리되어 있습니다.

- Azure OpenAI 환경변수 설정 시 우선 활성화
- Azure 실패 시 다른 Azure 경로를 순차 재시도
- 표준 OpenAI 호환 환경변수 설정 시 대체 활성화
- 실패 시 템플릿 리딩으로 자동 폴백
- 다른 제공자(Anthropic, Mistral 등)는 `lib/llm.ts`만 수정

```env
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-12-01-preview

# 또는 OpenAI 호환 API
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1  # Ollama: http://localhost:11434/v1
LLM_MODEL=gpt-4o-mini
```

---

## 🔧 기술 스택

- **Next.js 15** — App Router + Server Components
- **TypeScript** — 전체 타입 안전성
- **TailwindCSS 3** — 유틸리티 CSS
- **react-markdown** — Markdown 렌더링
- **uuid** — 세션 ID 생성
- **localStorage** — 세션 재현성 및 히스토리

---

## 📋 체크리스트

- [x] 78장 타로 덱 JSON 로딩
- [x] 3카드 / 켈틱 크로스 스프레드
- [x] Fisher-Yates 셔플 (중복 없음)
- [x] 정/역 50/50 랜덤
- [x] 세션 재현성 (localStorage)
- [x] 리딩 Markdown 생성 (8개 섹션)
- [x] LLM 인터페이스 분리 + 폴백
- [x] 위기 키워드 감지 + 안전 화면
- [x] 면책 문구 (모든 화면)
- [x] 셔플 애니메이션
- [x] 카드 상세 모달
- [x] 상담 히스토리 (/history)
- [x] API 라우트 (draw, read)
- [x] 환경변수 가이드

---

*본 서비스는 오락 및 자기성찰 목적으로만 제공됩니다.*
