import { NextRequest, NextResponse } from "next/server";
import { buildCardViewModels } from "@/lib/draw";
import { generateReading } from "@/lib/reading";
import { checkCrisis } from "@/lib/crisisDetector";
import type { DrawResult } from "@/types/tarot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증
    const question = String(body?.question ?? "").slice(0, 300).trim();
    if (!question) {
      return NextResponse.json({ error: "질문이 누락되었습니다." }, { status: 400 });
    }

    // 위기 키워드 이중 검증
    const crisis = checkCrisis(question);
    if (crisis.isCrisis) {
      return NextResponse.json(
        { error: "위기_감지" },
        { status: 200 }
      );
    }

    // DrawResult 유효성 확인 (OWASP A08 신뢰 오류 방지: 클라이언트 데이터 맹신 금지)
    const drawResult = body?.drawResult as DrawResult | undefined;
    if (!drawResult?.sessionId || !drawResult?.cards || !Array.isArray(drawResult.cards)) {
      return NextResponse.json({ error: "드로우 결과가 올바르지 않습니다." }, { status: 400 });
    }

    // 카드 수 제한 검증
    if (drawResult.cards.length < 1 || drawResult.cards.length > 10) {
      return NextResponse.json({ error: "카드 수가 올바르지 않습니다." }, { status: 400 });
    }

    const cardVMs = buildCardViewModels(drawResult);
    const readingInput = {
      sessionId: drawResult.sessionId,
      question,
      spreadType: drawResult.spreadType,
      cards: cardVMs,
    };

    const output = await generateReading(readingInput);

    return NextResponse.json(output, { status: 200 });
  } catch (err) {
    console.error("리딩 생성 오류:", err);
    return NextResponse.json({ error: "리딩 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
