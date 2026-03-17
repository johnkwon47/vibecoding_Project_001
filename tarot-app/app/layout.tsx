import type { Metadata } from "next";
import "./globals.css";
import Disclaimer from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "타로 상담 | 78장 타로 카드 리딩",
  description:
    "78장 타로 덱으로 하는 자기성찰 타로 상담 서비스. 3카드 또는 켈틱 크로스 스프레드로 당신의 질문에 답을 찾아보세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col relative z-10">
        <main className="flex-1">{children}</main>
        <Disclaimer />
      </body>
    </html>
  );
}
