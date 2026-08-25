-- Keep Runtime RAG limited to active, product-linked official evidence.
-- Demo snapshots and sources for a product closed to new subscriptions are historical,
-- while the EZ Loan placeholder explicitly says that detailed conditions were not found.

UPDATE source_document
SET review_status = 'SUPERSEDED', reviewed_by = 'rag-source-audit-2026-08-25',
    last_verified_at = CURRENT_TIMESTAMP(6), updated_at = CURRENT_TIMESTAMP(6)
WHERE id IN (2, 3, 4, 13, 14)
  AND review_status = 'APPROVED';

UPDATE source_document
SET review_status = 'NEED_REVIEW', reviewed_by = 'rag-source-audit-2026-08-25',
    last_verified_at = CURRENT_TIMESTAMP(6), updated_at = CURRENT_TIMESTAMP(6)
WHERE id = 8
  AND review_status = 'APPROVED';
