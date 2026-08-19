ALTER TABLE source_document
    ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT 'ko' AFTER valid_to;
