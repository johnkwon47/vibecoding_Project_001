import { NextRequest, NextResponse } from "next/server";
import { drawCards } from "@/lib/draw";
import { checkCrisis } from "@/lib/crisisDetector";
import type { SpreadType } from "@/types/tarot";

// 입력 악용 방지: 최대 길이·타입 검증
const MAX_QUESTION_LENGTH = 300;
const VALID_SPREAD_TYPES: SpreadType[] = ["three", "celtic", "auto"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증 (OWASP A03 인젝션 방지)
    const question = String(body?.question ?? "").slice(0, MAX_QUESTION_LENGTH).trim();
    const spreadType = String(body?.spreadType ?? "auto") as SpreadType;

    if (!question) {
      return NextResponse.json({ error: "질문을 입력해 주세요." }, { status: 400 });
    }

    if (!VALID_SPREAD_TYPES.includes(spreadType)) {
      return NextResponse.json({ error: "유효하지 않은 스프레드 타입입니다." }, { status: 400 });
    }

    // 위기 키워드 감지 → 리딩 생성 차단
    const crisis = checkCrisis(question);
    if (crisis.isCrisis) {
      return NextResponse.json(
        { error: "위기_감지", message: "안전 안내 화면으로 전환합니다." },
        { status: 200 }
      );
    }

    const result = drawCards(question, spreadType);

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
