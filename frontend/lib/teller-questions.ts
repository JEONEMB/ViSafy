import type { Locale } from "@/i18n/config";

/**
 * Counter dialogue for the bank-visit packet.
 *
 * Speaking is not the hard part at a bank counter — a foreign customer can hold up a prepared
 * Korean sentence. Understanding the reply is. So every phrase here carries the Korean the teller
 * says or the customer shows, plus a translation in each supported language.
 *
 * Safety rule for answers: an answer may state a fact about the customer or ask for something.
 * It must never assert that a product condition is met — only the bank decides that. Nothing here
 * says "I qualify" or "I meet the requirement", and `teller-questions.test.ts` enforces that.
 *
 * Scope: the rule keys the fixed Demo A~E products surface, plus the conditions the explanation
 * service already labels. A key with no entry simply contributes no card.
 */

export type Phrase = Record<Locale, string>;

export type TellerExchange = {
  /** Stable id so React keys and tests do not depend on the Korean text. */
  id: string;
  question: Phrase;
  answers: Phrase[];
};

/** Questions a teller asks almost every foreign customer, whatever the product is. */
export const baselineTellerExchanges: TellerExchange[] = [
  {
    id: "RESIDENCE_CARD",
    question: {
      ko: "외국인등록증 있으세요?",
      en: "Do you have your residence card?",
      vi: "Bạn có thẻ cư trú không?",
      zh: "您有外国人登录证吗？",
      ja: "外国人登録証はお持ちですか？",
      th: "คุณมีบัตรประจำตัวคนต่างด้าวไหม",
    },
    answers: [
      { ko: "네, 여기 있습니다.", en: "Yes, here it is.", vi: "Vâng, đây ạ.", zh: "有的，在这里。", ja: "はい、こちらです。", th: "มีค่ะ/ครับ นี่ค่ะ/ครับ" },
      { ko: "아니요, 여권만 있습니다.", en: "No, I only have my passport.", vi: "Không, tôi chỉ có hộ chiếu.", zh: "没有，我只有护照。", ja: "いいえ、パスポートだけです。", th: "ไม่มีค่ะ/ครับ มีแค่หนังสือเดินทาง" },
      { ko: "아직 발급 중입니다.", en: "It is still being issued.", vi: "Thẻ vẫn đang được cấp.", zh: "还在办理中。", ja: "まだ発行手続き中です。", th: "ยังอยู่ระหว่างการออกบัตร" },
    ],
  },
  {
    id: "PASSPORT_BROUGHT",
    question: {
      ko: "여권도 가지고 오셨어요?",
      en: "Did you bring your passport as well?",
      vi: "Bạn có mang theo hộ chiếu không?",
      zh: "您也带护照了吗？",
      ja: "パスポートもお持ちですか？",
      th: "คุณนำหนังสือเดินทางมาด้วยไหม",
    },
    answers: [
      { ko: "네, 가지고 왔습니다.", en: "Yes, I brought it.", vi: "Vâng, tôi có mang theo.", zh: "带了。", ja: "はい、持ってきました。", th: "นำมาด้วยค่ะ/ครับ" },
      { ko: "아니요, 다음에 가져오겠습니다.", en: "No, I will bring it next time.", vi: "Không, lần sau tôi sẽ mang theo.", zh: "没有，下次带来。", ja: "いいえ、次回お持ちします。", th: "ไม่ได้นำมา ครั้งหน้าจะนำมาค่ะ/ครับ" },
    ],
  },
  {
    id: "PHONE_VERIFICATION",
    question: {
      ko: "휴대전화 본인인증 되세요?",
      en: "Can you complete mobile identity verification?",
      vi: "Bạn có thực hiện được xác minh danh tính qua điện thoại không?",
      zh: "您可以进行手机本人认证吗？",
      ja: "携帯電話での本人確認はできますか？",
      th: "คุณสามารถยืนยันตัวตนผ่านมือถือได้ไหม",
    },
    answers: [
      { ko: "네, 제 명의로 된 휴대전화입니다.", en: "Yes, the phone is registered in my name.", vi: "Vâng, điện thoại đăng ký dưới tên tôi.", zh: "可以，手机是我本人名下的。", ja: "はい、私名義の携帯電話です。", th: "ได้ค่ะ/ครับ โทรศัพท์อยู่ในชื่อของฉัน" },
      { ko: "아니요, 제 명의가 아닙니다.", en: "No, the phone is not in my name.", vi: "Không, điện thoại không đứng tên tôi.", zh: "不行，手机不是我名下的。", ja: "いいえ、私名義ではありません。", th: "ไม่ได้ค่ะ/ครับ โทรศัพท์ไม่ได้อยู่ในชื่อของฉัน" },
      { ko: "한국 휴대전화가 없습니다.", en: "I do not have a Korean mobile phone.", vi: "Tôi không có điện thoại di động Hàn Quốc.", zh: "我没有韩国手机。", ja: "韓国の携帯電話を持っていません。", th: "ฉันไม่มีโทรศัพท์มือถือเกาหลี" },
    ],
  },
  {
    id: "PURPOSE_OF_USE",
    question: {
      ko: "어떤 용도로 사용하실 건가요?",
      en: "What will you use it for?",
      vi: "Bạn sẽ sử dụng vào mục đích gì?",
      zh: "您打算用于什么用途？",
      ja: "どのような目的でご利用になりますか？",
      th: "คุณจะใช้เพื่อวัตถุประสงค์ใด",
    },
    answers: [
      { ko: "급여를 받기 위해서입니다.", en: "To receive my salary.", vi: "Để nhận lương.", zh: "用来领工资。", ja: "給与を受け取るためです。", th: "เพื่อรับเงินเดือน" },
      { ko: "생활비 이체와 저축을 위해서입니다.", en: "For everyday transfers and saving.", vi: "Để chuyển tiền sinh hoạt và tiết kiệm.", zh: "用于日常转账和储蓄。", ja: "生活費の振込と貯蓄のためです。", th: "เพื่อโอนค่าใช้จ่ายประจำวันและออมเงิน" },
      { ko: "본국으로 송금하기 위해서입니다.", en: "To send money to my home country.", vi: "Để chuyển tiền về nước.", zh: "用于向本国汇款。", ja: "母国への送金のためです。", th: "เพื่อโอนเงินกลับประเทศ" },
    ],
  },
  {
    id: "EMPLOYMENT_DOCUMENTS",
    question: {
      ko: "재직 중이신가요? 직장 관련 서류가 있으세요?",
      en: "Are you currently employed? Do you have employment documents?",
      vi: "Bạn có đang đi làm không? Bạn có giấy tờ về việc làm không?",
      zh: "您目前在职吗？有在职相关材料吗？",
      ja: "現在お勤めですか。在職に関する書類はありますか。",
      th: "คุณทำงานอยู่หรือไม่ มีเอกสารเกี่ยวกับการทำงานไหม",
    },
    answers: [
      { ko: "네, 재직증명서를 가지고 있습니다.", en: "Yes, I have a certificate of employment.", vi: "Vâng, tôi có giấy xác nhận công tác.", zh: "在职，我带了在职证明。", ja: "はい、在職証明書を持っています。", th: "ทำงานอยู่ค่ะ/ครับ ฉันมีหนังสือรับรองการทำงาน" },
      { ko: "네, 하지만 서류는 다음에 가져오겠습니다.", en: "Yes, but I will bring the documents next time.", vi: "Vâng, nhưng lần sau tôi sẽ mang giấy tờ.", zh: "在职，但材料下次带来。", ja: "はい、書類は次回お持ちします。", th: "ทำงานอยู่ แต่จะนำเอกสารมาครั้งหน้า" },
      { ko: "아니요, 현재 일하고 있지 않습니다.", en: "No, I am not working at the moment.", vi: "Không, hiện tôi không đi làm.", zh: "没有，我目前没有工作。", ja: "いいえ、現在は働いていません。", th: "ไม่ได้ทำงานอยู่ในขณะนี้" },
    ],
  },
];

