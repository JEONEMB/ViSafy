from scripts.validate_production_config import validate


def test_default_secrets_are_rejected_and_provider_pair_is_required() -> None:
    errors = validate({
        "RAG_INTERNAL_TOKEN": "local-rag-development-token",
        "ADMIN_PASSWORD": "change-me",
        "DB_PASSWORD": "visafy",
        "MYSQL_ROOT_PASSWORD": "change-me",
        "LLM_PROVIDER": "openai",
    })

    assert len(errors) == 6
    assert any("OPENAI_API_KEY" in error for error in errors)
    assert any("OPENAI_MODEL" in error for error in errors)


def test_strong_secrets_pass_without_external_llm() -> None:
    assert validate({
        "RAG_INTERNAL_TOKEN": "rag-0123456789abcdef",
        "ADMIN_PASSWORD": "admin-0123456789abcdef",
        "DB_PASSWORD": "db-0123456789abcdef",
        "MYSQL_ROOT_PASSWORD": "root-0123456789abcdef",
        "LLM_PROVIDER": "none",
    }) == []
