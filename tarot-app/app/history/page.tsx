"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionHistoryItem } from "@/types/tarot";
import { loadHistory, deleteSession } from "@/lib/session";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setLoaded(true);
  }, []);

  const handleDelete = (sessionId: string) => {
    deleteSession(sessionId);
    setHistory((prev) => prev.filter((h) => h.sessionId !== sessionId));
  };

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← 홈
        </button>
        <h1 className="text-2xl font-bold text-white">📚 상담 기록</h1>
      </div>

      {!loaded ? (
        <div className="text-center text-mystic-400 animate-pulse py-16">
          로딩 중...
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌑</div>
          <p className="text-gray-400">저장된 상담 기록이 없습니다.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2.5 rounded-xl bg-mystic-800 hover:bg-mystic-700 text-white transition-colors"
          >
            새 상담 시작
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.sessionId}
              className="bg-gray-900/60 border border-mystic-800/30 rounded-xl px-5 py-4 flex items-start gap-4 hover:border-mystic-600/40 transition-colors group"
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => router.push(`/reading/${item.sessionId}`)}
              >
                <p className="text-white font-medium text-sm leading-snug group-hover:text-mystic-200 transition-colors">
                  &ldquo;{item.question}&rdquo;
                </p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>
                    {item.spreadType === "three"
                      ? "🃏 3카드"
                      : "✦ 켈틱 크로스"}
                  </span>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.sessionId);
                }}
                className="text-gray-600 hover:text-red-400 text-xs transition-colors px-2 py-1 rounded hover:bg-red-900/20 flex-shrink-0"
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          ))}

          <p className="text-center text-gray-600 text-xs pt-4">
            최근 {history.length}개 세션 (최대 50개 보관)
          </p>
        </div>
      )}
    </div>
  );
}
