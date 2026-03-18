/**
 * LLM 리딩 생성 모듈
 *
 * Azure OpenAI 환경변수 (우선순위 높음):
 *   AZURE_OPENAI_API_KEY          - Azure API 키
 *   AZURE_OPENAI_ENDPOINT         - Azure 엔드포인트 URL
 *   AZURE_OPENAI_DEPLOYMENT_NAME  - 배포(모델) 이름
 *   AZURE_OPENAI_API_VERSION      - API 버전 (예: 2024-12-01-preview)
 *
 * 표준 OpenAI 호환 환경변수 (폴백):
 *   LLM_API_KEY    - API 키
 *   LLM_BASE_URL   - 베이스 URL (기본: https://api.openai.com/v1)
 *   LLM_MODEL      - 모델 ID (기본: gpt-4o-mini)
 */

import type { ReadingInput } from "@/types/tarot";
import { getSpreadName } from "@/lib/spreadConfig";
import { analyzeQuestion, formatAnalysis, type QuestionAnalysis } from "@/lib/questionAnalysis";

function buildSystemPrompt(analysis: QuestionAnalysis): string {
  // 질문 유형별 맞춤 지침
  const typeGuidance = getTypeSpecificGuidance(analysis.type);
  
  // 영역별 맞춤 지침
  const domainGuidance = getDomainSpecificGuidance(analysis.domain);
  
  return `당신은 전문 타로 리더입니다. 한국어로 응답하며, 확정적 예언 대신 가능성과 경향을 제안합니다.

**핵심 원칙:**
1. **질문 중심 해석**: 카드의 의미를 질문자의 구체적 상황과 의도에 정확히 연결합니다.
2. **맥락 기반 통찰**: 단순히 카드 의미를 나열하지 않고, "이 질문의 맥락에서 이 카드가 의미하는 것"을 설명합니다.
3. **포지션 역할 강조**: 각 포지션의 역할(과거/현재/미래, 장애/목표 등)을 질문과 직접 연결하여 해석합니다.
4. **실천 가능성**: 질문자가 실제로 적용할 수 있는 구체적이고 실천 가능한 통찰을 제공합니다.
5. **감정 공감**: 질문자의 감정 상태를 고려하여 따뜻하고 지지적인 톤을 유지합니다.

**이 질문의 특성:**
${typeGuidance}
${domainGuidance}

**해석 접근법:**
- 카드를 읽을 때마다 "이것이 질문자의 [${analysis.coreIntent}]와 어떻게 연결되는가?"를 자문하세요.
- 추상적 개념보다 질문자가 "오늘, 지금, 여기서" 적용할 수 있는 구체적 행동이나 관점을 제시하세요.
- 카드 간 연결성을 강조하여 하나의 이야기로 풀어내세요.
- 질문자의 내면 목소리를 대변하듯, 그들이 이미 알고 있지만 확인받고 싶어하는 것을 명료하게 표현하세요.

리딩은 오락·자기성찰 목적임을 인식하고, 항상 따뜻하고 지지적인 톤을 유지합니다.
요청된 Markdown 구조를 정확히 따릅니다.
각 섹션은 반드시 지정된 제목을 그대로 사용하고, 가독성을 위해 핵심 문장을 볼드(**)로 강조합니다.`;
}

