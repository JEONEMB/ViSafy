package com.visafy.common.health;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(HealthController.class)
@AutoConfigureMockMvc(addFilters = false)
class HealthControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiHealthClient aiHealthClient;

    @Test
    void reportsBackendUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void reportsAiHealthThroughBackend() throws Exception {
        given(aiHealthClient.getHealth()).willReturn(HealthResponse.up());
        mockMvc.perform(get("/api/health/ai"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void passesTheAiProviderFieldsThroughTheProxy() throws Exception {
        given(aiHealthClient.getHealth()).willReturn(
                new HealthResponse("UP", null, "fastembed", "intfloat/multilingual-e5-small", "openai", true));

        mockMvc.perform(get("/api/health/ai"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.llmProvider").value("openai"))
                .andExpect(jsonPath("$.llmConfigured").value(true))
                .andExpect(jsonPath("$.embeddingProvider").value("fastembed"));
    }

    @Test
    void omitsTheAiFieldsFromTheBackendOwnHealth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.llmProvider").doesNotExist())
                .andExpect(jsonPath("$.message").doesNotExist());
    }
}

