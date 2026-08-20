-- Season 2 READY packages verified manually against official bank pages/documents on 2026-08-20.
-- Only explicit eligibility and amount statements become HARD rules. Missing document requirements are not invented.
SET @sol_savings_snapshot = 'SOL글로벌 적금 상품설명서. 상품특징: 해외 송금 시 특별중도해지 이율을 제공하는 외국인 전용 적금. 가입대상: 실명의 외국인(비거주자 제외), 1인 1계좌. 최저가입금액 1천원 이상, 최고가입금액 월 3백만원 이하. 계약기간 1년제, 자유적립식.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '신한은행', 'PRODUCT_DESCRIPTION', 'SOL글로벌 적금 상품설명서',
       'https://img.shinhan.com/sbank2016/seol/20170630814200000030LC000030.PDF',
       @sol_savings_snapshot, SHA2(@sol_savings_snapshot, 256), CURRENT_TIMESTAMP(6),
       '2025-10-31', '2026-10-30', 'ko', 'APPROVED', CURRENT_TIMESTAMP(6),
       'season2-official-source-review', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@sol_savings_snapshot, 256));
SET @sol_savings_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@sol_savings_snapshot, 256));

SET @easy_account_page_snapshot = 'Easy-One Pack 통장 공식 상품페이지. 외국인 전용 입출금통장. 가입대상: 실명의 외국인 개인 또는 외국인 개인사업자. 예금종류: 저축예금. 가입채널: 영업점.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'PRODUCT_PAGE', 'Easy-One Pack 통장 공식 상품페이지',
       'https://www.kebhana.com/cont/mall/mall08/mall0801/mall080103/1431574_115188.jsp',
       @easy_account_page_snapshot, SHA2(@easy_account_page_snapshot, 256), CURRENT_TIMESTAMP(6),
       '2025-07-01', NULL, 'ko', 'APPROVED', CURRENT_TIMESTAMP(6),
       'season2-official-source-review', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@easy_account_page_snapshot, 256));
SET @easy_account_page_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@easy_account_page_snapshot, 256));

SET @easy_account_terms_snapshot = 'Easy-One Pack 통장 특약 제3조 가입대상: 실명의 외국인 개인 또는 외국인 개인사업자. 제4조 가입금액 및 제5조 가입기간: 제한 없음. 2025년 7월 1일 변경 시행.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'TERMS', 'Easy-One Pack 통장 특약',
       'https://image.kebhana.com/cont/download/documents/provide/0000120160184_20250701.pdf',
       @easy_account_terms_snapshot, SHA2(@easy_account_terms_snapshot, 256), CURRENT_TIMESTAMP(6),
       '2025-07-01', NULL, 'ko', 'APPROVED', CURRENT_TIMESTAMP(6),
       'season2-official-source-review', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@easy_account_terms_snapshot, 256));
SET @easy_account_terms_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@easy_account_terms_snapshot, 256));

SET @easy_savings_page_snapshot = 'Easy-One Pack 적금 공식 상품페이지. 가입대상: 실명의 외국인 개인 및 외국인 개인사업자, 1인 1계좌. 가입기간 1년. 가입금액 및 월 적립한도: 1만원 이상 1천만원 이하. 자유적립식, 영업점 상품.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'PRODUCT_PAGE', 'Easy-One Pack 적금 공식 상품페이지',
       'https://www.kebhana.com/cont/mall/mall08/mall0801/mall080102/1431537_115157.jsp',
       @easy_savings_page_snapshot, SHA2(@easy_savings_page_snapshot, 256), CURRENT_TIMESTAMP(6),
       NULL, NULL, 'ko', 'APPROVED', CURRENT_TIMESTAMP(6),
       'season2-official-source-review', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@easy_savings_page_snapshot, 256));
SET @easy_savings_page_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@easy_savings_page_snapshot, 256));

SET @easy_savings_terms_snapshot = 'Easy-One Pack 적금 특약 제3조 가입대상: 외국인 개인 및 외국인 개인사업자. 제4조 가입기간: 1년. 제5조 가입금액 및 적립방법: 1만원 이상 1천만원 이내, 매월 1천만원 한도.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'TERMS', 'Easy-One Pack 적금 특약',
       'https://image.kebhana.com/cont/download/documents/provide/0170114000301_20210325.pdf',
       @easy_savings_terms_snapshot, SHA2(@easy_savings_terms_snapshot, 256), CURRENT_TIMESTAMP(6),
       '2021-03-25', NULL, 'ko', 'APPROVED', CURRENT_TIMESTAMP(6),
       'season2-official-source-review', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@easy_savings_terms_snapshot, 256));
