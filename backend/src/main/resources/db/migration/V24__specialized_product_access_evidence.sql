-- Complete only evidence explicitly stated by approved official sources.
-- Missing Shinhan identity and jeonse-loan details remain bank-confirmation / source-insufficient.

SET @reviewer = 'official-access-review-2026-08-28';

SET @hana_ez_source = (
    SELECT id FROM source_document
    WHERE source_url LIKE 'https://%hanabank.com/cont/mall/mall08/mall0802/mall080204/1510586_115200.jsp%'
      AND review_status = 'APPROVED'
    ORDER BY id DESC LIMIT 1
);

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value,
    rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name,
    valid_from, valid_to, description, confidence, review_status, last_verified_at, reviewed_by,
    created_at, updated_at)
SELECT @hana_ez_source, 'HANA-EZ-LOAN', 'HAS_RESIDENCE_CARD', 'EQ', 'true',
       'UNKNOWN', 'IDENTIFICATION_METHOD', FALSE,
       '외국인 등록증을 보유한 손님(체류자격 E-7 또는 E-9 한정)',
       '공식 상세페이지 대출대상 1번', NULL, '대출대상', '2025-08-27', NULL,
       '하나 외국인 EZ Loan의 공식 신분확인·보유 증표', 1.0000, 'APPROVED',
       CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE @hana_ez_source IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rule_candidate
                  WHERE product_code = 'HANA-EZ-LOAN' AND rule_key = 'HAS_RESIDENCE_CARD'
                    AND rule_nature = 'IDENTIFICATION_METHOD');

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value,
    rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name,
    valid_from, valid_to, description, confidence, review_status, last_verified_at, reviewed_by,
    created_at, updated_at)
SELECT @hana_ez_source, 'HANA-EZ-LOAN', 'BRANCH_ONLY', 'EXISTS', 'true',
       'UNKNOWN', 'CHANNEL_REQUIREMENT', FALSE,
       '신용대출 영업점 - 하나 외국인 EZ Loan',
       '공식 상세페이지 상품명 상단 채널 표시', NULL, '상품 채널', '2025-08-27', NULL,
       '공식 상품페이지에서 영업점 상품으로 표시하며 모바일 신청 가능 근거는 없음',
       1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer,
       CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE @hana_ez_source IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rule_candidate
                  WHERE product_code = 'HANA-EZ-LOAN' AND rule_key = 'BRANCH_ONLY'
                    AND rule_nature = 'CHANNEL_REQUIREMENT');

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value,
    rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name,
    valid_from, valid_to, description, confidence, review_status, last_verified_at, reviewed_by,
    created_at, updated_at)
SELECT @hana_ez_source, 'HANA-EZ-LOAN', 'FOREIGNER_LOAN_DOCUMENTS', 'EXISTS', 'true',
       'UNKNOWN', 'REQUIRED_DOCUMENT', FALSE,
       '외국인등록증, 여권, 고용허가서 또는 표준근로계약서, 건강보험득실확인서, 재직 및 연소득 증빙서류',
       '공식 상세페이지 필요서류', NULL, '필요서류', '2025-08-27', NULL,
       '필요시 은행이 추가 서류를 요청할 수 있음', 1.0000, 'APPROVED',
       CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE @hana_ez_source IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rule_candidate
                  WHERE product_code = 'HANA-EZ-LOAN' AND rule_key = 'FOREIGNER_LOAN_DOCUMENTS'
                    AND rule_nature = 'REQUIRED_DOCUMENT');

-- The SOL Global Savings description refers to non-face-to-face channels at product level.
-- It does not explicitly confirm foreign-customer mobile onboarding, so Runtime keeps online UNKNOWN.
SET @sol_channel_snapshot = 'SOL글로벌 적금 상품설명서는 인터넷뱅킹 등 비대면 채널을 통해 가입하거나 통장 미발행을 요청할 수 있는 경우를 안내하고, 실제 계약내용은 통장·증서 또는 비대면 채널 계좌상세조회에 따른다고 설명한다. 다만 외국인 고객의 모바일 신규 가능 여부와 신분확인증표 종류는 직접 명시하지 않는다.';

INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
    retrieved_at, information_base_date, valid_from, valid_to, language, review_status,
    last_verified_at, reviewed_by, created_at, updated_at)
