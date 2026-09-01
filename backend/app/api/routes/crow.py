from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.orchestrator import CrowOrchestrator
from app.agent.tools import CrowTools
from app.api.dependencies import get_current_user, get_db
from app.llm.client import LLMClient
from app.models.user import User
from app.rag.retriever import RAGRetriever
from app.schemas.crow import CrowChatRequest, CrowChatResponse
from app.search.hybrid import HybridSearch
from app.services.crow_service import CrowService


from app.ingestion.embedder import Embedder

router = APIRouter(
    prefix="/crow",
    tags=["Crow AI"],
)

_shared_embedder = Embedder()


async def get_crow_service(
    db: AsyncSession = Depends(get_db),
) -> CrowService:
    """
    Create the CrowService with complete orchestrator wiring.
    """

    async def orchestrator_factory(user_id: UUID):
        llm_client = LLMClient()
        hybrid_search = HybridSearch(db=db)
        tools = CrowTools(
            retriever=RAGRetriever(hybrid_search=hybrid_search, embedder=_shared_embedder),
            user_id=str(user_id),
        )
        return CrowOrchestrator(
            client=llm_client,
            tools=tools,
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