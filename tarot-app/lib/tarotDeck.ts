import type { TarotCard } from "@/types/tarot";
import rawDeck from "@/src/data/tarot_deck_78_ko.json";

// 빌드 타임 / 런타임 모두 안전하게 import
const deckData = rawDeck as TarotCard[];

/** 전체 78장 반환 */
export function getDeck(): TarotCard[] {
  return deckData;
}

/** id로 단일 카드 검색 */
export function getCardById(id: string): TarotCard | undefined {
  return deckData.find((c) => c.id === id);
}

/** 메이저 아르카나만 반환 */
export function getMajorArcana(): TarotCard[] {
  return deckData.filter((c) => c.arcana_type === "major");
}

/** 마이너 아르카나만 반환 */
export function getMinorArcana(): TarotCard[] {
  return deckData.filter((c) => c.arcana_type === "minor");
}
