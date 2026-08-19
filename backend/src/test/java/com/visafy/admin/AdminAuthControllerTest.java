package com.visafy.admin;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.visafy.common.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminAuthController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "app.security.admin-enabled=true")
class AdminAuthControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void rejectsAnonymousAdminRequest() throws Exception {
        mockMvc.perform(get("/api/admin/auth/check"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void allowsAuthenticatedAdminRequest() throws Exception {
        mockMvc.perform(get("/api/admin/auth/check"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AUTHENTICATED"));
    }
}