SELECT '신한은행', 'PRODUCT_DESCRIPTION', 'SOL글로벌 적금 비대면 채널 안내 근거',
       'https://img.shinhan.com/sbank2016/seol/20170630814200000030LC000030.PDF',
       @sol_channel_snapshot, SHA2(@sol_channel_snapshot, 256), CURRENT_TIMESTAMP(6), '2026-08-28',
       '2025-10-31', '2026-10-30', 'ko', 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer,
       CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@sol_channel_snapshot, 256));

SET @sol_channel_source = (
    SELECT id FROM source_document WHERE content_hash = SHA2(@sol_channel_snapshot, 256) LIMIT 1
);

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value,
    rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name,
    valid_from, valid_to, description, confidence, review_status, last_verified_at, reviewed_by,
    created_at, updated_at)
SELECT @sol_channel_source, 'SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'PRODUCT_NON_FACE_TO_FACE_CHANNEL',
       'EXISTS', 'true', 'UNKNOWN', 'CHANNEL_REQUIREMENT', FALSE,
       '인터넷뱅킹 등 비대면 채널을 통해 가입하거나 통장 미발행 요청 시에는 통장 또는 증서가 교부되지 않습니다.',
       '상품설명서 p.1 상단 안내', 1, '상품설명서 이용 안내', '2025-10-31', '2026-10-30',
       '상품 수준의 비대면 채널 언급이며 외국인 모바일 신규 가능을 확정하지 않음',
       1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer,
       CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE @sol_channel_source IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rule_candidate
                  WHERE product_code = 'SHINHAN-SOL-GLOBAL-SAVINGS-2025'
                    AND rule_key = 'PRODUCT_NON_FACE_TO_FACE_CHANNEL');

-- Preserve the jeonse product as an existence-only official reference.
-- No direct conditions, identity, channel, or document evidence is promoted.
SET @jeonse_source = (
    SELECT source_document_id FROM financial_product
    WHERE product_code = 'SHINHAN-SOL-GLOBAL-JEONSE' LIMIT 1
);

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value,
    rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name,
    valid_from, valid_to, description, confidence, review_status, last_verified_at, reviewed_by,
    created_at, updated_at)
SELECT @jeonse_source, 'SHINHAN-SOL-GLOBAL-JEONSE', 'PRODUCT_EXISTENCE_REFERENCE', 'EXISTS', 'true',
       'UNKNOWN', 'INFORMATION', FALSE,
       '외국인패키지 상품: SOL글로벌 통장, SOL글로벌 전세대출(서울보증_외국인)',
       'SOL글로벌 적금 상품설명서 p.1 우대이자율 2번', 1, '우대이자율',
       '2025-10-31', '2026-10-30',
       '상품 존재만 확인하며 가입조건·신분확인·채널·필요서류의 근거로 사용하지 않음',
       1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer,
       CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE @jeonse_source IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rule_candidate
                  WHERE product_code = 'SHINHAN-SOL-GLOBAL-JEONSE'
                    AND rule_key = 'PRODUCT_EXISTENCE_REFERENCE');

UPDATE financial_product
SET additional_conditions = '직접 상품설명서·약관이 등록되지 않아 가입조건, 신분확인, 채널 및 필요서류는 은행 확인이 필요합니다.',
    required_documents = '현재 등록된 공식 자료만으로 확인할 수 없습니다.',
    application_method = '신한은행 영업점 또는 공식 고객센터에서 상품 판매 여부와 신청 절차를 먼저 확인합니다.',
    updated_at = CURRENT_TIMESTAMP(6)
WHERE product_code = 'SHINHAN-SOL-GLOBAL-JEONSE';

INSERT INTO rule_change_history (rule_candidate_id, action, reviewer, before_status,
    after_operator, after_value, after_level, after_status, reviewed_at)
SELECT rc.id, 'APPROVE', @reviewer, 'PENDING', rc.operator, rc.rule_value, rc.rule_level,
       'APPROVED', rc.last_verified_at
FROM rule_candidate rc
LEFT JOIN rule_change_history history
       ON history.rule_candidate_id = rc.id AND history.action = 'APPROVE'
WHERE rc.reviewed_by = @reviewer AND history.id IS NULL;
