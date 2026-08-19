from functools import lru_cache

from app.config import settings
from app.rag.store import OfficialDocumentStore


@lru_cache
def get_document_store() -> OfficialDocumentStore:
    return OfficialDocumentStore(settings)
