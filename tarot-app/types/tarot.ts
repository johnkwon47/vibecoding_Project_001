// ─── 타로 카드 기본 타입 ──────────────────────────────────────────────────────

export type ArcanaType = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles" | null;
export type SpreadType = "three" | "celtic" | "auto";

export interface TarotCard {
  id: string;
  arcana_type: ArcanaType;
  name_ko: string;
  name_en: string;
  number: number | null;
  suit: Suit;
  rank: string | null;
  keywords_upright: string[];
  keywords_reversed: string[];
  meaning_upright_ko: string;
  meaning_reversed_ko: string;
  visual_motifs: string[];
  color_symbols: string[];
  image_asset: string;
  // Extended fields
  domain_hooks?: {
    love?: { upright: string; reversed: string };
    career?: { upright: string; reversed: string };
    money?: { upright: string; reversed: string };
    relationship?: { upright: string; reversed: string };
    self?: { upright: string; reversed: string };
  };
  actions?: {
    upright: string[];
    reversed: string[];
  };
  pitfalls?: {
    upright: string[];
    reversed: string[];
  };
  reflection_questions?: {
    upright: string[];
    reversed: string[];
  };
}

// ─── 스프레드 포지션 ────────────────────────────────────────────────────────

export interface SpreadPosition {
  index: number;
  key: string;
  nameKo: string;
  descriptionKo: string;
}

// ─── 드로우 결과 ────────────────────────────────────────────────────────────

export interface DrawnCardEntry {
  positionIndex: number;
  positionKey: string;
  positionNameKo: string;
  cardId: string;
  upright: boolean;
}

export interface DrawResult {
  sessionId: string;
  question: string;
  spreadType: Exclude<SpreadType, "auto">;
  createdAt: string;
  cards: DrawnCardEntry[];
}

// ─── 뷰 모델 (카드 + 포지션 + 정역 합성) ─────────────────────────────────────

export interface CardViewModel {
  positionIndex: number;
  positionKey: string;
  positionNameKo: string;
  positionDescriptionKo: string;
  card: TarotCard;
  upright: boolean;
  displayName: string; // "바보 (정)" | "바보 (역)"
  keywords: string[]; // upright or reversed
  meaning: string; // upright or reversed
}

// ─── 리딩 입력/출력 ──────────────────────────────────────────────────────────

export interface ReadingInput {
  sessionId: string;
  question: string;
  spreadType: Exclude<SpreadType, "auto">;
  cards: CardViewModel[];
}

export interface ReadingOutput {
  markdown: string;
  generatedBy: "template" | "llm";
}

// ─── 위기 감지 ───────────────────────────────────────────────────────────────

export interface CrisisCheckResult {
  isCrisis: boolean;
  matchedKeyword?: string;
}

// ─── 세션 스토리지 ───────────────────────────────────────────────────────────

export interface SessionHistoryItem {
  sessionId: string;
  question: string;
  spreadType: Exclude<SpreadType, "auto">;
  createdAt: string;
  cardCount: number;
}
