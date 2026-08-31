from __future__ import annotations

from openai import AsyncOpenAI

from app.core.config import settings


class LLMClient:
    """Central client for LLM interactions."""

    def __init__(self) -> None:
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
        )

    async def chat(
        self,
        messages: list[dict],
        *,
        tools: list[dict] | None = None,
        model: str = "gpt-4.1-mini",
    ):
        """Send a chat completion request."""

        return await self.client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
            tool_choice="auto" if tools else None,
        )