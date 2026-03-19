"use client";

import React, { useRef, useState, useCallback } from "react";
import type { CardViewModel, ReadingOutput } from "@/types/tarot";
import { getTarotImageCandidates } from "@/lib/cardImages";

interface DownloadReadingButtonProps {
  cards: CardViewModel[];
  reading: ReadingOutput;
  question: string;
  spreadName: string;
}

/** 마크다운 기호 제거 후 섹션 구분선으로 정리 */
function markdownToPlainText(md: string): string {
  return md
    .replace(/^##\s+/gm, "\n─────────────────────────────\n")
    .replace(/^###\s+/gm, "\n▸ ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/^>\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function DownloadReadingButton({
  cards,
  reading,
  question,
  spreadName,
}: DownloadReadingButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || downloading) return;
    setDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;

      /* 캡처 직전 잠깐 visible 처리 (렌더링 완료 보장) */
      const el = captureRef.current;
      el.style.left = "0px";
      el.style.top = "0px";
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.visibility = "visible";

      /* 이미지가 모두 로드될 때까지 대기 */
      const imgs = el.querySelectorAll<HTMLImageElement>("img");
      await Promise.allSettled(
        Array.from(imgs).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );

      const canvas = await html2canvas(el, {
        backgroundColor: "#0d0b1a",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      /* 다시 숨김 */
      el.style.position = "fixed";
      el.style.left = "-9999px";
      el.style.top = "-9999px";
      el.style.visibility = "hidden";

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `tarot-reading-${dateStr}.png`;
      link.click();
    } catch (err) {
      console.error("이미지 저장 실패:", err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  const plainText = markdownToPlainText(reading.markdown);

  return (
    <>
      {/* ── 다운로드 버튼 ── */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="px-5 py-2.5 rounded-xl border border-amber-700/50 hover:border-amber-500/70 text-amber-400 hover:text-amber-200 text-sm transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        {downloading ? "⏳ 저장 중..." : "🖼️ 이미지 저장"}
      </button>

      {/* ── 캡처 타겟 (화면 밖) ── */}
      <div
        ref={captureRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: "-9999px",
          visibility: "hidden",
          width: "820px",
          backgroundColor: "#0d0b1a",
          padding: "48px 40px",
          fontFamily:
            "'Noto Sans KR', 'Apple SD Gothic Neo', 'sans-serif'",
          color: "#e2e8f0",
          boxSizing: "border-box",
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.25em",
              color: "#a78bfa",
              marginBottom: "12px",
            }}
          >
            ✦ TAROT READING ✦
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#7c6fa8",
              marginBottom: "6px",
            }}
          >
            {spreadName}
          </div>
          <div
            style={{
              display: "inline-block",
              fontSize: "18px",
              fontWeight: "700",
              color: "#f1f5f9",
              borderBottom: "1px solid rgba(139,92,246,0.35)",
              paddingBottom: "8px",
              maxWidth: "680px",
            }}
          >
            &ldquo;{question}&rdquo;
          </div>
        </div>

        {/* 카드 이미지 행 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: cards.length > 3 ? "10px" : "20px",
            marginBottom: "36px",
            flexWrap: cards.length > 6 ? "wrap" : "nowrap",
          }}
        >
          {cards.map((card) => {
            const candidates = getTarotImageCandidates(card.card.name_ko);
            return (
              <div
                key={card.positionIndex}
                style={{ textAlign: "center", flexShrink: 0 }}
              >
                <div
                  style={{
                    width: cards.length > 7 ? "68px" : cards.length > 3 ? "80px" : "100px",
                    height: cards.length > 7 ? "110px" : cards.length > 3 ? "128px" : "160px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(139,92,246,0.45)",
                    backgroundColor: "#1a1030",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={candidates[0]}
                    alt={card.displayName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transform: card.upright ? "none" : "rotate(180deg)",
                    }}
                    crossOrigin="anonymous"
                  />
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#a78bfa",
                    marginTop: "5px",
                  }}
                >
                  {card.positionNameKo}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#e2e8f0",
                    marginTop: "2px",
                    maxWidth: "90px",
                    wordBreak: "keep-all",
                  }}
                >
                  {card.displayName}
                  {!card.upright && (
                    <span style={{ color: "#f87171" }}> (역)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI 리딩 본문 */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "12px",
            padding: "28px 32px",
            fontSize: "12.5px",
            lineHeight: "1.9",
            color: "#cbd5e1",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {plainText}
        </div>

        {/* 푸터 */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "10px",
            color: "#4b5563",
            letterSpacing: "0.1em",
          }}
        >
          ✦ Generated by Tarot App ✦
        </div>
      </div>
    </>
  );
}
