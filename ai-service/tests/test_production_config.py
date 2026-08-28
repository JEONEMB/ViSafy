from scripts.validate_production_config import validate


def test_default_secrets_are_rejected_and_provider_pair_is_required() -> None:
    errors = validate({
        "RAG_INTERNAL_TOKEN": "local-rag-development-token",
        "ADMIN_USERNAME": "admin",
        "ADMIN_PASSWORD": "change-me",
        "MYSQL_PASSWORD": "visafy",
        "DB_PASSWORD": "visafy",
        "MYSQL_ROOT_PASSWORD": "change-me",
        "LLM_PROVIDER": "openai",
    })

    assert any("ADMIN_USERNAME" in error for error in errors)
    assert any("OPENAI_API_KEY" in error for error in errors)
    assert any("OPENAI_MODEL" in error for error in errors)


def test_strong_secrets_pass_without_external_llm() -> None:
    assert validate({
        "RAG_INTERNAL_TOKEN": "rag-0123456789abcdef",
        "ADMIN_USERNAME": "admin_0123456789abcdef",
        "ADMIN_PASSWORD": "admin-0123456789abcdef",
        "MYSQL_PASSWORD": "db-0123456789abcdef",
        "DB_PASSWORD": "db-0123456789abcdef",
        "MYSQL_ROOT_PASSWORD": "root-0123456789abcdef",
        "LLM_PROVIDER": "none",
    }) == []


def test_example_placeholders_and_mismatched_database_password_are_rejected() -> None:
    errors = validate({
        "RAG_INTERNAL_TOKEN": "replace-with-independent-random-secret",
        "ADMIN_USERNAME": "replace-with-random-admin-username",
        "ADMIN_PASSWORD": "replace-with-random-secret",
        "MYSQL_PASSWORD": "mysql-0123456789abcdef",
        "DB_PASSWORD": "different-0123456789abcdef",
        "MYSQL_ROOT_PASSWORD": "replace-with-random-secret",
        "LLM_PROVIDER": "openai",
        "OPENAI_API_KEY": "replace-with-a-new-key",
        "OPENAI_MODEL": "gpt-5.6-terra",
    })

    assert any("replace" in error for error in errors)
    assert any("DB_PASSWORD must match MYSQL_PASSWORD" in error for error in errors)
    assert any("OPENAI_API_KEY" in error for error in errors)
