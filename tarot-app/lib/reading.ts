import type { ReadingInput, ReadingOutput, CardViewModel } from "@/types/tarot";
import { getSpreadName } from "@/lib/spreadConfig";
import { analyzeQuestion, type QuestionAnalysis } from "@/lib/questionAnalysis";

// ─── 이미지 리딩 생성 ───────────────────────────────────────────────────────

function buildImageReading(card: CardViewModel, question: string, analysis: QuestionAnalysis): string {
  const motifs = card.card.visual_motifs.slice(0, 3).join(", ");
  const colors = card.card.color_symbols
    .map((c) => {
      const [color, meaning] = c.split("=");
      return `${color}(${meaning})`;
    })
    .join(", ");

  const orientation = card.upright ? "정방향" : "역방향";
  
  // 질문 맥락 연결
  const contextualNote = getContextualImageNote(analysis, card.upright);
  
  return `이 카드가 ${orientation}으로 놓여 있습니다. 화면에는 ${motifs}이(가) 두드러지며, ${colors}의 상징이 분위기를 형성합니다. ${contextualNote}`;
}

/**
 * 질문 맥락에 맞는 이미지 해석 추가 메시지
 */
function getContextualImageNote(analysis: QuestionAnalysis, upright: boolean): string {
  const domain = analysis.domain;
  
  if (domain === "love" && upright) {
    return "이러한 시각적 요소들은 관계에서의 현재 에너지 흐름을 상징적으로 보여줍니다.";
  } else if (domain === "career" && upright) {
    return "이 이미지는 당신의 직업적 상황에서 주목해야 할 핵심 요소를 시각화하고 있습니다.";
  } else if (domain === "decision" && upright) {
    return "화면 속 상징들은 선택의 기로에서 고려해야 할 중요한 차원들을 드러냅니다.";
  } else if (!upright && analysis.emotionalTone === "anxious") {
    return "역방향의 이미지는 당신의 불안이 가리키는 숨겨진 진실을 보여주고 있을 수 있습니다.";
  } else if (!upright) {
    return "뒤집힌 이미지는 아직 표면화되지 않은 내면의 흐름을 암시합니다.";
  }
  
  return "";
}

// ─── 키워드 리딩 생성 ───────────────────────────────────────────────────────

function buildKeywordReading(card: CardViewModel, question: string, analysis: QuestionAnalysis): string {
  const keywords = card.keywords.join(", ");
  
  // 질문 유형에 맞는 키워드 해석
  const contextualInterpretation = getContextualKeywordInterpretation(
    card,
    analysis,
    question
  );
  
  return `이 위치의 전통적 의미는 **${keywords}**입니다. ${contextualInterpretation} ${card.meaning}`;
}

/**
 * 질문 맥락에 맞는 키워드 해석
 */
function getContextualKeywordInterpretation(
  card: CardViewModel,
  analysis: QuestionAnalysis,
  question: string
): string {
  const primaryKeyword = card.keywords[0];
  const type = analysis.type;
  const domain = analysis.domain;
  
  // 질문 유형별 키워드 적용
  if (type === "yes-no") {
    return card.upright
      ? `"${question}"에 대해 **${primaryKeyword}**의 에너지가 긍정적인 가능성을 지지하고 있습니다.`
      : `"${question}"에 대해 **${primaryKeyword}**의 측면이 아직 조정이 필요한 상태입니다.`;
  } else if (type === "how") {
    return `당신이 찾는 방법의 핵심은 **${primaryKeyword}**의 원리를 적용하는 것입니다.`;
  } else if (type === "choice") {
    return `선택의 순간에서 **${primaryKeyword}**가 어느 길이 더 당신의 본질과 가까운지 가리키고 있습니다.`;
  } else if (type === "timing") {
    return card.upright
      ? `**${primaryKeyword}**의 에너지가 활성화될 때가 적절한 시기일 것입니다.`
      : `**${primaryKeyword}**가 온전히 발현되기까지는 still 더 조율이 필요한 시기입니다.`;
  }
  
  // 영역별 키워드 적용
  if (domain === "love") {
    return `관계에서 **${primaryKeyword}**는 지금 당신이 주목해야 할 핵심 요소입니다.`;
  } else if (domain === "career") {
    return `직업적 상황에서 **${primaryKeyword}**가 현재 흐름을 이해하는 열쇠입니다.`;
  } else if (domain === "self-growth") {
    return `성장의 여정에서 **${primaryKeyword}**가 당신이 통과하고 있는 단계를 보여줍니다.`;
  }
  
  return `현재 상황에서 **${primaryKeyword}**가 중심 주제로 떠오릅니다.`;
}

