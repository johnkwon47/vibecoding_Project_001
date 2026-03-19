import { NextRequest, NextResponse } from "next/server";
import { checkCrisis } from "@/lib/crisisDetector";
import type { CardViewModel } from "@/types/tarot";

// ─── 타입 ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  context: {
    question: string;
    spreadType: string;
    cards: Pick<CardViewModel, "positionNameKo" | "displayName" | "keywords" | "meaning" | "upright">[];
    readingMarkdown: string;
  };
}

// ─── 시스템 프롬프트 ─────────────────────────────────────────────────────────

function buildChatSystemPrompt(context: ChatRequestBody["context"]): string {
  const cardSummary = context.cards
    .map(
      (c) =>
        `• [${c.positionNameKo}] ${c.displayName} — 키워드: ${c.keywords.slice(0, 3).join(", ")}`
    )
    .join("\n");

  return `당신은 10년 이상의 경력을 가진 전문 심리 상담가이자 타로 분석 전문가입니다.
현재 내담자와 1:1 심층 상담 세션을 진행 중입니다.

**이 세션의 컨텍스트:**
- 내담자의 질문: "${context.question}"
- 스프레드: ${context.spreadType === "three" ? "3카드 스프레드" : "켈틱 크로스"}
- 드로우된 카드:
${cardSummary}

**이미 제공된 초기 리딩 요약:**
${context.readingMarkdown.slice(0, 1200)}${context.readingMarkdown.length > 1200 ? "\n...(이후 생략)" : ""}

**상담 원칙:**
1. 위의 카드와 리딩을 기반으로 내담자의 후속 질문에 답하십시오
2. 전문 상담가의 어조를 유지하십시오 ("~합니다", "~됩니다", "~하시길 권합니다")
3. 응답은 간결하게 (3~6文 내외) 유지하되, 깊이 있는 통찰을 제공하십시오
4. 카드의 상징과 의미를 적극 활용하여 내담자의 질문에 직접 연결하십시오
5. 확정적 예언 대신 심리적 가능성과 패턴을 제시하십시오
6. 필요시 카드명을 **볼드**로 강조하여 언급하십시오
7. 상담 목적 이외의 요청(코딩, 일반 지식 등)은 정중히 거절하십시오

의학적·법적·재정적 전문 조언은 하지 마십시오. 리딩은 자기 성찰의 도구입니다.`;
}

// ─── LLM 호출 헬퍼 ──────────────────────────────────────────────────────────

async function postChatJSON(
  url: string,
  headers: Record<string, string>,
  body: unknown
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM 오류 ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("빈 응답");
  return content;
}

async function callChatLLM(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const azureKey = process.env.AZURE_OPENAI_API_KEY ?? "";
  const azureEndpoint = (process.env.AZURE_OPENAI_ENDPOINT ?? "").replace(/\/$/, "");
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "";
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-12-01-preview";

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages,
  ];

  const baseBody = {
    messages: chatMessages,
    max_tokens: 800,
    temperature: 0.7,
  };

  // Azure OpenAI 경로 1
  if (azureKey && azureEndpoint && azureDeployment) {
    try {
      const url = `${azureEndpoint}/openai/deployments/${encodeURIComponent(azureDeployment)}/chat/completions?api-version=${encodeURIComponent(azureApiVersion)}`;
      return await postChatJSON(url, { "api-key": azureKey }, baseBody);
    } catch {
      // fallthrough
    }
    // Azure OpenAI 경로 2 (AI Inference)
    try {
      const explicitModel = process.env.AZURE_OPENAI_MODEL_NAME ?? "";
      const model = explicitModel || azureDeployment.replace(/-\d+$/, "");
      const url = `${azureEndpoint}/models/${encodeURIComponent(model)}/chat/completions?api-version=${encodeURIComponent(azureApiVersion)}`;
      return await postChatJSON(
        url,
        { Authorization: `Bearer ${azureKey}` },
        { model, ...baseBody }
      );
    } catch {
      // fallthrough
    }
  }

  // 표준 OpenAI 호환
  const llmKey = process.env.LLM_API_KEY ?? "";
  if (llmKey) {
    const baseUrl = (process.env.LLM_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
    const url = `${baseUrl}/chat/completions`;
    return postChatJSON(
      url,
      { Authorization: `Bearer ${llmKey}` },
      { model, ...baseBody }
    );
  }

  throw new Error("LLM 환경변수가 설정되지 않았습니다.");
}

// ─── API 핸들러 ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;

    // 입력 검증
    const messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "메시지가 없습니다." }, { status: 400 });
    }

    // 최신 사용자 메시지 검증
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json({ error: "마지막 메시지는 사용자 메시지여야 합니다." }, { status: 400 });
    }

    const userText = String(lastMessage.content ?? "").slice(0, 500).trim();
    if (!userText) {
      return NextResponse.json({ error: "메시지 내용이 비어 있습니다." }, { status: 400 });
    }

    // 위기 키워드 감지
    const crisis = checkCrisis(userText);
    if (crisis.isCrisis) {
      return NextResponse.json({ error: "위기_감지" }, { status: 200 });
    }

    // 컨텍스트 검증
    const context = body?.context;
    if (!context?.question || !Array.isArray(context?.cards)) {
      return NextResponse.json({ error: "상담 컨텍스트가 올바르지 않습니다." }, { status: 400 });
    }

    // 메시지 수 제한 (DoS 방지)
    const trimmedMessages = messages.slice(-20);

    const systemPrompt = buildChatSystemPrompt(context);
    const reply = await callChatLLM(systemPrompt, trimmedMessages);

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err) {
    console.error("챗봇 API 오류:", err);
    return NextResponse.json(
      { error: "응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
