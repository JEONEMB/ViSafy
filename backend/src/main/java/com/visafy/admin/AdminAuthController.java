package com.visafy.admin;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {
    @GetMapping("/check")
    public Map<String, String> check() {
        return Map.of("status", "AUTHENTICATED");
    }
}
