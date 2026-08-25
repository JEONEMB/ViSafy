-- Link the approved KB Securities risk notice to the product package without
-- turning its informational statements into eligibility rules.

SET @reviewer = 'season3-official-source-review-2026-08-25';
SET @kb_stock_risk_id = (
    SELECT id FROM source_document
    WHERE source_url = 'https://fdata.kbsec.com/agree/globalStock_02.pdf'
    ORDER BY id DESC LIMIT 1
);

INSERT INTO rule_candidate (source_document_id, product_code, rule_key, operator, rule_value,
    rule_level, rule_nature, mandatory, source_excerpt, source_locator, page_number, section_name,
    valid_from, valid_to, description, confidence, review_status, last_verified_at, reviewed_by,
    created_at, updated_at)
SELECT @kb_stock_risk_id, 'KBSEC-FOREIGN-STOCK', 'PRODUCT_RISK_DESCRIPTION_AVAILABLE',
       'EXISTS', 'true', 'UNKNOWN', 'INFORMATION', FALSE,
       '미국인 등 또는 캐나다 국적 보유자는 해외주식 매매가 불가하며 세법상 거주지 변경 시 거래가 제한될 수 있다.',
       '해외주식 투자위험 확인서 제7~8항', 2, '국적 및 세법상 거주지 유의사항',
       '2025-11-03', NULL, '공식 상품 위험설명 연결 정보이며 Eligibility 판정에는 사용하지 않음',
       1.0000, 'APPROVED', CURRENT_TIMESTAMP(6), @reviewer, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (
    SELECT 1 FROM rule_candidate
    WHERE product_code = 'KBSEC-FOREIGN-STOCK'
      AND rule_key = 'PRODUCT_RISK_DESCRIPTION_AVAILABLE'
      AND source_document_id = @kb_stock_risk_id
);

INSERT INTO rule_change_history (rule_candidate_id, action, reviewer, before_status,
    after_operator, after_value, after_level, after_status, reviewed_at)
SELECT rc.id, 'APPROVE', @reviewer, 'PENDING', rc.operator, rc.rule_value, rc.rule_level,
       'APPROVED', rc.last_verified_at
FROM rule_candidate rc
LEFT JOIN rule_change_history history ON history.rule_candidate_id = rc.id AND history.action = 'APPROVE'
WHERE rc.product_code = 'KBSEC-FOREIGN-STOCK'
  AND rc.rule_key = 'PRODUCT_RISK_DESCRIPTION_AVAILABLE'
  AND history.id IS NULL;