function getTypeSpecificGuidance(type: string): string {
  const guidance: Record<string, string> = {
    "yes-no": `
- 질문자는 가능성에 대한 명확한 신호를 원합니다. 
- "될까/안될까"보다 "이루어지려면 무엇이 필요한가"에 초점을 맞추세요.
- 카드가 긍정이든 부정이든, 질문자가 영향을 줄 수 있는 요소를 제시하세요.`,
    "choice": `
- 질문자는 두 선택지 사이에서 고민하고 있습니다.
- 각 선택지의 잠재적 결과보다, 각 선택이 질문자의 내면 가치관과 어떻게 공명하는지 탐색하세요.
- "어느 것이 더 나은가"보다 "어느 것이 진정한 당신과 더 가까운가"를 질문하세요.`,
    "timing": `
- 질문자는 적절한 시기를 알고 싶어합니다.
- 구체적인 날짜보다, "어떤 조건이 갖춰지면 때가 무르익는가"를 제시하세요.
- 기다림과 행동의 균형을 안내하세요.`,
    "how": `
- 질문자는 구체적인 방법을 찾고 있습니다.
- 카드가 제시하는 에너지를 실천 가능한 단계로 번역하세요.
- "무엇을 해야 하는가"와 "어떤 태도로 접근해야 하는가"를 모두 제시하세요.`,
    "why": `
- 질문자는 상황의 근본 원인을 이해하고 싶어합니다.
- 카드를 통해 숨겨진 패턴이나 무의식적 동기를 조명하세요.
- 비난이나 자책이 아닌, 이해와 수용의 관점을 제공하세요.`,
    "what-if": `
- 질문자는 가능한 시나리오를 탐색하고 있습니다.
- 가정된 상황의 잠재적 흐름을 보여주되, 선택권은 항상 질문자에게 있음을 강조하세요.`,
    "advice": `
- 질문자는 명확한 조언을 원합니다.
- 구체적이고 실천 가능한 가이드를 제공하세요.
- "해야 한다"보다 "해볼 수 있다"의 톤으로 제안하세요.`,
    "general": `
- 질문자는 전반적인 흐름과 방향을 탐색하고 있습니다.
- 넓은 시야에서 현재 위치를 조망하고, 가능한 길들을 제시하세요.`,
  };
  return guidance[type] || guidance["general"];
}

function getDomainSpecificGuidance(domain: string): string {
  const guidance: Record<string, string> = {
    "love": `
- 연애/관계 질문: 상대방의 마음보다 질문자 자신의 진정한 욕구와 경계에 초점을 맞추세요.
- 관계의 건강성과 상호성을 함께 고려하세요.`,
    "career": `
- 직업/커리어 질문: 외부 성공보다 내면 만족도와 성장 가능성을 균형있게 다루세요.
- 현실적인 단계와 장기 비전을 함께 제시하세요.`,
    "money": `
- 재정 질문: 구체적인 투자 조언은 피하고, 돈에 대한 태도와 가치관을 탐색하세요.
- 물질적 안정과 정신적 평화의 균형을 강조하세요.`,
    "health": `
- 건강 질문: 의학적 조언은 절대 하지 마세요. 심신의 균형과 자기 돌봄에 초점을 맞추세요.`,
    "self-growth": `
- 자기계발 질문: 성장을 목표가 아닌 과정으로 접근하세요.
- 작은 변화의 누적 효과를 강조하세요.`,
    "decision": `
- 의사결정 질문: 옳고 그름보다, 질문자의 가치관과의 정렬을 탐색하세요.
- 결정 이후의 실천이 결정 자체보다 중요함을 상기시키세요.`,
    "relationship": `
- 인간관계 질문: 상대방을 바꾸려는 시도보다, 질문자가 관계에서 선택할 수 있는 것에 초점을 맞추세요.`,
    "general": `
- 일반 질문: 삶의 전반적 흐름과 균형을 고려하세요.`,
  };
  return guidance[domain] || guidance["general"];
}

