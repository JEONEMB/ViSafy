import hashlib
import math
import re
import unicodedata
from typing import Protocol

from app.config import Settings


class EmbeddingProvider(Protocol):
    dimensions: int

    def embed_document(self, text: str) -> list[float]: ...

    def embed_query(self, text: str) -> list[float]: ...


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

    def embed_document(self, text: str) -> list[float]:
        return self.embed(text)

    def embed_query(self, text: str) -> list[float]:
        return self.embed(text)


class FastEmbedMultilingualEmbedding:
    """CPU-friendly multilingual E5 embeddings backed by ONNX Runtime."""

    def __init__(self, model_name: str, dimensions: int = 384) -> None:
        try:
            from fastembed import TextEmbedding
            from fastembed.common.model_description import ModelSource, PoolingType
        except ImportError as exception:
            raise RuntimeError(
                "EMBEDDING_PROVIDER=fastembed requires the semantic optional dependency"
            ) from exception

        supported = {item["model"] for item in TextEmbedding.list_supported_models()}
        if model_name not in supported:
            TextEmbedding.add_custom_model(
                model=model_name,
                pooling=PoolingType.MEAN,
                normalization=True,
                sources=ModelSource(hf=model_name),
                dim=dimensions,
                model_file="onnx/model.onnx",
            )
        self._model = TextEmbedding(model_name=model_name)
        self.dimensions = dimensions

    def _embed(self, text: str) -> list[float]:
        vector = next(iter(self._model.embed([text])))
        return [float(value) for value in vector]

    def embed_document(self, text: str) -> list[float]:
        return self._embed(f"passage: {text}")

    def embed_query(self, text: str) -> list[float]:
        return self._embed(f"query: {text}")


def create_embedding_provider(settings: Settings) -> EmbeddingProvider:
    provider = settings.embedding_provider.strip().lower()
    if provider == "hash":
        return LocalHashEmbedding(settings.embedding_dimensions)
    if provider == "fastembed":
        return FastEmbedMultilingualEmbedding(
            settings.embedding_model, settings.embedding_dimensions
        )
    raise ValueError(f"Unsupported embedding provider: {settings.embedding_provider}")