// ─── 포지션별 통합 리딩 ────────────────────────────────────────────────────

function buildPositionIntegration(card: CardViewModel, question: string, analysis: QuestionAnalysis): string {
  const tone = card.upright
    ? "이 에너지를 수용하고 적극적으로 활용할 때"
    : "이 에너지의 뒤집힌 측면을 인식하고 조정할 때";
  
  // 질문 유형에 맞는 실천 제안
  const actionGuidance = getPositionActionGuidance(card, analysis);
  
  return `**${card.positionNameKo}** 자리에서, ${tone} "${question}"의 흐름에 중요한 전환점이 될 수 있습니다. ${actionGuidance}`;
}

/**
 * 포지션별 실천 가이드
 */
function getPositionActionGuidance(card: CardViewModel, analysis: QuestionAnalysis): string {
  const keyword = card.keywords[0];
  const type = analysis.type;
  
  if (type === "how" && card.upright) {
    return `구체적으로는 **${keyword}**의 태도로 오늘 한 가지 작은 행동을 시작해 보세요.`;
  } else if (type === "yes-no") {
    return card.upright
      ? `이 에너지를 강화하기 위해 **${keyword}**와 관련된 행동을 의식적으로 실천해 보세요.`
      : `**${keyword}**의 블록을 인식하고, 왜 그것이 나타났는지 스스로에게 물어보세요.`;
  } else if (type === "choice") {
    return `**${keyword}**는 당신의 선택이 어느 방향으로 흘러가야 하는지 암시하는 신호입니다.`;
  } else if (analysis.emotionalTone === "anxious") {
    return `불안한 마음에 **${keyword}**가 어떤 안정감을 줄 수 있을지 탐색해 보세요.`;
  } else if (analysis.emotionalTone === "frustrated") {
    return `답답함의 돌파구로 **${keyword}**가 새로운 관점을 제시하고 있습니다.`;
  }
  
  return `**${keyword}**를 통해 다음 단계로 나아갈 수 있습니다.`;
}

// ─── 전체 스토리 통합 ──────────────────────────────────────────────────────

function buildOverallStory(cards: CardViewModel[], question: string, analysis: QuestionAnalysis): string {
  const upright = cards.filter((c) => c.upright).length;
  const reversed = cards.length - upright;

  const trend = getTrendAnalysis(upright, reversed, analysis);
  const posNames = cards.map((c) => `**${c.positionNameKo}(${c.displayName})**`).join(" → ");

  const firstCard = cards[0];
  const lastCard = cards[cards.length - 1];
  const midCards = cards.slice(1, -1);
  const midSummary = midCards.length > 0
    ? midCards.map((c) => `**${c.displayName}**(${c.upright ? "정" : "역"})의 ${c.keywords[0]}`).join(", ")
    : "";

  // 질문 유형에 맞는 에너지 흐름 설명
  const energyFlow = buildEnergyFlowNarrative(firstCard, analysis, question);
  
  // 결과 카드 해석
  const outcome = buildOutcomeNarrative(lastCard, analysis, question);

  // 요약 라인  
  const summaryLine = buildSummaryLine(trend, question, posNames, analysis);

  const para1 = `${summaryLine}\n\n${energyFlow}${midSummary ? ` 중간의 ${midSummary} 에너지가 이 흐름을 매개하며 조율하는 역할을 합니다.` : ""} ${outcome}`;

  const para2 = buildPatternAnalysis(upright, reversed, analysis);

  const para3 = buildActionableConclusion(analysis, question);

  return [para1, para2, para3].join("\n\n");
}

/**
 * 트렌드 분석 (정역방향 비율)
 */
function getTrendAnalysis(upright: number, reversed: number, analysis: QuestionAnalysis): string {
  const base = upright > reversed
    ? "전반적으로 흐름이 열려 있으며 변화를 주도할 수 있는 가능성이 높은 시기입니다."
    : upright === reversed
      ? "내부와 외부의 긴장이 공존하며, 균형을 찾는 것이 지금 가장 중요한 핵심입니다."
      : "내면의 저항이나 외부 장애가 감지되므로, 방향을 재조정해야 할 시기일 수 있습니다.";
  
  // 질문 유형에 따른 뉘앙스 추가
  if (analysis.type === "yes-no" && upright > reversed) {
    return base + " 가능성은 당신의 적극적 참여에 달려 있습니다.";
  } else if (analysis.type === "how" && reversed > upright) {
    return base + " 방법을 찾기 전에 먼저 내면의 블록을 확인하는 것이 우선일 수 있습니다.";
  }
  
  return base;
}

