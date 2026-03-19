"use client";

import React from "react";

/**
 * 위기 키워드 감지 시 표시되는 안전 안내 화면
 * 한국 기준 위기상담 번호 포함
 */
export default function CrisisBanner({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 p-6">
      <div className="max-w-lg w-full bg-gray-900 rounded-2xl border border-red-500/50 p-8 shadow-2xl text-center">
        <div className="text-5xl mb-4">🆘</div>
        <h2 className="text-2xl font-bold text-red-400 mb-3">
          지금 많이 힘드신가요?
        </h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          당신의 감정이 매우 중요합니다. 혼자 감당하기 어려울 때는
          전문가의 도움을 받으세요. 당신은 혼자가 아닙니다.
        </p>

        <div className="space-y-3 mb-8">
          <a
            href="tel:1393"
            className="flex items-center justify-between bg-red-900/40 hover:bg-red-900/60 border border-red-500/40 rounded-xl px-5 py-4 text-left transition-colors"
          >
            <div>
              <div className="text-red-300 font-semibold text-lg">📞 1393</div>
              <div className="text-gray-400 text-sm">
                자살예방상담전화 (24시간, 무료)
              </div>
            </div>
            <span className="text-red-400 text-xl">→</span>
          </a>

          <a
            href="tel:1577-0199"
            className="flex items-center justify-between bg-orange-900/30 hover:bg-orange-900/50 border border-orange-500/40 rounded-xl px-5 py-4 text-left transition-colors"
          >
            <div>
              <div className="text-orange-300 font-semibold text-lg">
                📞 1577-0199
              </div>
              <div className="text-gray-400 text-sm">
                정신건강위기상담전화 (24시간)
              </div>
            </div>
            <span className="text-orange-400 text-xl">→</span>
          </a>

          <a
            href="tel:119"
            className="flex items-center justify-between bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-500/40 rounded-xl px-5 py-4 text-left transition-colors"
          >
            <div>
              <div className="text-yellow-300 font-semibold text-lg">
                📞 119 / 112
              </div>
              <div className="text-gray-400 text-sm">
                응급상황 즉시 신고 (위급 시)
              </div>
            </div>
            <span className="text-yellow-400 text-xl">→</span>
          </a>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          타로 리딩보다 지금 당신의 안전이 먼저입니다.
          안전하다고 느껴지면 언제든 다시 돌아오세요.
        </p>

        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-400 transition-colors text-sm"
        >
          ← 돌아가기
        </button>
      </div>
    </div>
  );
}
