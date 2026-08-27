ALTER TABLE financial_product
    ADD COLUMN official_application_url VARCHAR(1000) NULL AFTER application_method;

CREATE TABLE financial_journey_progress (
    id VARCHAR(36) PRIMARY KEY,
    profile_session_hash VARCHAR(64) NOT NULL,
    step_code VARCHAR(60) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP(6) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT uk_journey_progress_session_step UNIQUE (profile_session_hash, step_code),
    INDEX idx_journey_progress_expiry (expires_at)
);
