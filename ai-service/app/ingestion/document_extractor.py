import hashlib
import io
from html.parser import HTMLParser
from typing import ClassVar

from pypdf import PdfReader

from app.ingestion.text_processor import FinancialDocumentProcessor


class _VisibleTextParser(HTMLParser):
    hidden_tags: ClassVar[set[str]] = {"script", "style", "noscript", "svg", "nav", "footer"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._hidden_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() in self.hidden_tags:
            self._hidden_depth += 1
        elif tag.lower() in {"p", "br", "li", "h1", "h2", "h3", "tr", "section"}:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in self.hidden_tags and self._hidden_depth:
            self._hidden_depth -= 1
        elif tag.lower() in {"p", "li", "h1", "h2", "h3", "tr", "section"}:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self._hidden_depth == 0:
            self.parts.append(data)


class DocumentExtractor:
    def __init__(self, scanned_page_threshold: int = 30) -> None:
        self.scanned_page_threshold = scanned_page_threshold
        self.processor = FinancialDocumentProcessor(900, 150)

    def pdf(self, content: bytes) -> dict:
        reader = PdfReader(io.BytesIO(content))
        pages = []
        low_text_pages = []
        for page_number, page in enumerate(reader.pages, start=1):
            text = self.processor.clean(page.extract_text() or "")
            if len(text) < self.scanned_page_threshold:
                low_text_pages.append(page_number)
            pages.append({"pageNumber": page_number, "text": text})
        combined = "\n\n".join(
            f"[PAGE {page['pageNumber']}]\n{page['text']}" for page in pages if page["text"]
        )
        return self._result("PDF", combined, pages, low_text_pages)

    def html(self, content: str) -> dict:
        parser = _VisibleTextParser()
        parser.feed(content)
        text = self.processor.clean("".join(parser.parts))
        return self._result("HTML", text, [], [])

    def compare_hash(self, previous_hash: str | None, current_text: str) -> dict:
        current_hash = self._hash(current_text)
        changed = bool(previous_hash) and previous_hash.lower() != current_hash
        return {
            "contentHash": current_hash,
            "changed": changed,
            "reviewRequired": changed,
            "recommendedStatus": "NEED_REVIEW" if changed else "UNCHANGED",
        }

    def _result(self, kind: str, text: str, pages: list[dict], low_text_pages: list[int]) -> dict:
        return {
            "documentType": kind,
            "text": text,
            "pages": pages,
            "contentHash": self._hash(text),
            "ocrRequired": bool(low_text_pages),
            "ocrRequiredPages": low_text_pages,
        }

    def _hash(self, text: str) -> str:
        normalized = self.processor.clean(text)
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()
