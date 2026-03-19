import type { DrawResult, SessionHistoryItem } from "@/types/tarot";

const DRAW_PREFIX = "tarot_session_";
const HISTORY_KEY = "tarot_history";

// ─── 세션 저장/로드 ─────────────────────────────────────────────────────────

export function saveDrawResult(result: DrawResult): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAW_PREFIX + result.sessionId, JSON.stringify(result));

  // 히스토리 목록 업데이트
  const history = loadHistory();
  const item: SessionHistoryItem = {
    sessionId: result.sessionId,
    question: result.question,
    spreadType: result.spreadType,
    createdAt: result.createdAt,
    cardCount: result.cards.length,
  };
  // 중복 제거 후 앞에 추가
  const filtered = history.filter((h) => h.sessionId !== result.sessionId);
  filtered.unshift(item);
  // 최근 50개만 보관
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 50)));
}

export function loadDrawResult(sessionId: string): DrawResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DRAW_PREFIX + sessionId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DrawResult;
  } catch {
    return null;
  }
}

export function loadHistory(): SessionHistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SessionHistoryItem[];
  } catch {
    return [];
  }
}

export function deleteSession(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAW_PREFIX + sessionId);
  const history = loadHistory().filter((h) => h.sessionId !== sessionId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