SET @easy_savings_terms_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@easy_savings_terms_snapshot, 256));

INSERT INTO financial_product (product_code, institution, product_name, product_type, financial_purpose,
    description, target_summary, source_document_id, active, foreigner_target, information_base_date,
    public_conditions, additional_conditions, required_documents, application_method, created_at, updated_at)
SELECT 'SHINHAN-SOL-GLOBAL-SAVINGS-2025', '신한은행', 'SOL글로벌 적금', 'SAVINGS', 'SAVINGS',
       '공식 상품설명서로 가입대상과 월 납입한도를 확인한 외국인 전용 자유적립식 적금',
       '실명의 거주 외국인 중 동일 상품 계좌가 없는 고객', @sol_savings_source, TRUE, TRUE, '2025-10-31',
       '실명의 외국인, 비거주자 제외, 1인 1계좌, 월 1천원 이상 300만원 이하',
       '실명확인과 실제 계약내용은 신한은행 최종 확인이 필요합니다.',
       '공식 상품설명서에 별도 제출서류 목록이 공개되어 있지 않아 은행 확인이 필요합니다.',
       '신한은행 공식 채널에서 상품설명서와 실제 계약내용 확인 후 신청', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM financial_product WHERE product_code = 'SHINHAN-SOL-GLOBAL-SAVINGS-2025');
SET @sol_savings_product = (SELECT id FROM financial_product WHERE product_code = 'SHINHAN-SOL-GLOBAL-SAVINGS-2025');

INSERT INTO financial_product (product_code, institution, product_name, product_type, financial_purpose,
    description, target_summary, source_document_id, active, foreigner_target, information_base_date,
    public_conditions, additional_conditions, required_documents, application_method, created_at, updated_at)
SELECT 'HANA-EASY-ONE-ACCOUNT', '하나은행', 'Easy-One Pack 통장', 'CHECKING_ACCOUNT', 'ACCOUNT',
       '공식 상품페이지와 2025년 개정 특약으로 가입대상을 확인한 외국인 전용 입출금통장',
       '실명의 외국인 개인 또는 외국인 개인사업자', @easy_account_page_source, TRUE, TRUE, '2025-07-01',
       '실명의 외국인 개인 또는 외국인 개인사업자',
       '실명확인과 수수료 우대조건 적용은 하나은행 확인이 필요합니다.',
       '공식 Source에 별도 제출서류 목록이 공개되어 있지 않아 영업점 확인이 필요합니다.',
       '하나은행 영업점 상담 후 신청', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM financial_product WHERE product_code = 'HANA-EASY-ONE-ACCOUNT');
SET @easy_account_product = (SELECT id FROM financial_product WHERE product_code = 'HANA-EASY-ONE-ACCOUNT');

INSERT INTO financial_product (product_code, institution, product_name, product_type, financial_purpose,
    description, target_summary, source_document_id, active, foreigner_target, information_base_date,
    public_conditions, additional_conditions, required_documents, application_method, created_at, updated_at)
SELECT 'HANA-EASY-ONE-SAVINGS', '하나은행', 'Easy-One Pack 적금', 'SAVINGS', 'SAVINGS',
       '현재 공식 상품페이지와 공식 특약으로 가입대상, 1인 1계좌, 월 적립한도를 확인한 외국인 전용 적금',
       '실명의 외국인 개인 또는 외국인 개인사업자 중 동일 상품 계좌가 없는 고객', @easy_savings_page_source, TRUE, TRUE, '2026-08-20',
       '실명의 외국인 개인 또는 외국인 개인사업자, 1인 1계좌, 월 1만원 이상 1천만원 이하',
       '실명확인과 우대금리 적용은 하나은행 확인이 필요합니다.',
       '공식 Source에 별도 제출서류 목록이 공개되어 있지 않아 영업점 확인이 필요합니다.',
       '하나은행 영업점 상담 후 신청', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM financial_product WHERE product_code = 'HANA-EASY-ONE-SAVINGS');
SET @easy_savings_product = (SELECT id FROM financial_product WHERE product_code = 'HANA-EASY-ONE-SAVINGS');

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value, rule_level,
    rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name, valid_from, valid_to,
    description, confidence, review_status, last_verified_at, created_at, updated_at) VALUES
