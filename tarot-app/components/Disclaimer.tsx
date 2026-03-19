"use client";

import React from "react";

/** 화면 하단 항상 표시 면책 문구 */
export default function Disclaimer() {
  return (
    <footer className="w-full bg-mystic-950/80 border-t border-mystic-700/40 mt-auto py-3 px-4 text-center text-xs text-mystic-300 backdrop-blur-sm">
      ⚠️&nbsp;본 서비스는&nbsp;
      <strong>오락 및 자기성찰 목적</strong>으로만 제공됩니다. 중요한 결정은
      반드시 전문가와 상의하세요. 타로 리딩은 미래를 확정적으로 예언하지
      않습니다.
    </footer>
  );
}
