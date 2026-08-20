"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="ui-page max-w-xl">
      <div className="ui-card p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-ink">화면을 불러오지 못했습니다.</h1>
      <p className="mt-3 text-muted">잠시 후 다시 시도해 주세요.</p>
      <button className="ui-button ui-button-primary mt-6" onClick={reset} type="button">
        다시 시도
      </button>
      </div>
    </main>
  );
}
