"use client";

import React, { useState } from "react";
import type { CardViewModel } from "@/types/tarot";
import CardTile from "@/components/CardTile";
import CardModal from "@/components/CardModal";

interface ThreeCardSpreadProps {
  cards: CardViewModel[]; // 3장
}

export default function ThreeCardSpread({ cards }: ThreeCardSpreadProps) {
  const [selectedCard, setSelectedCard] = useState<CardViewModel | null>(null);

  return (
    <>
      <div className="flex flex-col items-center gap-6">
        {/* 레이블 + 카드 그리드 */}
        <div className="flex items-end gap-4 md:gap-8 justify-center flex-wrap">
          {cards.map((cardVM) => (
            <div key={cardVM.positionIndex} className="flex flex-col items-center gap-2">
              <CardTile
                cardVM={cardVM}
                revealed={true}
                size="lg"
                onClick={() => setSelectedCard(cardVM)}
              />
              <span className="text-mystic-300 text-sm font-medium">
                {cardVM.positionNameKo}
              </span>
            </div>
          ))}
        </div>

        {/* 화살표 연결 */}
        <p className="text-mystic-500 text-xs mt-1">
          카드를 클릭하면 상세 정보를 볼 수 있습니다
        </p>
      </div>

      {selectedCard && (
        <CardModal cardVM={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}
