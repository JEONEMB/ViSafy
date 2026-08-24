ALTER TABLE temp_profile
    ADD COLUMN has_residence_card BOOLEAN NULL AFTER desired_monthly_amount,
    ADD COLUMN has_passport BOOLEAN NULL AFTER has_residence_card,
    ADD COLUMN has_domestic_phone BOOLEAN NULL AFTER has_passport,
    ADD COLUMN can_domestic_phone_verify BOOLEAN NULL AFTER has_domestic_phone,
    ADD COLUMN has_korean_bank_account BOOLEAN NULL AFTER can_domestic_phone_verify,
    ADD COLUMN has_korean_credit_history BOOLEAN NULL AFTER has_korean_bank_account,
    ADD COLUMN preferred_channel VARCHAR(40) NULL AFTER has_korean_credit_history,
    ADD COLUMN remittance_country VARCHAR(80) NULL AFTER preferred_channel;

UPDATE temp_profile
SET has_korean_bank_account = has_bank_account
WHERE has_korean_bank_account IS NULL;

ALTER TABLE precheck_result
    ADD COLUMN access_status VARCHAR(40) NOT NULL DEFAULT 'ACCESS_UNKNOWN' AFTER status,
    ADD COLUMN access_assessment_json LONGTEXT NULL AFTER access_status;
