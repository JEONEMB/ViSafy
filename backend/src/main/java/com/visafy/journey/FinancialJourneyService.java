package com.visafy.journey;

import com.visafy.journey.FinancialJourneyResult.JourneyStep;
import com.visafy.journey.FinancialJourneyResult.JourneyStepStatus;
import com.visafy.journey.FinancialJourneyResult.ProfileSummary;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import com.visafy.execution.ApiExecutionHistoryService;
import org.springframework.stereotype.Service;

@Service
public class FinancialJourneyService {
    private static final List<String> CODES = List.of("IDENTITY_PREPARATION", "DEMAND_DEPOSIT_ACCOUNT",
            "RECEIVE_SALARY", "DEBIT_CARD", "SAVINGS", "REMITTANCE", "BUILD_CREDIT",
            "LOAN_AND_HOUSING", "INVESTMENT");
    private final TempProfileService profileService;
    private final FinancialJourneyProgressRepository progressRepository;

    public FinancialJourneyService(TempProfileService profileService, FinancialJourneyProgressRepository progressRepository) {
        this.profileService = profileService;
        this.progressRepository = progressRepository;
    }

    public FinancialJourneyResult get(String profileSessionId) {
        TempProfile profile = profileService.getBySessionId(profileSessionId.strip());
        FinancialPurposeCode purpose = FinancialPurposeCode.from(profile.getFinancialPurpose());
        boolean identityReady = Boolean.TRUE.equals(profile.getHasResidenceCard())
                || Boolean.TRUE.equals(profile.getHasPassport());
        boolean accountReady = Boolean.TRUE.equals(profile.getHasKoreanBankAccount());
        int current = !identityReady ? 1 : (!accountReady && purpose.targetStep() >= 2 ? 2 : purpose.targetStep());
        String language = profile.getLanguage();
        String nextAction = nextAction(language, purpose, identityReady, accountReady);
        List<JourneyStep> steps = new ArrayList<>();
        Set<String> explicit = progressRepository.findByProfileSessionHashAndCompletedTrue(
                ApiExecutionHistoryService.hashSessionId(profileSessionId.strip())).stream()
                .map(FinancialJourneyProgress::getStepCode).collect(Collectors.toSet());
        for (int number = 1; number <= CODES.size(); number++) {
            JourneyStepStatus status;
            if (explicit.contains(CODES.get(number - 1)) || number == 1 && identityReady || number == 2 && accountReady) status = JourneyStepStatus.COMPLETED;
            else if (number == current) status = JourneyStepStatus.CURRENT;
            else if (number < current) status = JourneyStepStatus.NEED_CONFIRMATION;
            else status = JourneyStepStatus.UPCOMING;
            steps.add(new JourneyStep(number, CODES.get(number - 1), status,
                    title(language, number), description(language, number)));
        }
        return new FinancialJourneyResult(purpose, current,
                localized(language, "나의 한국 금융생활 여정", "My financial journey in Korea",
                        "Hành trình tài chính của tôi tại Hàn Quốc", "我在韩国的金融生活旅程",
                        "私の韓国での金融ライフの道のり",
                        "เส้นทางการเงินของฉันในเกาหลี"), nextAction,
                new ProfileSummary(profile.getNationality(),
                        Boolean.TRUE.equals(profile.getHasResidenceCard()),
                        Boolean.TRUE.equals(profile.getHasPassport()),
                        Boolean.TRUE.equals(profile.getHasDomesticPhone()),
                        Boolean.TRUE.equals(profile.getCanDomesticPhoneVerify()),
                        Boolean.TRUE.equals(profile.getHasKoreanBankAccount()),
                        Boolean.TRUE.equals(profile.getHasKoreanCreditHistory()),
                        profile.getRemittanceCountry()),
                List.copyOf(steps));
    }

    public void updateProgress(String profileSessionId, String stepCode, boolean completed) {
        TempProfile profile = profileService.getBySessionId(profileSessionId.strip());
        String normalized = stepCode.strip().toUpperCase();
        if (!CODES.contains(normalized)) throw new IllegalArgumentException("Unsupported journey step");
        String hash = ApiExecutionHistoryService.hashSessionId(profileSessionId.strip());
        FinancialJourneyProgress progress = progressRepository.findByProfileSessionHashAndStepCode(hash, normalized)
                .orElseGet(() -> new FinancialJourneyProgress(hash, normalized, completed, profile.getExpiresAt()));
        progress.update(completed, profile.getExpiresAt());
        progressRepository.save(progress);
    }

