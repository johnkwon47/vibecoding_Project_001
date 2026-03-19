"use client";

import React, { useState } from "react";
import type { CardViewModel } from "@/types/tarot";
import CardTile from "@/components/CardTile";
import CardModal from "@/components/CardModal";

interface CelticCrossSpreadProps {
  cards: CardViewModel[]; // 10장
}

/**
 * 켈틱 크로스 레이아웃
 *
 * 중앙 크로스 (인덱스 0~5):
 *   [4] 의식(상단)
 *   [3] 과거(좌) + [0] 현재/[1] 도전(중) + [5] 가까운미래(우)
 *   [2] 근본(하단)
 *
 * 우측 세로 컬럼 (인덱스 6~9, 아래서 위):
 *   [9] 결과 (상단)
 *   [8] 희망/두려움
 *   [7] 외부
 *   [6] 나/태도 (하단)
 */
export default function CelticCrossSpread({ cards }: CelticCrossSpreadProps) {
  const [selectedCard, setSelectedCard] = useState<CardViewModel | null>(null);

  const c = cards; // 인덱스 편의

  return (
    <>
      <div className="flex gap-6 items-start justify-center flex-wrap">
        {/* 좌측: 크로스 레이아웃 */}
        <div className="relative" style={{ width: 360, height: 440 }}>
          {/* 4번: 의식(상단 중앙) */}
          <CardPosition top={0} left={140} card={c[4]} onSelect={setSelectedCard} />

          {/* 3번: 과거(중간 좌) */}
          <CardPosition top={145} left={0} card={c[3]} onSelect={setSelectedCard} />

          {/* 0번: 현재(중앙) */}
          <CardPosition top={145} left={140} card={c[0]} onSelect={setSelectedCard} />

          {/* 1번: 도전(중앙 위에 살짝 겹침 - 가로) */}
          <CardPosition top={158} left={152} card={c[1]} onSelect={setSelectedCard} rotate />

          {/* 5번: 가까운미래(중간 우) */}
          <CardPosition top={145} left={280} card={c[5]} onSelect={setSelectedCard} />

          {/* 2번: 근본(하단 중앙) */}
          <CardPosition top={290} left={140} card={c[2]} onSelect={setSelectedCard} />
        </div>

        {/* 우측: 세로 컬럼 (아래서 위: 6→7→8→9) */}
        <div className="flex flex-col-reverse gap-2">
          {[c[6], c[7], c[8], c[9]].map((card) => (
            <div key={card.positionIndex} className="flex items-center gap-2">
              <span className="text-mystic-400 text-[11px] w-20 text-right leading-tight">
                {card.positionNameKo}
              </span>
              <CardTile
                cardVM={card}
                revealed={true}
                size="sm"
                onClick={() => setSelectedCard(card)}
              />
            </div>
          ))}
        </div>
      </div>

      <p className="text-mystic-500 text-xs text-center mt-2">
        카드를 클릭하면 상세 정보를 볼 수 있습니다
      </p>

      {selectedCard && (
        <CardModal cardVM={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}

interface CardPositionProps {
  top: number;
  left: number;
  card: CardViewModel;
  onSelect: (c: CardViewModel) => void;
  rotate?: boolean;
}

function CardPosition({ top, left, card, onSelect, rotate }: CardPositionProps) {
  return (
    <div
      className="absolute flex flex-col items-center gap-1"
      style={{ top, left }}
    >
      <CardTile
        cardVM={card}
        revealed={true}
        size="sm"
        onClick={() => onSelect(card)}
        className={rotate ? "rotate-90" : ""}
      />
      {!rotate && (
        <span className="text-[10px] text-mystic-400 w-20 text-center leading-tight">
          {card.positionNameKo}
        </span>
      )}
    </div>
  );
}
