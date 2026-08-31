from __future__ import annotations

import os
from openai import AsyncOpenAI

from app.core.config import settings


class LLMClient:
    """Central client for LLM interactions with auto-detection for Groq and OpenAI."""

    def __init__(self) -> None:
        api_key = settings.OPENAI_API_KEY
        # If the API key starts with 'gsk_', it's a Groq Cloud API key
        if api_key and api_key.startswith("gsk_"):
            self.client = AsyncOpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1",
            )
            self.default_model = "openai/gpt-oss-120b"
        else:

            self.client = AsyncOpenAI(
                api_key=api_key or "sk-dummy-key-for-offline",
            )
            self.default_model = "gpt-4o-mini"

    async def chat(
        self,
        messages: list[dict],
        *,
        tools: list[dict] | None = None,
        model: str | None = None,
    ):
        """Send a chat completion request."""
        target_model = model or self.default_model

        kwargs = {
            "model": target_model,
            "messages": messages,
        }
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"

        return await self.client.chat.completions.create(**kwargs)