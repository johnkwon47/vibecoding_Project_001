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
    return "이 시각적 상징들은 관계 역동에서 현재 작동하고 있는 심리적 에너지 흐름을 구체적으로 나타냅니다.";
  } else if (domain === "career" && upright) {
    return "이 이미지는 귀하의 직업 상황에서 전문적으로 주목해야 할 핵심 요소를 상징적으로 제시하고 있습니다.";
  } else if (domain === "decision" && upright) {
    return "이미지 속 상징들은 의사결정 과정에서 체계적으로 검토해야 할 심층적 차원들을 드러냅니다.";
  } else if (!upright && analysis.emotionalTone === "anxious") {
    return "역방향으로 나타난 이 이미지는 현재의 불안 이면에 놓인 무의식적 패턴을 시사합니다.";
  } else if (!upright) {
    return "역방향 이미지는 아직 의식화되지 않은 내면의 심리적 과정이 진행 중임을 나타냅니다.";
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
      ? `"${question}"에 대해 **${primaryKeyword}**의 에너지가 실현 가능성을 지지하는 방향으로 작용하고 있습니다.`
      : `"${question}"에 대해 **${primaryKeyword}** 측면의 내적 조정이 선행될 필요가 있는 상태입니다.`;
  } else if (type === "how") {
    return `귀하가 모색하는 방법의 핵심은 **${primaryKeyword}**의 원리를 체계적으로 적용하는 데 있습니다.`;
  } else if (type === "choice") {
    return `선택의 기로에서 **${primaryKeyword}**는 어느 방향이 귀하의 본질적 가치관과 더 일치하는지를 가리킵니다.`;
  } else if (type === "timing") {
    return card.upright
      ? `**${primaryKeyword}**의 에너지가 충분히 성숙될 때가 적절한 시기가 될 것으로 분석됩니다.`
      : `**${primaryKeyword}**가 온전히 발현되기까지는 추가적인 조율과 준비가 필요한 시기입니다.`;
  }
  
  // 영역별 키워드 적용
  if (domain === "love") {
    return `관계 역동 속에서 **${primaryKeyword}**는 현재 가장 중점적으로 다루어야 할 심리적 핵심 요소입니다.`;
  } else if (domain === "career") {
    return `직업적 맥락에서 **${primaryKeyword}**가 현재 상황의 흐름을 이해하는 핵심 열쇠입니다.`;
  } else if (domain === "self-growth") {
    return `심리적 성장의 관점에서 **${primaryKeyword}**는 귀하가 현재 통과하고 있는 발달 단계를 나타냅니다.`;
  }
  
  return `현재 상황에서 **${primaryKeyword}**가 핵심 주제로 부상하고 있습니다.`;
}

// ─── 포지션별 통합 리딩 ────────────────────────────────────────────────────

function buildPositionIntegration(card: CardViewModel, question: string, analysis: QuestionAnalysis): string {
  const tone = card.upright
    ? "이 에너지를 내면화하고 전략적으로 활용하실 때"
    : "이 에너지의 역전된 측면을 심층적으로 인식하고 체계적으로 조정하실 때";
  
  // 질문 유형에 맞는 실천 제안
  const actionGuidance = getPositionActionGuidance(card, analysis);
  
  return `**${card.positionNameKo}** 포지션에서, ${tone} "${question}"의 흐름에 있어 의미 있는 전환점이 마련될 수 있습니다. ${actionGuidance}`;
}

/**
 * 포지션별 실천 가이드
 */
function getPositionActionGuidance(card: CardViewModel, analysis: QuestionAnalysis): string {
  const keyword = card.keywords[0];
  const type = analysis.type;
  
  if (type === "how" && card.upright) {
    return `구체적 실천 측면에서, **${keyword}**의 원리를 바탕으로 실현 가능한 첫 번째 단계를 설정하시길 권합니다.`;
  } else if (type === "yes-no") {
    return card.upright
      ? `이 에너지를 강화하기 위해 **${keyword}**와 관련된 행동을 의도적이고 지속적으로 실천하시는 것이 도움이 됩니다.`
      : `**${keyword}**의 심리적 블록을 인식하고, 그 기저에 있는 원인을 객관적으로 탐색해 보시길 권합니다.`;
  } else if (type === "choice") {
    return `**${keyword}**는 어느 선택 방향이 귀하의 심층적 가치관과 더 부합하는지를 가리키는 중요한 지표입니다.`;
  } else if (analysis.emotionalTone === "anxious") {
    return `현재의 불안 감정 속에서 **${keyword}**가 제공할 수 있는 심리적 안정감의 근거를 탐색하시길 권합니다.`;
  } else if (analysis.emotionalTone === "frustrated") {
    return `현재의 막막함을 타개하는 돌파구로서 **${keyword}**가 새로운 관점의 전환을 제시하고 있습니다.`;
  }
  
  return `**${keyword}**의 심층적 의미를 통해 다음 단계로의 발전적 이행이 가능합니다.`;
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
    ? "전반적인 에너지 흐름이 개방되어 있으며, 변화를 주도적으로 이끌어 나갈 수 있는 가능성이 높은 시기로 분석됩니다."
    : upright === reversed
      ? "내외부의 긴장이 상호 공존하며, 심리적 균형의 회복이 현재 가장 중요한 과제로 나타납니다."
      : "내면의 심리적 저항이나 외부 환경적 장애가 감지되므로, 전략적 방향 재조정이 필요한 시기로 보입니다.";
  
  // 질문 유형에 따른 뉘앙스 추가
  if (analysis.type === "yes-no" && upright > reversed) {
    return base + " 실현 가능성은 궁극적으로 귀하의 능동적 참여와 헌신에 달려 있습니다.";
  } else if (analysis.type === "how" && reversed > upright) {
    return base + " 방법론을 모색하기에 앞서, 내면의 심리적 블록을 먼저 확인하는 것이 선행되어야 합니다.";
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
      `"${first.keywords[0]}"으로 드러나는 내면적 패턴을 1주일 간 관찰하시고 상담 노트에 기록하시길 권합니다.`
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
    return `"${keyword}"의 에너지를 관계에서 구체적으로 표현하기 위해 오늘 한 가지 진정성 있는 소통을 실천하시길 권합니다.`;
  } else if (analysis.domain === "career") {
    return `"${keyword}"의 원리를 직무 환경에서 실질적으로 적용할 수 있는 구체적인 감도를 하나 설정하시길 권합니다.`;
  } else if (analysis.domain === "self-growth") {
    return `"${keyword}"의 에너지를 체화하기 위해 오늘 하루 의도적으로 그 태도를 연습하실 것을 권합니다.`;
  } else if (analysis.domain === "decision") {
    return `"${keyword}"를 의사결정의 평가 기준으로 삼고, 각 선택지를 이 렌즈로 다시 검토하시길 권합니다.`;
  }
  
  return `"${keyword}"의 에너지를 오늘 하루 구체적인 행동으로 표현하시길 권합니다.`;
}