    private String nextAction(String language, FinancialPurposeCode purpose, boolean identity, boolean account) {
        if (!identity) return localized(language,
                "먼저 금융기관에서 사용할 수 있는 신분증과 신분확인 방법을 확인해보세요.",
                "First, confirm which identity document and verification method the institution accepts.",
                "Trước tiên, hãy xác nhận giấy tờ và cách xác minh danh tính mà tổ chức chấp nhận.",
                "请先确认该金融机构可接受的身份证件与本人确认方式。",
                "まず、金融機関で使用できる本人確認書類と確認方法をご確認ください。",
                "ก่อนอื่น กรุณาตรวจสอบเอกสารยืนยันตัวตนและวิธีการยืนยันที่สถาบันการเงินยอมรับ");
        if (!account && purpose == FinancialPurposeCode.SAVE_MONEY) return localized(language,
                "적금을 알아보기 전에 자동이체 등에 사용할 국내 계좌가 필요한지 확인해보세요.",
                "Before choosing savings, check whether you need a Korean account for automatic transfers.",
                "Trước khi chọn tiết kiệm, hãy kiểm tra bạn có cần tài khoản Hàn Quốc để chuyển tiền tự động không.",
                "在了解定期存款之前，请确认是否需要用于自动转账的韩国账户。",
                "積立を検討する前に、自動振替などに使う韓国の口座が必要かご確認ください。",
                "ก่อนเลือกบัญชีออมทรัพย์ กรุณาตรวจสอบว่าคุณต้องมีบัญชีเกาหลีสำหรับการโอนอัตโนมัติหรือไม่");
        if (!account && purpose.targetStep() >= 2) return localized(language,
                "다음 금융서비스를 이용하기 전에 국내 입출금계좌가 필요한지 확인해보세요.",
                "Check whether a Korean demand-deposit account is required before the next service.",
                "Hãy kiểm tra có cần tài khoản thanh toán tại Hàn Quốc trước dịch vụ tiếp theo không.",
                "在使用下一项金融服务之前，请确认是否需要韩国的活期存款账户。",
                "次の金融サービスを利用する前に、韓国の普通預金口座が必要かご確認ください。",
                "ก่อนใช้บริการทางการเงินถัดไป กรุณาตรวจสอบว่าจำเป็นต้องมีบัญชีเงินฝากกระแสรายวันของเกาหลีหรือไม่");
        return localized(language, "공식 조건과 필요한 준비사항을 상품별로 확인해보세요.",
                "Review the official conditions and preparation items for each product.",
                "Hãy xem điều kiện chính thức và các mục cần chuẩn bị cho từng sản phẩm.",
                "请按产品确认官方条件与需要准备的事项。",
                "商品ごとに公式条件と必要な準備事項をご確認ください。",
                "กรุณาตรวจสอบเงื่อนไขอย่างเป็นทางการและสิ่งที่ต้องเตรียมของแต่ละผลิตภัณฑ์");
    }

    private static final List<String> LANGUAGE_ROWS = List.of("ko", "en", "vi", "zh", "ja", "th");

    private String title(String language, int step) {
        String[][] values = {
                {"신분확인 준비", "입출금계좌", "급여수령", "체크카드", "예·적금", "해외송금", "신용이력 형성", "대출·주거금융", "투자"},
                {"Prepare identification", "Demand deposit account", "Receive salary", "Debit card", "Savings", "Remittance", "Build credit", "Loans & housing", "Investment"},
                {"Chuẩn bị danh tính", "Tài khoản thanh toán", "Nhận lương", "Thẻ ghi nợ", "Tiết kiệm", "Chuyển tiền", "Xây dựng tín dụng", "Vay & nhà ở", "Đầu tư"},
                {"身份确认准备", "活期存款账户", "工资领取", "借记卡", "存款・定期存款", "海外汇款", "建立信用记录", "贷款・住房金融", "投资"},
                {"本人確認の準備", "普通預金口座", "給与の受取", "デビットカード", "預金・積立", "海外送金", "信用履歴の形成", "ローン・住宅金融", "投資"},
                {"เตรียมยืนยันตัวตน", "บัญชีเงินฝากกระแสรายวัน", "การรับเงินเดือน", "บัตรเดบิต", "เงินฝากและออมทรัพย์", "การโอนเงินต่างประเทศ", "สร้างประวัติเครดิต", "สินเชื่อและการเงินที่อยู่อาศัย", "การลงทุน"}
        };
        return values[row(language)][step - 1];
    }

    private String description(String language, int step) {
        return localized(language, step + "단계의 공식 이용조건과 준비사항을 확인합니다.",
                "Review official access conditions and preparation for step " + step + ".",
                "Xem điều kiện sử dụng chính thức và chuẩn bị cho bước " + step + ".",
                "确认第 " + step + " 阶段的官方使用条件与准备事项。",
                "ステップ" + step + "の公式利用条件と準備事項を確認します。",
                "ตรวจสอบเงื่อนไขการใช้บริการอย่างเป็นทางการและสิ่งที่ต้องเตรียมของขั้นที่ " + step);
    }

    private int row(String language) {
        int index = language == null ? -1 : LANGUAGE_ROWS.indexOf(language.toLowerCase(Locale.ROOT));
        return index < 0 ? 0 : index;
    }

    private String localized(String language, String ko, String en, String vi, String zh, String ja, String th) {
        return switch (row(language)) {
            case 1 -> en;
            case 2 -> vi;
            case 3 -> zh;
            case 4 -> ja;
            case 5 -> th;
            default -> ko;
        };
    }
}
