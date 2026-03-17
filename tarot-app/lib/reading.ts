import type { ReadingInput, ReadingOutput, CardViewModel } from "@/types/tarot";
import { getSpreadName } from "@/lib/spreadConfig";

// ─── 이미지 리딩 생성 ───────────────────────────────────────────────────────

function buildImageReading(card: CardViewModel): string {
  const motifs = card.card.visual_motifs.slice(0, 3).join(", ");
  const colors = card.card.color_symbols
    .map((c) => {
      const [color, meaning] = c.split("=");
      return `${color}(${meaning})`;
    })
    .join(", ");

  const orientation = card.upright ? "정방향" : "역방향";
  return `이 카드가 ${orientation}으로 놓여 있습니다. 화면에는 ${motifs}이(가) 두드러지며, ${colors}의 상징이 분위기를 형성합니다.`;
}

// ─── 키워드 리딩 생성 ───────────────────────────────────────────────────────

function buildKeywordReading(card: CardViewModel): string {
  const keywords = card.keywords.join(", ");
  return `이 위치의 전통적 의미는 **${keywords}**입니다. ${card.meaning}`;
}

// ─── 포지션별 통합 리딩 ────────────────────────────────────────────────────

function buildPositionIntegration(card: CardViewModel, question: string): string {
  const tone = card.upright
    ? "이 에너지를 수용하고 적극적으로 활용할 때"
    : "이 에너지의 뒤집힌 측면을 인식하고 조정할 때";
  return `**${card.positionNameKo}** 자리에서, ${tone} "${question}"의 흐름에 중요한 전환점이 될 수 있습니다.`;
}

// ─── 전체 스토리 통합 ──────────────────────────────────────────────────────

function buildOverallStory(cards: CardViewModel[], question: string): string {
  const upright = cards.filter((c) => c.upright).length;
  const reversed = cards.length - upright;

  const trend =
    upright > reversed
      ? "전반적으로 흐름이 열려 있으며 변화를 주도할 수 있는 가능성이 높은 시기입니다."
      : upright === reversed
        ? "내부와 외부의 긴장이 공존하며, 균형을 찾는 것이 지금 가장 중요한 핵심입니다."
        : "내면의 저항이나 외부 장애가 감지되므로, 방향을 재조정해야 할 시기일 수 있습니다.";

  const posNames = cards.map((c) => `**${c.positionNameKo}(${c.displayName})**`).join(" → ");

  const firstCard = cards[0];
  const lastCard = cards[cards.length - 1];
  const midCards = cards.slice(1, -1);
  const midSummary = midCards.length > 0
    ? midCards.map((c) => `**${c.displayName}**(${c.upright ? "정" : "역"})의 ${c.keywords[0]}`).join(", ")
    : "";

  const energyFlow = firstCard.upright
    ? `출발점인 **${firstCard.displayName}**은 '${firstCard.keywords[0]}' 에너지를 바탕으로 흐름을 열고 있습니다.`
    : `출발점인 **${firstCard.displayName}**(역)은 '${firstCard.keywords[0]}' 에너지가 아직 내면에 억눌려 있음을 보여줍니다.`;

  const outcome = lastCard.upright
    ? `흐름의 끝에 자리한 **${lastCard.displayName}**은 '${lastCard.keywords[0]}'의 가능성으로 수렴하며, 긍정적인 전환을 암시합니다.`
    : `흐름의 끝에 자리한 **${lastCard.displayName}**(역)은 '${lastCard.keywords[0]}' 에너지가 아직 해소되지 않았음을 나타냅니다. 이는 결과가 아니라 성찰을 위한 신호로 받아들일 수 있습니다.`;

  const summaryLine = `> **요약:** ${trend.replace(/입니다\.$/, "일 수 있습니다.")} "${question}"에 대해 ${posNames}의 카드가 이 흐름을 함께 가리키고 있습니다.`;

  const para1 = `${summaryLine}\n\n${energyFlow}${midSummary ? ` 중간의 ${midSummary} 에너지가 이 흐름을 매개하며 조율하는 역할을 합니다.` : ""} ${outcome}`;

  const para2 = `전체적으로 ${upright}장의 정방향과 ${reversed}장의 역방향이 조합되어 있습니다. ` +
    (upright > reversed
      ? `정방향 카드가 우세하여 현재 에너지가 외부로 잘 표현되고 있을 가능성이 있습니다. 이 흐름을 유지하면서 각 카드의 키워드를 실천의 나침반으로 삼아 보세요.`
      : upright === reversed
        ? `정·역방향이 균형을 이루고 있어 내면과 외부 현실 사이의 조율이 필요한 시기임을 암시합니다. 어느 한쪽에 치우치지 않고 양쪽의 목소리를 모두 경청하는 것이 중요합니다.`
        : `역방향 카드가 많아 내면의 블록이나 외부 환경의 저항이 흐름에 영향을 주고 있을 수 있습니다. 억압된 에너지를 어떻게 전환할 수 있을지 탐색해 보는 것이 도움이 될 수 있습니다.`);

  const para3 = `각 카드가 전하는 메시지를 확정적 예언이 아닌 가능성의 지도로 삼아, 지금 취할 수 있는 가장 작은 행동이 무엇인지 스스로에게 물어보세요. 타로는 당신 안의 지혜를 비추는 거울입니다.`;

  return [para1, para2, para3].join("\n\n");
}

// ─── 행동 제안 ─────────────────────────────────────────────────────────────

