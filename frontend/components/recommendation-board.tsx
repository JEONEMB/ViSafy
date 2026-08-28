"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { AnalysisProgress } from "@/components/analysis-progress";
import { getRecommendations } from "@/services/recommendation";
import { getProfile, updateProfile } from "@/services/profile";
import type { RecommendationItem } from "@/types/recommendation";
import type { TempProfile } from "@/types/profile";
import type { JourneyTarget } from "@/components/financial-journey-panel";
import { parseProfileAnswer, ProfileFieldInput, profileFieldLabel, profileInput } from "@/components/profile-field-input";

const copy = {
  ko: { eyebrow: "FR-401 · 맞춤 추천", title: "내 공개조건 진단 결과", description: "확률 점수 없이 검수된 Rule의 통과 수와 추가 확인 항목으로 정렬했습니다.", noProfile: "임시 프로필을 저장하면 내 조건에 맞춰 상품을 정렬해 드립니다.", createProfile: "프로필 입력하기", recommended: "추천 후보", moreInfo: "추가 정보 필요", confirmed: "확인된 공개조건", additional: "추가 확인", count: "개", purpose: "금융 목적 일치", preference: "선호 은행 일치", met: "공개조건 충족", confirm: "은행 확인 필요", insufficient: "정보 추가 필요", detail: "상품 상세 및 진단", excluded: "명시적 공개조건을 충족하지 못해 추천에서 제외된 상품", empty: "현재 추천 가능한 상품이 없습니다.", loading: "상품별 공개조건을 확인하고 있습니다...", error: "추천 결과를 불러오지 못했습니다. 프로필이 만료됐다면 다시 입력해 주세요.", retryProfile: "프로필 다시 입력", informationNeeded: "이 정보를 입력하면 다시 진단할 수 있어요", enterNow: "지금 입력하기", saveAnalyze: "저장하고 다시 분석", saved: "입력값을 반영해 추천을 다시 계산했습니다.", cannotEnter: "사용자 입력이 아니라 공식자료 보완이 필요한 항목입니다.", inputError: "정보를 저장하지 못했습니다. 다시 시도해 주세요.", close: "입력 닫기" },
  en: { eyebrow: "FR-401 · Personalized", title: "My public-condition results", description: "Ranked by verified rules passed and checks needed, without probability scores.", noProfile: "Save a temporary profile to rank products for your conditions.", createProfile: "Create profile", recommended: "Recommendation candidates", moreInfo: "More information needed", confirmed: "Confirmed public conditions", additional: "Additional checks", count: "", purpose: "Purpose matched", preference: "Preferred bank matched", met: "Public conditions met", confirm: "Bank confirmation needed", insufficient: "More information needed", detail: "Product details and check", excluded: "products excluded from recommendations due to an explicit failed condition", empty: "No products can currently be recommended.", loading: "Checking each product's public conditions...", error: "Recommendations could not be loaded. Re-enter your profile if it has expired.", retryProfile: "Re-enter profile", informationNeeded: "Add this information to run the check again", enterNow: "Enter now", saveAnalyze: "Save and analyze again", saved: "Your answer was applied and recommendations were recalculated.", cannotEnter: "This requires official-source review, not more information from you.", inputError: "Could not save the information. Please try again.", close: "Close input" },
  vi: { eyebrow: "FR-401 · Gợi ý cá nhân", title: "Kết quả điều kiện công khai của tôi", description: "Sắp xếp theo số quy tắc đã xác nhận và mục cần kiểm tra, không dùng điểm xác suất.", noProfile: "Lưu hồ sơ tạm thời để sắp xếp sản phẩm theo điều kiện của bạn.", createProfile: "Nhập hồ sơ", recommended: "Sản phẩm đề xuất", moreInfo: "Cần thêm thông tin", confirmed: "Điều kiện công khai đã xác nhận", additional: "Cần xác nhận thêm", count: "", purpose: "Phù hợp mục đích", preference: "Phù hợp ngân hàng ưu tiên", met: "Đáp ứng điều kiện công khai", confirm: "Cần ngân hàng xác nhận", insufficient: "Cần thêm thông tin", detail: "Chi tiết và kiểm tra", excluded: "sản phẩm bị loại khỏi đề xuất do không đáp ứng điều kiện công khai", empty: "Hiện không có sản phẩm có thể đề xuất.", loading: "Đang kiểm tra điều kiện công khai của từng sản phẩm...", error: "Không thể tải đề xuất. Hãy nhập lại nếu hồ sơ đã hết hạn.", retryProfile: "Nhập lại hồ sơ", informationNeeded: "Nhập thông tin này để kiểm tra lại", enterNow: "Nhập ngay", saveAnalyze: "Lưu và phân tích lại", saved: "Thông tin đã được áp dụng và đề xuất đã được tính lại.", cannotEnter: "Mục này cần bổ sung nguồn chính thức, không phải thông tin từ bạn.", inputError: "Không thể lưu thông tin. Vui lòng thử lại.", close: "Đóng" },
  zh: { eyebrow: "FR-401 · 个性化推荐", title: "我的公开条件诊断结果", description: "不使用概率分数，按已审核规则的通过数量与需额外确认的项目排序。", noProfile: "保存临时资料后，将按您的条件为您排序产品。", createProfile: "填写资料", recommended: "推荐候选", moreInfo: "需补充信息", confirmed: "已确认的公开条件", additional: "需额外确认", count: "项", purpose: "金融目的匹配", preference: "偏好银行匹配", met: "满足公开条件", confirm: "需银行确认", insufficient: "需补充信息", detail: "产品详情与诊断", excluded: "因未满足明示的公开条件而被排除的产品", empty: "目前没有可推荐的产品。", loading: "正在确认各产品的公开条件…", error: "未能载入推荐结果。若资料已过期，请重新填写。", retryProfile: "重新填写资料", informationNeeded: "填写该信息后可重新诊断", enterNow: "立即填写", saveAnalyze: "保存并重新分析", saved: "已应用您的填写内容并重新计算推荐结果。", cannotEnter: "该项需要补充官方资料，而非您提供的信息。", inputError: "未能保存信息，请重试。", close: "关闭输入" },
  ja: { eyebrow: "FR-401 · おすすめ", title: "私の公開条件の診断結果", description: "確率スコアを使わず、審査済みルールの通過数と追加確認項目で並べ替えています。", noProfile: "一時プロフィールを保存すると、条件に合わせて商品を並べ替えます。", createProfile: "プロフィールを入力", recommended: "おすすめ候補", moreInfo: "情報の追加が必要", confirmed: "確認された公開条件", additional: "追加確認", count: "件", purpose: "金融目的が一致", preference: "希望銀行が一致", met: "公開条件を満たす", confirm: "銀行の確認が必要", insufficient: "情報の追加が必要", detail: "商品詳細と診断", excluded: "明示された公開条件を満たさず推薦から除外された商品", empty: "現在おすすめできる商品はありません。", loading: "商品ごとの公開条件を確認しています…", error: "推薦結果を読み込めませんでした。プロフィールの有効期限が切れている場合は再入力してください。", retryProfile: "プロフィールを再入力", informationNeeded: "この情報を入力すると再診断できます", enterNow: "今すぐ入力", saveAnalyze: "保存して再分析", saved: "入力内容を反映して推薦を再計算しました。", cannotEnter: "これは利用者の入力ではなく、公式資料の補完が必要な項目です。", inputError: "情報を保存できませんでした。もう一度お試しください。", close: "入力を閉じる" },
  th: { eyebrow: "FR-401 · คำแนะนำเฉพาะบุคคล", title: "ผลตรวจเงื่อนไขสาธารณะของฉัน", description: "จัดลำดับตามจำนวนกฎที่ผ่านการตรวจสอบและรายการที่ต้องยืนยันเพิ่ม โดยไม่ใช้คะแนนความน่าจะเป็น", noProfile: "บันทึกโปรไฟล์ชั่วคราวเพื่อจัดลำดับผลิตภัณฑ์ให้ตรงกับเงื่อนไขของคุณ", createProfile: "กรอกโปรไฟล์", recommended: "ตัวเลือกที่แนะนำ", moreInfo: "ต้องการข้อมูลเพิ่มเติม", confirmed: "เงื่อนไขสาธารณะที่ยืนยันแล้ว", additional: "ต้องยืนยันเพิ่มเติม", count: "รายการ", purpose: "ตรงกับวัตถุประสงค์ทางการเงิน", preference: "ตรงกับธนาคารที่ต้องการ", met: "ผ่านเงื่อนไขสาธารณะ", confirm: "ต้องให้ธนาคารยืนยัน", insufficient: "ต้องการข้อมูลเพิ่มเติม", detail: "รายละเอียดและผลตรวจผลิตภัณฑ์", excluded: "ผลิตภัณฑ์ที่ถูกคัดออกเพราะไม่ผ่านเงื่อนไขสาธารณะที่ระบุไว้ชัดเจน", empty: "ขณะนี้ไม่มีผลิตภัณฑ์ที่แนะนำได้", loading: "กำลังตรวจสอบเงื่อนไขสาธารณะของแต่ละผลิตภัณฑ์...", error: "ไม่สามารถโหลดผลคำแนะนำได้ หากโปรไฟล์หมดอายุ กรุณากรอกใหม่", retryProfile: "กรอกโปรไฟล์ใหม่", informationNeeded: "กรอกข้อมูลนี้เพื่อตรวจสอบอีกครั้ง", enterNow: "กรอกตอนนี้", saveAnalyze: "บันทึกและวิเคราะห์ใหม่", saved: "นำข้อมูลที่กรอกมาคำนวณคำแนะนำใหม่แล้ว", cannotEnter: "รายการนี้ต้องเพิ่มเติมเอกสารอย่างเป็นทางการ ไม่ใช่ข้อมูลจากคุณ", inputError: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่", close: "ปิดการกรอก" },
} as const;

const dashboardCopy = {
  ko: { publicTitle: "공개조건", additionalTitle: "추가 확인", evidence: "판단 근거", documents: "필요서류", inquiry: "은행에 물어보기", journey: "금융생활 여정에서 준비하기", final: "최종 가입승인이 아닙니다.", baseDate: "정보 기준일" },
  en: { publicTitle: "Public conditions", additionalTitle: "Additional checks", evidence: "Evidence", documents: "Documents", inquiry: "Ask the bank", journey: "Prepare in my financial journey", final: "This is not final approval.", baseDate: "Information date" },
  vi: { publicTitle: "Điều kiện công khai", additionalTitle: "Cần xác nhận thêm", evidence: "Căn cứ", documents: "Giấy tờ", inquiry: "Hỏi ngân hàng", journey: "Chuẩn bị trong hành trình tài chính", final: "Đây không phải phê duyệt cuối cùng.", baseDate: "Ngày thông tin" },
  zh: { publicTitle: "公开条件", additionalTitle: "额外确认", evidence: "判断依据", documents: "所需材料", inquiry: "向银行咨询", journey: "在金融生活旅程中准备", final: "这并非最终的加入批准。", baseDate: "信息基准日" },
  ja: { publicTitle: "公開条件", additionalTitle: "追加確認", evidence: "判断根拠", documents: "必要書類", inquiry: "銀行に問い合わせる", journey: "金融ライフの道のりで準備する", final: "最終的な加入承認ではありません。", baseDate: "情報基準日" },
  th: { publicTitle: "เงื่อนไขสาธารณะ", additionalTitle: "การยืนยันเพิ่มเติม", evidence: "หลักฐานประกอบการพิจารณา", documents: "เอกสารที่ต้องใช้", inquiry: "สอบถามธนาคาร", journey: "เตรียมตัวในเส้นทางการเงิน", final: "นี่ไม่ใช่การอนุมัติขั้นสุดท้าย", baseDate: "วันที่อ้างอิงข้อมูล" },
} as const;

export function RecommendationBoard({ onContinueJourney }: { onContinueJourney?: (focus: JourneyTarget) => void }) {
  const { locale } = useLocale();
  const uiLocale = locale;
  const text = copy[uiLocale];
  const [identity, setIdentity] = useState<{ id: number; session: string } | null>();
  useEffect(() => { const id = Number(localStorage.getItem("visafyProfileId")); const session = localStorage.getItem("visafyProfileSessionId"); setIdentity(id && session ? { id, session } : null); }, []);
  const profile = useQuery({ queryKey: ["recommendation-profile", identity?.id], queryFn: () => getProfile(identity!.id, identity!.session), enabled: Boolean(identity) });
  const recommendations = useQuery({
    queryKey: ["recommendations", identity?.session],
    queryFn: () => getRecommendations(identity!.session),
    enabled: Boolean(identity),
  });

  if (identity === undefined) {
    return <section className="ui-card mt-8 animate-pulse p-8" aria-label={text.loading}><div className="h-5 w-48 rounded bg-line" /><div className="mt-4 h-8 w-80 max-w-full rounded bg-surface-subtle" /></section>;
  }
  if (!identity) {
    return <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-panel border border-status-info-border bg-status-info-bg p-6 sm:p-8"><div><h2 className="text-2xl font-bold text-ink">{text.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{text.noProfile}</p></div><Link className="ui-button ui-button-primary" href="/profile">{text.createProfile} →</Link></section>;
  }

  return <section className="ui-panel mt-8 p-6 sm:p-8">
    <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{text.title}</h2>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{uiLocale === "ko" ? "확률 점수 없이 충족한 공개조건과 추가 확인 항목으로 정렬했습니다." : uiLocale === "vi" ? "Sắp xếp theo điều kiện công khai đã đáp ứng và nội dung cần xác nhận, không dùng điểm xác suất." : "Ranked by public conditions met and checks needed, without probability scores."}</p>
    {recommendations.isLoading ? <div className="mt-8"><p className="mb-3 text-sm text-muted">{text.loading}</p><AnalysisProgress /></div> : null}
    {recommendations.isError ? <div className="ui-alert-danger mt-8 flex flex-wrap items-center justify-between gap-3"><p>{text.error}</p><Link className="ui-link" href="/profile">{text.retryProfile}</Link></div> : null}
    {recommendations.data ? <>
      <RecommendationGroup identity={identity} profile={profile.data} items={recommendations.data.recommended} title={text.recommended} text={text} onContinueJourney={onContinueJourney} />
      {recommendations.data.additionalInformationNeeded.length ? <RecommendationGroup identity={identity} profile={profile.data} items={recommendations.data.additionalInformationNeeded} title={text.moreInfo} text={text} onContinueJourney={onContinueJourney} additional /> : null}
      {recommendations.data.recommended.length === 0 ? <p className="mt-7 rounded-card border border-dashed border-line-strong p-7 text-center text-muted">{text.empty}</p> : null}
      {recommendations.data.excludedCount > 0 ? <p className="mt-6 text-xs text-quiet">{recommendations.data.excludedCount} {text.excluded}</p> : null}
    </> : null}
  </section>;
}

function RecommendationGroup({ identity, profile, items, title, text, onContinueJourney, additional = false }: { identity: { id: number; session: string }; profile?: TempProfile; items: RecommendationItem[]; title: string; text: (typeof copy)[keyof typeof copy]; onContinueJourney?: (focus: JourneyTarget) => void; additional?: boolean }) {
  const { locale } = useLocale();
  const dashboard = dashboardCopy[locale];
  return <section className="mt-8">
    <div className="flex items-center gap-3"><h3 className="text-xl font-bold text-ink">{title}</h3><span className="rounded-full border border-line bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted">{items.length}</span></div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">{items.map((item, index) => <article className="rounded-card border border-line bg-surface p-5" key={item.productId}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-brand">#{index + 1} · {item.institution}</p><h4 className="mt-1 text-lg font-bold text-ink">{item.productName}</h4></div><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${additional ? "border-status-warning-border bg-status-warning-bg text-status-warning" : item.eligibilityStatus === "PUBLIC_CONDITIONS_MET" ? "border-status-success-border bg-status-success-bg text-status-success" : "border-status-warning-border bg-status-warning-bg text-status-warning"}`}>{additional ? text.insufficient : item.eligibilityStatus === "PUBLIC_CONDITIONS_MET" ? text.met : text.confirm}</span></div>
      <p className="mt-3 text-sm leading-6 text-muted">{item.targetSummary}</p>
      <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-control border border-status-success-border bg-status-success-bg p-3"><p className="text-xs text-status-success">{text.confirmed}</p><p className="mt-1 text-lg font-bold text-status-success">{item.confirmedPublicConditions}/{item.totalPublicConditions}</p></div><div className="rounded-control border border-status-warning-border bg-status-warning-bg p-3"><p className="text-xs text-status-warning">{text.additional}</p><p className="mt-1 text-lg font-bold text-status-warning">{item.additionalCheckCount}{text.count}</p></div></div>
      {!additional ? <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2"><div><h5 className="text-xs font-bold text-status-success">{dashboard.publicTitle}</h5><ul className="mt-2 space-y-1.5 text-xs text-muted">{item.eligibility.passedRules.slice(0, 4).map((rule, ruleIndex) => <li key={`${rule.key}-${ruleIndex}`}>✓ {rule.message}</li>)}</ul></div><div><h5 className="text-xs font-bold text-status-warning">{dashboard.additionalTitle}</h5><ul className="mt-2 space-y-1.5 text-xs text-muted">{[...item.eligibility.externalChecks, ...item.eligibility.unknownRules].slice(0, 3).map((rule, ruleIndex) => <li key={`${rule.key}-${ruleIndex}`}>△ {rule.message}</li>)}</ul></div></div> : null}
      <div className="mt-3 flex flex-wrap gap-2">{item.purposeMatched ? <span className="rounded-full border border-status-info-border bg-status-info-bg px-2.5 py-1 text-xs font-semibold text-status-info">✓ {text.purpose}</span> : null}{item.preferredConditionMatches > 0 ? <span className="rounded-full border border-line bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-muted">✓ {text.preference}</span> : null}</div>
      {additional && item.eligibility.insufficientReasons.length ? <MissingInformationAction identity={identity} profile={profile} item={item} text={text} /> : null}
      <p className="mt-4 text-xs text-quiet">{dashboard.baseDate} {item.informationBaseDate} · {dashboard.final}</p>
      <div className="mt-4 flex flex-wrap gap-2"><button className="ui-button ui-button-primary min-h-9 px-3 py-1.5 text-xs" onClick={() => onContinueJourney?.({ code: journeyCode(item.productCategory), productId: item.productId })} type="button">{dashboard.journey} ↓</button><Link className="ui-button ui-button-secondary min-h-9 px-3 py-1.5 text-xs" href={`/products/${item.productId}?tab=evidence`}>{dashboard.evidence}</Link><Link className="ui-button ui-button-secondary min-h-9 px-3 py-1.5 text-xs" href={`/products/${item.productId}?tab=documents`}>{dashboard.documents}</Link><Link className="ui-button ui-button-secondary min-h-9 px-3 py-1.5 text-xs" href={`/products/${item.productId}?tab=precheck#bank-inquiry`}>{dashboard.inquiry}</Link></div>
    </article>)}</div>
  </section>;
}

