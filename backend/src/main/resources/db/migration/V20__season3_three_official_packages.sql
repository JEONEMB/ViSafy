-- Complete three additional Season 3 Source packages with official evidence.
-- Reviewed on 2026-08-25. A product-level digital channel is not treated as
-- foreign-resident access unless the same official evidence explicitly says so.

SET @reviewer = 'season3-official-source-review-2026-08-25';

-- Shared Hana foreign-customer identity guide imported in V18.
SET @hana_identity_id = (
    SELECT id FROM source_document
    WHERE source_url = 'https://image.kebhana.com/cont/download/documents/provide/0000000220407_20251218.pdf'
    ORDER BY id DESC LIMIT 1
);

-- 1. Hana More Easy Savings: current product description with channel evidence.
SET @hana_more_easy_desc = '하나더이지 적금 상품설명서. 가입대상은 실명의 외국인으로 1인 1계좌이며 비거주자는 제외한다. 신규 채널은 영업점과 스마트폰뱅킹이다. 가입 및 적립한도는 매월 1만원 이상 30만원 이하이다.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
    retrieved_at, information_base_date, valid_from, valid_to, language, review_status,
    last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'PRODUCT_DESCRIPTION', '하나더이지 적금 상품설명서 (2025.12.31)',
       'https://image.kebhana.com/cont/download/documents/manual/0100324000101_20251231_m.pdf',
       @hana_more_easy_desc, SHA2(@hana_more_easy_desc, 256), CURRENT_TIMESTAMP(6), '2026-08-25',
       '2025-12-31', '2026-12-31', 'ko', 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer,
       CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@hana_more_easy_desc, 256));
SET @hana_more_easy_desc_id = (SELECT id FROM source_document WHERE content_hash = SHA2(@hana_more_easy_desc, 256));

-- 2. Easy-One Pack Account: current description explicitly limits opening to a branch.
SET @easy_account_desc = 'Easy-One Pack 통장 상품설명서. 가입대상은 실명의 외국인 개인 또는 외국인 개인사업자이다. 거래방법은 신규 영업점, 해지 영업점·인터넷뱅킹·스마트폰뱅킹으로 안내한다.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
    retrieved_at, information_base_date, valid_from, valid_to, language, review_status,
    last_verified_at, reviewed_by, created_at, updated_at)
SELECT '하나은행', 'PRODUCT_DESCRIPTION', 'Easy-One Pack 통장 상품설명서 (2025.09.01)',
       'https://image.kebhana.com/cont/download/documents/manual/0170114000101_20250901_m.pdf',
       @easy_account_desc, SHA2(@easy_account_desc, 256), CURRENT_TIMESTAMP(6), '2026-08-25',
       '2025-09-01', NULL, 'ko', 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer,
       CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@easy_account_desc, 256));
SET @easy_account_desc_id = (SELECT id FROM source_document WHERE content_hash = SHA2(@easy_account_desc, 256));

-- 3. KB Securities foreign-stock service: risk notice, account-opening guide,
-- and enhanced customer due-diligence policy.
SET @kb_stock_risk = '해외주식 투자위험 확인서. 미국인 등 또는 캐나다 국적 보유자는 해외주식 매매가 불가하며, 세법상 거주지가 대한민국 외 국가로 변경되는 경우 기존 해외주식 계좌가 해지될 수 있다.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
    retrieved_at, information_base_date, valid_from, valid_to, language, review_status,
    last_verified_at, reviewed_by, created_at, updated_at)
SELECT 'KB증권', 'PRODUCT_DESCRIPTION', 'KB증권 해외주식 투자위험 확인서',
       'https://fdata.kbsec.com/agree/globalStock_02.pdf', @kb_stock_risk,
       SHA2(@kb_stock_risk, 256), CURRENT_TIMESTAMP(6), '2026-08-25', '2025-11-03', NULL,
       'ko', 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@kb_stock_risk, 256));
SET @kb_stock_risk_id = (SELECT id FROM source_document WHERE content_hash = SHA2(@kb_stock_risk, 256));

SET @kb_stock_guide = '해외주식 매매 시작하기 안내. 종합위탁계좌 개설 시 본인은 신분증과 거래인감을 준비한다. 해외주식 거래 전 투자위험확인서 및 고객정보제공동의서 동의가 필요하다.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
    retrieved_at, information_base_date, valid_from, valid_to, language, review_status,
    last_verified_at, reviewed_by, created_at, updated_at)
SELECT 'KB증권', 'PUBLIC_GUIDE', 'KB증권 해외주식 매매 시작하기',
       'https://fdata.kbsec.com/agree/foreignstock03.pdf', @kb_stock_guide,
       SHA2(@kb_stock_guide, 256), CURRENT_TIMESTAMP(6), '2026-08-25', NULL, NULL,
       'ko', 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@kb_stock_guide, 256));
