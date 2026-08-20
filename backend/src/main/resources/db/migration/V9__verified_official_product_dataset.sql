-- Gold dataset manually verified from the official URLs documented in the Phase 0 report.
-- Test-profile values are intentionally absent: only statements present in the snapshots become rules.

SET @hana_page_snapshot = '하나더이지 적금. 가입대상: 실명의 외국인(1인 1계좌, 비거주자 제외). 가입금액 및 적립한도: 매월 1만원 이상 30만원 이하. 판매기간: 2025-05-28부터 2026-12-31까지. 가입채널: 영업점, 스마트폰.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'PRODUCT_PAGE', '하나더이지 적금 공식 상품페이지',
       'https://www.kebhana.com/cont/mall/mall08/mall0801/mall080102/1508308_115157.jsp',
       @hana_page_snapshot, SHA2(@hana_page_snapshot, 256), CURRENT_TIMESTAMP(6),
       '2025-05-28', '2026-12-31', 'ko', 'APPROVED', CURRENT_TIMESTAMP(6),
       'phase0-report', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@hana_page_snapshot, 256));
SET @hana_page_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@hana_page_snapshot, 256));

SET @hana_terms_snapshot = '하나더이지 적금 특약 제2조 가입대상: 이 예금의 가입대상은 실명의 외국인으로, 1인 1계좌만 가입이 가능합니다(비거주자 제외). 제6조 가입금액: 1만원 이상 30만원 이하.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'TERMS', '하나더이지 적금 특약',
       'https://image.kebhana.com/cont/download/documents/provide/0100324000101_20250528.pdf',
       @hana_terms_snapshot, SHA2(@hana_terms_snapshot, 256), CURRENT_TIMESTAMP(6),
       '2025-05-28', '2026-12-31', 'ko', 'APPROVED', CURRENT_TIMESTAMP(6),
       'phase0-report', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@hana_terms_snapshot, 256));
SET @hana_terms_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@hana_terms_snapshot, 256));

SET @kb_stock_snapshot = 'KB증권 해외주식 매매순서 STEP 01 계좌개설: 영업점, 은행, 비대면 서비스를 통해 종합위탁계좌 개설(내국인 및 거주외국인 가능, 미국/캐나다 국적 불가능). 해외주식투자위험 및 고객정보제공 동의가 필요합니다. STEP 02 입금/환전, STEP 03 해외주식주문, STEP 04 세금처리.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT 'KB증권', 'PRODUCT_PAGE', 'KB증권 해외주식 매매안내',
       'https://www.kbsec.com/go.able?linkcd=m04040026',
       @kb_stock_snapshot, SHA2(@kb_stock_snapshot, 256), CURRENT_TIMESTAMP(6),
       NULL, NULL, 'ko', 'APPROVED', CURRENT_TIMESTAMP(6), 'phase0-report',
       CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@kb_stock_snapshot, 256));
SET @kb_stock_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@kb_stock_snapshot, 256));

SET @ez_snapshot = '하나은행 대출상품 공시 목록: 하나 외국인 EZ Loan, 최종게시일 2025-08-27. 이 목록은 상품 존재만 확인하며 상세 가입조건은 포함하지 않습니다.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'PRODUCT_PAGE', '하나 외국인 EZ Loan 상품 공시 목록',
       'https://www.kebhana.com/cont/mall/mall09/mall0903/mall090303/index.jsp',
       @ez_snapshot, SHA2(@ez_snapshot, 256), CURRENT_TIMESTAMP(6), '2025-08-27', NULL,
       'ko', 'APPROVED', CURRENT_TIMESTAMP(6), 'phase0-report', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@ez_snapshot, 256));
SET @ez_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@ez_snapshot, 256));

SET @sol_snapshot = 'SOL글로벌 적금 상품설명서의 외국인 패키지 상품 예시에 SOL글로벌 전세대출(서울보증_외국인)이 기재되어 있습니다. 이 문서는 전세대출의 직접 상품설명서가 아니므로 가입조건 Rule 근거로 사용하지 않습니다.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
                             retrieved_at, valid_from, valid_to, language, review_status,
                             last_verified_at, reviewed_by, created_at, updated_at)
SELECT '신한은행', 'PRODUCT_DESCRIPTION', 'SOL글로벌 적금 상품설명서 내 전세대출 보조 근거',
       'https://img.shinhan.com/sbank2016/seol/20170630814200000030LC000030.PDF',
       @sol_snapshot, SHA2(@sol_snapshot, 256), CURRENT_TIMESTAMP(6), '2025-10-31', '2026-10-30',
       'ko', 'APPROVED', CURRENT_TIMESTAMP(6), 'phase0-report', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@sol_snapshot, 256));