function buildActions(cards: CardViewModel[]): string[] {
  const actions: string[] = [];

  const uprightCards = cards.filter((c) => c.upright);
  if (uprightCards.length > 0) {
    const first = uprightCards[0];
    actions.push(
      `"${first.keywords[0]}"의 에너지를 오늘 하루 한 가지 구체적인 행동으로 표현해 보세요.`
    );
  }

  const reversedCards = cards.filter((c) => !c.upright);
  if (reversedCards.length > 0) {
    const first = reversedCards[0];
    actions.push(
      `"${first.keywords[0]}"이(가) 드러나는 패턴을 일주일간 관찰하고 일기에 기록해 보세요.`
    );
  }

  if (cards.length >= 3) {
    actions.push(
      "신뢰하는 사람과 이 질문에 대해 솔직하게 대화하는 시간을 가져보세요."
    );
  }

  return actions.slice(0, 3);
}

// ─── 주의 함정 ─────────────────────────────────────────────────────────────

function buildPitfalls(cards: CardViewModel[]): string[] {
  const pitfalls: string[] = [
    "타로 리딩을 유일한 판단 근거로 삼기보다, 내면의 직관과 현실적 데이터를 함께 고려하세요.",
  ];

  const reversedCount = cards.filter((c) => !c.upright).length;
  if (reversedCount >= Math.ceil(cards.length / 2)) {
    pitfalls.push(
      "역방향 카드가 많습니다. 현재 내부 저항 또는 외부 막힘이 과장되어 보일 수 있으니, 단정하지 말고 관찰자의 시각을 유지하세요."
    );
  } else {
    pitfalls.push(
      "결과가 긍정적으로 보이더라도, 행동하지 않으면 가능성은 현실이 되지 않습니다. 리딩을 시작점으로만 활용하세요."
    );
  }

  return pitfalls;
}

// ─── 자문 질문 ────────────────────────────────────────────────────────────

function buildJournalQuestions(question: string, cards: CardViewModel[]): string[] {
  const firstCard = cards[0];
  return [
    `"${firstCard.displayName}"이(가) 지금 나에게 전하는 가장 솔직한 메시지는 무엇인가?`,
    `"${question}"에 대한 나의 두려움과 진정한 희망은 각각 무엇인가?`,
  ];
}

// ─── 핵심 키워드 추출 ──────────────────────────────────────────────────────

function buildCoreKeywords(cards: CardViewModel[]): string[] {
  const kwSet = new Set<string>();
  for (const c of cards) {
    for (const kw of c.keywords.slice(0, 2)) {
      kwSet.add(kw);
      if (kwSet.size >= 6) break;
    }
    if (kwSet.size >= 6) break;
  }
  return [...kwSet];
}

// ─── 최종 마크다운 조립 ────────────────────────────────────────────────────

export function generateTemplateReading(input: ReadingInput): string {
  const { question, spreadType, cards } = input;
  const spreadName = getSpreadName(spreadType);
  const coreKeywords = buildCoreKeywords(cards);
  const actions = buildActions(cards);
  const pitfalls = buildPitfalls(cards);
  const journalQs = buildJournalQuestions(question, cards);

  const lines: string[] = [];

  // 1) 질문 요약
  lines.push("## 1) 🔮 질문 요약");
  lines.push(
    `당신의 질문은 **"${question}"**입니다. ` +
      `${spreadName}을 통해 현재의 에너지와 흐름, 그리고 가능한 방향을 살펴보겠습니다.`
  );
  lines.push("");

  // 2) 핵심 키워드
  lines.push("## 2) ✨ 핵심 키워드");
  lines.push(coreKeywords.map((k) => `\`${k}\``).join("  ·  "));
  lines.push("");

  // 3) 포지션별 리딩
  lines.push("## 3) 📖 포지션별 리딩");
  lines.push("");

  for (const card of cards) {
    lines.push(`### ${card.positionIndex + 1}. ${card.positionNameKo} — ${card.displayName}`);
    lines.push("");
    lines.push("**🎨 이미지 리딩**");
    lines.push(buildImageReading(card));
    lines.push("");
    lines.push("**🗝 키워드 리딩**");
    lines.push(buildKeywordReading(card));
    lines.push("");
    lines.push("**💡 통합**");
    lines.push(buildPositionIntegration(card, question));
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // 4) 전체 해석
  lines.push("## 4) 🌊 전체 해석");
  lines.push(buildOverallStory(cards, question));
  lines.push("");

  // 5) 행동 제안
  lines.push("## 5) 🚀 행동 제안");
  for (const action of actions) {
    lines.push(`- ${action}`);
  }
  lines.push("");

  // 6) 주의할 점
  lines.push("## 6) ⚠️ 주의할 점");
  for (const pitfall of pitfalls) {
    lines.push(`- ${pitfall}`);
  }
  lines.push("");

  // 7) 저널링 질문
  lines.push("## 7) 📝 저널링 질문");
  for (let i = 0; i < journalQs.length; i++) {
    lines.push(`${i + 1}. ${journalQs[i]}`);
  }
  lines.push("");

  return lines.join("\n");
}

// ─── 공개 인터페이스 ────────────────────────────────────────────────────────

export async function generateReading(input: ReadingInput): Promise<ReadingOutput> {
  // Azure OpenAI 또는 표준 LLM 설정이 있으면 시도, 실패 시 템플릿 폴백
  const hasAzure = !!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
  const hasLLM = !!process.env.LLM_API_KEY;
  if (hasAzure || hasLLM) {
    try {
      const { generateLLMReading } = await import("@/lib/llm");
      const markdown = await generateLLMReading(input);
      return { markdown, generatedBy: "llm" };
    } catch (err) {
      console.warn("LLM 리딩 실패, 템플릿으로 폴백합니다:", err);
    }
  }

  const markdown = generateTemplateReading(input);
  return { markdown, generatedBy: "template" };
}
