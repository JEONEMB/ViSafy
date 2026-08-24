from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_environment: str = "local"
    llm_provider: str = "none"
    llm_api_key: str = ""
    llm_model: str = ""
    openai_api_key: str = ""
    openai_model: str = ""
    llm_timeout_seconds: float = 8.0
    vector_db_path: str = "./chroma-data"
    allowed_source_domains: str = ""
    rag_internal_token: str = "local-rag-development-token"
    rag_collection_name: str = "official_financial_documents"
    rag_chunk_size: int = 900
    rag_chunk_overlap: int = 150
    embedding_provider: str = "hash"
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    embedding_dimensions: int = 384
    embedding_api_key: str = ""
    ocr_provider: str = "none"
    ocr_api_key: str = ""
    cors_allowed_origins: str = "http://localhost:3000,http://localhost:8080"

    @property
    def source_domain_allowlist(self) -> list[str]:
        return [
            item.strip().lower() for item in self.allowed_source_domains.split(",") if item.strip()
        ]

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_allowed_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
