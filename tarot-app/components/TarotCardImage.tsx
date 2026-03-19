"use client";

import React, { useEffect, useState } from "react";
import { getTarotImageCandidates } from "@/lib/cardImages";

interface TarotCardImageProps {
  nameKo: string;
  alt: string;
  upright?: boolean;
  className?: string;
  imageClassName?: string;
}

export default function TarotCardImage({
  nameKo,
  alt,
  upright = true,
  className = "",
  imageClassName = "",
}: TarotCardImageProps) {
  const candidates = getTarotImageCandidates(nameKo);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [nameKo]);

  const src = candidates[candidateIndex];
  const exhausted = candidateIndex >= candidates.length;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-950 ${className}`}>
      {!exhausted && src ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-contain ${upright ? "" : "rotate-180"} ${imageClassName}`}
          loading="lazy"
          onError={() => setCandidateIndex((prev) => prev + 1)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-mystic-900 to-gray-950 text-center">
          <div>
            <div className="text-3xl opacity-70">✦</div>
            <div className="mt-2 px-3 text-xs text-mystic-300/70">{nameKo}</div>
          </div>
        </div>
      )}
    </div>
  );
}