/**
 * 질문 유형별 특화 행동 제안
 */
function getTypeSpecificAction(analysis: QuestionAnalysis, cards: CardViewModel[]): string | null {
  if (analysis.type === "how") {
    return "첫 번째 카드가 제시한 접근 방법을 이번 주 3일간 소규모 실험으로 적용해 보시고, 거기에서 얻은 쿠를 상담 노트에 기록하시길 권합니다.";
  } else if (analysis.type === "choice") {
    return "각 선택지를 택했을 때의 하루를 마음속으로 구체적으로 구성해 보시고, 어느 시나리오에서 구체적 행동이 더 자연스럽게 느껴지는지 살펴보십시오.";
  } else if (analysis.type === "timing") {
    return "지금 당장 실출할 수 있는 소규모 준비 단계를 하나 실행하시고, 상황 도래의 신호들을 전문가 시각으로 관찰하십시오.";
  } else if (analysis.emotionalTone === "anxious") {
    return "현재 불안을 완화하기 위해 실질적으로 통제 가능한 요소 한 가지밖에 모든 에너지를 집중시켜 행동하십시오.";
  } else if (cards.length >= 3) {
    return "신뢰할 수 있는 주변인과 이 질문에 대해 짇징칵없는 대화를 나누어 보시기를 권합니다.";
  }
  
  return null;
}

// ─── 주의 함정 ─────────────────────────────────────────────────────────────

function buildPitfalls(cards: CardViewModel[], analysis: QuestionAnalysis): string[] {
  const pitfalls: string[] = [
    "타로 리딩은 자기 성찰과 내면 탐색을 위한 도구입니다. 중요한 의사결정은 수치적 구체성과 전문 상담을 병행하시길 권합니다.",
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
      "역방향 카드가 많습니다. 현재 내면의 심리적 저항이 과장되어 인식될 수 있으니, 단정적 해석보다 관찰자의 시각을 유지하시길 권합니다."
    );
  } else {
    pitfalls.push(
      "흐름이 긍정적으로 나타나더라도, 이는 시작점일 뿐입니다. 실질적인 행동 없이는 가능성이 현실화되지 않습니다."
    );
  }
  
  // 감정 톤별 주의사항
  if (analysis.emotionalTone === "anxious") {
    pitfalls.push(
      "현재의 불안 상태에서는 카드를 부정적으로 해석하는 경향이 있을 수 있습니다. 수일 후 안정된 상태에서 다시 검토하실 것을 권합니다."
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
    `"${firstCard.displayName}"이(가) 현재 저에게 전하는 가장 핵심적인 통찰은 무엇입니까?`
  );
  
  // 두 번째 질문: 질문 유형 기반
  if (analysis.type === "yes-no") {
    questions.push(
      `"${question}"가 실현된다면, 그것이 충족해 주는 더 깊은 심리적 욕구는 무엇입니까?`
    );
  } else if (analysis.type === "choice") {
    questions.push(
      `각 선택지에서 제가 가장 두려워하는 것과 가장 기대하는 것은 각각 무엇입니까?`
    );
  } else if (analysis.type === "how") {
    questions.push(
      `이 방법의 실천을 가로막는 장애물은 외부 환경에 있습니까, 아니면 내면의 심리적 저항에 있습니까?`
    );
  } else if (analysis.type === "timing") {
    questions.push(
      `"지금은 때가 아니다"는 판단이 성숙한 지혜에서 비롯된 것입니까, 아니면 변화에 대한 두려움에서 비롯된 것입니까?`
    );
  } else if (analysis.emotionalTone === "anxious") {
    questions.push(
      `현재 불안의 근원은 무엇이며, 제가 실질적으로 통제 가능한 영역과 그렇지 않은 영역을 어떻게 구분할 수 있습니까?`
    );
  } else if (analysis.emotionalTone === "confused") {
    questions.push(
      `혼란을 걷어낸 상태에서 바라본다면, 저의 내면이 가리키는 방향은 어디입니까?`
    );
  } else {
    questions.push(
      `"${question}"에 대한 저의 두려움과 진정한 바람은 각각 무엇이며, 두 감정이 공존하는 이유는 무엇입니까?`
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
