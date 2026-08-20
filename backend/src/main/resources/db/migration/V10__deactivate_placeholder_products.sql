-- Preserve prior local/demo records for auditability, but do not expose them beside the verified dataset.
UPDATE financial_product
SET active = FALSE,
    updated_at = CURRENT_TIMESTAMP(6)
WHERE product_code LIKE 'DEMO-%'
   OR product_code LIKE 'ADM-DEMO-%';