SET @sol_source = (SELECT id FROM source_document WHERE content_hash = SHA2(@sol_snapshot, 256));

INSERT INTO financial_product (product_code, institution, product_name, product_type, financial_purpose,
    description, target_summary, source_document_id, active, foreigner_target, information_base_date,
    public_conditions, additional_conditions, required_documents, application_method, created_at, updated_at)
SELECT 'HANA-EASY-SAVINGS-2025', '하나은행', '하나더이지 적금', 'SAVINGS', 'SAVINGS',
       '공식 상품페이지와 특약으로 가입대상, 1인 1계좌 및 월 납입한도를 확인한 외국인 전용 적금',
       '실명의 거주 외국인 중 동일 상품 계좌가 없는 고객', @hana_page_source, TRUE, TRUE, '2025-05-28',
       '실명의 외국인, 비거주자 제외, 1인 1계좌, 월 1만원 이상 30만원 이하',
       '실명확인 및 실제 가입 처리는 하나은행 확인이 필요합니다.',
       '공식 Source에서 별도 제출서류 목록을 확인하지 못했습니다.',
       '하나은행 영업점 또는 공식 스마트폰 채널', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM financial_product WHERE product_code = 'HANA-EASY-SAVINGS-2025');
SET @hana_product = (SELECT id FROM financial_product WHERE product_code = 'HANA-EASY-SAVINGS-2025');

INSERT INTO financial_product (product_code, institution, product_name, product_type, financial_purpose,
    description, target_summary, source_document_id, active, foreigner_target, information_base_date,
    public_conditions, additional_conditions, required_documents, application_method, created_at, updated_at)
SELECT 'KBSEC-FOREIGN-STOCK', 'KB증권', '외국인 해외주식 거래', 'INVESTMENT', 'INVESTMENT',
       'KB증권 공식 해외주식 안내에 따라 거주 외국인의 국적 공개조건을 비교하는 투자 서비스',
       '미국·캐나다 국적이 아닌 대한민국 거주 외국인', @kb_stock_source, TRUE, TRUE, '2026-08-20',
       '거주 외국인 가능, 미국·캐나다 국적 제외',
       '계좌개설 본인확인과 거래 적합성 확인은 KB증권 절차에 따릅니다.',
       '해외주식투자위험 및 고객정보제공 동의',
       '종합위탁계좌 개설 후 입금·환전, 해외주식 주문, 세금처리', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM financial_product WHERE product_code = 'KBSEC-FOREIGN-STOCK');
SET @kb_product = (SELECT id FROM financial_product WHERE product_code = 'KBSEC-FOREIGN-STOCK');

INSERT INTO financial_product (product_code, institution, product_name, product_type, financial_purpose,
    description, target_summary, source_document_id, active, foreigner_target, information_base_date,
    public_conditions, additional_conditions, required_documents, application_method, created_at, updated_at)
SELECT 'HANA-EZ-LOAN', '하나은행', '하나 외국인 EZ Loan', 'LOAN', 'LOAN',
       '공식 공시에서 상품 존재만 확인되었으며 상세 공식 가입조건 Source는 미확보 상태입니다.',
       '공식 상세 가입조건 Source 추가 수집 필요', @ez_source, TRUE, TRUE, '2025-08-27',
       '공식 가입조건 Source 미확보', '자동 판정하지 않음', '공식 Source 미확보',
       '공식 Source 미확보', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM financial_product WHERE product_code = 'HANA-EZ-LOAN');

INSERT INTO financial_product (product_code, institution, product_name, product_type, financial_purpose,
    description, target_summary, source_document_id, active, foreigner_target, information_base_date,
    public_conditions, additional_conditions, required_documents, application_method, created_at, updated_at)
SELECT 'SHINHAN-SOL-GLOBAL-JEONSE', '신한은행', 'SOL글로벌 전세대출(서울보증_외국인)', 'LOAN', 'LOAN',
       '공식 보조자료에서 상품 존재만 확인되었으며 직접 상품설명서와 가입조건 Source는 미확보 상태입니다.',
       '직접 상품설명서와 공식 가입조건 Source 추가 수집 필요', @sol_source, TRUE, TRUE, '2025-10-31',
       '공식 가입조건 Source 미확보', '서울보증 심사는 확보 후 EXTERNAL_CHECK로 분류',
       '공식 Source 미확보', '공식 Source 미확보', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM financial_product WHERE product_code = 'SHINHAN-SOL-GLOBAL-JEONSE');