SET @kb_stock_guide_id = (SELECT id FROM source_document WHERE content_hash = SHA2(@kb_stock_guide, 256));

SET @kb_edd = 'KB증권 고객확인제도 안내. 강화된 고객확인은 자금세탁위험이 큰 경우 거래목적과 자금원천 등을 추가로 확인하며, 신규 계좌 개설 전 또는 금융거래 완료 전에 수행한다.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
    retrieved_at, information_base_date, valid_from, valid_to, language, review_status,
    last_verified_at, reviewed_by, created_at, updated_at)
SELECT 'KB증권', 'PUBLIC_GUIDE', 'KB증권 고객확인제도 안내',
       'https://nwww.kbsec.com/go.able?linkcd=m06100021', @kb_edd,
       SHA2(@kb_edd, 256), CURRENT_TIMESTAMP(6), '2026-08-25', NULL, NULL,
       'ko', 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash = SHA2(@kb_edd, 256));
SET @kb_edd_id = (SELECT id FROM source_document WHERE content_hash = SHA2(@kb_edd, 256));

SET @hana_more_easy_product = (SELECT id FROM financial_product WHERE product_code = 'HANA-EASY-SAVINGS-2025');
SET @easy_account_product = (SELECT id FROM financial_product WHERE product_code = 'HANA-EASY-ONE-ACCOUNT');
SET @kb_stock_product = (SELECT id FROM financial_product WHERE product_code = 'KBSEC-FOREIGN-STOCK');
SET @kb_stock_page_id = (
    SELECT id FROM source_document
    WHERE source_url = 'https://www.kbsec.com/go.able?linkcd=m04040026'
    ORDER BY id DESC LIMIT 1
);

-- Identity, channel, and document evidence. These are Access facts and never
-- create FOREIGNER_ALLOWED eligibility rules.
INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value,
    rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name,
    valid_from, valid_to, description, confidence, review_status, last_verified_at, reviewed_by,
    created_at, updated_at) VALUES
(@hana_identity_id, 'HANA-EASY-SAVINGS-2025', 'FOREIGNER_IDENTITY_METHOD', 'EXISTS', 'true',
 'UNKNOWN', 'IDENTIFICATION_METHOD', FALSE, '여권, 외국인등록증 등 공식 실명확인증표',
 '외국인 고객 실명확인 안내', NULL, '실명확인증표', '2025-12-18', NULL,
 '상품 가입 허용 Rule이 아닌 신분확인 방법', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_more_easy_desc_id, 'HANA-EASY-SAVINGS-2025', 'BRANCH_CHANNEL', 'EXISTS', 'true',
 'UNKNOWN', 'CHANNEL_REQUIREMENT', FALSE, '신규: 영업점, 스마트폰뱅킹',
 '상품설명서 p.2 거래방법', 2, '거래방법', '2025-12-31', '2026-12-31',
 'BRANCH AVAILABLE; 상품 수준 스마트폰 채널은 표시하되 외국인 모바일 이용 판정은 보수적으로 분리', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_more_easy_desc_id, 'HANA-EASY-SAVINGS-2025', 'PRODUCT_MOBILE_CHANNEL', 'EXISTS', 'true',
 'UNKNOWN', 'CHANNEL_REQUIREMENT', FALSE, '신규: 영업점, 스마트폰뱅킹',
 '상품설명서 p.2 거래방법', 2, '거래방법', '2025-12-31', '2026-12-31',
 'PRODUCT MOBILE AVAILABLE; CUSTOMER-SPECIFIC SUPPORT UNVERIFIED', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_identity_id, 'HANA-EASY-SAVINGS-2025', 'FOREIGNER_ID_DOCUMENT', 'EXISTS', 'true',
 'UNKNOWN', 'REQUIRED_DOCUMENT', FALSE, '여권 또는 외국인등록증 등 공식 실명확인증표',
 '외국인 고객 실명확인 안내', NULL, '실명확인증표', '2025-12-18', NULL,
 '신분확인 단계 준비서류', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),

