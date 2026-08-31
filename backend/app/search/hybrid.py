from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chunk import Chunk
from app.models.file import File


class HybridSearch:
    """
    Hybrid note search using:
    1. PostgreSQL keyword matching
    2. pgvector semantic similarity

    Results from both searches are merged and ranked.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def search(
        self,
        query: str,
        *,
        top_k: int = 10,
        filters: dict[str, Any] | None = None,
        query_embedding: list[float] | None = None,
    ) -> list[dict[str, Any]]:

        if not query.strip():
            return []

        keyword_results = await self._keyword_search(
            query=query,
            limit=top_k * 2,
            filters=filters,
        )

        vector_results: list[dict[str, Any]] = []

        if query_embedding:
            vector_results = await self._vector_search(
                embedding=query_embedding,
                limit=top_k * 2,
                filters=filters,
            )

        return self._merge_results(
            keyword_results,
            vector_results,
            top_k=top_k,
        )

    async def _keyword_search(
        self,
        query: str,
        *,
        limit: int,
        filters: dict[str, Any] | None,
    ) -> list[dict[str, Any]]:

        search_pattern = f"%{query.strip()}%"

        stmt = (
            select(Chunk, File)
            .join(File, Chunk.file_id == File.id)
            .where(
                File.filename.ilike(search_pattern)
                | Chunk.content.ilike(search_pattern)
            )
            .limit(limit)
        )

        stmt = self._apply_filters(stmt, filters)

        result = await self.db.execute(stmt)

        rows = result.all()

        return [
            self._build_result(
                chunk=chunk,
                file=file,
                score=1.0 / (index + 1),
                search_type="keyword",
            )
            for index, (chunk, file) in enumerate(rows)
        ]

    async def _vector_search(
        self,
        embedding: list[float],
        *,
        limit: int,
        filters: dict[str, Any] | None,
    ) -> list[dict[str, Any]]:

        distance = Chunk.embedding.cosine_distance(embedding)

        stmt = (
            select(
                Chunk,
                File,
                distance.label("distance"),
            )
            .join(File, Chunk.file_id == File.id)
            .where(
                Chunk.embedding.is_not(None)
            )
            .order_by(distance)
            .limit(limit)
        )

        stmt = self._apply_filters(stmt, filters)

        result = await self.db.execute(stmt)

        rows = result.all()

        results = []

        for chunk, file, distance_value in rows:
            similarity = 1.0 - float(distance_value)

            results.append(
                self._build_result(
                    chunk=chunk,
                    file=file,
                    score=max(0.0, similarity),
                    search_type="vector",
                )
            )

        return results

    @staticmethod
    def _apply_filters(
        stmt,
        filters: dict[str, Any] | None,
    ):
        """
        Apply metadata filters.

        Current metadata lives inside Chunk.metadata_.
        """

        if not filters:
            return stmt

        for key, value in filters.items():

            if value is None:
                continue

            stmt = stmt.where(
                Chunk.metadata_[key].as_string() == str(value)
            )

        return stmt

    @staticmethod
    def _build_result(
        *,
        chunk: Chunk,
        file: File,
        score: float,
        search_type: str,
    ) -> dict[str, Any]:

        metadata = dict(chunk.metadata_ or {})

        # Always expose the file information.
        metadata.setdefault(
            "filename",
            file.filename,
        )

        metadata.setdefault(
            "mime_type",
            file.mime_type,
        )

        metadata.setdefault(
            "file_id",
            str(file.id),
        )

        return {
            "chunk_id": str(chunk.id),
            "note_id": str(file.id),
            "content": chunk.content,
            "score": score,
            "search_type": search_type,
            "metadata": metadata,
        }

    @staticmethod
    def _merge_results(
        keyword_results: list[dict[str, Any]],
        vector_results: list[dict[str, Any]],
        *,
        top_k: int,
    ) -> list[dict[str, Any]]:

        merged: dict[str, dict[str, Any]] = {}

        # Keyword contribution
        for result in keyword_results:
            chunk_id = result["chunk_id"]

            merged[chunk_id] = {
                **result,
                "score": result["score"] * 0.4,
            }

        # Vector contribution
        for result in vector_results:
            chunk_id = result["chunk_id"]

            if chunk_id in merged:
                merged[chunk_id]["score"] += (
                    result["score"] * 0.6
                )
                merged[chunk_id]["search_type"] = "hybrid"
            else:
                merged[chunk_id] = {
                    **result,
                    "score": result["score"] * 0.6,
                }

        return sorted(
            merged.values(),
            key=lambda item: item["score"],
            reverse=True,
        )[:top_k]