import { v4 as uuidv4 } from "uuid";
import type {
  TarotCard,
  DrawResult,
  DrawnCardEntry,
  SpreadType,
  CardViewModel,
} from "@/types/tarot";
import { getDeck } from "@/lib/tarotDeck";
import { getPositions, recommendSpread } from "@/lib/spreadConfig";
import { getCardById } from "@/lib/tarotDeck";

// ─── Fisher-Yates 셔플 ────────────────────────────────────────────────────────

/**
 * Fisher-Yates 알고리즘으로 배열을 제자리에서 셔플합니다.
 * 원본 배열을 직접 변경합니다(immutable하려면 복사본에 적용하세요).
 */
export function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── 드로우 로직 ──────────────────────────────────────────────────────────────

/**
 * 78장 덱에서 N장을 중복 없이 드로우합니다.
 * 각 카드마다 정/역을 50/50으로 결정합니다.
 */
export function drawCards(
  question: string,
  spreadType: SpreadType,
): DrawResult {
  const resolvedType: Exclude<SpreadType, "auto"> =
    spreadType === "auto" ? recommendSpread(question) : spreadType;

  const positions = getPositions(resolvedType);
  const n = positions.length; // 3 또는 10

  const shuffled: TarotCard[] = fisherYatesShuffle(getDeck());
  const drawn = shuffled.slice(0, n);

  const cards: DrawnCardEntry[] = drawn.map((card, i) => ({
    positionIndex: positions[i].index,
    positionKey: positions[i].key,
    positionNameKo: positions[i].nameKo,
    cardId: card.id,
    upright: Math.random() >= 0.5,
  }));

  return {
    sessionId: uuidv4(),
    question,
    spreadType: resolvedType,
    createdAt: new Date().toISOString(),
    cards,
  };
}

// ─── 뷰 모델 결합 ─────────────────────────────────────────────────────────────

/**
 * DrawResult + 덱 메타를 합성해 렌더링에 필요한 CardViewModel[]을 반환합니다.
 */
export function buildCardViewModels(drawResult: DrawResult): CardViewModel[] {
  const positions = getPositions(drawResult.spreadType);

  return drawResult.cards.map((entry) => {
    const card = getCardById(entry.cardId);
    if (!card) throw new Error(`Card not found: ${entry.cardId}`);

    const pos = positions.find((p) => p.index === entry.positionIndex);
    if (!pos) throw new Error(`Position not found: ${entry.positionIndex}`);

    return {
      positionIndex: entry.positionIndex,
      positionKey: entry.positionKey,
      positionNameKo: entry.positionNameKo,
      positionDescriptionKo: pos.descriptionKo,
      card,
      upright: entry.upright,
      displayName: `${card.name_ko} (${entry.upright ? "정" : "역"})`,
      keywords: entry.upright ? card.keywords_upright : card.keywords_reversed,
      meaning: entry.upright ? card.meaning_upright_ko : card.meaning_reversed_ko,
    };
  });
}
