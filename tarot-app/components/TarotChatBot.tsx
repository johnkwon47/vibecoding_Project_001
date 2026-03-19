"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { CardViewModel, ReadingOutput } from "@/types/tarot";
import type { ChatMessage } from "@/app/api/chat/route";

interface TarotChatBotProps {
  cards: CardViewModel[];
  reading: ReadingOutput;
  question: string;
  spreadType: string;
}

const SUGGESTED_QUESTIONS = [
  "이 카드들이 전하는 핵심 메시지를 한 문장으로 요약해 주세요.",
  "역방향 카드의 의미를 더 자세히 설명해 주세요.",
  "제가 지금 당장 실천할 수 있는 구체적인 행동이 있을까요?",
  "이 상황에서 가장 주의해야 할 점은 무엇인가요?",
  "카드들 사이의 연결고리를 더 깊이 설명해 주세요.",
];

export default function TarotChatBot({
  cards,
  reading,
  question,
  spreadType,
}: TarotChatBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 챗봇이 열릴 때 웰컴 메시지 초기화
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `안녕하세요. 리딩을 바탕으로 심층 상담을 진행하겠습니다.\n\n**"${question}"** 에 대해 ${cards.length}장의 카드가 드로우되었습니다. 리딩에서 더 알고 싶은 부분이나 궁금한 점을 자유롭게 질문해 주십시오.`,
        },
      ]);
    }
  }, [open, messages.length, question, cards.length]);

  // 새 메시지 도착 시 스크롤
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            context: {
              question,
              spreadType,
              cards: cards.map((c) => ({
                positionNameKo: c.positionNameKo,
                displayName: c.displayName,
                keywords: c.keywords,
                meaning: c.meaning,
                upright: c.upright,
              })),
              readingMarkdown: reading.markdown,
            },
          }),
        });

        const data = await res.json();

        if (data.error === "위기_감지") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "지금 많이 힘드신 것 같습니다. 전문 상담 기관에 연락하시면 도움을 받으실 수 있습니다.\n\n**정신건강 위기상담 전화: 1577-0199** (24시간)\n**자살예방상담전화: 1393** (24시간)",
            },
          ]);
          return;
        }

        if (!res.ok || data.error) {
          throw new Error(data.error ?? "알 수 없는 오류");
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "응답 생성 중 오류가 발생했습니다.";
        setError(msg);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [loading, messages, question, spreadType, cards, reading.markdown]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="mt-8">
      {/* ── 챗봇 토글 버튼 ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-mystic-600/40 bg-mystic-900/30 hover:bg-mystic-800/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔮</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-mystic-100">
              AI 상담사와 대화하기
            </p>
            <p className="text-xs text-mystic-400 mt-0.5">
              리딩 결과에 대해 더 깊이 탐색하고 싶은 것이 있으신가요?
            </p>
          </div>
        </div>
        <span
          className={`text-mystic-400 text-lg transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {/* ── 챗봇 패널 ── */}
      {open && (
        <div className="mt-3 rounded-2xl border border-mystic-700/40 bg-gray-900/80 overflow-hidden animate-fade-in">
          {/* 카드 컨텍스트 뱃지 */}
          <div className="px-4 py-2 border-b border-mystic-800/40 bg-mystic-950/50 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-mystic-500">컨텍스트:</span>
            {cards.map((c) => (
              <span
                key={c.positionIndex}
                className="text-xs px-2 py-0.5 rounded-full border border-mystic-700/40 bg-mystic-900/40 text-mystic-300"
              >
                {c.positionNameKo}: {c.displayName}
              </span>
            ))}
          </div>

          {/* 메시지 목록 */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-mystic-800 border border-mystic-600/50 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                    🔮
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-mystic-700/60 text-mystic-50 rounded-tr-sm"
                      : "bg-gray-800/80 border border-mystic-800/40 text-gray-200 rounded-tl-sm"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            ))}

            {/* 로딩 인디케이터 */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-mystic-800 border border-mystic-600/50 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                  🔮
                </div>
                <div className="bg-gray-800/80 border border-mystic-800/40 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-mystic-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-mystic-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-mystic-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="text-center">
                <span className="text-xs text-red-400 bg-red-950/30 border border-red-800/30 px-3 py-1.5 rounded-full">
                  ⚠️ {error}
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* 추천 질문 (첫 메시지 이후 or 초기) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full border border-mystic-700/50 bg-mystic-900/30 text-mystic-300 hover:border-mystic-500/70 hover:text-mystic-100 transition-colors disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* 입력창 */}
          <div className="border-t border-mystic-800/40 p-3 flex gap-2 items-end bg-mystic-950/30">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="리딩에 대해 더 궁금한 점을 물어보세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
              disabled={loading}
              rows={2}
              className="flex-1 resize-none bg-gray-800/60 border border-mystic-700/40 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-mystic-500/60 transition-colors disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-mystic-700/80 hover:bg-mystic-600/80 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? "..." : "전송"}
            </button>
          </div>

          {/* 면책 고지 */}
          <div className="px-4 py-2 border-t border-mystic-900/40 bg-mystic-950/20">
            <p className="text-xs text-gray-600 text-center">
              타로 상담은 자기 성찰의 도구입니다. 의료·법률·재정 전문 조언을 대체하지 않습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
