package com.visafy.rag;

import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.product.ProductRule;
import com.visafy.product.ProductRuleRepository;
import com.visafy.rag.RagAiClient.IndexDocument;
import com.visafy.rag.RagAiClient.SyncResponse;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class RagIndexService {
    private final SourceDocumentService sourceService;
    private final FinancialProductRepository productRepository;
    private final ProductRuleRepository ruleRepository;
    private final RagAiClient aiClient;

    public RagIndexService(SourceDocumentService sourceService, FinancialProductRepository productRepository,
                           ProductRuleRepository ruleRepository, RagAiClient aiClient) {
        this.sourceService = sourceService;
        this.productRepository = productRepository;
        this.ruleRepository = ruleRepository;
        this.aiClient = aiClient;
    }

    public ReindexResult reindex() {
        LocalDate today = LocalDate.now();
        List<SourceDocument> sources = sourceService.findAll();
        Map<Long, Map<Long, Set<String>>> associations = new LinkedHashMap<>();
        for (FinancialProduct product : productRepository.findByActiveTrueOrderByCreatedAtDesc()) {
            associations.computeIfAbsent(product.getSourceDocument().getId(), ignored -> new LinkedHashMap<>())
                    .computeIfAbsent(product.getId(), ignored -> new LinkedHashSet<>());
        }
        for (ProductRule rule : ruleRepository.findAllByActiveTrue()) {
            if (!rule.getProduct().isActive() || !rule.isEffective(today)) continue;
            associations.computeIfAbsent(rule.getSourceDocument().getId(), ignored -> new LinkedHashMap<>())
                    .computeIfAbsent(rule.getProduct().getId(), ignored -> new LinkedHashSet<>())
                    .add(rule.getRuleKey());
        }

        List<IndexDocument> documents = new ArrayList<>();
        int skippedUnlinked = 0;
        for (SourceDocument source : sources) {
            if (!source.isEffective(today)) continue;
            Map<Long, Set<String>> products = associations.get(source.getId());
            if (products == null || products.isEmpty()) {
                skippedUnlinked++;
                continue;
            }
            products.forEach((productId, ruleKeys) -> documents.add(new IndexDocument(
                    source.getId(), source.getInstitution(), source.getTitle(), source.getSourceType().name(),
                    source.getSourceUrl(), source.getRetrievedAt(), source.getValidFrom(), source.getValidTo(),
                    productId, source.getLanguage(), source.getReviewStatus().name(), source.getContentHash(),
                    source.getSnapshotText(), List.copyOf(ruleKeys))));
        }
        SyncResponse response = aiClient.sync(documents);
        return new ReindexResult(response.indexedDocuments(), response.indexedChunks(), skippedUnlinked);
    }

    public record ReindexResult(int indexedDocuments, int indexedChunks, int skippedUnlinkedSources) {}
}
