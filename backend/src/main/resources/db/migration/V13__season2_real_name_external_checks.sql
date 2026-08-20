-- "Real-name foreigner" is an explicit official-source condition, but the user cannot complete
-- the bank's identity verification inside ViSafy. Keep it as a non-mandatory EXTERNAL_CHECK.
SET @sol_savings_source = (SELECT id FROM source_document WHERE title = 'SOL글로벌 적금 상품설명서' ORDER BY id DESC LIMIT 1);
SET @easy_account_terms_source = (SELECT id FROM source_document WHERE title = 'Easy-One Pack 통장 특약' ORDER BY id DESC LIMIT 1);
SET @easy_savings_terms_source = (SELECT id FROM source_document WHERE title = 'Easy-One Pack 적금 특약' ORDER BY id DESC LIMIT 1);

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value, rule_level,
    rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name, valid_from, valid_to,
    description, confidence, review_status, last_verified_at, created_at, updated_at) VALUES
(@sol_savings_source, 'SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'REAL_NAME_VERIFICATION', 'EXISTS', 'BANK_PROCESS',
 'EXTERNAL_CHECK', 'EXTERNAL_CHECK', FALSE, '가입대상 실명의 외국인', '상품설명서 4페이지 가입대상', 4,
 '거래조건-가입대상', '2025-10-31', '2026-10-30', '실명확인은 신한은행 절차에서 확인 필요', 1.0000,
 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_account_terms_source, 'HANA-EASY-ONE-ACCOUNT', 'REAL_NAME_VERIFICATION', 'EXISTS', 'BANK_PROCESS',
 'EXTERNAL_CHECK', 'EXTERNAL_CHECK', FALSE, '실명의 외국인 개인 또는 외국인 개인사업자', '특약 제3조 가입대상', 1,
 '제3조 가입대상', '2025-07-01', NULL, '실명확인은 하나은행 절차에서 확인 필요', 1.0000,
 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_savings_terms_source, 'HANA-EASY-ONE-SAVINGS', 'REAL_NAME_VERIFICATION', 'EXISTS', 'BANK_PROCESS',
 'EXTERNAL_CHECK', 'EXTERNAL_CHECK', FALSE, '외국인 개인 및 외국인 개인사업자', '특약 제3조 가입대상', 1,
 '제3조 가입대상', '2021-03-25', NULL, '실명확인은 하나은행 절차에서 확인 필요', 1.0000,
 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));

INSERT INTO product_rule (rule_candidate_id, product_id, source_document_id, rule_key, operator, rule_value,
    rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name, valid_from,
    valid_to, review_status, description, active, verified_at, created_at, updated_at)
SELECT rc.id, fp.id, rc.source_document_id, rc.rule_key, rc.operator, rc.rule_value, rc.rule_level,
       rc.rule_nature, rc.mandatory, rc.source_excerpt, rc.source_locator, rc.page_number, rc.section_name,
       rc.valid_from, rc.valid_to, rc.review_status, rc.description, TRUE, rc.last_verified_at,
       rc.created_at, rc.updated_at
FROM rule_candidate rc
JOIN financial_product fp ON fp.product_code = rc.product_code
LEFT JOIN product_rule pr ON pr.rule_candidate_id = rc.id
WHERE rc.product_code IN ('SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'HANA-EASY-ONE-ACCOUNT', 'HANA-EASY-ONE-SAVINGS')
  AND rc.rule_key = 'REAL_NAME_VERIFICATION' AND pr.id IS NULL;

INSERT INTO rule_change_history (rule_candidate_id, action, reviewer, before_operator, before_value,
    before_level, before_status, after_operator, after_value, after_level, after_status, reviewed_at)
SELECT rc.id, 'APPROVE', 'season2-official-source-review', NULL, NULL, NULL, 'PENDING',
       rc.operator, rc.rule_value, rc.rule_level, 'APPROVED', rc.last_verified_at
FROM rule_candidate rc
LEFT JOIN rule_change_history history ON history.rule_candidate_id = rc.id AND history.action = 'APPROVE'
WHERE rc.product_code IN ('SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'HANA-EASY-ONE-ACCOUNT', 'HANA-EASY-ONE-SAVINGS')
  AND rc.rule_key = 'REAL_NAME_VERIFICATION' AND history.id IS NULL;
