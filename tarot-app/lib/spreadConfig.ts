import type { SpreadPosition, SpreadType } from "@/types/tarot";

// ─── 3카드 스프레드 ─────────────────────────────────────────────────────────

export const THREE_CARD_POSITIONS: SpreadPosition[] = [
  {
    index: 0,
    key: "past",
    nameKo: "과거",
    descriptionKo: "현재 상황에 영향을 준 과거의 에너지 또는 사건",
  },
  {
    index: 1,
    key: "present",
    nameKo: "현재",
    descriptionKo: "지금 이 순간의 상황과 핵심 에너지",
  },
  {
    index: 2,
    key: "future",
    nameKo: "미래",
    descriptionKo: "현재 흐름이 이어질 때 나타날 가능성과 방향",
  },
];

// ─── 켈틱 크로스 스프레드 ───────────────────────────────────────────────────

export const CELTIC_CROSS_POSITIONS: SpreadPosition[] = [
  {
    index: 0,
    key: "present",
    nameKo: "현재 (상황)",
    descriptionKo: "지금 이 순간 질문자 주변의 핵심 에너지",
  },
  {
    index: 1,
    key: "challenge",
    nameKo: "도전 (장애)",
    descriptionKo: "현재 상황을 가로막거나 긴장을 형성하는 힘",
  },
  {
    index: 2,
    key: "foundation",
    nameKo: "근본 (기저)",
    descriptionKo: "상황의 무의식적 뿌리, 심층부의 영향",
  },
  {
    index: 3,
    key: "past",
    nameKo: "과거 (영향)",
    descriptionKo: "최근 지나간 에너지로 현재에 영향을 미치는 것",
  },
  {
    index: 4,
    key: "crown",
    nameKo: "의식 (목표/가능성)",
    descriptionKo: "질문자가 의식적으로 추구하는 목표나 최선의 결과",
  },
  {
    index: 5,
    key: "near_future",
    nameKo: "가까운 미래",
    descriptionKo: "앞으로 수 주~수 개월 안에 나타날 에너지",
  },
  {
    index: 6,
    key: "self",
    nameKo: "나 (태도)",
    descriptionKo: "질문자가 상황에 접근하는 내면의 자세",
  },
  {
    index: 7,
    key: "external",
    nameKo: "외부 (환경)",
    descriptionKo: "주변 환경, 타인, 사회적 영향",
  },
  {
    index: 8,
    key: "hope_fear",
    nameKo: "희망/두려움",
    descriptionKo: "질문자가 가장 원하거나 가장 두려워하는 것",
  },
  {
    index: 9,
    key: "outcome",
    nameKo: "결과 (전개)",
    descriptionKo: "현재 흐름이 이어질 경우 도달할 최종 결과",
  },
];

// ─── 헬퍼 ───────────────────────────────────────────────────────────────────

export function getPositions(spreadType: Exclude<SpreadType, "auto">): SpreadPosition[] {
  return spreadType === "three" ? THREE_CARD_POSITIONS : CELTIC_CROSS_POSITIONS;
}

export function getSpreadName(spreadType: Exclude<SpreadType, "auto">): string {
  return spreadType === "three" ? "3카드 스프레드" : "켈틱 크로스 스프레드";
}

/**
 * 질문 텍스트를 분석해 3카드(가벼운) vs 켈틱(복합/장기) 추천
 * 룰 기반: 길이·키워드로 단순 분류
 */
export function recommendSpread(question: string): Exclude<SpreadType, "auto"> {
  const complex = [
    "관계", "진로", "직업", "미래", "결혼", "사업", "장기", "계획",
    "어떻게 해야", "왜", "원인", "전체", "인생", "커리어", "목표",
    "해결", "선택", "고민",
  ];
  const trimmed = question.trim();
  if (trimmed.length > 40) return "celtic";
  for (const kw of complex) {
    if (trimmed.includes(kw)) return "celtic";
  }
  return "three";
}