/** Extra questions a teller asks when a product actually carries the matching condition. */
export const ruleTellerExchanges: Record<string, TellerExchange> = {
  VISA_TYPE: {
    id: "VISA_TYPE",
    question: {
      ko: "체류자격이 어떻게 되세요?",
      en: "What is your status of stay?",
      vi: "Tư cách lưu trú của bạn là gì?",
      zh: "您的停留资格是什么？",
      ja: "在留資格は何ですか。",
      th: "สถานะการพำนักของคุณคืออะไร",
    },
    answers: [
      { ko: "외국인등록증에 표시된 체류자격을 확인해 주세요.", en: "Please check the status of stay printed on my residence card.", vi: "Vui lòng xem tư cách lưu trú in trên thẻ cư trú của tôi.", zh: "请查看我外国人登录证上标示的停留资格。", ja: "外国人登録証に記載された在留資格をご確認ください。", th: "กรุณาตรวจสอบสถานะการพำนักที่ระบุบนบัตรประจำตัวคนต่างด้าวของฉัน" },
    ],
  },
  RESIDENCY_MONTH: {
    id: "RESIDENCY_MONTH",
    question: {
      ko: "한국에 오신 지 얼마나 되셨어요?",
      en: "How long have you lived in Korea?",
      vi: "Bạn đã ở Hàn Quốc bao lâu rồi?",
      zh: "您来韩国多久了？",
      ja: "韓国に来られてどのくらいですか。",
      th: "คุณอยู่เกาหลีมานานเท่าไรแล้ว",
    },
    answers: [
      { ko: "외국인등록증의 발급일을 확인해 주세요.", en: "Please check the issue date on my residence card.", vi: "Vui lòng xem ngày cấp trên thẻ cư trú của tôi.", zh: "请查看我外国人登录证的签发日期。", ja: "外国人登録証の発行日をご確認ください。", th: "กรุณาตรวจสอบวันที่ออกบัตรประจำตัวคนต่างด้าวของฉัน" },
      { ko: "정확한 기간은 확인해서 알려드리겠습니다.", en: "I will check the exact period and let you know.", vi: "Tôi sẽ kiểm tra chính xác và báo lại.", zh: "准确期间我确认后告诉您。", ja: "正確な期間は確認してお伝えします。", th: "ฉันจะตรวจสอบระยะเวลาที่แน่นอนแล้วแจ้งให้ทราบ" },
    ],
  },
  DOMESTIC_INCOME_MONTH: {
    id: "DOMESTIC_INCOME_MONTH",
    question: {
      ko: "지금 직장에서 급여를 받으신 지 얼마나 되셨어요?",
      en: "How long have you been paid at your current job?",
      vi: "Bạn đã nhận lương ở công việc hiện tại bao lâu?",
      zh: "您在现在的公司领薪多久了？",
      ja: "現在の勤務先で給与を受け取ってどのくらいですか。",
      th: "คุณได้รับเงินเดือนจากที่ทำงานปัจจุบันมานานเท่าไร",
    },
    answers: [
      { ko: "급여명세서를 가지고 있습니다. 확인해 주시겠어요?", en: "I have my payslips. Could you check them?", vi: "Tôi có phiếu lương. Bạn kiểm tra giúp được không?", zh: "我带了工资单，可以帮我确认吗？", ja: "給与明細を持っています。ご確認いただけますか。", th: "ฉันมีสลิปเงินเดือน ช่วยตรวจสอบได้ไหม" },
      { ko: "정확한 기간은 확인해서 알려드리겠습니다.", en: "I will check the exact period and let you know.", vi: "Tôi sẽ kiểm tra chính xác và báo lại.", zh: "准确期间我确认后告诉您。", ja: "正確な期間は確認してお伝えします。", th: "ฉันจะตรวจสอบระยะเวลาที่แน่นอนแล้วแจ้งให้ทราบ" },
    ],
  },
  RESIDENT_STATUS: {
    id: "RESIDENT_STATUS",
    question: {
      ko: "국내 거주자이신가요?",
      en: "Are you a resident of Korea?",
      vi: "Bạn có phải là người cư trú tại Hàn Quốc không?",
      zh: "您是韩国居住者吗？",
      ja: "国内の居住者ですか。",
      th: "คุณเป็นผู้มีถิ่นที่อยู่ในเกาหลีหรือไม่",
    },
    answers: [
      { ko: "네, 한국에 거주하고 있습니다.", en: "Yes, I live in Korea.", vi: "Vâng, tôi đang sống tại Hàn Quốc.", zh: "是的，我住在韩国。", ja: "はい、韓国に居住しています。", th: "ใช่ค่ะ/ครับ ฉันอาศัยอยู่ในเกาหลี" },
      { ko: "거주자에 해당하는지 확인해 주시겠어요?", en: "Could you check whether I count as a resident?", vi: "Bạn kiểm tra giúp tôi có được tính là người cư trú không?", zh: "能否帮我确认我是否属于居住者？", ja: "居住者に該当するかご確認いただけますか。", th: "ช่วยตรวจสอบว่าฉันนับเป็นผู้มีถิ่นที่อยู่หรือไม่" },
    ],
  },
  HAS_EXISTING_PRODUCT_ACCOUNT: {
    id: "HAS_EXISTING_PRODUCT_ACCOUNT",
    question: {
      ko: "이 상품 계좌를 이미 가지고 계신가요?",
      en: "Do you already hold an account for this product?",
      vi: "Bạn đã có tài khoản của sản phẩm này chưa?",
      zh: "您已经有这个产品的账户了吗？",
      ja: "この商品の口座をすでにお持ちですか。",
      th: "คุณมีบัญชีของผลิตภัณฑ์นี้อยู่แล้วหรือไม่",
    },
    answers: [
      { ko: "아니요, 없습니다.", en: "No, I do not.", vi: "Không, tôi chưa có.", zh: "没有。", ja: "いいえ、持っていません。", th: "ไม่มีค่ะ/ครับ" },
      { ko: "네, 이미 있습니다.", en: "Yes, I already have one.", vi: "Vâng, tôi đã có rồi.", zh: "有的。", ja: "はい、すでに持っています。", th: "มีอยู่แล้วค่ะ/ครับ" },
      { ko: "잘 모르겠습니다. 조회해 주시겠어요?", en: "I am not sure. Could you look it up?", vi: "Tôi không chắc. Bạn tra giúp được không?", zh: "我不太清楚，可以帮我查一下吗？", ja: "わかりません。照会していただけますか。", th: "ฉันไม่แน่ใจ ช่วยตรวจสอบให้ได้ไหม" },
    ],
  },
  DESIRED_MONTHLY_AMOUNT: {
    id: "DESIRED_MONTHLY_AMOUNT",
    question: {
      ko: "매달 얼마씩 넣으실 계획이세요?",
      en: "How much do you plan to deposit each month?",
      vi: "Mỗi tháng bạn dự định gửi bao nhiêu?",
      zh: "您计划每月存入多少？",
      ja: "毎月いくら積み立てるご予定ですか。",
      th: "คุณวางแผนจะฝากเดือนละเท่าไร",
    },
    answers: [
      { ko: "월 납입 최소금액과 최대금액을 알려주시겠어요?", en: "Could you tell me the minimum and maximum monthly deposit?", vi: "Bạn cho tôi biết mức gửi hàng tháng tối thiểu và tối đa được không?", zh: "能告诉我每月存入的最低和最高金额吗？", ja: "毎月の最低額と最高額を教えていただけますか。", th: "ช่วยบอกยอดฝากรายเดือนขั้นต่ำและสูงสุดได้ไหม" },
      { ko: "금액은 상담 후에 정하고 싶습니다.", en: "I would like to decide the amount after we talk.", vi: "Tôi muốn quyết định số tiền sau khi được tư vấn.", zh: "我想咨询后再决定金额。", ja: "金額は相談してから決めたいです。", th: "ฉันอยากตัดสินใจยอดเงินหลังจากปรึกษาแล้ว" },
    ],
  },
};

