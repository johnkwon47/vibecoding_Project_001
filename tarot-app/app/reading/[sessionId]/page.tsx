"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { CardViewModel, DrawResult, ReadingOutput } from "@/types/tarot";
import { loadDrawResult } from "@/lib/session";
import { buildCardViewModels } from "@/lib/draw";
import ThreeCardSpread from "@/components/ThreeCardSpread";
import CelticCrossSpread from "@/components/CelticCrossSpread";
import ReadingViewer from "@/components/ReadingViewer";
import DownloadReadingButton from "@/components/DownloadReadingButton";

/** /api/read 호출 → 실패 시 템플릿 폴백 */
async function fetchReading(drawResult: DrawResult): Promise<ReadingOutput> {
  try {
    const res = await fetch("/api/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: drawResult.question,
        drawResult,
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json() as ReadingOutput;
    if (!data.markdown) throw new Error("빈 응답");
    return data;
  } catch (err) {
    console.warn("API 리딩 실패, 템플릿으로 폴백:", err);
    const { buildCardViewModels: buildVMs } = await import("@/lib/draw");
    const { generateTemplateReading } = await import("@/lib/reading");
    const cardVMs = buildVMs(drawResult);
    const markdown = generateTemplateReading({
      sessionId: drawResult.sessionId,
      question: drawResult.question,
      spreadType: drawResult.spreadType,
      cards: cardVMs,
    });
    return { markdown, generatedBy: "template" };
  }
}

type Phase = "spread" | "reading";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/^[-*]\s+/gm, "")
    .trim();
}

function extractSection(markdown: string, headingPattern: RegExp): string {
  const lines = markdown.split("\n");
  const startIndex = lines.findIndex((line) => headingPattern.test(line.trim()));
  if (startIndex === -1) return "";

  const sectionLines: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s+/.test(line.trim())) break;
    sectionLines.push(line);
  }

  return stripMarkdown(sectionLines.join("\n"));
}

function extractFirstSentence(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  const match = compact.match(/^(.{1,120}?[.!?]|.{1,120}?다\.)/);
  return (match?.[1] ?? compact.slice(0, 120)).trim();
}

