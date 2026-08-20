UPDATE rule_candidate
SET rule_nature = 'UNKNOWN_ELIGIBILITY'
WHERE rule_level = 'UNKNOWN' AND rule_nature = 'INFORMATION';

UPDATE product_rule
SET rule_nature = 'UNKNOWN_ELIGIBILITY'
WHERE rule_level = 'UNKNOWN' AND rule_nature = 'INFORMATION';
