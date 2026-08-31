from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.crow import CrowChatRequest, CrowChatResponse
from app.services.crow_service import CrowService


router = APIRouter(
    prefix="/crow",
    tags=["Crow AI"],
)


async def get_crow_service(
    db: AsyncSession = Depends(get_db),
) -> CrowService:
    """
    Create the CrowService.

    The actual orchestrator/LLM dependency should be injected
    here once the agent wiring is finalized.
    """

    # TODO:
    # Replace with your actual orchestrator factory.
    async def orchestrator_factory(user_id: UUID):
        raise NotImplementedError(
            "Crow orchestrator factory is not configured yet."
        )

    return CrowService(
        db=db,
        orchestrator_factory=orchestrator_factory,
    )


@router.post(
    "/chat",
    response_model=CrowChatResponse,
    status_code=status.HTTP_200_OK,
)
async def chat_with_crow(
    request: CrowChatRequest,
    current_user: User = Depends(get_current_user),
    crow_service: CrowService = Depends(get_crow_service),
) -> CrowChatResponse:
    """
    Send a message to Crow AI.
    """

    try:
        return await crow_service.chat(
            user_id=current_user.id,
            message=request.message,
            conversation_id=request.conversation_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc