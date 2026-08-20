package com.visafy.rag;

import com.visafy.rag.RagAiClient.RagAnswerResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RagController {
    private final RagIndexService indexService;
    private final RagService ragService;

    public RagController(RagIndexService indexService, RagService ragService) {
        this.indexService = indexService;
        this.ragService = ragService;
    }

    @PostMapping("/admin/rag/reindex")
    public RagIndexService.ReindexResult reindex() {
        return indexService.reindex();
    }

    @GetMapping("/admin/rag/quality")
    public RagIndexService.QualityMetrics quality() {
        return indexService.quality();
    }

    @PostMapping("/rag/answer")
    public RagAnswerResponse answer(@Valid @RequestBody RagQuestionRequest request) {
        return ragService.answer(request.profileSessionId(), request.productId(), request.ruleKey(),
                request.query(), request.topK());
    }

    public record RagQuestionRequest(
            @NotBlank String profileSessionId,
            @NotNull Long productId,
            @NotBlank @Size(max = 120) String ruleKey,
            @NotBlank @Size(min = 2, max = 1000) String query,
            @Min(1) @Max(10) int topK
    ) {}
}
