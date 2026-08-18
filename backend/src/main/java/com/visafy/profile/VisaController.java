package com.visafy.profile;

import com.visafy.profile.VisaCatalog.VisaMaster;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/visas")
public class VisaController {
    private final VisaCatalog visaCatalog;

    public VisaController(VisaCatalog visaCatalog) {
        this.visaCatalog = visaCatalog;
    }

    @GetMapping
    public List<VisaMaster> findActive() {
        return visaCatalog.findActive();
    }
}