function MissingInformationAction({ identity, profile, item, text }: { identity: { id: number; session: string }; profile?: TempProfile; item: RecommendationItem; text: (typeof copy)[keyof typeof copy] }) {
  const { locale } = useLocale(); const language = locale;
  const client = useQueryClient(); const [open, setOpen] = useState(false); const [answer, setAnswer] = useState(""); const [saved, setSaved] = useState(false);
  const field = item.nextPreparationField ?? null;
  const update = useMutation({ mutationFn: async () => { if (!profile || !field) return; const input = profileInput(profile); (input as Record<string, unknown>)[field] = parseProfileAnswer(field, answer); return updateProfile(identity.id, identity.session, input); }, onSuccess: async () => { setSaved(true); setAnswer(""); setOpen(false); await client.invalidateQueries({ queryKey: ["recommendation-profile"] }); await client.invalidateQueries({ queryKey: ["agent-profile"] }); await client.invalidateQueries({ queryKey: ["recommendations"] }); await client.invalidateQueries({ queryKey: ["financial-journey"] }); } });
  return <div className="mt-4 rounded-control border border-status-warning-border bg-status-warning-bg p-4 text-status-warning">
    <div className="flex items-start gap-3"><span aria-hidden="true" className="mt-0.5 text-lg">⚠</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{field ? text.informationNeeded : text.cannotEnter}</p><ul className="mt-2 space-y-1.5 text-xs leading-5">{item.eligibility.insufficientReasons.slice(0, 3).map((reason, reasonIndex) => <li key={`${reason.messageCode}-${reasonIndex}`}>• {reason.message}</li>)}</ul>{field ? <button aria-expanded={open} className="mt-3 min-h-10 rounded-control border border-status-warning-border bg-surface px-3 text-xs font-bold text-status-warning transition hover:border-status-warning hover:bg-white" onClick={() => { setOpen((current) => !current); setSaved(false); }} type="button">{open ? text.close : `${text.enterNow} →`}</button> : null}</div></div>
    {open && field ? <form className="mt-4 border-t border-status-warning-border pt-4" onSubmit={(event) => { event.preventDefault(); update.mutate(); }}><label className="ui-label text-ink">{profileFieldLabel(language, field)}<ProfileFieldInput field={field} value={answer} locale={locale} onChange={setAnswer} /></label><button className="ui-button ui-button-primary mt-3" disabled={!answer || !profile || update.isPending}>{text.saveAnalyze}</button></form> : null}
    {saved ? <p className="mt-3 text-xs font-semibold text-status-success">✓ {text.saved}</p> : null}{update.isError ? <p className="mt-3 text-xs font-semibold text-status-danger">{text.inputError}</p> : null}
  </div>;
}

function journeyCode(category: RecommendationItem["productCategory"]) {
  if (category === "DEMAND_DEPOSIT") return "DEMAND_DEPOSIT_ACCOUNT";
  if (category === "DEBIT_CARD") return "DEBIT_CARD";
  if (category === "SAVINGS" || category === "TIME_DEPOSIT") return "SAVINGS";
  if (category === "REMITTANCE") return "REMITTANCE";
  if (category === "CREDIT_CARD") return "BUILD_CREDIT";
  if (["PERSONAL_LOAN", "HOUSING_LOAN", "POLICY_FINANCE"].includes(category)) return "LOAN_AND_HOUSING";
  return "INVESTMENT";
}
