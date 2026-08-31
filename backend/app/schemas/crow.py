from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CrowChatRequest(BaseModel):
    """Request sent when a user sends a message to Crow."""

    conversation_id: UUID | None = None

    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="User's message to Crow.",
    )


class CrowSource(BaseModel):
    """A note/source referenced by Crow."""

    note_id: UUID | str
    title: str
    score: float = 0.0
    is_premium: bool = False
    coin_price: int | None = None
    category: str | None = None
    preview_url: str | None = None


class CrowChatResponse(BaseModel):
    """Response returned by the Crow chat endpoint."""

    conversation_id: UUID
    message: str

    sources: list[CrowSource] = Field(
        default_factory=list
    )

    created_at: datetime