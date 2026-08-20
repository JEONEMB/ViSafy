-- The product-name link in Hana Bank's official disclosure list resolves to a detailed official page.
-- Comparable public conditions become HARD rules. Conditional E-9/FX-bank checks remain external.

SET @hana_ez_detail_snapshot = '하나 외국인 EZ Loan 공식 상세페이지. 대출대상: 외국인등록증을 보유한 국내 거주 외국인 중 체류자격 E-7 또는 E-9, 국내 거주기간 3개월 이상, 현 직장 급여소득 3개월 이상, 하나은행을 거래외국환 지정은행으로 등록한 고객. E-9는 최초 1회차 입국자. 필요서류: 외국인등록증, 여권, 고용허가서 또는 표준근로계약서, 건강보험득실확인서, 재직 및 연소득 증빙서류. 영업점 상품.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'PRODUCT_PAGE', '하나 외국인 EZ Loan 공식 상세페이지',
       'https://www.hanabank.com/cont/mall/mall08/mall0802/mall080204/1510586_115200.jsp',
       @hana_ez_detail_snapshot, SHA2(@hana_ez_detail_snapshot, 256), CURRENT_TIMESTAMP(6),
       '2025-08-27', NULL, 'ko', 'APPROVED', CURRENT_TIMESTAMP(6),
       'season2-official-source-review', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@hana_ez_detail_snapshot, 256));
SET @hana_ez_detail_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@hana_ez_detail_snapshot, 256));

UPDATE financial_product
SET source_document_id = @hana_ez_detail_source,
    description = '공식 상세페이지의 체류자격, 국내 거주기간과 급여소득기간을 비교하고 은행 확인 조건을 분리한 외국인 근로자 신용대출',
    target_summary = 'E-7 또는 E-9 체류자격으로 국내 거주·급여소득 기간 조건을 충족한 외국인 근로자',
    information_base_date = '2026-08-20',
    public_conditions = 'E-7 또는 E-9, 국내 거주기간 3개월 이상, 현 직장 급여소득 3개월 이상',
    additional_conditions = '거래외국환 지정은행 등록 및 E-9 최초 1회차 입국 여부는 은행 확인 필요',
    required_documents = '외국인등록증, 여권, 고용허가서 또는 표준근로계약서, 건강보험득실확인서, 재직 및 연소득 증빙서류',
    application_method = '하나은행 영업점 상담 및 신청',
    updated_at = CURRENT_TIMESTAMP(6)
WHERE product_code = 'HANA-EZ-LOAN';
SET @hana_ez_product = (SELECT id FROM financial_product WHERE product_code = 'HANA-EZ-LOAN');

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value, rule_level,
    rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name, valid_from, valid_to,
    description, confidence, review_status, last_verified_at, created_at, updated_at) VALUES
(@hana_ez_detail_source, 'HANA-EZ-LOAN', 'VISA_TYPE', 'IN', '["E-7","E-9"]', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '체류자격 E-7 또는 E-9 한정', '공식 상세페이지 대출대상 1', NULL, '대출대상', '2025-08-27', NULL,
 '허용 체류자격', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_ez_detail_source, 'HANA-EZ-LOAN', 'RESIDENCY_MONTH', 'GTE', '3', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '국내 거주기간 3개월 이상', '공식 상세페이지 대출대상 2', NULL, '대출대상', '2025-08-27', NULL,
 '국내 거주 최소기간', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_ez_detail_source, 'HANA-EZ-LOAN', 'DOMESTIC_INCOME_MONTH', 'GTE', '3', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '현 직장 급여소득 3개월 이상', '공식 상세페이지 대출대상 2', NULL, '대출대상', '2025-08-27', NULL,
 '현 직장 급여소득 최소기간', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_ez_detail_source, 'HANA-EZ-LOAN', 'FX_BANK_AND_E9_ENTRY_CHECK', 'EXISTS', 'BANK_PROCESS',
 'EXTERNAL_CHECK', 'EXTERNAL_CHECK', TRUE,
 '당행을 거래 외국환지정은행으로 등록, 체류자격 E-9는 최초 1회차 입국자',
 '공식 상세페이지 대출대상 3~4', NULL, '대출대상', '2025-08-27', NULL,
 '거래외국환 지정과 E-9 최초 입국 조건은 은행 확인 필요', 1.0000, 'APPROVED',
 CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));

