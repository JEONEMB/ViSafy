ALTER TABLE rule_candidate
    ADD COLUMN mandatory BOOLEAN NOT NULL DEFAULT TRUE AFTER rule_level,
    ADD COLUMN source_locator VARCHAR(500) NOT NULL DEFAULT 'Snapshot text' AFTER source_excerpt,
    ADD COLUMN valid_from DATE NULL AFTER source_locator,
    ADD COLUMN valid_to DATE NULL AFTER valid_from,
    ADD COLUMN description TEXT NULL AFTER valid_to;

UPDATE rule_candidate rc
JOIN source_document sd ON sd.id = rc.source_document_id
SET rc.valid_from = COALESCE(rc.valid_from, sd.valid_from),
    rc.valid_to = COALESCE(rc.valid_to, sd.valid_to),
    rc.description = rc.source_excerpt;

ALTER TABLE rule_candidate
    MODIFY COLUMN description TEXT NOT NULL;

ALTER TABLE product_rule
    ADD COLUMN product_id BIGINT NULL AFTER rule_candidate_id,
    ADD COLUMN mandatory BOOLEAN NOT NULL DEFAULT TRUE AFTER rule_level,
    ADD COLUMN source_locator VARCHAR(500) NOT NULL DEFAULT 'Snapshot text' AFTER source_excerpt,
    ADD COLUMN valid_from DATE NULL AFTER source_locator,
    ADD COLUMN valid_to DATE NULL AFTER valid_from,
    ADD COLUMN review_status VARCHAR(40) NOT NULL DEFAULT 'APPROVED' AFTER valid_to,
    ADD COLUMN description TEXT NULL AFTER review_status,
    CHANGE COLUMN last_verified_at verified_at DATETIME(6) NOT NULL;

UPDATE product_rule pr
JOIN financial_product fp ON fp.product_code = pr.product_code
JOIN rule_candidate rc ON rc.id = pr.rule_candidate_id
SET pr.product_id = fp.id,
    pr.mandatory = rc.mandatory,
    pr.source_locator = rc.source_locator,
    pr.valid_from = rc.valid_from,
    pr.valid_to = rc.valid_to,
    pr.review_status = rc.review_status,
    pr.description = rc.description;

DELETE FROM product_rule WHERE product_id IS NULL;

ALTER TABLE product_rule
    MODIFY COLUMN product_id BIGINT NOT NULL,
    MODIFY COLUMN description TEXT NOT NULL,
    ADD CONSTRAINT fk_product_rule_product FOREIGN KEY (product_id) REFERENCES financial_product (id),
    DROP INDEX idx_product_rule_runtime,
    DROP COLUMN product_code,
    ADD INDEX idx_product_rule_runtime (product_id, active, rule_key, valid_from, valid_to);
