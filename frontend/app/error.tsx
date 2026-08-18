"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-2xl font-bold">화면을 불러오지 못했습니다.</h1>
      <p className="mt-3 text-slate-600">잠시 후 다시 시도해 주세요.</p>
      <button className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white" onClick={reset} type="button">
        다시 시도
      </button>
    </main>
  );
}

