package com.visafy.profile;

import com.visafy.profile.TempProfile.ProfileData;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TempProfileService {
    private final TempProfileRepository repository;
    private final VisaCatalog visaCatalog;

    public TempProfileService(TempProfileRepository repository, VisaCatalog visaCatalog) {
        this.repository = repository;
        this.visaCatalog = visaCatalog;
    }

    @Transactional
    public TempProfile create(ProfileData data) {
        validate(data);
        TempProfile profile = new TempProfile(UUID.randomUUID().toString());
        profile.update(data);
        return repository.save(profile);
    }

    public TempProfile get(Long id) {
        TempProfile profile = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        validateNotExpired(profile);
        return profile;
    }

    public TempProfile getBySessionId(String sessionId) {
        TempProfile profile = repository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        validateNotExpired(profile);
        return profile;
    }

    public TempProfile getOwned(Long id, String sessionId) {
        TempProfile profile = getBySessionId(sessionId.strip());
        if (!profile.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }
        return profile;
    }

    private void validateNotExpired(TempProfile profile) {
        if (profile.getExpiresAt().isBefore(java.time.Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Temporary profile has expired");
        }
    }

    @Transactional
    public TempProfile update(Long id, ProfileData data) {
        validate(data);
        TempProfile profile = get(id);
        profile.update(data);
        return profile;
    }

    /**
     * Switches only the stored language. Diagnosis messages, access details, guidance, the
     * journey, and AI answers all read the profile language, so a language change in the UI has
     * to reach the profile for those to follow.
     */
    @Transactional
    public TempProfile updateLanguage(Long id, String sessionId, String language) {
        TempProfile profile = getOwned(id, sessionId);
        profile.changeLanguage(language);
        return profile;
    }

    @Transactional
    public TempProfile updateOwned(Long id, String sessionId, ProfileData data) {
        validate(data);
        TempProfile profile = getOwned(id, sessionId);
        profile.update(data);
        return profile;
    }

    private void validate(ProfileData data) {
        LocalDate today = LocalDate.now();
        SensitiveDataGuard.rejectProhibitedValues(data.nationality(), data.visaType(), data.occupation(),
                data.employmentType(), data.financialPurpose(), data.housingType(), data.preferredBank());
        if (data.visaType() != null && !visaCatalog.supports(data.visaType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported visa type");
        }
        if (data.birthDate() != null && !data.birthDate().isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "birthDate must be in the past");
        }
        if (data.visaExpiry() != null && data.visaExpiry().isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "visaExpiry must not be in the past");
        }
        if (data.residencyStartDate() != null && data.residencyStartDate().isAfter(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "residencyStartDate must not be in the future");
        }
    }
}