/**
 * 에너지 흐름 서사 구축
 */
function buildEnergyFlowNarrative(firstCard: CardViewModel, analysis: QuestionAnalysis, question: string): string {
  const keyword = firstCard.keywords[0];
  const cardName = firstCard.displayName;
  
  if (analysis.type === "yes-no") {
    return firstCard.upright
      ? `출발점인 **${cardName}**은 '${keyword}' 에너지를 바탕으로 "${question}"의 가능성을 열고 있습니다.`
      : `출발점인 **${cardName}**(역)은 '${keyword}' 에너지가 아직 충분히 발현되지 않아, 가능성이 보류 상태임을 보여줍니다.`;
  } else if (analysis.type === "how") {
    return firstCard.upright
      ? `출발점인 **${cardName}**은 '${keyword}'가 당신이 찾는 방법의 첫 번째 열쇠임을 가리킵니다.`
      : `출발점인 **${cardName}**(역)은 '${keyword}' 접근이 아직은 효과적이지 않을 수 있음을 암시합니다.`;
  } else if (analysis.type === "choice") {
    return firstCard.upright
      ? `출발점인 **${cardName}**은 '${keyword}'가 현재 당신에게 가장 중요한 선택 기준임을 보여줍니다.`
      : `출발점인 **${cardName}**(역)은 '${keyword}'를 선택 기준으로 삼기 전에 재검토가 필요함을 제안합니다.`;
  }
  
  return firstCard.upright
    ? `출발점인 **${cardName}**은 '${keyword}' 에너지를 바탕으로 흐름을 열고 있습니다.`
    : `출발점인 **${cardName}**(역)은 '${keyword}' 에너지가 아직 내면에 억눌려 있음을 보여줍니다.`;
}

/**
 * 결과 카드 서사 구축
 */
function buildOutcomeNarrative(lastCard: CardViewModel, analysis: QuestionAnalysis, question: string): string {
  const keyword = lastCard.keywords[0];
  const cardName = lastCard.displayName;
  
  if (analysis.type === "yes-no") {
    return lastCard.upright
      ? `흐름의 끝에 자리한 **${cardName}**은 '${keyword}'의 성취 가능성을 긍정적으로 암시합니다.`
      : `흐름의 끝에 자리한 **${cardName}**(역)은 '${keyword}'가 완전히 실현되기까지는 더 많은 노력이나 시간이 필요함을 나타냅니다.`;
  } else if (analysis.type === "timing") {
    return lastCard.upright
      ? `흐름의 끝에 자리한 **${cardName}**은 '${keyword}'가 충만해질 때가 적절한 타이밍임을 가리킵니다.`
      : `흐름의 끝에 자리한 **${cardName}**(역)은 아직 '${keyword}'가 무르익지 않았으므로 서두르지 말라는 신호입니다.`;
  }
  
  return lastCard.upright
    ? `흐름의 끝에 자리한 **${cardName}**은 '${keyword}'의 가능성으로 수렴하며, 긍정적인 전환을 암시합니다.`
    : `흐름의 끝에 자리한 **${cardName}**(역)은 '${keyword}' 에너지가 아직 해소되지 않았음을 나타냅니다. 이는 결과가 아니라 성찰을 위한 신호로 받아들일 수 있습니다.`;
}

/**
 * 요약 라인 구축
 */
function buildSummaryLine(trend: string, question: string, posNames: string, analysis: QuestionAnalysis): string {
  const coreMessage = trend.split('.')[0];
  let contextualPhrase = "";
  
  if (analysis.domain === "love") {
    contextualPhrase = "관계의 에너지가";
  } else if (analysis.domain === "career") {
    contextualPhrase = "직업적 흐름이";
  } else if (analysis.domain === "decision") {
    contextualPhrase = "선택의 방향성이";
  } else {
    contextualPhrase = "현재 상황이";
  }
  
  return `> **요약:** ${contextualPhrase} ${coreMessage.replace(/입니다$/, "일 수 있습니다")}. "${question}"에 대해 ${posNames}의 카드가 이 흐름을 함께 가리키고 있습니다.`;
}

