import asyncio
from typing import Optional
from fastembed import TextEmbedding
from app.core.config import settings

# Global singleton so model weights are loaded once in memory
_global_fastembed_model: Optional[TextEmbedding] = None


def get_fastembed_model() -> TextEmbedding:
    global _global_fastembed_model
    if _global_fastembed_model is None:
        _global_fastembed_model = TextEmbedding(model_name=settings.EMBEDDING_MODEL)
    return _global_fastembed_model


class Embedder:
    """
    Generate vector embeddings using FastEmbed (BGE-small-en-v1.5, 384 dimensions).
    High performance, local ONNX execution, zero API token billing.
    """

    def __init__(self, model_name: str | None = None) -> None:
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self._model = get_fastembed_model()

    async def embed_text(self, text: str) -> list[float]:
        """Generate an embedding for a single text."""
        if not text or not text.strip():
            raise ValueError("Cannot embed empty text.")

        results = await self.embed_texts([text])
        return results[0]

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if not texts:
            return []

        cleaned_texts = [text.strip() for text in texts if text and text.strip()]
        if not cleaned_texts:
            return []

        # Run CPU/ONNX embedding generation in a worker thread to keep the event loop non-blocking
        def _embed():
            return [vec.tolist() for vec in self._model.embed(cleaned_texts)]

        return await asyncio.to_thread(_embed)

    async def embed_query(self, query: str) -> list[float]:
        """Generate an embedding specifically for a search query."""
        return await self.embed_text(query)