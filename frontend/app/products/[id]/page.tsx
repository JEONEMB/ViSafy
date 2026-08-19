"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/components/providers/locale-provider";
import { getProduct } from "@/services/product";

const copy = {
  ko: { back: "상품 목록", summary: "상품 요약", public: "공개조건", additional: "추가 확인 조건", documents: "필요서류", apply: "신청방법", source: "공식 출처", base: "정보 기준일", rules: "검수된 조건", warning: "실제 가입 가능 여부는 은행의 최종 심사에서 결정됩니다." },
  en: { back: "Products", summary: "Product summary", public: "Public conditions", additional: "Additional checks", documents: "Required documents", apply: "How to apply", source: "Official source", base: "Information date", rules: "Reviewed conditions", warning: "Final eligibility is determined by the bank's review." },
  vi: { back: "Danh sách sản phẩm", summary: "Tóm tắt sản phẩm", public: "Điều kiện công khai", additional: "Điều kiện cần xác nhận", documents: "Giấy tờ cần thiết", apply: "Cách đăng ký", source: "Nguồn chính thức", base: "Ngày thông tin", rules: "Điều kiện đã kiểm duyệt", warning: "Khả năng đăng ký cuối cùng do ngân hàng quyết định." },
} as const;

export default function ProductDetailPage() {
  const { locale } = useLocale();
  const text = copy[locale];
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const product = useQuery({ queryKey: ["product", id], queryFn: () => getProduct(id), enabled: Number.isFinite(id) });

  if (product.isLoading) return <main className="mx-auto max-w-4xl px-6 py-12">Loading...</main>;
  if (product.isError || !product.data) return <main className="mx-auto max-w-4xl px-6 py-12 text-rose-700">{product.error?.message ?? "Product not found"}</main>;
  const item = product.data;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link className="text-sm font-semibold text-blue-700" href="/products">← {text.back}</Link>
      <header className="mt-6 rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
        <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.diagnosisStatus}</span><span className="text-sm text-slate-300">{item.institution}</span></div>
        <h1 className="mt-5 text-3xl font-bold sm:text-4xl">{item.productName}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-300">{item.description}</p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Info title={text.summary} body={item.targetSummary} />
        <Info title={text.public} body={item.publicConditions} />
        <Info title={text.additional} body={item.additionalConditions} />
        <Info title={text.documents} body={item.requiredDocuments} />
        <Info title={text.apply} body={item.applicationMethod} />
        <section className="rounded-2xl border bg-white p-6"><h2 className="font-bold">{text.source}</h2><a className="mt-3 block text-sm font-semibold text-blue-700 underline" href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceTitle}</a><p className="mt-3 text-sm text-slate-500">{text.base}: {item.informationBaseDate}</p></section>
      </div>

      <section className="mt-8 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">{text.rules}</h2>
        <div className="mt-4 space-y-3">{item.rules.map((rule) => <div className="rounded-xl bg-slate-50 p-4" key={rule.id}><p className="font-mono text-sm font-semibold">{rule.ruleKey} {rule.operator} {rule.ruleValue}</p><p className="mt-2 text-sm text-slate-600">{rule.sourceExcerpt}</p></div>)}</div>
        {item.rules.length === 0 ? <p className="mt-3 text-sm text-slate-500">No approved rules.</p> : null}
      </section>
      <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{text.warning}</p>
    </main>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return <section className="rounded-2xl border bg-white p-6"><h2 className="font-bold">{title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{body}</p></section>;
}