/**
 * 정역방향 패턴 분석
 */
function buildPatternAnalysis(upright: number, reversed: number, analysis: QuestionAnalysis): string {
  const baseAnalysis = `전체적으로 ${upright}장의 정방향과 ${reversed}장의 역방향이 조합되어 있습니다. `;
  
  let interpretation = "";
  if (upright > reversed) {
    interpretation = `정방향 카드가 우세하여 현재 에너지가 외부로 잘 표현되고 있을 가능성이 있습니다. `;
    if (analysis.type === "how") {
      interpretation += `이 흐름을 유지하면서 각 카드의 키워드를 실천의 구체적 단계로 삼아 보세요.`;
    } else if (analysis.type === "yes-no") {
      interpretation += `긍정적 흐름을 더욱 강화하기 위해 당신이 할 수 있는 행동에 집중하세요.`;
    } else {
      interpretation += `이 흐름을 유지하면서 각 카드의 키워드를 실천의 나침반으로 삼아 보세요.`;
    }
  } else if (upright === reversed) {
    interpretation = `정·역방향이 균형을 이루고 있어 내면과 외부 현실 사이의 조율이 필요한 시기임을 암시합니다. `;
    if (analysis.emotionalTone === "confused") {
      interpretation += `혼란스러움은 자연스러운 것입니다. 어느 한쪽에 치우치지 않고 양쪽의 목소리를 모두 경청하는 것이 중요합니다.`;
    } else {
      interpretation += `어느 한쪽에 치우치지 않고 양쪽의 목소리를 모두 경청하는 것이 중요합니다.`;
    }
  } else {
    interpretation = `역방향 카드가 많아 내면의 블록이나 외부 환경의 저항이 흐름에 영향을 주고 있을 수 있습니다. `;
    if (analysis.emotionalTone === "frustrated") {
      interpretation += `답답함의 근원은 바로 이 저항에 있을 수 있습니다. 억압된 에너지를 어떻게 전환할 수 있을지 차분히 탐색해 보세요.`;
    } else {
      interpretation += `억압된 에너지를 어떻게 전환할 수 있을지 탐색해 보는 것이 도움이 될 수 있습니다.`;
    }
  }
  
  return baseAnalysis + interpretation;
}

/**
 * 실천 가능한 결론
 */
function buildActionableConclusion(analysis: QuestionAnalysis, question: string): string {
  let conclusion = `각 카드가 전하는 메시지를 확정적 예언이 아닌 가능성의 지도로 삼아, `;
  
  if (analysis.type === "how") {
    conclusion += `지금 취할 수 있는 가장 작은 행동이 무엇인지 스스로에게 물어보세요.`;
  } else if (analysis.type === "yes-no") {
    conclusion += `가능성을 현실로 만들기 위해 당신이 할 수 있는 것에 집중하세요.`;
  } else if (analysis.type === "choice") {
    conclusion += `어느 선택이 당신의 진정한 가치관과 더 가까운지 내면의 목소리에 귀 기울여 보세요.`;
  } else if (analysis.type === "timing") {
    conclusion += `적절한 때를 기다리는 동안 준비할 수 있는 것들을 점검해 보세요.`;
  } else {
    conclusion += `지금 취할 수 있는 가장 작은 행동이 무엇인지 스스로에게 물어보세요.`;
  }
  
  conclusion += ` 타로는 당신 안의 지혜를 비추는 거울입니다.`;
  
  return conclusion;
}

// ─── 행동 제안 ─────────────────────────────────────────────────────────────

function buildActions(cards: CardViewModel[], analysis: QuestionAnalysis): string[] {
  const actions: string[] = [];

  const uprightCards = cards.filter((c) => c.upright);
  if (uprightCards.length > 0) {
    const first = uprightCards[0];
    const actionPhrase = getActionPhrase(first.keywords[0], analysis);
    actions.push(actionPhrase);
  }

  const reversedCards = cards.filter((c) => !c.upright);
  if (reversedCards.length > 0) {
    const first = reversedCards[0];
    actions.push(
      `"${first.keywords[0]}"이(가) 드러나는 패턴을 일주일간 관찰하고 일기에 기록해 보세요.`
    );
  }

  // 질문 유형별 추가 행동 제안
  const typeSpecificAction = getTypeSpecificAction(analysis, cards);
  if (typeSpecificAction) {
    actions.push(typeSpecificAction);
  }

  return actions.slice(0, 3);
}