(@hana_identity_id, 'HANA-EASY-ONE-ACCOUNT', 'FOREIGNER_IDENTITY_METHOD', 'EXISTS', 'true',
 'UNKNOWN', 'IDENTIFICATION_METHOD', FALSE, '여권, 외국인등록증 등 공식 실명확인증표',
 '외국인 고객 실명확인 안내', NULL, '실명확인증표', '2025-12-18', NULL,
 '상품 가입 허용 Rule이 아닌 신분확인 방법', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@easy_account_desc_id, 'HANA-EASY-ONE-ACCOUNT', 'BRANCH_ONLY_CHANNEL', 'EXISTS', 'true',
 'UNKNOWN', 'CHANNEL_REQUIREMENT', FALSE, '신규: 영업점',
 '상품설명서 p.2 거래방법', 2, '거래방법', '2025-09-01', NULL,
 'BRANCH_ONLY; 온라인 신규 가능 여부는 공식 자료에서 확인되지 않음', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@hana_identity_id, 'HANA-EASY-ONE-ACCOUNT', 'FOREIGNER_ID_DOCUMENT', 'EXISTS', 'true',
 'UNKNOWN', 'REQUIRED_DOCUMENT', FALSE, '여권 또는 외국인등록증 등 공식 실명확인증표',
 '외국인 고객 실명확인 안내', NULL, '실명확인증표', '2025-12-18', NULL,
 '신분확인 단계 준비서류', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),

(@kb_stock_guide_id, 'KBSEC-FOREIGN-STOCK', 'IDENTITY_DOCUMENT', 'EXISTS', 'true',
 'UNKNOWN', 'IDENTIFICATION_METHOD', FALSE, '계좌개설 본인: 신분증, 거래인감',
 '해외주식 매매 시작하기 STEP 01', 1, '계좌개설 구비서류', NULL, NULL,
 '종합위탁계좌 신분확인 방법', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@kb_stock_page_id, 'KBSEC-FOREIGN-STOCK', 'BRANCH_CHANNEL', 'EXISTS', 'true',
 'UNKNOWN', 'CHANNEL_REQUIREMENT', FALSE, '영업점, 은행, 비대면 서비스를 통해 종합위탁계좌 개설(내국인 및 거주외국인 가능)',
 '매매순서 STEP 01 계좌개설', NULL, 'STEP 01 계좌개설', NULL, NULL,
 'BRANCH AVAILABLE', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@kb_stock_page_id, 'KBSEC-FOREIGN-STOCK', 'FOREIGNER_ONLINE_CHANNEL', 'EXISTS', 'true',
 'UNKNOWN', 'CHANNEL_REQUIREMENT', FALSE, '영업점, 은행, 비대면 서비스를 통해 종합위탁계좌 개설(내국인 및 거주외국인 가능)',
 '매매순서 STEP 01 계좌개설', NULL, 'STEP 01 계좌개설', NULL, NULL,
 'FOREIGNER ONLINE AVAILABLE: 공식 문구가 거주외국인과 비대면 계좌개설을 함께 명시', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@kb_stock_guide_id, 'KBSEC-FOREIGN-STOCK', 'ACCOUNT_OPENING_DOCUMENTS', 'EXISTS', 'true',
 'UNKNOWN', 'REQUIRED_DOCUMENT', FALSE, '본인: 신분증, 거래인감; 해외주식 투자위험확인서 및 고객정보제공동의서 동의 필요',
 '해외주식 매매 시작하기 STEP 01', 1, '계좌개설 구비서류', NULL, NULL,
 '공식 계좌개설 준비사항', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(@kb_edd_id, 'KBSEC-FOREIGN-STOCK', 'IDENTITY_ENHANCED_DUE_DILIGENCE', 'EXISTS', 'BANK_PROCESS',
 'EXTERNAL_CHECK', 'EXTERNAL_CHECK', FALSE, '자금세탁위험이 큰 경우 거래목적, 자금원천 등을 추가 확인',
 '고객확인제도 - 강화된 고객확인', NULL, '강화된 고객확인', NULL, NULL,
 '고객 위험도에 따라 KB증권 추가 확인이 필요한 실제 EXTERNAL_CHECK', 1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));

INSERT INTO rule_change_history (rule_candidate_id, action, reviewer, before_status,
    after_operator, after_value, after_level, after_status, reviewed_at)
SELECT rc.id, 'APPROVE', @reviewer, 'PENDING', rc.operator, rc.rule_value, rc.rule_level,
       'APPROVED', rc.last_verified_at
FROM rule_candidate rc
LEFT JOIN rule_change_history history ON history.rule_candidate_id = rc.id AND history.action = 'APPROVE'
WHERE rc.product_code IN ('HANA-EASY-SAVINGS-2025', 'HANA-EASY-ONE-ACCOUNT', 'KBSEC-FOREIGN-STOCK')
  AND rc.reviewed_by = @reviewer AND history.id IS NULL;

-- The legacy Easy-One Pack Savings is listed by Hana as closed to new subscriptions
-- since 2021-04-30. Preserve its history but do not expose it as an active product.
UPDATE financial_product
SET active = FALSE, updated_at = CURRENT_TIMESTAMP(6)
WHERE product_code = 'HANA-EASY-ONE-SAVINGS';