function buildUserPrompt(input: ReadingInput, analysis: QuestionAnalysis): string {
  const spreadName = getSpreadName(input.spreadType);
  const cardSummaries = input.cards
    .map(
      (c) =>
        `[${c.positionNameKo}] ${c.displayName}\n` +
        `  키워드: ${c.keywords.join(", ")}\n` +
        `  의미: ${c.meaning}\n` +
        `  모티프: ${c.card.visual_motifs.join(", ")}\n` +
        `  색상: ${c.card.color_symbols.join(", ")}`
    )
    .join("\n\n");

  const contextualHints = buildContextualHints(analysis, input.cards);

  return `질문: "${input.question}"
스프레드: ${spreadName}

**질문 분석:**
${formatAnalysis(analysis)}

드로우된 카드:
${cardSummaries}

${contextualHints}

위 정보를 바탕으로 다음 7개 섹션을 포함한 Markdown 리딩을 작성하세요.
아래 제목 텍스트를 한 글자도 바꾸지 말고 그대로 사용하세요:

## 1) 🔮 질문 요약
## 2) ✨ 핵심 키워드
## 3) 📖 포지션별 리딩 (질문 맥락에 맞는 키워드 선택)
## 4) 🌊 전체 해석
## 5) 🚀 행동 제안
## 6) ⚠️ 주의할 점
## 7) 📝 저널링 질문

**각 섹션 작성 지침:**

### 1) 질문 요약
- 질문자의 질문을 재해석하여, 표면적 질문 뒤에 있는 진짜 고민이 무엇인지 짚어주세요.
- "${analysis.coreIntent}"를 중심으로 질문의 본질을 1-2문장으로 정리하세요.

### 2) 핵심 키워드
- 카드들에서 추출한 핵심 키워드 5-7개를 백틱으로 감싸서 나열하세요.
- 질문의 핵심 영역(${analysis.domain})과 가장 관련 깊은 키워드를 우선 선택하세요.

### 3) 포지션별 리딩
- 각 포지션마다 \`### {번호}. {포지션명} — {카드명}\` 형식 사용
- 각 포지션에서 다음 3개 소제목을 반드시 포함:
  
  **🎨 이미지 리딩**
  - 카드의 시각적 상징(모티프, 색상)이 "이 특정 질문"에서 무엇을 암시하는지 해석
  - 예: "칼을 든 여인이 외로이 앉아 있는 모습은, 당신의 [질문의 특정 상황]에서..."
  
  **🗝 키워드 리딩**
  - 카드의 전통적 의미를 질문자의 상황에 구체적으로 적용
  - 일반론을 피하고 "당신의 [상황]에서 이 카드의 [키워드]는..."으로 시작
  - 질문 영역(${analysis.domain})의 맥락에서 키워드를 재해석
  
  **💡 통합**
  - 이 포지션의 역할(예: "과거", "장애", "결과")과 질문을 직접 연결
  - 질문자가 "오늘 이 카드를 보고 내일 무엇을 다르게 할 수 있는가"를 제시
  - ${analysis.type === "yes-no" ? "가능성을 높이거나 낮추는 요인 제시" : ""}${analysis.type === "how" ? "구체적인 실천 방법 제안" : ""}${analysis.type === "choice" ? "이 포지션이 각 선택지에 주는 시사점" : ""}

### 4) 전체 해석
**형식:**
- 첫 줄: \`> **요약:** <전체 흐름을 한 문장으로 핵심만 압축한 요약>\` 
  (이 요약은 UI의 한줄 조언 패널에 단독으로 표시되므로, 그 자체로 완결된 메시지여야 합니다)
- 이후 2-3개 문단으로 깊이 있는 통합 해석:

**내용:**
1. **질문과 카드의 대화**: 질문자의 핵심 고민(${analysis.coreIntent})과 카드들이 제시하는 통찰이 어떻게 맞물리는지
2. **에너지 흐름 분석**: 카드 간 연결성 - 시작→중간→결과의 흐름이 질문자의 현재 상황에서 어떻게 작동하는지
3. **정·역방향 패턴**: 정방향 ${input.cards.filter(c => c.upright).length}장 / 역방향 ${input.cards.filter(c => !c.upright).length}장이 질문자에게 주는 구체적 메시지
4. **실천 방향**: "그래서 나는 구체적으로 무엇을 해야 하는가?"에 대한 명확한 답변

**주의사항:**
- 카드 의미를 단순 나열하지 말고, 질문자의 삶 속에서 이 카드들이 어떤 이야기를 만드는지 서사로 풀어내세요
- 추상적 표현보다 구체적 상황과 행동을 언급하세요
- 질문자의 감정 상태(${analysis.emotionalTone})를 고려한 공감적 톤을 유지하세요

### 5) 행동 제안
- 불릿 2-3개
- "~해보세요" 형식의 구체적이고 실천 가능한 행동
- 질문 영역(${analysis.domain})에서 실제로 적용 가능한 것만 제안
- 오늘/이번 주 당장 시작할 수 있는 작은 행동 포함

### 6) 주의할 점
- 불릿 1-2개
- 질문 맥락에서 조심해야 할 함정이나 흔한 오해
- 타로에 의존하지 말고 현실적 판단도 함께하라는 균형 잡힌 조언

### 7) 저널링 질문
- 번호 목록 2개
- 질문자가 스스로 답을 찾도록 돕는 열린 질문
- "${input.question}"와 직접 연관된 자기 성찰 질문

**전체 작성 원칙:**
- 확정적 표현을 피하고 "~할 수 있습니다", "~의 가능성", "~의 경향"을 사용하세요
- 각 섹션 첫 문장에서 핵심 표현 1개 이상을 **볼드** 처리하세요
- 질문자가 "이 리딩이 나를 위해 맞춤 제작되었다"고 느낄 수 있도록, 질문의 구체적 단어와 맥락을 리딩 전체에 녹여 넣으세요`;
}

