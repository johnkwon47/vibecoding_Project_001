"use client";

import React, { useState } from "react";
import type { CardViewModel } from "@/types/tarot";
import TarotCardImage from "@/components/TarotCardImage";

interface CardTileProps {
  cardVM: CardViewModel;
  revealed?: boolean;  // false = 뒷면, true = 앞면
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-20 h-32",
  md: "w-28 h-44",
  lg: "w-40 h-64",
};

export default function CardTile({
  cardVM,
  revealed = true,
  onClick,
  size = "md",
  className = "",
}: CardTileProps) {
  const [flipped, setFlipped] = useState(false);

  const isUpright = cardVM.upright;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setFlipped((f) => !f);
    }
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} cursor-pointer select-none flex-shrink-0`}
      style={{ perspective: "800px" }}
      onClick={handleClick}
      role="button"
      aria-label={revealed ? cardVM.displayName : "뒤집어 보기"}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: revealed ? "rotateY(0deg)" : "rotateY(180deg)",
        }}
      >
        {/* 앞면 */}
        <div
          className="absolute inset-0 overflow-hidden rounded-xl border border-mystic-400/30 shadow-lg hover:shadow-mystic-500/30 hover:border-mystic-300/60 transition-all"
          style={{ backfaceVisibility: "hidden" }}
        >
          <TarotCardImage
            nameKo={cardVM.card.name_ko}
            alt={cardVM.displayName}
            upright={isUpright}
            className="absolute inset-0"
          />

          <span
            className={`absolute right-1.5 top-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/65 backdrop-blur-sm ${isUpright ? "text-gold-300" : "text-red-300"}`}
          >
            {isUpright ? "정" : "역"}
          </span>
        </div>

        {/* 뒷면 */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-b from-mystic-900 to-mystic-950 border border-mystic-600/50 flex items-center justify-center shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-4xl opacity-60">✦</div>
        </div>
      </div>
    </div>
  );
}
