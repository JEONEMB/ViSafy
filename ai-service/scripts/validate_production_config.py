import os
import sys

PLACEHOLDERS = {"", "visafy", "change-me", "local-rag-development-token", "local-development-only-secret"}
REQUIRED = ("RAG_INTERNAL_TOKEN", "ADMIN_PASSWORD", "DB_PASSWORD", "MYSQL_ROOT_PASSWORD")


def validate(environment: dict[str, str]) -> list[str]:
    errors = []
    for key in REQUIRED:
        value = environment.get(key, "").strip()
        if value in PLACEHOLDERS or value.startswith("change-me"):
            errors.append(f"{key} must be replaced with a deployment secret")
        elif len(value) < 16:
            errors.append(f"{key} must be at least 16 characters")
    providers = {
        "openai": ("OPENAI_API_KEY", "OPENAI_MODEL"),
        "gemini": ("GEMINI_API_KEY", "GEMINI_MODEL"),
        "anthropic": ("ANTHROPIC_API_KEY", "ANTHROPIC_MODEL"),
    }
    selected = environment.get("LLM_PROVIDER", "none").strip().lower()
    if selected not in {"none", *providers}:
        errors.append(f"Unsupported LLM_PROVIDER: {selected}")
    elif selected in providers:
        for key in providers[selected]:
            if not environment.get(key, "").strip():
                errors.append(f"{key} is required for LLM_PROVIDER={selected}")
    return errors


if __name__ == "__main__":
    problems = validate(dict(os.environ))
    if problems:
        print("Production configuration is not ready:")
        for problem in problems:
            print(f"- {problem}")
        sys.exit(1)
    print("Production secret configuration passed.")