/**
 * 질문 분석 결과를 바탕으로 맥락적 힌트 생성
 */
function buildContextualHints(analysis: QuestionAnalysis, cards: any[]): string {
  const hints: string[] = [];
  
  // 시간 지향에 따른 힌트
  if (analysis.timeOrientation === "future") {
    hints.push("⏰ 질문자는 미래 지향적입니다. 가능성과 준비 방법을 강조하세요.");
  } else if (analysis.timeOrientation === "past") {
    hints.push("⏰ 질문자는 과거를 돌아보고 있습니다. 교훈과 치유를 강조하세요.");
  }
  
  // 감정 톤에 따른 힌트
  if (analysis.emotionalTone === "anxious") {
    hints.push("💭 질문자는 불안해하고 있습니다. 안정감과 구체적 통제 가능한 요소를 제시하세요.");
  } else if (analysis.emotionalTone === "frustrated") {
    hints.push("💭 질문자는 답답함을 느끼고 있습니다. 새로운 관점과 돌파구를 제시하세요.");
  } else if (analysis.emotionalTone === "confused") {
    hints.push("💭 질문자는 혼란스러워합니다. 명확성과 우선순위를 제시하세요.");
  }
  
  // 구체성에 따른 힌트
  if (analysis.specificityLevel <= 2) {
    hints.push("📍 질문이 포괄적입니다. 카드를 통해 구체적인 초점을 제안하세요.");
  } else if (analysis.specificityLevel >= 4) {
    hints.push("📍 질문이 구체적입니다. 그 구체성을 살려 세밀한 통찰을 제공하세요.");
  }
  
  // 정역방향 비율
  const uprightCount = cards.filter(c => c.upright).length;
  const reversedCount = cards.length - uprightCount;
  if (reversedCount > uprightCount) {
    hints.push("🔄 역방향이 많습니다. 내면의 저항이나 조정이 필요한 영역을 탐색하세요.");
  } else if (uprightCount > reversedCount) {
    hints.push("✨ 정방향이 우세합니다. 긍정적 흐름을 활용하는 방법을 강조하세요.");
  }
  
  return hints.length > 0 ? `**해석 맥락 힌트:**\n${hints.join("\n")}\n` : "";
}

// ─── 내부 헬퍼 ──────────────────────────────────────────────────────────────

