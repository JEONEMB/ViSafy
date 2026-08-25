package com.visafy.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class RagIndexLifecycle {
    private static final Logger log = LoggerFactory.getLogger(RagIndexLifecycle.class);
    private final RagIndexService indexService;

    public RagIndexLifecycle(RagIndexService indexService) {
        this.indexService = indexService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void refreshOnStartup() {
        refresh("backend-startup");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void refreshAfterApprovedDataChange(RagIndexRefreshRequested event) {
        refresh(event.reason());
    }

    private synchronized void refresh(String reason) {
        try {
            RagIndexService.ReindexResult result = indexService.reindex();
            log.info("RAG index refreshed: reason={}, documents={}, chunks={}, unlinked={}", reason,
                    result.indexedDocuments(), result.indexedChunks(), result.skippedUnlinkedSources());
        } catch (RuntimeException exception) {
            // RAG must not prevent the deterministic eligibility service from starting or approving data.
            log.warn("RAG automatic refresh failed; eligibility remains available: reason={}, error={}",
                    reason, exception.getMessage());
        }
    }
}
