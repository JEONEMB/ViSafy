ALTER TABLE temp_profile
    ADD COLUMN resident_status VARCHAR(40) NULL AFTER preferred_bank,
    ADD COLUMN has_existing_product_account BOOLEAN NULL AFTER resident_status,
    ADD COLUMN desired_monthly_amount DECIMAL(15,2) NULL AFTER has_existing_product_account;

ALTER TABLE rule_candidate
    ADD COLUMN rule_nature VARCHAR(40) NOT NULL DEFAULT 'HARD_ELIGIBILITY' AFTER rule_level,
    ADD COLUMN page_number INT NULL AFTER source_locator,
    ADD COLUMN section_name VARCHAR(255) NULL AFTER page_number;

UPDATE rule_candidate
SET rule_nature = CASE
    WHEN rule_level = 'EXTERNAL_CHECK' THEN 'EXTERNAL_CHECK'
    WHEN rule_level = 'UNKNOWN' THEN 'INFORMATION'
    ELSE 'HARD_ELIGIBILITY'
END;

ALTER TABLE product_rule
    ADD COLUMN rule_nature VARCHAR(40) NOT NULL DEFAULT 'HARD_ELIGIBILITY' AFTER rule_level,
    ADD COLUMN page_number INT NULL AFTER source_locator,
    ADD COLUMN section_name VARCHAR(255) NULL AFTER page_number;

UPDATE product_rule
SET rule_nature = CASE
    WHEN rule_level = 'EXTERNAL_CHECK' THEN 'EXTERNAL_CHECK'
    WHEN rule_level = 'UNKNOWN' THEN 'INFORMATION'
    ELSE 'HARD_ELIGIBILITY'
END;

ALTER TABLE source_document
    ADD COLUMN reviewed_by VARCHAR(120) NULL AFTER last_verified_at;

UPDATE source_document
SET reviewed_by = 'migration'
WHERE review_status IN ('APPROVED', 'REJECTED', 'NEED_REVIEW', 'EXPIRED');

ALTER TABLE precheck_result
    ADD COLUMN required_fields TEXT NULL AFTER disclaimer;

UPDATE precheck_result SET required_fields = '' WHERE required_fields IS NULL;

ALTER TABLE precheck_result
    MODIFY COLUMN required_fields TEXT NOT NULL;
