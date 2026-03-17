"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { SpreadType } from "@/types/tarot";
import { checkCrisis } from "@/lib/crisisDetector";
import { recommendSpread } from "@/lib/spreadConfig";
import { drawCards } from "@/lib/draw";
import { saveDrawResult } from "@/lib/session";
import CrisisBanner from "@/components/CrisisBanner";

const SPREAD_OPTIONS: {
  value: SpreadType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "three",
    label: "3카드 스프레드",
    description: "과거·현재·미래 — 간결하고 명쾌한 통찰",
    icon: "🃏",
  },
  {
    value: "celtic",
    label: "켈틱 크로스",
    description: "10장으로 상황 전체를 깊게 탐색",
    icon: "✦",
  },
  {
    value: "auto",
    label: "추천 (자동)",
    description: "질문을 분석해 최적의 스프레드를 선택",
    icon: "🔮",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType>("auto");
  const [showCrisis, setShowCrisis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = question.trim();
    if (!trimmed) {
      setError("질문을 입력해 주세요.");
      return;
    }

    // 위기 키워드 감지
    const crisis = checkCrisis(trimmed);
    if (crisis.isCrisis) {
      setShowCrisis(true);
      return;
    }

    setLoading(true);
    setError("");

    // 클라이언트에서 드로우 + 저장 후 셔플 화면으로 이동
    const result = drawCards(trimmed, spreadType);
    saveDrawResult(result);

    router.push(`/shuffle?sessionId=${result.sessionId}`);
  };

  // 추천 스프레드 미리보기
  const previewSpread = spreadType === "auto" && question.trim()
    ? recommendSpread(question.trim())
    : null;

  return (
    <>
      {showCrisis && <CrisisBanner onBack={() => setShowCrisis(false)} />}

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* 로고 / 타이틀 */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="text-6xl mb-4 animate-float">🌙</div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-mystic-300 via-purple-200 to-gold-400 bg-clip-text text-transparent mb-3">
            타로 상담
          </h1>
          <p className="text-mystic-400 text-lg">
            78장의 카드가 당신의 질문에 답합니다
          </p>
        </div>

        {/* 의식 안내 */}
        <div className="max-w-md w-full mb-6 text-center animate-slide-up">
          <p className="text-gray-400 text-sm leading-relaxed bg-mystic-950/60 border border-mystic-800/40 rounded-xl px-5 py-4">
            ✨ 질문에 집중하며 마음을 고요히 하세요.
            <br />
            타로는 현재의 에너지와 흐름을 보여주는 거울입니다.
          </p>
        </div>

        {/* 메인 폼 */}
        <form
          onSubmit={handleSubmit}
          className="max-w-xl w-full space-y-6 animate-slide-up"
        >
          {/* 질문 입력 */}
          <div>
            <label
              htmlFor="question"
              className="block text-mystic-300 text-sm font-medium mb-2"
            >
              질문을 입력하세요
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setError("");
              }}
              placeholder="예: 지금 제 관계의 흐름이 어떤가요? / 이 선택을 해도 될까요?"
              rows={3}
              maxLength={300}
              className="w-full bg-gray-900/80 border border-mystic-700/50 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-mystic-400/80 focus:ring-1 focus:ring-mystic-400/30 resize-none text-sm leading-relaxed transition-colors"
            />
            <div className="flex justify-between items-center mt-1">
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <p className="text-gray-600 text-xs ml-auto">
                {question.length}/300
              </p>
            </div>
          </div>

          {/* 스프레드 선택 */}
          <div>
            <label className="block text-mystic-300 text-sm font-medium mb-3">
              스프레드 선택
            </label>
            <div className="grid gap-3">
              {SPREAD_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    spreadType === opt.value
                      ? "border-mystic-400/70 bg-mystic-900/40"
                      : "border-gray-700/50 bg-gray-900/30 hover:border-mystic-700/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="spread"
                    value={opt.value}
                    checked={spreadType === opt.value}
                    onChange={() => setSpreadType(opt.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{opt.label}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{opt.description}</div>
                    {opt.value === "auto" && previewSpread && (
                      <div className="text-mystic-400 text-xs mt-1">
                        → 추천:{" "}
                        {previewSpread === "three"
                          ? "3카드 스프레드"
                          : "켈틱 크로스"}
                      </div>
                    )}
                  </div>
                  {spreadType === opt.value && (
                    <span className="ml-auto text-mystic-400 flex-shrink-0">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="w-full py-4 rounded-xl font-semibold text-base transition-all bg-gradient-to-r from-mystic-700 to-mystic-600 hover:from-mystic-600 hover:to-mystic-500 text-white shadow-lg shadow-mystic-900/50 hover:shadow-mystic-700/40 disabled:opacity-40 disabled:cursor-not-allowed border border-mystic-500/30"
          >
            {loading ? "준비 중..." : "🔮 카드 뽑기 시작"}
          </button>
        </form>

        {/* 하단 안내 */}
        <p className="mt-8 text-gray-600 text-xs text-center max-w-sm">
          세션은 브라우저 로컬 저장소에 보관됩니다.
          타인과 공유하지 않으며 서버에 전송되지 않습니다.
        </p>
      </div>
    </>
  );
}
