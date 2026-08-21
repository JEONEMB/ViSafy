ALTER TABLE source_document
    ADD COLUMN information_base_date DATE NULL AFTER retrieved_at,
    MODIFY COLUMN snapshot_text LONGTEXT NULL;

UPDATE source_document
SET information_base_date = DATE(retrieved_at)
WHERE information_base_date IS NULL;

ALTER TABLE source_document
    MODIFY COLUMN information_base_date DATE NOT NULL;

ALTER TABLE rule_candidate
    ADD COLUMN reviewed_by VARCHAR(120) NULL AFTER last_verified_at;

UPDATE rule_candidate
SET reviewed_by = 'migration'
WHERE review_status IN ('APPROVED', 'REJECTED', 'NEED_REVIEW', 'EXPIRED', 'UNKNOWN');

ALTER TABLE product_rule
    ADD COLUMN reviewed_by VARCHAR(120) NULL AFTER verified_at;

UPDATE product_rule pr
JOIN rule_candidate rc ON rc.id = pr.rule_candidate_id
SET pr.reviewed_by = COALESCE(rc.reviewed_by, 'migration');
