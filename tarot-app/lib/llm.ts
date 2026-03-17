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

function buildSystemPrompt(): string {
  return `당신은 전문 타로 리더입니다. 한국어로 응답하며, 확정적 예언 대신 가능성과 경향을 제안합니다.

**핵심 원칙:**
1. 카드의 키워드와 의미를 질문자의 구체적 상황에 맞춰 해석합니다.
2. 단순히 카드 의미를 나열하지 않고, "이 질문의 맥락에서 이 카드가 의미하는 것"을 설명합니다.
3. 각 포지션의 역할(과거/현재/미래, 장애/목표 등)을 질문과 연결하여 해석합니다.
4. 질문자가 실제로 적용할 수 있는 구체적이고 실천 가능한 통찰을 제공합니다.

리딩은 오락·자기성찰 목적임을 인식하고, 항상 따뜻하고 지지적인 톤을 유지합니다.
요청된 Markdown 구조를 정확히 따릅니다.
각 섹션은 반드시 지정된 제목을 그대로 사용하고, 가독성을 위해 핵심 문장을 볼드(**)로 강조합니다.`;
}

function buildUserPrompt(input: ReadingInput): string {
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

  return `질문: "${input.question}"
스프레드: ${spreadName}

드로우된 카드:
${cardSummaries}

위 정보를 바탕으로 다음 7개 섹션을 포함한 Markdown 리딩을 작성하세요.
아래 제목 텍스트를 한 글자도 바꾸지 말고 그대로 사용하세요:

## 1) 🔮 질문 요약
## 2) ✨ 핵심 키워드
## 3) 📖 포지션별 리딩 (질문 맥락에 맞는 키워드 선택)
- "포지션별 리딩"은 각 포지션마다 \`### {번호}. {포지션명} — {카드명}\` 형식 사용
- 각 포지션에서 **이미지 리딩**, **키워드 리딩**, **통합** 소제목을 포함
  - **이미지 리딩**: 카드의 시각적 상징(모티프, 색상)이 이 질문에서 무엇을 암시하는지 해석
  - **키워드 리딩**: 카드의 전통적 의미를 질문자의 상황에 구체적으로 적용하여 설명
  - **통합**: 이 포지션의 역할(예: "과거", "장애", "결과")과 질문을 연결하여 실천적 통찰 제공
- "전체 해석"은 반드시 다음 형식으로 작성:
  - 첫 줄: \`> **요약:** <전체 흐름을 한 문장으로 핵심만 압축한 요약>\` (이 줄만 한줄 조언 패널에 표시됨)
  - 이후 2~3개 문단: 
    * 질문의 핵심 고민과 카드들이 제시하는 통찰의 연결점
    * 카드 간 에너지 흐름이 질문자의 현재 상황에서 어떻게 작동하는지
    * 정·역방향 패턴이 질문자에게 주는 구체적 메시지
    * 질문자가 지금 당장 적용할 수 있는 실천 방향
- "행동 제안"은 불릿 1~3개 (질문 상황에 맞는 구체적이고 실천 가능한 행동)
- "주의할 점"은 불릿 1~2개 (질문 맥락에서 조심해야 할 함정이나 오해)
- "저널링 질문"은 번호 목록 2개 (질문자가 스스로 답을 찾도록 돕는 열린 질문)
- 각 섹션 시작에 1문장 요약을 넣고, 그 문장에서 핵심 표현 1개 이상을 **볼드** 처리

**중요:** 카드의 일반적 의미를 나열하지 말고, "이 질문에서 이 카드는 무엇을 말하는가"에 초점을 맞추세요.- "전체 해석"은 반드시 다음 형식으로 작성:
  - 첫 줄: \`> **요약:** <전체 흐름을 한 문장으로 핵심만 압축한 요약>\` (이 줄만 한줄 조언 패널에 표시됨)
  - 이후 2~3개 문단: 카드 간 에너지 흐름 분석, 정·역방향 패턴 해석, 질문과의 구체적 연결, 실천 방향을 깊이 있게 서술
- "행동 제안"은 불릿 1~3개
- "주의할 점"은 불릿 1~2개
- "저널링 질문"은 번호 목록 2개
- 각 섹션 시작에 1문장 요약을 넣고, 그 문장에서 핵심 표현 1개 이상을 **볼드** 처리

확정적 표현은 피하고 "가능성", "경향", "~할 수 있습니다" 등을 사용하세요.`;
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

function buildChatBody(model: string, input: ReadingInput, includeModel: boolean) {
  const base = {
    messages: [
      { role: "system" as const, content: buildSystemPrompt() },
      { role: "user" as const, content: buildUserPrompt(input) },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  };
  return includeModel ? { model, ...base } : base;
}

// ─── Azure: 경로 1 — /openai/deployments/{id}/chat/completions ─────────────

async function callAzureOpenAI(input: ReadingInput): Promise<string> {
  const { apiKey, endpoint, deployment, apiVersion } = getAzureVars();
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  return postJSON(url, { "api-key": apiKey }, buildChatBody(deployment, input, false), "Azure OpenAI");
}

// ─── Azure: 경로 2 — /models/{id}/chat/completions (AI Inference) ──────────

async function callAzureAIInference(input: ReadingInput): Promise<string> {
  const { apiKey, endpoint, modelName, deployment, apiVersion } = getAzureVars();
  const model = modelName || deployment;
  const url = `${endpoint}/models/${encodeURIComponent(model)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  return postJSON(url, { Authorization: `Bearer ${apiKey}` }, buildChatBody(model, input, true), "Azure AI Inference");
}

// ─── Azure: 경로 3 — /openai/v1/chat/completions (Responses API) ───────────

async function callAzureOpenAIV1(input: ReadingInput): Promise<string> {
  const { apiKey, endpoint, modelName, deployment } = getAzureVars();
  const model = modelName || deployment;
  const url = `${endpoint}/openai/v1/chat/completions`;
  const body = {
    model,
    messages: [
      { role: "system" as const, content: buildSystemPrompt() },
      { role: "user" as const, content: buildUserPrompt(input) },
    ],
    max_completion_tokens: 6000,
  };
  return postJSON(url, { "api-key": apiKey, Authorization: `Bearer ${apiKey}` }, body, "Azure v1");
}

// ─── 표준 OpenAI 호환 ───────────────────────────────────────────────────────

async function callOpenAICompatible(input: ReadingInput): Promise<string> {
  const apiKey = process.env.LLM_API_KEY ?? "";
  const baseUrl = (process.env.LLM_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
  const url = `${baseUrl}/chat/completions`;
  return postJSON(url, { Authorization: `Bearer ${apiKey}` }, buildChatBody(model, input, true), "LLM");
}

// ─── 공개 함수 ──────────────────────────────────────────────────────────────

/**
 * Azure OpenAI 3가지 경로 → 표준 OpenAI 순서로 시도합니다.
 * 1) /openai/deployments/{id}/chat/completions  (Azure OpenAI Service)
 * 2) /models/{id}/chat/completions              (Azure AI Inference)
 * 3) /openai/v1/chat/completions                (Azure Responses API)
 */
export async function generateLLMReading(input: ReadingInput): Promise<string> {
  const { apiKey: azureKey, endpoint: azureEndpoint, deployment: azureDeployment } = getAzureVars();

  if (azureKey && azureEndpoint && azureDeployment) {
    try {
      return await callAzureOpenAI(input);
    } catch (e1) {
      console.warn("Azure OpenAI 경로 실패:", (e1 as Error).message.slice(0, 80));
    }
    try {
      return await callAzureAIInference(input);
    } catch (e2) {
      console.warn("Azure AI Inference 경로 실패:", (e2 as Error).message.slice(0, 80));
    }
    try {
      return await callAzureOpenAIV1(input);
    } catch (e3) {
      console.warn("Azure v1 경로 실패:", (e3 as Error).message.slice(0, 80));
    }
  }

  const llmKey = process.env.LLM_API_KEY;
  if (llmKey) {
    return callOpenAICompatible(input);
  }

  throw new Error("LLM 환경변수가 설정되지 않았습니다.");
}
