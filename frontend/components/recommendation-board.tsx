"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { AnalysisProgress } from "@/components/analysis-progress";
import { getRecommendations } from "@/services/recommendation";
import type { RecommendationItem } from "@/types/recommendation";

const copy = {
  ko: { eyebrow: "FR-401 · 맞춤 추천", title: "내 공개조건 진단 결과", description: "확률 점수 없이 검수된 Rule의 통과 수와 추가 확인 항목으로 정렬했습니다.", noProfile: "임시 프로필을 저장하면 내 조건에 맞춰 상품을 정렬해 드립니다.", createProfile: "프로필 입력하기", recommended: "추천 후보", moreInfo: "추가 정보 필요", confirmed: "확인된 공개조건", additional: "추가 확인", count: "개", purpose: "금융 목적 일치", preference: "선호 은행 일치", met: "공개조건 충족", confirm: "은행 확인 필요", insufficient: "정보 추가 필요", detail: "상품 상세 및 진단", excluded: "명시적 공개조건을 충족하지 못해 추천에서 제외된 상품", empty: "현재 추천 가능한 상품이 없습니다.", loading: "상품별 공개조건을 확인하고 있습니다...", error: "추천 결과를 불러오지 못했습니다. 프로필이 만료됐다면 다시 입력해 주세요.", retryProfile: "프로필 다시 입력" },
  en: { eyebrow: "FR-401 · Personalized", title: "My public-condition results", description: "Ranked by verified rules passed and checks needed, without probability scores.", noProfile: "Save a temporary profile to rank products for your conditions.", createProfile: "Create profile", recommended: "Recommendation candidates", moreInfo: "More information needed", confirmed: "Confirmed public conditions", additional: "Additional checks", count: "", purpose: "Purpose matched", preference: "Preferred bank matched", met: "Public conditions met", confirm: "Bank confirmation needed", insufficient: "More information needed", detail: "Product details and check", excluded: "products excluded from recommendations due to an explicit failed condition", empty: "No products can currently be recommended.", loading: "Checking each product's public conditions...", error: "Recommendations could not be loaded. Re-enter your profile if it has expired.", retryProfile: "Re-enter profile" },
  vi: { eyebrow: "FR-401 · Gợi ý cá nhân", title: "Kết quả điều kiện công khai của tôi", description: "Sắp xếp theo số quy tắc đã xác nhận và mục cần kiểm tra, không dùng điểm xác suất.", noProfile: "Lưu hồ sơ tạm thời để sắp xếp sản phẩm theo điều kiện của bạn.", createProfile: "Nhập hồ sơ", recommended: "Sản phẩm đề xuất", moreInfo: "Cần thêm thông tin", confirmed: "Điều kiện công khai đã xác nhận", additional: "Cần xác nhận thêm", count: "", purpose: "Phù hợp mục đích", preference: "Phù hợp ngân hàng ưu tiên", met: "Đáp ứng điều kiện công khai", confirm: "Cần ngân hàng xác nhận", insufficient: "Cần thêm thông tin", detail: "Chi tiết và kiểm tra", excluded: "sản phẩm bị loại khỏi đề xuất do không đáp ứng điều kiện công khai", empty: "Hiện không có sản phẩm có thể đề xuất.", loading: "Đang kiểm tra điều kiện công khai của từng sản phẩm...", error: "Không thể tải đề xuất. Hãy nhập lại nếu hồ sơ đã hết hạn.", retryProfile: "Nhập lại hồ sơ" },
} as const;

const dashboardCopy = {
  ko: { publicTitle: "공개조건", additionalTitle: "추가 확인", evidence: "판단 근거", documents: "필요서류", inquiry: "은행에 물어보기", final: "최종 가입승인이 아닙니다.", baseDate: "정보 기준일" },
  en: { publicTitle: "Public conditions", additionalTitle: "Additional checks", evidence: "Evidence", documents: "Documents", inquiry: "Ask the bank", final: "This is not final approval.", baseDate: "Information date" },
  vi: { publicTitle: "Điều kiện công khai", additionalTitle: "Cần xác nhận thêm", evidence: "Căn cứ", documents: "Giấy tờ", inquiry: "Hỏi ngân hàng", final: "Đây không phải phê duyệt cuối cùng.", baseDate: "Ngày thông tin" },
} as const;

