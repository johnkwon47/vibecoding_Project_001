# vibecoding_Project_001
# Tarot Reading Service (78-Card Deck)

사용자가 입력한 고민/질문을 바탕으로 **78장 타로 덱(메이저 22 + 마이너 56)**에서 카드를 뽑고, 스프레드에 따라 **리추얼(집중 → 셔플 → 드로우 → 배열 → 리딩)** 흐름으로 결과를 제공하는 웹 서비스입니다.

> ⚠️ 본 서비스는 **오락/자기성찰 목적**이며, 중요한 결정(의료/법률/투자 등)은 전문가 상담을 권장합니다.

## Features

- **자유 질문 입력**: 타로로 상담받고 싶은 내용을 텍스트로 입력
- **78장 풀 덱 사용**: 메이저 22장 + 마이너 56장 기반
- **스프레드 지원**
  - **3카드 스프레드**: 과거 / 현재 / 미래
  - **켈틱 크로스(10장)**: 현재, 장애, 근본, 과거, 목표, 가까운 미래, 나, 외부, 희망/두려움, 결과
  - **추천 스프레드**(옵션): 질문 성격에 따라 3카드/켈틱 자동 선택
- **랜덤 드로우(중복 없음)**: Fisher–Yates 셔플 + 카드별 정/역(50/50)
- **세션 재현성**: 같은 세션에서는 새로고침해도 동일 결과 유지(localStorage 기반)
- **구조화된 리딩 출력**
  - 이미지 리딩(분위기/상징/색)
  - 키워드 리딩(전통 의미)
  - 통합 스토리 + 행동 제안/주의 포인트/자문 질문
- **안전 기능**: 위기 키워드 감지 시 리딩 대신 도움 안내 메시지 제공(한국 기준 112/119/1393)

## Data

- 덱 데이터: `tarot_deck_78_ko.json`
  - 카드별 키워드/의미/상징(visual_motifs, color_symbols)을 포함하며 리딩 생성에 활용됩니다.

## Deployment (Vercel)

### 1. GitHub 연동
- Vercel 대시보드에서 "Import Project" 선택
- GitHub 저장소 선택: `johnkwon47/vibecoding_Project_001`

### 2. 프로젝트 설정
- **Framework Preset**: Next.js (자동 감지)
- **Root Directory**: 자동 감지됨 (`vercel.json`에서 `tarot-app` 디렉토리 지정)
- **Build Command**: `cd tarot-app && npm install && npm run build` (자동 적용)
- **Output Directory**: `tarot-app/.next` (자동 적용)

### 3. 환경 변수 설정 (필수)
Vercel 대시보드 > Settings > Environment Variables에서 아래 5개 변수를 추가하세요:

```
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_OPENAI_MODEL_NAME=gpt-5-nano
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-nano-04
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

> ⚠️ 환경 변수 추가 후 "Redeploy" 버튼을 눌러 재배포하세요.

### 4. 배포 완료
배포가 완료되면 Vercel이 제공하는 URL(예: `your-project.vercel.app`)에서 서비스를 이용할 수 있습니다.

## Local Development

### 환경 변수 설정
1. `tarot-app/.env.example`을 복사하여 `tarot-app/.env.local` 생성
2. Azure OpenAI 설정값을 입력

### 개발 서버 실행
```bash
cd tarot-app
npm install
npm run dev
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

## Roadmap (Optional)

- 카드 펼치기(팬 UI)에서 직접 선택하는 드로우 UX
- 히스토리/저장/공유 기능 강화
- LLM 기반 “심화 리딩” 모드(옵션 플러그인)
- 카드 의미 사전/학습 모드