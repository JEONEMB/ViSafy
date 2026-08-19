import re
import unicodedata


class FinancialDocumentProcessor:
    def __init__(self, chunk_size: int, overlap: int) -> None:
        if chunk_size < 200 or overlap < 0 or overlap >= chunk_size:
            raise ValueError("Invalid chunk configuration")
        self.chunk_size = chunk_size
        self.overlap = overlap

    def clean(self, text: str) -> str:
        normalized = unicodedata.normalize("NFKC", text).replace("\x00", " ")
        normalized = re.sub(r"[\t\r\f\v]+", " ", normalized)
        normalized = re.sub(r"[ ]{2,}", " ", normalized)
        normalized = re.sub(r"\n[ ]+", "\n", normalized)
        normalized = re.sub(r"\n{3,}", "\n\n", normalized)
        return normalized.strip()

    def chunk(self, text: str) -> list[str]:
        cleaned = self.clean(text)
        if not cleaned:
            return []
        chunks: list[str] = []
        start = 0
        while start < len(cleaned):
            hard_end = min(start + self.chunk_size, len(cleaned))
            end = hard_end
            if hard_end < len(cleaned):
                search_from = start + max(1, self.chunk_size // 2)
                candidates = [
                    cleaned.rfind("\n\n", search_from, hard_end),
                    cleaned.rfind("\n", search_from, hard_end),
                    cleaned.rfind(". ", search_from, hard_end),
                    cleaned.rfind("다. ", search_from, hard_end),
                ]
                boundary = max(candidates)
                if boundary > start:
                    end = boundary + (1 if cleaned[boundary] == "\n" else 2)
            piece = cleaned[start:end].strip()
            if piece:
                chunks.append(piece)
            if end >= len(cleaned):
                break
            start = max(start + 1, end - self.overlap)
        return chunks