/**
 * 질문 맥락에 맞는 행동 구문 생성
 */
function getActionPhrase(keyword: string, analysis: QuestionAnalysis): string {
  if (analysis.domain === "love") {
    return `"${keyword}"의 에너지를 관계에서 표현하기 위해 오늘 한 가지 소통 행동을 시도해 보세요.`;
  } else if (analysis.domain === "career") {
    return `"${keyword}"의 원리를 직장이나 프로젝트에서 구체적으로 적용할 방법을 하나 실천해 보세요.`;
  } else if (analysis.domain === "self-growth") {
    return `"${keyword}"의 에너지를 체화하기 위해 오늘 하루 의식적으로 그 태도를 연습해 보세요.`;
  } else if (analysis.domain === "decision") {
    return `"${keyword}"를 결정의 기준으로 삼아, 각 선택지를 이 렌즈로 재평가해 보세요.`;
  }
  
  return `"${keyword}"의 에너지를 오늘 하루 한 가지 구체적인 행동으로 표현해 보세요.`;
}

/**
 * 질문 유형별 특화 행동 제안
 */
function getTypeSpecificAction(analysis: QuestionAnalysis, cards: CardViewModel[]): string | null {
  if (analysis.type === "how") {
    return "첫 번째 카드가 제시한 방법을 오늘부터 3일간 작은 실험으로 시도해 보세요.";
  } else if (analysis.type === "choice") {
    return "각 선택지를 택했을 때의 하루를 상상하며 일기를 써보세요. 어느 쪽이 더 진정성 있게 느껴지나요?";
  } else if (analysis.type === "timing") {
    return "지금 당장 할 수 있는 작은 준비 단계를 하나 실행하고, 때가 무르익는 신호들을 관찰하세요.";
  } else if (analysis.emotionalTone === "anxious") {
    return "불안을 줄이기 위해 당신이 통제할 수 있는 한 가지 요소에 집중하여 행동하세요.";
  } else if (cards.length >= 3) {
    return "신뢰하는 사람과 이 질문에 대해 솔직하게 대화하는 시간을 가져보세요.";
  }
  
  return null;
}

// ─── 주의 함정 ─────────────────────────────────────────────────────────────

function buildPitfalls(cards: CardViewModel[], analysis: QuestionAnalysis): string[] {
  const pitfalls: string[] = [
    "타로 리딩을 유일한 판단 근거로 삼기보다, 내면의 직관과 현실적 데이터를 함께 고려하세요.",
  ];

  const reversedCount = cards.filter((c) => !c.upright).length;
  
  // 질문 유형별 주의사항
  if (analysis.type === "yes-no" && reversedCount >= Math.ceil(cards.length / 2)) {
    pitfalls.push(
      "역방향이 많지만, 이것이 '안 된다'는 의미가 아닙니다. 조건이나 접근을 바꾸면 가능성은 얼마든지 달라집니다."
    );
  } else if (analysis.type === "choice" && reversedCount > 0) {
    pitfalls.push(
      "역방향 카드는 특정 선택지가 '나쁘다'는 것이 아니라, 그 길에서 예상되는 도전을 미리 보여줍니다."
    );
  } else if (reversedCount >= Math.ceil(cards.length / 2)) {
    pitfalls.push(
      "역방향 카드가 많습니다. 현재 내부 저항 또는 외부 막힘이 과장되어 보일 수 있으니, 단정하지 말고 관찰자의 시각을 유지하세요."
    );
  } else {
    pitfalls.push(
      "결과가 긍정적으로 보이더라도, 행동하지 않으면 가능성은 현실이 되지 않습니다. 리딩을 시작점으로만 활용하세요."
    );
  }
  
  // 감정 톤별 주의사항
  if (analysis.emotionalTone === "anxious") {
    pitfalls.push(
      "불안한 상태에서는 카드를 부정적으로 해석하기 쉽습니다. 며칠 후 다시 읽어보며 균형 잡힌 시각을 유지하세요."
    );
  }

  return pitfalls.slice(0, 2);
}

// ─── 자문 질문 ────────────────────────────────────────────────────────────

