"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ShuffleAnimation from "@/components/ShuffleAnimation";

function ShufflePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("sessionId");

  useEffect(() => {
    if (!sessionId) {
      router.replace("/");
    }
  }, [sessionId, router]);

  const handleComplete = () => {
    if (sessionId) {
      router.push(`/reading/${sessionId}`);
    }
  };

  if (!sessionId) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <ShuffleAnimation onComplete={handleComplete} />
    </div>
  );
}

export default function ShufflePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-mystic-300">
        로딩 중...
      </div>
    }>
      <ShufflePageInner />
    </Suspense>
  );
}
