-- Link the separately registered official disclosure document to the product
-- package without turning it into an eligibility condition.
SET @reviewer = 'workspace-owner-authorized-2026-08-24';
SET @kb_life_desc_id = (
    SELECT id FROM source_document
    WHERE title = 'KB생계비계좌 공식 공시자료'
    ORDER BY id DESC LIMIT 1
);

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value,
 rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name,
 valid_from, valid_to, description, confidence, review_status, last_verified_at, reviewed_by,
 created_at, updated_at)
VALUES (@kb_life_desc_id, 'KB-LIVELIHOOD-ACCOUNT', 'PRODUCT_DESCRIPTION_AVAILABLE', 'EXISTS', 'true',
 'UNKNOWN', 'INFORMATION', FALSE,
 '상품공시실에서 KB생계비계좌 상품설명서와 특약을 제공한다.',
 '상품공시실 KB생계비계좌 공시자료', NULL, '상품별 공시자료', '2026-02-02', NULL,
 '공식 상품설명서 연결 정보이며 Eligibility 판정에는 사용하지 않음', 1.0000,
 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));

SET @candidate_id = LAST_INSERT_ID();
INSERT INTO rule_change_history (rule_candidate_id, action, reviewer, before_status,
 after_operator, after_value, after_level, after_status, reviewed_at)
VALUES (@candidate_id, 'APPROVE', @reviewer, 'PENDING', 'EXISTS', 'true', 'UNKNOWN',
 'APPROVED', CURRENT_TIMESTAMP(6));