async function postJSON(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  label: string
): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${label} 오류 ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${label}이 빈 응답을 반환했습니다.`);
  return content;
}

function getAzureVars() {
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "";
  const explicitModelName = process.env.AZURE_OPENAI_MODEL_NAME ?? "";
  const inferredModelName = deployment.replace(/-\d+$/, "");
  return {
    apiKey: process.env.AZURE_OPENAI_API_KEY ?? "",
    endpoint: (process.env.AZURE_OPENAI_ENDPOINT ?? "").replace(/\/$/, ""),
    modelName: explicitModelName || inferredModelName,
    deployment,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-12-01-preview",
  };
}

function buildChatBody(model: string, input: ReadingInput, analysis: QuestionAnalysis, includeModel: boolean) {
  const base = {
    messages: [
      { role: "system" as const, content: buildSystemPrompt(analysis) },
      { role: "user" as const, content: buildUserPrompt(input, analysis) },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  };
  return includeModel ? { model, ...base } : base;
}

// ─── Azure: 경로 1 — /openai/deployments/{id}/chat/completions ─────────────

async function callAzureOpenAI(input: ReadingInput, analysis: QuestionAnalysis): Promise<string> {
  const { apiKey, endpoint, deployment, apiVersion } = getAzureVars();
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  return postJSON(url, { "api-key": apiKey }, buildChatBody(deployment, input, analysis, false), "Azure OpenAI");
}

// ─── Azure: 경로 2 — /models/{id}/chat/completions (AI Inference) ──────────

async function callAzureAIInference(input: ReadingInput, analysis: QuestionAnalysis): Promise<string> {
  const { apiKey, endpoint, modelName, deployment, apiVersion } = getAzureVars();
  const model = modelName || deployment;
  const url = `${endpoint}/models/${encodeURIComponent(model)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  return postJSON(url, { Authorization: `Bearer ${apiKey}` }, buildChatBody(model, input, analysis, true), "Azure AI Inference");
}

// ─── Azure: 경로 3 — /openai/v1/chat/completions (Responses API) ───────────

async function callAzureOpenAIV1(input: ReadingInput, analysis: QuestionAnalysis): Promise<string> {
  const { apiKey, endpoint, modelName, deployment } = getAzureVars();
  const model = modelName || deployment;
  const url = `${endpoint}/openai/v1/chat/completions`;
  const body = {
    model,
    messages: [
      { role: "system" as const, content: buildSystemPrompt(analysis) },
      { role: "user" as const, content: buildUserPrompt(input, analysis) },
    ],
    max_completion_tokens: 6000,
  };
  return postJSON(url, { "api-key": apiKey, Authorization: `Bearer ${apiKey}` }, body, "Azure v1");
}

// ─── 표준 OpenAI 호환 ───────────────────────────────────────────────────────

async function callOpenAICompatible(input: ReadingInput, analysis: QuestionAnalysis): Promise<string> {
  const apiKey = process.env.LLM_API_KEY ?? "";
  const baseUrl = (process.env.LLM_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
  const url = `${baseUrl}/chat/completions`;
  return postJSON(url, { Authorization: `Bearer ${apiKey}` }, buildChatBody(model, input, analysis, true), "LLM");
}

// ─── 공개 함수 ──────────────────────────────────────────────────────────────

/**
 * Azure OpenAI 3가지 경로 → 표준 OpenAI 순서로 시도합니다.
 * 1) /openai/deployments/{id}/chat/completions  (Azure OpenAI Service)
 * 2) /models/{id}/chat/completions              (Azure AI Inference)
 * 3) /openai/v1/chat/completions                (Azure Responses API)
 */
export async function generateLLMReading(input: ReadingInput): Promise<string> {
  // 질문 분석 수행
  const analysis = analyzeQuestion(input.question);
  console.log("[질문 분석 결과]", formatAnalysis(analysis));
  
  const { apiKey: azureKey, endpoint: azureEndpoint, deployment: azureDeployment } = getAzureVars();

  if (azureKey && azureEndpoint && azureDeployment) {
    try {
      return await callAzureOpenAI(input, analysis);
    } catch (e1) {
      console.warn("Azure OpenAI 경로 실패:", (e1 as Error).message.slice(0, 80));
    }
    try {
      return await callAzureAIInference(input, analysis);
    } catch (e2) {
      console.warn("Azure AI Inference 경로 실패:", (e2 as Error).message.slice(0, 80));
    }
    try {
      return await callAzureOpenAIV1(input, analysis);
    } catch (e3) {
      console.warn("Azure v1 경로 실패:", (e3 as Error).message.slice(0, 80));
    }
  }

  const llmKey = process.env.LLM_API_KEY;
  if (llmKey) {
    return callOpenAICompatible(input, analysis);
  }

  throw new Error("LLM 환경변수가 설정되지 않았습니다.");
}
