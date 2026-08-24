import hashlib
import math
import re
import unicodedata
from typing import Protocol

from app.config import Settings


class EmbeddingProvider(Protocol):
    dimensions: int

    def embed(self, text: str) -> list[float]: ...


class LocalHashEmbedding:
    """Deterministic local embedding suitable for offline MVP retrieval."""

    def __init__(self, dimensions: int = 384) -> None:
        self.dimensions = dimensions

    def embed(self, text: str) -> list[float]:
        normalized = unicodedata.normalize("NFKC", text).lower()
        words = re.findall(r"[a-z0-9]+(?:-[a-z0-9]+)*|[가-힣]+", normalized)
        compact = re.sub(r"\s+", "", normalized)
        features = words + [compact[index : index + 3] for index in range(max(0, len(compact) - 2))]
        vector = [0.0] * self.dimensions
        for feature in features:
            digest = hashlib.sha256(feature.encode("utf-8")).digest()
            bucket = int.from_bytes(digest[:4], "big") % self.dimensions
            sign = 1.0 if digest[4] & 1 else -1.0
            vector[bucket] += sign
        norm = math.sqrt(sum(value * value for value in vector))
        return [value / norm for value in vector] if norm else vector


class SentenceTransformerEmbedding:
    """Optional local multilingual semantic embedding.

    The heavy model dependency is deliberately optional so the key-free MVP keeps
    working offline with the hash baseline.
    """

    def __init__(self, model_name: str) -> None:
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError as exception:
            raise RuntimeError(
                "EMBEDDING_PROVIDER=sentence_transformers requires the semantic optional dependency"
            ) from exception
        self._model = SentenceTransformer(model_name)
        self.dimensions = int(self._model.get_sentence_embedding_dimension())

    def embed(self, text: str) -> list[float]:
        vector = self._model.encode(text, normalize_embeddings=True)
        return [float(value) for value in vector]


def create_embedding_provider(settings: Settings) -> EmbeddingProvider:
    provider = settings.embedding_provider.strip().lower()
    if provider == "hash":
        return LocalHashEmbedding(settings.embedding_dimensions)
    if provider == "sentence_transformers":
        return SentenceTransformerEmbedding(settings.embedding_model)
    raise ValueError(f"Unsupported embedding provider: {settings.embedding_provider}")
