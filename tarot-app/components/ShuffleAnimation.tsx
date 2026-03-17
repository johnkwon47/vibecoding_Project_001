"use client";

import React, { useEffect, useState } from "react";

interface ShuffleAnimationProps {
  onComplete: () => void;
}

/** 셔플 애니메이션 컴포넌트 (1.8초 후 onComplete 호출) */
export default function ShuffleAnimation({ onComplete }: ShuffleAnimationProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1500);
    const t4 = setTimeout(() => onComplete(), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const messages = [
    "카드를 준비하고 있습니다...",
    "질문에 집중하며 셔플합니다...",
    "당신을 위한 카드를 뽑고 있습니다...",
    "준비 완료!",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
      {/* 떠있는 카드 덱 애니메이션 */}
      <div className="relative w-40 h-56">
        {[4, 3, 2, 1, 0].map((i) => (
          <div
            key={i}
            className={`absolute inset-0 rounded-xl bg-gradient-to-b from-mystic-800 to-mystic-950 border border-mystic-500/40 shadow-xl transition-all duration-500`}
            style={{
              transform: `translateX(${i * 2 - 4}px) translateY(${-i * 3}px) rotate(${(i - 2) * (phase >= 1 ? 8 : 2)}deg)`,
              opacity: 1 - i * 0.08,
              transitionDelay: `${i * 60}ms`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">
              ✦
            </div>
          </div>
        ))}

        {/* 글로우 효과 */}
        {phase >= 1 && (
          <div className="absolute inset-0 rounded-xl bg-mystic-500/10 animate-glow pointer-events-none" />
        )}
      </div>

      {/* 진행 메시지 */}
      <div className="text-center space-y-3">
        <p className="text-mystic-200 text-lg font-medium animate-pulse">
          {messages[phase]}
        </p>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= phase ? "bg-mystic-400" : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 의식 안내 문구 */}
      <div className="max-w-sm text-center">
        <p className="text-gray-500 text-sm leading-relaxed">
          눈을 감고 당신의 질문에 집중하세요.
          <br />
          마음이 준비되면 카드가 스스로 당신을 찾아올 것입니다.
        </p>
      </div>
    </div>
  );
}