-- Hana Easy Savings: five independent HARD conditions backed by the official terms.
INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value, rule_level,
    rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name, valid_from, valid_to,
    description, confidence, review_status, last_verified_at, created_at, updated_at) VALUES
(@hana_terms_source, 'HANA-EASY-SAVINGS-2025', 'IS_FOREIGNER', 'EQ', 'true', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '이 예금의 가입대상은 실명의 외국인으로', '특약 제2조 가입대상', 1, '제2조 가입대상', '2025-05-28', '2026-12-31', '외국인 가입대상', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_terms_source, 'HANA-EASY-SAVINGS-2025', 'RESIDENT_STATUS', 'NE', 'NON_RESIDENT', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '비거주자 제외', '특약 제2조 가입대상', 1, '제2조 가입대상', '2025-05-28', '2026-12-31', '비거주자 제외', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_terms_source, 'HANA-EASY-SAVINGS-2025', 'HAS_EXISTING_PRODUCT_ACCOUNT', 'EQ', 'false', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '1인 1계좌만 가입이 가능합니다', '특약 제2조 가입대상', 1, '제2조 가입대상', '2025-05-28', '2026-12-31', '동일 상품 1인 1계좌', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_terms_source, 'HANA-EASY-SAVINGS-2025', 'DESIRED_MONTHLY_AMOUNT', 'GTE', '10000', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '가입금액은 1만원 이상 30만원 이하입니다', '특약 제6조 가입금액', 1, '제6조 가입금액', '2025-05-28', '2026-12-31', '월 납입 최소금액', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_terms_source, 'HANA-EASY-SAVINGS-2025', 'DESIRED_MONTHLY_AMOUNT', 'LTE', '300000', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '가입금액은 1만원 이상 30만원 이하입니다', '특약 제6조 가입금액', 1, '제6조 가입금액', '2025-05-28', '2026-12-31', '월 납입 최대금액', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));

-- KB Securities: only the two conditions explicitly present in the official page.
INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value, rule_level,
    rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name, valid_from, valid_to,
    description, confidence, review_status, last_verified_at, created_at, updated_at) VALUES
(@kb_stock_source, 'KBSEC-FOREIGN-STOCK', 'RESIDENT_STATUS', 'EQ', 'RESIDENT', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '내국인 및 거주외국인 가능', '매매순서 STEP 01 계좌개설', NULL, 'STEP 01 계좌개설', NULL, NULL, '거주 외국인', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@kb_stock_source, 'KBSEC-FOREIGN-STOCK', 'NATIONALITY', 'NOT_IN', '["US","CA"]', 'HARD', 'HARD_ELIGIBILITY', TRUE,
 '미국/캐나다 국적 불가능', '매매순서 STEP 01 계좌개설', NULL, 'STEP 01 계좌개설', NULL, NULL, '미국·캐나다 국적 제외', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));

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
WHERE rc.product_code IN ('HANA-EASY-SAVINGS-2025', 'KBSEC-FOREIGN-STOCK') AND pr.id IS NULL;

INSERT INTO product_application_step (product_id, source_document_id, step_order, title, description, channel,
    source_locator, valid_from, valid_to, active, created_at, updated_at)
SELECT @hana_product, @hana_page_source, 1, '공식 채널에서 가입',
       '하나은행 공식 상품페이지가 안내하는 영업점 또는 스마트폰 채널에서 가입을 진행합니다.',
       '영업점·스마트폰', '공식 상품페이지 가입채널', '2025-05-28', '2026-12-31', TRUE,
       CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM product_application_step WHERE product_id = @hana_product AND step_order = 1);

INSERT INTO product_application_step (product_id, source_document_id, step_order, title, description, channel,
    source_locator, valid_from, valid_to, active, created_at, updated_at) VALUES
(@kb_product, @kb_stock_source, 1, '종합위탁계좌 개설', '영업점, 은행 또는 비대면 서비스로 계좌를 개설합니다.', '영업점·은행·비대면', '매매순서 STEP 01', NULL, NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@kb_product, @kb_stock_source, 2, '입금 및 환전', '개설한 계좌에 입금하고 거래 통화로 환전합니다.', 'HTS·MTS', '매매순서 STEP 02', NULL, NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@kb_product, @kb_stock_source, 3, '해외주식 주문', '공식 HTS·MTS 또는 안내된 채널로 해외주식을 주문합니다.', 'HTS·MTS', '매매순서 STEP 03', NULL, NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@kb_product, @kb_stock_source, 4, '세금 처리 확인', '해외주식 양도소득 관련 공식 안내를 확인합니다.', '공식 채널', '매매순서 STEP 04', NULL, NULL, TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));