export function RecommendationBoard() {
  const { locale } = useLocale();
  const text = copy[locale];
  const [profileSessionId, setProfileSessionId] = useState<string | null>();
  useEffect(() => setProfileSessionId(localStorage.getItem("visafyProfileSessionId")), []);
  const recommendations = useQuery({
    queryKey: ["recommendations", profileSessionId],
    queryFn: () => getRecommendations(profileSessionId!),
    enabled: Boolean(profileSessionId),
  });

  if (profileSessionId === undefined) {
    return <section className="mt-8 animate-pulse rounded-3xl bg-slate-100 p-10"><div className="h-5 w-48 rounded bg-slate-200" /><div className="mt-4 h-8 w-80 max-w-full rounded bg-slate-200" /></section>;
  }
  if (!profileSessionId) {
    return <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-slate-950 p-7 text-white sm:p-9"><div><p className="text-sm font-semibold text-teal-300">{text.eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{text.title}</h2><p className="mt-2 text-sm text-slate-300">{text.noProfile}</p></div><Link className="rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950" href="/profile">{text.createProfile} →</Link></section>;
  }

  return <section className="mt-8 rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-9">
    <p className="text-sm font-semibold text-teal-300">{text.eyebrow}</p>
    <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{text.title}</h2>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{text.description}</p>
    {recommendations.isLoading ? <div className="mt-8"><p className="mb-3 text-sm text-slate-300">{text.loading}</p><AnalysisProgress /></div> : null}
    {recommendations.isError ? <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-400/15 p-5 text-sm text-rose-100"><p>{text.error}</p><Link className="font-bold underline" href="/profile">{text.retryProfile}</Link></div> : null}
    {recommendations.data ? <>
      <RecommendationGroup items={recommendations.data.recommended} title={text.recommended} text={text} />
      {recommendations.data.additionalInformationNeeded.length ? <RecommendationGroup items={recommendations.data.additionalInformationNeeded} title={text.moreInfo} text={text} additional /> : null}
      {recommendations.data.recommended.length === 0 ? <p className="mt-7 rounded-xl border border-dashed border-white/20 p-7 text-center text-slate-300">{text.empty}</p> : null}
      {recommendations.data.excludedCount > 0 ? <p className="mt-6 text-xs text-slate-400">{recommendations.data.excludedCount} {text.excluded}</p> : null}
    </> : null}
  </section>;
}

function RecommendationGroup({ items, title, text, additional = false }: { items: RecommendationItem[]; title: string; text: (typeof copy)[keyof typeof copy]; additional?: boolean }) {
  const { locale } = useLocale();
  const dashboard = dashboardCopy[locale];
  return <section className="mt-8">
    <div className="flex items-center gap-3"><h3 className="text-xl font-bold">{title}</h3><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{items.length}</span></div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">{items.map((item, index) => <article className="rounded-2xl bg-white p-5 text-slate-950" key={item.productId}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-700">#{index + 1} · {item.institution}</p><h4 className="mt-1 text-lg font-bold">{item.productName}</h4></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${additional ? "bg-slate-200 text-slate-700" : item.eligibilityStatus === "PUBLIC_CONDITIONS_MET" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{additional ? text.insufficient : item.eligibilityStatus === "PUBLIC_CONDITIONS_MET" ? text.met : text.confirm}</span></div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{item.targetSummary}</p>
      <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-emerald-700">{text.confirmed}</p><p className="mt-1 text-lg font-extrabold text-emerald-950">{item.confirmedPublicConditions}/{item.totalPublicConditions}</p></div><div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-700">{text.additional}</p><p className="mt-1 text-lg font-extrabold text-amber-950">{item.additionalCheckCount}{text.count}</p></div></div>
      {!additional ? <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2"><div><h5 className="text-xs font-black uppercase tracking-wider text-emerald-800">{dashboard.publicTitle}</h5><ul className="mt-2 space-y-1.5 text-xs text-slate-600">{item.eligibility.passedRules.slice(0, 4).map((rule, ruleIndex) => <li key={`${rule.key}-${ruleIndex}`}>✓ {rule.message}</li>)}</ul></div><div><h5 className="text-xs font-black uppercase tracking-wider text-amber-800">{dashboard.additionalTitle}</h5><ul className="mt-2 space-y-1.5 text-xs text-slate-600">{[...item.eligibility.externalChecks, ...item.eligibility.unknownRules].slice(0, 3).map((rule, ruleIndex) => <li key={`${rule.key}-${ruleIndex}`}>⚠ {rule.message}</li>)}</ul></div></div> : null}
      <div className="mt-3 flex flex-wrap gap-2">{item.purposeMatched ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">✓ {text.purpose}</span> : null}{item.preferredConditionMatches > 0 ? <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">✓ {text.preference}</span> : null}</div>
      {additional && item.eligibility.insufficientReasons.length ? <ul className="mt-4 space-y-1 text-xs leading-5 text-slate-500">{item.eligibility.insufficientReasons.slice(0, 2).map((reason, reasonIndex) => <li key={`${reason.messageCode}-${reasonIndex}`}>• {reason.message}</li>)}</ul> : null}
      <p className="mt-4 text-xs text-slate-400">{dashboard.baseDate} {item.informationBaseDate} · {dashboard.final}</p>
      <div className="mt-4 flex flex-wrap gap-2"><Link className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white" href={`/products/${item.productId}?tab=evidence`}>{dashboard.evidence}</Link><Link className="rounded-lg border px-3 py-2 text-xs font-bold text-slate-700" href={`/products/${item.productId}?tab=documents`}>{dashboard.documents}</Link><Link className="rounded-lg border px-3 py-2 text-xs font-bold text-slate-700" href={`/products/${item.productId}?tab=precheck#bank-inquiry`}>{dashboard.inquiry}</Link></div>
    </article>)}</div>
  </section>;
}
