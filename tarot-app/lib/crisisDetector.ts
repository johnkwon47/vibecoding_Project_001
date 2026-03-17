import type { CrisisCheckResult } from "@/types/tarot";

/**
 * 위기 키워드 목록 (한국어, 자살·자해·극단적 선택 관련)
 * OWASP 인젝션 방지: 정규식 매칭만 수행, 외부 입력을 eval/SQL 등에 사용 안 함.
 */
const CRISIS_KEYWORDS = [
  "죽고싶다", "죽고 싶다", "죽고싶어", "죽고 싶어",
  "자살", "자해", "스스로 목숨", "목숨을 끊", "극단적 선택",
  "살기 싫다", "살기싫다", "살고 싶지 않", "살고싶지않",
  "사라지고 싶다", "사라지고싶다", "없어지고 싶다",
  "모든 걸 끝내고 싶다", "모든걸 끝내고 싶다",
];

/**
 * 입력 텍스트에서 위기 키워드 감지
 */
export function checkCrisis(text: string): CrisisCheckResult {
  const normalized = text.replace(/\s+/g, " ").toLowerCase();
  for (const kw of CRISIS_KEYWORDS) {
    if (normalized.includes(kw)) {
      return { isCrisis: true, matchedKeyword: kw };
    }
  }
  return { isCrisis: false };
}
