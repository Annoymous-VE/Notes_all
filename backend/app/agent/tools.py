from __future__ import annotations

import json
from typing import Any

from app.rag.retriever import RAGRetriever


class CrowTools:
    """
    Read-only tools available to Crow.

    Crow can search and inspect notes, but cannot purchase,
    spend coins, modify balances, or change permissions.
    """

    def __init__(
        self,
        retriever: RAGRetriever,
        user_id: str,
    ) -> None:
        self.retriever = retriever
        self.user_id = user_id
        self.latest_sources: list[dict[str, Any]] = []

    def definitions(self) -> list[dict[str, Any]]:
        return [
            {
                "type": "function",
                "function": {
                    "name": "search_notes",
                    "description": (
                        "Search NotesAll notes using keyword and semantic "
                        "search. Use this to find notes by title, topic, "
                        "subject, course, semester, university, or concept."
                    ),
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Natural-language search query.",
                            },
                            "top_k": {
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 10,
                                "default": 5,
                            },
                            "filters": {
                                "type": "object",
                                "description": "Optional metadata filters.",
                                "additionalProperties": True,
                            },
                        },
                        "required": ["query"],
                        "additionalProperties": False,
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_note_details",
                    "description": (
                        "Get detailed information about a specific note, "
                        "including its metadata and whether it is premium."
                    ),
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "note_id": {
                                "type": "string",
                                "description": "The note ID.",
                            }
                        },
                        "required": ["note_id"],
                        "additionalProperties": False,
                    },
                },
            },
        ]

    async def execute(
        self,
        name: str,
        arguments: str,
    ) -> str:

        try:
            args = json.loads(arguments)
        except json.JSONDecodeError:
            return json.dumps({
                "success": False,
                "error": "Invalid tool arguments.",
            })

        handlers = {
            "search_notes": self._search_notes,
            "get_note_details": self._get_note_details,
        }

        handler = handlers.get(name)

        if handler is None:
            return json.dumps({
                "success": False,
                "error": f"Unknown tool: {name}",
            })

        try:
            result = await handler(**args)
            return json.dumps(result, default=str)

        except Exception as exc:
            return json.dumps({
                "success": False,
                "error": str(exc),
            })

    async def _search_notes(
        self,
        query: str,
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> dict[str, Any]:

        chunks = await self.retriever.retrieve(
            query=query,
            top_k=top_k,
            filters=filters,
        )

        seen_notes: set[str] = set()
        retrieved_sources: list[dict[str, Any]] = []
        for chunk in chunks:
            note_id_str = str(chunk.note_id)
            if note_id_str not in seen_notes:
                seen_notes.add(note_id_str)
                meta = chunk.metadata or {}
                title = meta.get("title") or meta.get("filename") or f"Note {note_id_str[:8]}"
                retrieved_sources.append({
                    "note_id": note_id_str,
                    "title": title,
                    "score": float(chunk.score),
                    "is_premium": True if meta.get("price") else False,
                    "coin_price": int(meta.get("price")) if meta.get("price") else 100,
                    "category": meta.get("category"),
                })
        self.latest_sources = retrieved_sources

        return {
            "success": True,
            "results": [
                {
                    "chunk_id": chunk.chunk_id,
                    "note_id": chunk.note_id,
                    "content": chunk.content,
                    "score": chunk.score,
                    "metadata": chunk.metadata,
                }
                for chunk in chunks
            ],
        }

    async def _get_note_details(
        self,
        note_id: str,
    ) -> dict[str, Any]:

        # TODO:
        # Connect this to your existing note_service.
        return {
            "success": False,
            "error": "Note details service not connected yet.",
            "note_id": note_id,
        }