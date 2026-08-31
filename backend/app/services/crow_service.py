from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.orchestrator import CrowOrchestrator
from app.agent.tools import CrowTools
from app.models.conversation import Conversation, ConversationMessage
from app.schemas.crow import CrowChatResponse, CrowSource


class CrowService:
    """
    Business logic for Crow AI conversations.

    Responsibilities:
    - Create/retrieve conversations
    - Store user messages
    - Run the Crow agent
    - Store Crow responses
    - Return the final response

    Database operations and business rules live here,
    not inside the LLM agent.
    """

    def __init__(
        self,
        db: AsyncSession,
        orchestrator_factory,
    ) -> None:
        self.db = db
        self.orchestrator_factory = orchestrator_factory

    async def chat(
        self,
        user_id: UUID,
        message: str,
        conversation_id: UUID | None = None,
    ) -> CrowChatResponse:

        conversation = await self._get_or_create_conversation(
            user_id=user_id,
            conversation_id=conversation_id,
        )

        await self._save_message(
            conversation_id=conversation.id,
            role="user",
            content=message,
        )

        history = await self._get_history(conversation.id)

        orchestrator = await self.orchestrator_factory(
            user_id=user_id,
        )

        response_text = await orchestrator.run(history)

        await self._save_message(
            conversation_id=conversation.id,
            role="assistant",
            content=response_text,
        )

        conversation.updated_at = datetime.now(timezone.utc)

        await self.db.commit()

        return CrowChatResponse(
            conversation_id=conversation.id,
            message=response_text,
            sources=[],
            requires_confirmation=False,
            confirmation_type=None,
            created_at=datetime.now(timezone.utc),
        )

    async def _get_or_create_conversation(
        self,
        user_id: UUID,
        conversation_id: UUID | None,
    ) -> Conversation:

        if conversation_id:
            result = await self.db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.user_id == user_id,
                )
            )

            conversation = result.scalar_one_or_none()

            if conversation is None:
                raise ValueError(
                    "Conversation not found."
                )

            return conversation

        conversation = Conversation(
            user_id=user_id,
            title=None,
        )

        self.db.add(conversation)

        await self.db.flush()

        return conversation

    async def _save_message(
        self,
        conversation_id: UUID,
        role: str,
        content: str,
    ) -> ConversationMessage:

        message = ConversationMessage(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )

        self.db.add(message)

        await self.db.flush()

        return message

    async def _get_history(
        self,
        conversation_id: UUID,
    ) -> list[dict[str, str]]:

        result = await self.db.execute(
            select(ConversationMessage)
            .where(
                ConversationMessage.conversation_id
                == conversation_id
            )
            .order_by(
                ConversationMessage.created_at.asc()
            )
        )

        messages = result.scalars().all()

        return [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in messages
        ]