(@sol_savings_source, 'SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'IS_FOREIGNER', 'EQ', 'true', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '가입대상 실명의 외국인', '상품설명서 4페이지 가입대상', 4, '거래조건-가입대상', '2025-10-31', '2026-10-30', '외국인 가입대상', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@sol_savings_source, 'SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'RESIDENT_STATUS', 'NE', 'NON_RESIDENT', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '비거주자 제외', '상품설명서 4페이지 가입대상', 4, '거래조건-가입대상', '2025-10-31', '2026-10-30', '비거주자 제외', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@sol_savings_source, 'SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'HAS_EXISTING_PRODUCT_ACCOUNT', 'EQ', 'false', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '1인 1계좌', '상품설명서 4페이지 가입대상', 4, '거래조건-가입대상', '2025-10-31', '2026-10-30', '동일 상품 1인 1계좌', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@sol_savings_source, 'SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'DESIRED_MONTHLY_AMOUNT', 'GTE', '1000', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '최저가입금액 1천원 이상', '상품설명서 4페이지 가입금액', 4, '거래조건-가입금액', '2025-10-31', '2026-10-30', '월 납입 최소금액', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@sol_savings_source, 'SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'DESIRED_MONTHLY_AMOUNT', 'LTE', '3000000', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '최고가입금액 월 3백만원 이하', '상품설명서 4페이지 가입금액', 4, '거래조건-가입금액', '2025-10-31', '2026-10-30', '월 납입 최대금액', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_account_terms_source, 'HANA-EASY-ONE-ACCOUNT', 'IS_FOREIGNER', 'EQ', 'true', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '실명의 외국인 개인 또는 외국인 개인사업자', '특약 제3조 가입대상', 1, '제3조 가입대상', '2025-07-01', NULL, '외국인 가입대상', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_savings_terms_source, 'HANA-EASY-ONE-SAVINGS', 'IS_FOREIGNER', 'EQ', 'true', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '외국인 개인 및 외국인 개인사업자', '특약 제3조 가입대상', 1, '제3조 가입대상', '2021-03-25', NULL, '외국인 가입대상', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_savings_page_source, 'HANA-EASY-ONE-SAVINGS', 'HAS_EXISTING_PRODUCT_ACCOUNT', 'EQ', 'false', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '1인 1계좌', '공식 상품페이지 가입대상', NULL, '가입대상', NULL, NULL, '동일 상품 1인 1계좌', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_savings_terms_source, 'HANA-EASY-ONE-SAVINGS', 'DESIRED_MONTHLY_AMOUNT', 'GTE', '10000', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '가입금액은 1만원 이상', '특약 제5조 가입금액 및 적립방법', 1, '제5조 가입금액 및 적립방법', '2021-03-25', NULL, '월 납입 최소금액', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_savings_terms_source, 'HANA-EASY-ONE-SAVINGS', 'DESIRED_MONTHLY_AMOUNT', 'LTE', '10000000', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '매월 1천만원 한도', '특약 제5조 가입금액 및 적립방법', 1, '제5조 가입금액 및 적립방법', '2021-03-25', NULL, '월 납입 최대금액', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));

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
  AND pr.id IS NULL;

INSERT INTO rule_change_history (rule_candidate_id, action, reviewer, before_operator, before_value,
    before_level, before_status, after_operator, after_value, after_level, after_status, reviewed_at)
SELECT rc.id, 'APPROVE', 'season2-official-source-review', NULL, NULL, NULL, 'PENDING',
       rc.operator, rc.rule_value, rc.rule_level, 'APPROVED', rc.last_verified_at
FROM rule_candidate rc
LEFT JOIN rule_change_history history ON history.rule_candidate_id = rc.id AND history.action = 'APPROVE'
WHERE rc.product_code IN ('SHINHAN-SOL-GLOBAL-SAVINGS-2025', 'HANA-EASY-ONE-ACCOUNT', 'HANA-EASY-ONE-SAVINGS')
  AND history.id IS NULL;

INSERT INTO product_application_step (product_id, source_document_id, step_order, title, description, channel,
    source_locator, valid_from, valid_to, active, created_at, updated_at) VALUES
(@sol_savings_product, @sol_savings_source, 1, '공식 상품설명서 확인', '가입 전 상품설명서의 거래조건과 실제 계약내용을 확인합니다.', '신한은행 공식 채널', '상품설명서 1페이지 안내', '2025-10-31', '2026-10-30', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_account_product, @easy_account_page_source, 1, '영업점 상담 및 신청', '하나은행 영업점에서 상품 조건과 필요서류를 확인하고 신청합니다.', '영업점', '공식 상품페이지 영업점 상품 표시', '2025-07-01', NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_savings_product, @easy_savings_page_source, 1, '영업점 상담 및 신청', '하나은행 영업점에서 상품 조건과 필요서류를 확인하고 신청합니다.', '영업점', '공식 상품페이지 영업점 상품 표시', NULL, NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));
