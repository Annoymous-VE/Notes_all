from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.ingestion.embedder import Embedder
from app.search.hybrid import HybridSearch


@dataclass
class RetrievedChunk:
    chunk_id: str
    note_id: str
    content: str
    score: float
    metadata: dict[str, Any]


class RAGRetriever:
    """
    Retrieves relevant note chunks using hybrid search.

    Query flow:
        User query
            ↓
        Embedding
            ↓
        HybridSearch
            ↓
        Relevant chunks
    """

    def __init__(
        self,
        hybrid_search: HybridSearch,
        embedder: Embedder,
    ) -> None:
        self.hybrid_search = hybrid_search
        self.embedder = embedder

    async def retrieve(
        self,
        query: str,
        *,
        top_k: int = 8,
        filters: dict[str, Any] | None = None,
    ) -> list[RetrievedChunk]:

        if not query.strip():
            return []

        # Generate embedding for semantic search.
        query_embedding = await self.embedder.embed_query(query)

        # Perform keyword + vector search.
        results = await self.hybrid_search.search(
            query=query,
            top_k=top_k,
            filters=filters,
            query_embedding=query_embedding,
        )

        return [
            self._normalize_result(result)
            for result in results
        ]

    @staticmethod
    def _normalize_result(
        result: dict[str, Any],
    ) -> RetrievedChunk:

        return RetrievedChunk(
            chunk_id=str(result["chunk_id"]),
            note_id=str(result["note_id"]),
            content=result["content"],
            score=float(result.get("score", 0.0)),
            metadata=result.get("metadata", {}),
        )