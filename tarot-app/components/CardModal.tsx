"use client";

import React from "react";
import type { CardViewModel } from "@/types/tarot";
import TarotCardImage from "@/components/TarotCardImage";

interface CardModalProps {
  cardVM: CardViewModel;
  onClose: () => void;
}

export default function CardModal({ cardVM, onClose }: CardModalProps) {
  const { card, upright, displayName, keywords, meaning, positionNameKo, positionDescriptionKo } =
    cardVM;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900/95 border border-mystic-500/40 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-mystic-900/50 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-gray-900/95 border-b border-mystic-700/30 px-6 pt-5 pb-4 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700/50 transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>

          <div className="text-center">
            <span className="text-xs text-mystic-400 bg-mystic-900/50 px-2 py-0.5 rounded-full border border-mystic-700/40">
              {positionNameKo}
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white">{card.name_ko}</h2>
            <p className="text-sm text-gray-400">{card.name_en}</p>
            <span
              className={`inline-block mt-1 text-sm font-semibold px-3 py-0.5 rounded-full border ${
                upright
                  ? "text-gold-400 border-gold-600/50 bg-gold-900/20"
                  : "text-red-400 border-red-600/50 bg-red-900/20"
              }`}
            >
              {upright ? "⬆ 정방향" : "⬇ 역방향"}
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-mystic-700/30 bg-black/30">
            <TarotCardImage
              nameKo={card.name_ko}
              alt={displayName}
              upright={upright}
              className="h-80 w-full"
              imageClassName="object-contain bg-black/30"
            />
          </div>

          {/* 포지션 설명 */}
          <div className="bg-mystic-900/30 rounded-xl p-4 border border-mystic-700/20">
            <h3 className="text-mystic-300 text-xs font-semibold mb-1 uppercase tracking-wider">
              포지션 의미
            </h3>
            <p className="text-gray-300 text-sm">{positionDescriptionKo}</p>
          </div>

          {/* 키워드 */}
          <div>
            <h3 className="text-mystic-300 text-xs font-semibold mb-2 uppercase tracking-wider">
              키워드
            </h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-sm px-3 py-1 rounded-full bg-mystic-800/50 border border-mystic-600/40 text-mystic-200"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* 의미 */}
          <div>
            <h3 className="text-mystic-300 text-xs font-semibold mb-2 uppercase tracking-wider">
              {upright ? "정방향 의미" : "역방향 의미"}
            </h3>
            <p className="text-gray-200 leading-relaxed text-sm">{meaning}</p>
          </div>

          {/* 비주얼 모티프 */}
          <div>
            <h3 className="text-mystic-300 text-xs font-semibold mb-2 uppercase tracking-wider">
              이미지 모티프
            </h3>
            <div className="flex flex-wrap gap-2">
              {card.visual_motifs.map((m) => (
                <span
                  key={m}
                  className="text-xs px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/40 text-gray-300"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* 색상 상징 */}
          <div>
            <h3 className="text-mystic-300 text-xs font-semibold mb-2 uppercase tracking-wider">
              색상 상징
            </h3>
            <div className="flex flex-wrap gap-2">
              {card.color_symbols.map((cs) => {
                const [color, sym] = cs.split("=");
                return (
                  <span
                    key={cs}
                    className="text-xs px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/40 text-gray-300"
                  >
                    <span className="text-gold-400 font-medium">{color}</span>: {sym}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 두 방향 모두 */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700/30">
            <div>
              <h3 className="text-green-400 text-xs font-semibold mb-1">⬆ 정방향 키워드</h3>
              <p className="text-gray-400 text-xs">{card.keywords_upright.join(", ")}</p>
            </div>
            <div>
              <h3 className="text-red-400 text-xs font-semibold mb-1">⬇ 역방향 키워드</h3>
              <p className="text-gray-400 text-xs">{card.keywords_reversed.join(", ")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
