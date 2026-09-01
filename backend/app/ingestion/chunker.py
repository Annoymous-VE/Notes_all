from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class TextChunk:
    content: str
    chunk_index: int


class TextChunker:
    """
    Splits extracted document text into overlapping chunks.

    Designed for RAG retrieval:
    - Keeps chunks reasonably small
    - Preserves sentence boundaries where possible
    - Uses overlap so important context is not lost
    """

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 150,
    ) -> None:

        if chunk_size <= 0:
            raise ValueError("chunk_size must be greater than 0.")

        if chunk_overlap < 0:
            raise ValueError("chunk_overlap cannot be negative.")

        if chunk_overlap >= chunk_size:
            raise ValueError(
                "chunk_overlap must be smaller than chunk_size."
            )

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split(self, text: str) -> list[TextChunk]:
        """
        Split document text into RAG-friendly chunks.
        """

        text = self._clean_text(text)

        if not text:
            return []

        paragraphs = self._split_paragraphs(text)

        chunks: list[TextChunk] = []
        current = ""

        for paragraph in paragraphs:

            # Paragraph fits into current chunk.
            if len(current) + len(paragraph) + 1 <= self.chunk_size:
                current = self._append(current, paragraph)
                continue

            # Save current chunk.
            if current:
                chunks.append(
                    TextChunk(
                        content=current.strip(),
                        chunk_index=len(chunks),
                    )
                )

            # Paragraph itself is too large.
            if len(paragraph) > self.chunk_size:
                split_parts = self._split_large_text(paragraph)

                for part in split_parts:
                    chunks.append(
                        TextChunk(
                            content=part.strip(),
                            chunk_index=len(chunks),
                        )
                    )

                current = self._get_overlap(
                    split_parts[-1]
                )

            else:
                current = paragraph

        # Save final chunk.
        if current.strip():
            chunks.append(
                TextChunk(
                    content=current.strip(),
                    chunk_index=len(chunks),
                )
            )

        return chunks

    def chunk(self, text: str) -> list[str]:
        """
        Convenience method returning only chunk text.

        Useful for indexer.py.
        """

        return [
            chunk.content
            for chunk in self.split(text)
        ]

    @staticmethod
    def _clean_text(text: str) -> str:
        """Normalize extracted document text."""

        text = text.replace("\x00", " ")

        # Normalize whitespace.
        text = re.sub(r"[ \t]+", " ", text)

        # Normalize excessive blank lines.
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    @staticmethod
    def _split_paragraphs(text: str) -> list[str]:
        """Split text while preserving paragraph structure."""

        paragraphs = re.split(
            r"\n\s*\n",
            text,
        )

        return [
            paragraph.strip()
            for paragraph in paragraphs
            if paragraph.strip()
        ]

    @staticmethod
    def _append(
        current: str,
        paragraph: str,
    ) -> str:

        if not current:
            return paragraph

        return f"{current}\n\n{paragraph}"

    def _split_large_text(
        self,
        text: str,
    ) -> list[str]:
        """
        Split oversized paragraphs using sentence boundaries
        where possible.
        """

        sentences = re.split(
            r"(?<=[.!?])\s+",
            text,
        )

        chunks: list[str] = []
        current = ""

        for sentence in sentences:

            if not sentence:
                continue

            if (
                len(current) + len(sentence) + 1
                <= self.chunk_size
            ):
                current = self._append(
                    current,
                    sentence,
                )
                continue

            if current:
                chunks.append(current.strip())

            # Single sentence is larger than chunk size.
            if len(sentence) > self.chunk_size:
                chunks.extend(
                    self._split_by_size(sentence)
                )
                current = ""
            else:
                current = sentence

        if current:
            chunks.append(current.strip())

        return chunks

    def _split_by_size(
        self,
        text: str,
    ) -> list[str]:
        """Hard split when a sentence is extremely large."""

        chunks: list[str] = []

        start = 0
        text_length = len(text)

        while start < text_length:

            end = min(
                start + self.chunk_size,
                text_length,
            )

            chunks.append(
                text[start:end].strip()
            )

            if end >= text_length:
                break

            start = end - self.chunk_overlap

        return chunks

    def _get_overlap(
        self,
        text: str,
    ) -> str:
        """Return the last part of a chunk as overlap."""

        if len(text) <= self.chunk_overlap:
            return text
              
        return text[-self.chunk_overlap:]   