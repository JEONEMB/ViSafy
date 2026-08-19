package com.visafy.execution;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "recommendation_result_history")
public class ApiExecutionHistory {
    @Id
    @Column(length = 36)
    private String id;
    @Column(nullable = false, length = 40)
    private String executionType;
    @Column(nullable = false, length = 64)
    private String profileSessionHash;
    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String resultJson;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant expiresAt;

    protected ApiExecutionHistory() {}

    ApiExecutionHistory(String id, String executionType, String profileSessionHash, String resultJson,
                        Instant createdAt, Instant expiresAt) {
        this.id = id;
        this.executionType = executionType;
        this.profileSessionHash = profileSessionHash;
        this.resultJson = resultJson;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public String getId() { return id; }
    public String getExecutionType() { return executionType; }
    public String getProfileSessionHash() { return profileSessionHash; }
    public String getResultJson() { return resultJson; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
}
