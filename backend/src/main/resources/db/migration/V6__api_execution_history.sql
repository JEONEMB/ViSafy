ALTER TABLE source_document
    ADD COLUMN snapshot_path VARCHAR(1000) NULL AFTER snapshot_text;

ALTER TABLE product_document_requirement
    ADD COLUMN verified_at DATETIME(6) NULL AFTER active;

UPDATE product_document_requirement pdr
JOIN source_document sd ON sd.id = pdr.source_document_id
SET pdr.verified_at = sd.last_verified_at;

ALTER TABLE product_document_requirement
    MODIFY COLUMN verified_at DATETIME(6) NOT NULL;

CREATE TABLE recommendation_result_history (
    id CHAR(36) NOT NULL,
    execution_type VARCHAR(40) NOT NULL,
    profile_session_hash CHAR(64) NOT NULL,
    result_json LONGTEXT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_api_execution_expiry (expires_at),
    INDEX idx_api_execution_type_created (execution_type, created_at)
);

CREATE TABLE precheck_result (
    id CHAR(36) NOT NULL,
    profile_session_hash CHAR(64) NOT NULL,
    profile_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    status VARCHAR(40) NOT NULL,
    information_base_date DATE NOT NULL,
    disclaimer TEXT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_precheck_profile FOREIGN KEY (profile_id) REFERENCES temp_profile (id),
    CONSTRAINT fk_precheck_product FOREIGN KEY (product_id) REFERENCES financial_product (id),
    INDEX idx_precheck_expiry (expires_at),
    INDEX idx_precheck_profile_created (profile_id, created_at)
);

CREATE TABLE precheck_rule_result (
    id BIGINT NOT NULL AUTO_INCREMENT,
    precheck_result_id CHAR(36) NOT NULL,
    product_rule_id BIGINT NULL,
    rule_key VARCHAR(120) NOT NULL,
    result VARCHAR(40) NOT NULL,
    message_code VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    actual_value VARCHAR(1000) NULL,
    expected_value VARCHAR(1000) NULL,
    mandatory BOOLEAN NOT NULL,
    blocking BOOLEAN NOT NULL,
    source_excerpt TEXT NULL,
    source_locator VARCHAR(500) NULL,
    source_url VARCHAR(1000) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_precheck_rule_precheck FOREIGN KEY (precheck_result_id) REFERENCES precheck_result (id),
    CONSTRAINT fk_precheck_rule_product_rule FOREIGN KEY (product_rule_id) REFERENCES product_rule (id),
    INDEX idx_precheck_rule_result (precheck_result_id, result)
);

CREATE TABLE consultation (
    id CHAR(36) NOT NULL,
    profile_session_hash CHAR(64) NOT NULL,
    product_id BIGINT NOT NULL,
    rule_key VARCHAR(120) NOT NULL,
    question TEXT NOT NULL,
    answer LONGTEXT NOT NULL,
    language VARCHAR(10) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_consultation_product FOREIGN KEY (product_id) REFERENCES financial_product (id),
    INDEX idx_consultation_expiry (expires_at),
    INDEX idx_consultation_product_created (product_id, created_at)
);
