ALTER TABLE financial_product
    ADD COLUMN product_audience VARCHAR(40) NOT NULL DEFAULT 'GENERAL' AFTER financial_purpose,
    ADD COLUMN product_category VARCHAR(40) NOT NULL DEFAULT 'SAVINGS' AFTER product_audience;

UPDATE financial_product
SET product_audience = CASE WHEN foreigner_target = TRUE THEN 'FOREIGNER_SPECIALIZED' ELSE 'GENERAL' END,
    product_category = CASE product_type
        WHEN 'CHECKING_ACCOUNT' THEN 'DEMAND_DEPOSIT'
        WHEN 'SAVINGS' THEN 'SAVINGS'
        WHEN 'LOAN' THEN 'PERSONAL_LOAN'
        WHEN 'CARD' THEN 'DEBIT_CARD'
        WHEN 'INVESTMENT' THEN 'SECURITIES'
        ELSE 'SAVINGS'
    END;

ALTER TABLE temp_profile
    MODIFY birth_date DATE NULL,
    MODIFY visa_type VARCHAR(10) NULL,
    MODIFY visa_expiry DATE NULL,
    MODIFY residency_start_date DATE NULL,
    MODIFY occupation VARCHAR(120) NULL,
    MODIFY employment_type VARCHAR(80) NULL,
    MODIFY monthly_income DECIMAL(15,2) NULL,
    MODIFY employment_duration_months INT NULL;