/** Korean the customer says to raise a condition the bank still has to confirm. */
export const conditionAsks: Record<string, Phrase> = {
  FX_BANK_AND_E9_ENTRY_CHECK: {
    ko: "거래외국환은행 지정과 E-9 최초 입국 확인이 필요한지 알려주시겠어요?",
    en: "Could you tell me whether a designated foreign-exchange bank and an E-9 first-entry check are required?",
    vi: "Bạn cho tôi biết có cần chỉ định ngân hàng ngoại hối giao dịch và xác nhận nhập cảnh lần đầu E-9 không?",
    zh: "能否告知是否需要指定外汇交易银行以及 E-9 首次入境确认？",
    ja: "取引外国為替銀行の指定と、E-9 の初回入国確認が必要かどうか教えていただけますか。",
    th: "ช่วยแจ้งได้ไหมว่าต้องกำหนดธนาคารแลกเปลี่ยนเงินตราต่างประเทศและตรวจสอบการเข้าประเทศครั้งแรกของ E-9 หรือไม่",
  },
  REAL_NAME_VERIFICATION: {
    ko: "제 신분증으로 실명확인이 가능한지 확인해 주시겠어요?",
    en: "Could you check whether real-name verification is possible with my identification?",
    vi: "Bạn kiểm tra giúp tôi có thể xác minh danh tính thực bằng giấy tờ của tôi không?",
    zh: "能否确认用我的身份证件是否可以进行实名确认？",
    ja: "私の身分証明書で実名確認ができるかご確認いただけますか。",
    th: "ช่วยตรวจสอบได้ไหมว่าสามารถยืนยันตัวตนแบบชื่อจริงด้วยเอกสารของฉันได้หรือไม่",
  },
  VISA_DETAIL: {
    ko: "이 상품에 가입할 수 있는 체류자격 목록을 알려주시겠어요?",
    en: "Could you tell me which statuses of stay are accepted for this product?",
    vi: "Bạn cho tôi biết những tư cách lưu trú nào được chấp nhận cho sản phẩm này?",
    zh: "能否告诉我这个产品接受哪些停留资格？",
    ja: "この商品に加入できる在留資格の一覧を教えていただけますか。",
    th: "ช่วยบอกรายการสถานะการพำนักที่สมัครผลิตภัณฑ์นี้ได้ไหม",
  },
  GUARANTEE: {
    ko: "보증보험 발급이 가능한지 확인해 주시겠어요?",
    en: "Could you check whether guarantee insurance can be issued?",
    vi: "Bạn kiểm tra giúp có thể cấp bảo hiểm bảo lãnh không?",
    zh: "能否确认是否可以办理保证保险？",
    ja: "保証保険の発行が可能かご確認いただけますか。",
    th: "ช่วยตรวจสอบได้ไหมว่าสามารถออกประกันค้ำประกันได้หรือไม่",
  },
  BANK_CREDIT_REVIEW: {
    ko: "내부 신용평가에서 어떤 항목을 보시는지 알려주시겠어요?",
    en: "Could you tell me what the internal credit review looks at?",
    vi: "Bạn cho tôi biết đánh giá tín dụng nội bộ xem xét những gì?",
    zh: "能否告诉我内部信用评估会看哪些项目？",
    ja: "内部の信用評価ではどの項目を見るのか教えていただけますか。",
    th: "ช่วยบอกได้ไหมว่าการประเมินเครดิตภายในพิจารณาสิ่งใดบ้าง",
  },
};

/** Baseline questions first, then the ones the product's own conditions bring in. */
export function tellerExchangesFor(ruleKeys: string[]): TellerExchange[] {
  const matched = Array.from(new Set(ruleKeys))
    .map((key) => ruleTellerExchanges[key])
    .filter((exchange): exchange is TellerExchange => Boolean(exchange));
  return [...baselineTellerExchanges, ...matched];
}