INSERT INTO product_rule (rule_candidate_id, product_id, source_document_id, rule_key, operator, rule_value,
    rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name, valid_from,
    valid_to, review_status, description, active, verified_at, created_at, updated_at)
SELECT rc.id, @hana_ez_product, rc.source_document_id, rc.rule_key, rc.operator, rc.rule_value, rc.rule_level,
       rc.rule_nature, rc.mandatory, rc.source_excerpt, rc.source_locator, rc.page_number, rc.section_name,
       rc.valid_from, rc.valid_to, rc.review_status, rc.description, TRUE, rc.last_verified_at,
       rc.created_at, rc.updated_at
FROM rule_candidate rc
LEFT JOIN product_rule pr ON pr.rule_candidate_id = rc.id
WHERE rc.product_code = 'HANA-EZ-LOAN' AND pr.id IS NULL;

INSERT INTO rule_change_history (rule_candidate_id, action, reviewer, before_operator, before_value,
    before_level, before_status, after_operator, after_value, after_level, after_status, reviewed_at)
SELECT rc.id, 'APPROVE', 'season2-official-source-review', NULL, NULL, NULL, 'PENDING',
       rc.operator, rc.rule_value, rc.rule_level, 'APPROVED', rc.last_verified_at
FROM rule_candidate rc
LEFT JOIN rule_change_history history ON history.rule_candidate_id = rc.id AND history.action = 'APPROVE'
WHERE rc.product_code = 'HANA-EZ-LOAN' AND history.id IS NULL;

INSERT INTO product_document_requirement (product_id, source_document_id, document_name, description,
    requirement_type, condition_rule_key, source_locator, valid_from, valid_to, active, verified_at,
    created_at, updated_at) VALUES
(@hana_ez_product, @hana_ez_detail_source, '외국인등록증', '외국인등록증 보유가 대출대상에 포함됩니다.', 'OFFICIAL_REQUIRED', NULL, '공식 상세페이지 대출대상·필요서류', '2025-08-27', NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_ez_product, @hana_ez_detail_source, '여권', '공식 필요서류 목록에 명시되어 있습니다.', 'OFFICIAL_REQUIRED', NULL, '공식 상세페이지 필요서류', '2025-08-27', NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_ez_product, @hana_ez_detail_source, '고용허가서 또는 표준근로계약서', '두 문서 중 해당 문서를 준비합니다.', 'OFFICIAL_REQUIRED', NULL, '공식 상세페이지 필요서류', '2025-08-27', NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_ez_product, @hana_ez_detail_source, '건강보험득실확인서', '공식 필요서류 목록에 명시되어 있습니다.', 'OFFICIAL_REQUIRED', NULL, '공식 상세페이지 필요서류', '2025-08-27', NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_ez_product, @hana_ez_detail_source, '재직 및 연소득 증빙서류', '재직과 연소득을 증빙하는 서류입니다.', 'OFFICIAL_REQUIRED', NULL, '공식 상세페이지 필요서류', '2025-08-27', NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_ez_product, @hana_ez_detail_source, '추가 요청 서류', '필요시 은행이 추가 서류를 요청할 수 있습니다.', 'BANK_CONFIRMATION', NULL, '공식 상세페이지 필요서류 안내', '2025-08-27', NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));

INSERT INTO product_application_step (product_id, source_document_id, step_order, title, description, channel,
    source_locator, valid_from, valid_to, active, created_at, updated_at)
SELECT @hana_ez_product, @hana_ez_detail_source, 1, '필요서류 준비', '공식 상세페이지에 명시된 필요서류를 준비합니다.',
       '영업점', '공식 상세페이지 필요서류', '2025-08-27', NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM product_application_step WHERE product_id = @hana_ez_product AND step_order = 1);

INSERT INTO product_application_step (product_id, source_document_id, step_order, title, description, channel,
    source_locator, valid_from, valid_to, active, created_at, updated_at)
SELECT @hana_ez_product, @hana_ez_detail_source, 2, '영업점 상담 및 신청', '하나은행 영업점에서 추가 조건을 확인하고 신청합니다.',
       '영업점', '공식 상세페이지 영업점 상품 표시', '2025-08-27', NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM product_application_step WHERE product_id = @hana_ez_product AND step_order = 2);
