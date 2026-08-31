from __future__ import annotations

from openai import AsyncOpenAI

from app.core.config import settings


class Embedder:
    """Generate vector embeddings using OpenAI."""

    def __init__(
        self,
        client: AsyncOpenAI | None = None,
    ) -> None:
        self.client = client or AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
        )

        self.model = settings.EMBEDDING_MODEL

    async def embed_text(self, text: str) -> list[float]:
        """Generate an embedding for a single text."""

        if not text.strip():
            raise ValueError("Cannot embed empty text.")

        response = await self.client.embeddings.create(
            model=self.model,
            input=text,
        )

        return response.data[0].embedding

    async def embed_texts(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        """Generate embeddings for multiple texts."""

        if not texts:
            return []

        cleaned_texts = [
            text.strip()
            for text in texts
            if text.strip()
        ]

        if not cleaned_texts:
            return []

        response = await self.client.embeddings.create(
            model=self.model,
            input=cleaned_texts,
        )

        return [
            item.embedding
            for item in sorted(
                response.data,
                key=lambda item: item.index,
            )
        ]

    async def embed_query(self, query: str) -> list[float]:
        """Generate an embedding specifically for a search query."""

        return await self.embed_text(query)