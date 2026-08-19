import hashlib
import math
import re
import unicodedata


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
