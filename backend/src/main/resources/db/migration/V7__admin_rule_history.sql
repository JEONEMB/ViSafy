CREATE TABLE rule_change_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    rule_candidate_id BIGINT NOT NULL,
    action VARCHAR(40) NOT NULL,
    reviewer VARCHAR(120) NOT NULL,
    before_operator VARCHAR(40) NULL,
    before_value TEXT NULL,
    before_level VARCHAR(40) NULL,
    before_status VARCHAR(40) NULL,
    after_operator VARCHAR(40) NULL,
    after_value TEXT NULL,
    after_level VARCHAR(40) NULL,
    after_status VARCHAR(40) NULL,
    reviewed_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_rule_history_candidate FOREIGN KEY (rule_candidate_id) REFERENCES rule_candidate (id),
    INDEX idx_rule_history_candidate_time (rule_candidate_id, reviewed_at)
);
