import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">ViSafy</p>
      <h1 className="text-4xl font-bold tracking-tight">내 조건에 맞는 금융상품을, 근거와 함께</h1>
      <p className="max-w-2xl text-lg leading-8 text-slate-600">
        공식 출처와 검수된 규칙을 기반으로 외국인 사용자의 금융상품 사전자격을 안내하는 서비스입니다.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white" href="/profile">
          프로필 입력하기
        </Link>
        <Link className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold" href="/admin/sources">
          Source · Rule 검수
        </Link>
        <Link className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold" href="/health">
          시스템 상태
        </Link>
      </div>
    </main>
  );
}
