from __future__ import annotations

from dataclasses import dataclass

from app.rag.retriever import RetrievedChunk


@dataclass
class RAGContext:
    """Context prepared for the LLM."""

    text: str
    sources: list[RetrievedChunk]


class RAGContextBuilder:
    """
    Builds the context that will be provided to Crow.

    Responsibilities:
    - Format retrieved chunks
    - Remove duplicate chunks
    - Limit context size
    - Preserve source information

    This class does NOT:
    - Call the LLM
    - Perform searches
    - Modify database records
    - Handle coin transactions
    """

    def __init__(
        self,
        max_chunks: int = 8,
        max_characters: int = 30_000,
    ) -> None:
        self.max_chunks = max_chunks
        self.max_characters = max_characters

    def build(
        self,
        chunks: list[RetrievedChunk],
    ) -> RAGContext:
        """Build a formatted RAG context from retrieved chunks."""

        selected: list[RetrievedChunk] = []
        seen_chunks: set[str] = set()
        current_length = 0

        for chunk in chunks:
            if len(selected) >= self.max_chunks:
                break

            if chunk.chunk_id in seen_chunks:
                continue

            content = chunk.content.strip()

            if not content:
                continue

            remaining = self.max_characters - current_length

            if remaining <= 0:
                break

            if len(content) > remaining:
                content = content[:remaining]

            selected_chunk = RetrievedChunk(
                chunk_id=chunk.chunk_id,
                note_id=chunk.note_id,
                content=content,
                score=chunk.score,
                metadata=chunk.metadata,
            )

            selected.append(selected_chunk)
            seen_chunks.add(chunk.chunk_id)
            current_length += len(content)

        context_text = self._format(selected)

        return RAGContext(
            text=context_text,
            sources=selected,
        )

    @staticmethod
    def _format(
        chunks: list[RetrievedChunk],
    ) -> str:
        """Format chunks into structured LLM context."""

        if not chunks:
            return "No relevant notes were found."

        sections: list[str] = []

        for index, chunk in enumerate(chunks, start=1):
            metadata = chunk.metadata

            title = metadata.get("title", "Untitled note")
            subject = metadata.get("subject", "")
            page = metadata.get("page_number")

            source_info = f"Note: {title}"

            if subject:
                source_info += f" | Subject: {subject}"

            if page is not None:
                source_info += f" | Page: {page}"

            sections.append(
                f"[SOURCE {index}]\n"
                f"{source_info}\n"
                f"Note ID: {chunk.note_id}\n"
                f"Relevance Score: {chunk.score:.4f}\n"
                f"Content:\n{chunk.content}"
            )

        return "\n\n".join(sections)