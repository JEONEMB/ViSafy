package com.visafy.recommendation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import com.visafy.execution.ApiExecutionHistoryService;
import com.visafy.execution.ApiExecutionHistoryService.RetrievedExecution;
import com.visafy.execution.ApiExecutionHistoryService.StoredExecution;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final RecommendationService service;
    private final TempProfileService profileService;
    private final ApiExecutionHistoryService historyService;

    public RecommendationController(RecommendationService service, TempProfileService profileService,
                                    ApiExecutionHistoryService historyService) {
        this.service = service;
        this.profileService = profileService;
        this.historyService = historyService;
    }

    @PostMapping
    public ResponseEntity<RecommendationResult> recommend(@Valid @RequestBody RecommendationRequest request) {
        TempProfile profile = profileService.getBySessionId(request.profileSessionId());
        RecommendationResult result = service.recommend(request.profileSessionId());
        StoredExecution stored = historyService.save(ApiExecutionHistoryService.RECOMMENDATION,
                request.profileSessionId(), result, profile.getExpiresAt());
        return ResponseEntity.ok()
                .location(URI.create("/api/recommendations/" + stored.id()))
                .header("X-Recommendation-Id", stored.id())
                .body(result);
    }

    @GetMapping("/{id}")
    public RecommendationResult get(@PathVariable String id,
                                    @RequestHeader("X-Profile-Session-Id") String profileSessionId) {
        RetrievedExecution<RecommendationResult> stored = historyService.get(id,
                ApiExecutionHistoryService.RECOMMENDATION, profileSessionId, RecommendationResult.class);
        return stored.result();
    }

    public record RecommendationRequest(@NotBlank String profileSessionId) {
    }
}