function buildJournalQuestions(question: string, cards: CardViewModel[], analysis: QuestionAnalysis): string[] {
  const firstCard = cards[0];
  const questions: string[] = [];
  
  // 첫 번째 질문: 카드 기반
  questions.push(
    `"${firstCard.displayName}"이(가) 지금 나에게 전하는 가장 솔직한 메시지는 무엇인가?`
  );
  
  // 두 번째 질문: 질문 유형 기반
  if (analysis.type === "yes-no") {
    questions.push(
      `"${question}"가 이루어지는 것을 나는 정말로 원하는가? 그 뒤에 숨은 진짜 욕구는 무엇인가?`
    );
  } else if (analysis.type === "choice") {
    questions.push(
      `각 선택지에서 내가 가장 두려워하는 것과 가장 기대하는 것은 무엇인가?`
    );
  } else if (analysis.type === "how") {
    questions.push(
      `이 방법을 실천하지 못하게 막는 진짜 장애물은 외부에 있나, 내면에 있나?`
    );
  } else if (analysis.type === "timing") {
    questions.push(
      `"지금은 때가 아니다"라는 생각이 지혜인가, 아니면 두려움의 핑계인가?`
    );
  } else if (analysis.emotionalTone === "anxious") {
    questions.push(
      `이 불안의 근원은 무엇이며, 내가 통제할 수 있는 것과 없는 것을 어떻게 구분할 수 있을까?`
    );
  } else if (analysis.emotionalTone === "confused") {
    questions.push(
      `혼란을 걷어내고 나면, 내 직관은 어느 방향을 가리키고 있는가?`
    );
  } else {
    questions.push(
      `"${question}"에 대한 나의 두려움과 진정한 희망은 각각 무엇인가?`
    );
  }
  
  return questions;
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
  
  // 질문 분석 수행
  const analysis = analyzeQuestion(question);
  console.log("[질문 분석 - 템플릿]", analysis);
  
  const spreadName = getSpreadName(spreadType);
  const coreKeywords = buildCoreKeywords(cards);
  const actions = buildActions(cards, analysis);
  const pitfalls = buildPitfalls(cards, analysis);
  const journalQs = buildJournalQuestions(question, cards, analysis);

  const lines: string[] = [];

  // 1) 질문 요약
  lines.push("## 1) 🔮 질문 요약");
  
  // 질문 유형에 맞는 요약 메시지
  const summaryMessage = getQuestionSummary(question, analysis, spreadName);
  lines.push(summaryMessage);
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
    lines.push(buildImageReading(card, question, analysis));
    lines.push("");
    lines.push("**🗝 키워드 리딩**");
    lines.push(buildKeywordReading(card, question, analysis));
    lines.push("");
    lines.push("**💡 통합**");
    lines.push(buildPositionIntegration(card, question, analysis));
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // 4) 전체 해석
  lines.push("## 4) 🌊 전체 해석");
  lines.push(buildOverallStory(cards, question, analysis));
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

/**
 * 질문 유형에 맞는 요약 메시지 생성
 */
function getQuestionSummary(question: string, analysis: QuestionAnalysis, spreadName: string): string {
  const baseMessage = `당신의 질문은 **"${question}"**입니다. `;
  
  let contextMessage = "";
  if (analysis.type === "yes-no") {
    contextMessage = "이것은 가능성을 탐색하는 질문입니다. 카드는 '예/아니오'가 아니라, 가능성을 높이거나 낮추는 요인들을 보여줍니다. ";
  } else if (analysis.type === "choice") {
    contextMessage = "이것은 선택의 순간입니다. 카드는 어느 길이 옳은지가 아니라, 각 길이 당신의 내면과 어떻게 공명하는지 보여줍니다. ";
  } else if (analysis.type === "how") {
    contextMessage = "이것은 방법을 찾는 질문입니다. 카드는 구체적 단계와 필요한 태도를 함께 제시합니다. ";
  } else if (analysis.type === "timing") {
    contextMessage = "이것은 시기를 묻는 질문입니다. 카드는 구체적 날짜보다, 어떤 조건이 갖춰질 때 때가 무르익는지 보여줍니다. ";
  } else if (analysis.type === "why") {
    contextMessage = "이것은 이유를 찾는 질문입니다. 카드는 표면 아래의 패턴과 무의식적 동기를 조명합니다. ";
  } else if (analysis.type === "advice") {
    contextMessage = "이것은 조언을 구하는 질문입니다. 카드는 실천 가능한 통찰과 방향을 제시합니다. ";
  }
  
  const spreadMessage = `${spreadName}을 통해 현재의 에너지와 흐름, 그리고 가능한 방향을 살펴보겠습니다.`;
  
  return baseMessage + contextMessage + spreadMessage;
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
