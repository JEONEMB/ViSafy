package com.visafy.profile;

import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class VisaCatalog {
    private static final List<VisaMaster> VISAS = List.of(
            new VisaMaster("D-2", "유학", "STUDY", "전문대학 이상 교육기관의 유학생", true),
            new VisaMaster("D-4", "일반연수", "TRAINING", "어학연수 등 일반 연수생", true),
            new VisaMaster("E-7", "특정활동", "EMPLOYMENT", "전문 지식·기술 분야 종사자", true),
            new VisaMaster("E-9", "비전문취업", "EMPLOYMENT", "고용허가제 비전문 취업자", true),
            new VisaMaster("F-2", "거주", "RESIDENCE", "장기 체류가 허용된 거주자", true),
            new VisaMaster("F-5", "영주", "RESIDENCE", "대한민국 영주 자격 보유자", true),
            new VisaMaster("F-6", "결혼이민", "RESIDENCE", "국민의 배우자 등 결혼이민자", true)
    );
    private static final Set<String> SUPPORTED_CODES = Set.of("D-2", "D-4", "E-7", "E-9", "F-2", "F-5", "F-6");

    public List<VisaMaster> findActive() { return VISAS; }
    public boolean supports(String code) { return SUPPORTED_CODES.contains(code); }

    public record VisaMaster(String visaCode, String visaName, String visaCategory, String description, boolean active) {
    }
}