function buildReadingHighlights(markdown: string): { oneLineAdvice: string; keywords: string[] } {
  const keywordsSection = extractSection(markdown, /^##\s*(?:2\)\s*✨\s*핵심\s*키워드|✨\s*핵심\s*키워드)/);
  const overallSection = extractSection(markdown, /^##\s*(?:4\)\s*🌊\s*전체\s*해석|🌊\s*전체\s*스토리)/);
  const actionsSection = extractSection(markdown, /^##\s*(?:5\)\s*🚀\s*행동\s*제안|🚀\s*행동\s*제안)/);

  const rawKeywords = keywordsSection
    .split(/\n|·|,/)
    .map((item) => item.replace(/["'""'']/g, "").trim())
    .filter(Boolean);

  const uniqueKeywords = Array.from(new Set(rawKeywords)).slice(0, 3);

  // > **요약:** 마커 우선, 없으면 첫 문장 추출
  const summaryMarkerMatch = overallSection.match(/요약[:\s]+(.{10,150})/);
  const oneLineAdvice = summaryMarkerMatch
    ? summaryMarkerMatch[1].replace(/\*\*/g, "").trim()
    : (extractFirstSentence(overallSection) || extractFirstSentence(actionsSection));

  return {
    oneLineAdvice: oneLineAdvice || "리딩의 흐름을 바탕으로 오늘 실천 가능한 작은 행동부터 시작해 보세요.",
    keywords: uniqueKeywords,
  };
}

export default function ReadingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [cardVMs, setCardVMs] = useState<CardViewModel[]>([]);
  const [reading, setReading] = useState<ReadingOutput | null>(null);
  const [phase, setPhase] = useState<Phase>("spread");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [readingLoading, setReadingLoading] = useState(false);

  // 세션 로드
  useEffect(() => {
    if (!sessionId) return;
    const result = loadDrawResult(sessionId);
    if (!result) {
      setError("세션을 찾을 수 없습니다. 새로 시작해 주세요.");
      return;
    }
    setDrawResult(result);
    try {
      const vms = buildCardViewModels(result);
      setCardVMs(vms);
    } catch (e) {
      console.error("카드 뷰모델 생성 실패:", e);
      setError("카드 데이터를 불러오는 중 오류가 발생했습니다. 새로 시작해 주세요.");
    }
  }, [sessionId]);

  // 리딩 생성
  const generateReading = useCallback(async () => {
    if (!drawResult || cardVMs.length === 0) return;
    setReadingLoading(true);
    try {
      const output = await fetchReading(drawResult);
      setReading(output);
      setPhase("reading");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("리딩 생성 실패:", e);
      setError("리딩 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setReadingLoading(false);
    }
  }, [drawResult, cardVMs]);

  // 복사
  const handleCopy = async () => {
    if (!reading) return;
    try {
      await navigator.clipboard.writeText(reading.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 실패 시 무시
    }
  };

  // 훅은 조기 return 전에 모두 선언 (Rules of Hooks)
  const spreadName =
    drawResult?.spreadType === "three" ? "3카드 스프레드" : "켈틱 크로스";
  const readingHighlights = useMemo(
    () => (reading ? buildReadingHighlights(reading.markdown) : null),
    [reading]
  );

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
        <div className="text-5xl">🌑</div>
        <p className="text-red-400 text-center">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 rounded-lg bg-mystic-800 hover:bg-mystic-700 text-white transition-colors"
        >
          처음으로
        </button>
      </div>
    );
  }

  if (!drawResult || cardVMs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-mystic-400 animate-pulse">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      {/* 헤더 */}
      <div className="text-center mb-8 animate-fade-in max-w-4xl mx-auto">
        <span className="text-xs text-mystic-400 bg-mystic-900/40 border border-mystic-700/30 px-3 py-1 rounded-full">
          {spreadName}
        </span>
        <h1 className="mt-3 text-2xl md:text-3xl font-bold text-white">
          &ldquo;{drawResult.question}&rdquo;
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          {new Date(drawResult.createdAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* 읽기 단계 - 2컬럼 레이아웃 또는 기본 레이아웃 */}
      {phase === "reading" && reading ? (
        <div className="mx-auto max-w-7xl md:grid md:grid-cols-2 md:items-start md:gap-6">
          {/* 왼쪽: 고정 카드 (모바일 숨김, md 이상에서 표시) */}
          <div className="hidden md:block min-w-0">
            <div className="sticky top-10 space-y-4">
              <div className="bg-gray-900/50 border border-mystic-800/30 rounded-2xl p-6 animate-slide-up overflow-x-auto">
                {drawResult.spreadType === "three" ? (
                  <ThreeCardSpread cards={cardVMs} />
                ) : (
                  <CelticCrossSpread cards={cardVMs} />
                )}
              </div>

              {readingHighlights && (
                <div className="mt-4 bg-mystic-950/40 border border-mystic-700/30 rounded-2xl p-4">
                  <p className="text-xs text-mystic-300 mb-2">한줄 조언</p>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    &ldquo;{readingHighlights.oneLineAdvice}&rdquo;
                  </p>

                  <div className="mt-4">
                    <p className="text-xs text-mystic-300 mb-2">키워드</p>
                    <div className="flex flex-wrap gap-2">
                      {readingHighlights.keywords.length > 0 ? (
                        readingHighlights.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="text-xs px-2.5 py-1 rounded-full border border-mystic-600/40 bg-mystic-900/40 text-mystic-100"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">리딩에서 키워드를 추출하지 못했습니다.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 리딩 콘텐츠 (스크롤 가능) */}
          <div className="min-w-0 md:w-full">
            {/* 모바일용 카드 표시 */}
            <div className="md:hidden bg-gray-900/50 border border-mystic-800/30 rounded-2xl p-6 mb-6 animate-slide-up overflow-x-auto">
              {drawResult.spreadType === "three" ? (
                <ThreeCardSpread cards={cardVMs} />
              ) : (
                <CelticCrossSpread cards={cardVMs} />
              )}
            </div>

            {readingHighlights && (
              <div className="md:hidden mb-6 bg-mystic-950/40 border border-mystic-700/30 rounded-2xl p-4">
                <p className="text-xs text-mystic-300 mb-2">한줄 조언</p>
                <p className="text-sm text-gray-200 leading-relaxed">
                  &ldquo;{readingHighlights.oneLineAdvice}&rdquo;
                </p>

                <div className="mt-4">
                  <p className="text-xs text-mystic-300 mb-2">키워드</p>
                  <div className="flex flex-wrap gap-2">
                    {readingHighlights.keywords.length > 0 ? (
                      readingHighlights.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="text-xs px-2.5 py-1 rounded-full border border-mystic-600/40 bg-mystic-900/40 text-mystic-100"
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">리딩에서 키워드를 추출하지 못했습니다.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 액션 버튼 영역 */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleCopy}
                className="px-5 py-2.5 rounded-xl border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white text-sm transition-colors"
              >
                {copied ? "✓ 복사됨" : "📋 마크다운 복사"}
              </button>

              <DownloadReadingButton
                cards={cardVMs}
                reading={reading}
                question={drawResult.question}
                spreadName={spreadName}
              />

              <button
                onClick={() => router.push("/")}
                className="px-5 py-2.5 rounded-xl border border-mystic-700/50 hover:border-mystic-500/70 text-mystic-300 hover:text-mystic-100 text-sm transition-colors"
              >
                🔮 다시 뽑기
              </button>

              <button
                onClick={() => router.push("/history")}
                className="px-5 py-2.5 rounded-xl border border-gray-700/50 hover:border-gray-500/50 text-gray-400 hover:text-gray-200 text-sm transition-colors"
              >
                📚 기록 보기
              </button>
            </div>

            {/* 리딩 결과 */}
            <ReadingViewer reading={reading} />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* 스프레드 단계 - 기본 레이아웃 */}
          <div className="bg-gray-900/50 border border-mystic-800/30 rounded-2xl p-6 mb-8 animate-slide-up overflow-x-auto">
            {drawResult.spreadType === "three" ? (
              <ThreeCardSpread cards={cardVMs} />
            ) : (
              <CelticCrossSpread cards={cardVMs} />
            )}
          </div>

          {/* 액션 버튼 영역 */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {phase === "spread" && (
              <button
                onClick={generateReading}
                disabled={readingLoading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-mystic-700 to-mystic-600 hover:from-mystic-600 hover:to-mystic-500 text-white font-semibold shadow-lg shadow-mystic-900/40 transition-all border border-mystic-500/30 disabled:opacity-50 disabled:cursor-wait"
              >
                {readingLoading ? "✨ AI 리딩 생성 중..." : "📖 리딩 보기"}
              </button>
            )}

            <button
              onClick={() => router.push("/")}
              className="px-5 py-2.5 rounded-xl border border-mystic-700/50 hover:border-mystic-500/70 text-mystic-300 hover:text-mystic-100 text-sm transition-colors"
            >
              🔮 다시 뽑기
            </button>

            <button
              onClick={() => router.push("/history")}
              className="px-5 py-2.5 rounded-xl border border-gray-700/50 hover:border-gray-500/50 text-gray-400 hover:text-gray-200 text-sm transition-colors"
            >
              📚 기록 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
