"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import type { ReadingOutput } from "@/types/tarot";

interface ReadingViewerProps {
  reading: ReadingOutput;
}

export default function ReadingViewer({ reading }: ReadingViewerProps) {

  return (
    <div className="bg-gray-900/60 border border-mystic-700/30 rounded-2xl p-6 animate-fade-in">
      {/* 생성 방식 배지 */}
      <div className="flex justify-end mb-4">
        <span
          className={`text-xs px-2 py-1 rounded-full border ${
            reading.generatedBy === "llm"
              ? "text-green-400 border-green-700/40 bg-green-900/20"
              : "text-mystic-400 border-mystic-700/40 bg-mystic-900/20"
          }`}
        >
          {reading.generatedBy === "llm" ? "✨ AI 리딩" : "📜 템플릿 리딩"}
        </span>
      </div>

      {/* Markdown 렌더링 */}
      <div className="prose prose-invert prose-sm max-w-none reading-prose">
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <div className="mt-8 mb-3 first:mt-0">
                <h2 className="text-lg md:text-xl font-bold text-mystic-100 px-4 py-2 rounded-xl border border-mystic-600/40 bg-mystic-900/40">
                  {children}
                </h2>
              </div>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-mystic-200 mt-6 mb-2 px-3 py-2 rounded-lg bg-mystic-950/40 border border-mystic-800/40">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-200 leading-relaxed mb-3">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="space-y-2 mb-4 bg-mystic-950/30 border border-mystic-900/40 rounded-lg p-3">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-mystic-400 mt-1 flex-shrink-0">•</span>
                <span>{children}</span>
              </li>
            ),
            ol: ({ children }) => (
              <ol className="space-y-2 mb-4 list-decimal list-inside bg-mystic-950/30 border border-mystic-900/40 rounded-lg p-3">{children}</ol>
            ),
            strong: ({ children }) => (
              <strong className="text-mystic-200 font-semibold">{children}</strong>
            ),
            code: ({ children }) => (
              <code className="bg-mystic-900/60 text-gold-400 px-1.5 py-0.5 rounded text-sm">
                {children}
              </code>
            ),
            hr: () => (
              <hr className="border-mystic-700/30 my-4" />
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-mystic-500/50 pl-4 text-gray-400 italic my-3">
                {children}
              </blockquote>
            ),
          }}
        >
          {reading.markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
