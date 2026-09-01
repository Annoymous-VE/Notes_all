from uuid import UUID, uuid4
from fastapi import APIRouter, UploadFile, File as FastAPIFile, Form, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.file import File as DBFile
from app.models.user import User
from app.ingestion.extractor import DocumentExtractor
from app.ingestion.chunker import TextChunker
from app.ingestion.embedder import Embedder
from app.ingestion.indexer import ChunkIndexer
from app.services.storage_service import (
    upload_file,
    download_file,
    delete_user_files,
)

router = APIRouter(prefix="/files", tags=["Files"])

extractor = DocumentExtractor()
chunker = TextChunker(chunk_size=900, chunk_overlap=120)
embedder = Embedder()


# File Upload & Automatic Vector Indexing endpoint
@router.post("/upload")
async def upload_note(
    user_id: str,
    file: UploadFile = FastAPIFile(...),
    title: str = Form(None),
    category: str = Form(None),
    subject: str = Form(None),
    description: str = Form(None),
    tags: str = Form(None),
    price: float = Form(None),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    file_size = len(content)

    # 1. Resolve or create valid User UUID to respect Postgres foreign key
    target_user_id: UUID
    try:
        target_user_id = UUID(user_id)
        user_record = await db.get(User, target_user_id)
        if not user_record:
            # Check if user exists by email or create a fallback user
            user_record = User(
                id=target_user_id,
                email=f"seller_{str(target_user_id)[:8]}@notesall.com",
                name="Verified Seller",
                password_hash="system_generated",
            )
            db.add(user_record)
            await db.flush()
    except (ValueError, TypeError):
        # user_id is string or email, find user or pick a demo user
        res = await db.execute(select(User).limit(1))
        existing_user = res.scalars().first()
        if existing_user:
            target_user_id = existing_user.id
        else:
            target_user_id = uuid4()
            user_record = User(
                id=target_user_id,
                email=f"{user_id}@notesall.com" if "@" not in user_id else user_id,
                name="Verified Seller",
                password_hash="system_generated",
            )
            db.add(user_record)
            await db.flush()

    # 2. Upload file to Supabase storage
    storage_key = f"{target_user_id}/{file.filename}"
    upload_file(
        user_id=str(target_user_id),
        file_name=file.filename,
        file_content=content,
        content_type=file.content_type or "application/octet-stream",
    )

    # 3. Create or update File record in PostgreSQL
    db_file = DBFile(
        id=uuid4(),
        user_id=target_user_id,
        filename=file.filename,
        storage_key=storage_key,
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=file_size,
    )
    db.add(db_file)
    await db.flush()

    # 4. Extract document text using DocumentExtractor
    extracted_text = ""
    extracted_metadata = {}
    try:
        doc = await extractor.extract(
            file_bytes=content,
            filename=file.filename,
            mime_type=file.content_type or "application/octet-stream",
        )
        extracted_text = doc.text.strip()
        extracted_metadata = doc.metadata
    except Exception as e:
        print(f"Extraction notice for {file.filename}: {e}")

    # Build rich note summary chunk including metadata
    doc_title = title or file.filename.rsplit(".", 1)[0]
    meta_summary = f"Title: {doc_title}\n"
    if subject:
        meta_summary += f"Subject: {subject}\n"
    if category:
        meta_summary += f"Category: {category}\n"
    if tags:
        meta_summary += f"Tags: {tags}\n"
    if description:
        meta_summary += f"Description: {description}\n"

    # 5. Chunk the content with overlap
    chunks_to_index: list[str] = []
    if extracted_text:
        text_chunks = chunker.chunk(extracted_text)
        # Prepend the contextual metadata to the first chunk
        if text_chunks:
            text_chunks[0] = f"{meta_summary}\n{text_chunks[0]}"
        chunks_to_index.extend(text_chunks)
    else:
        # If no extractable text, index the meta summary so it can still be searched and recommended
        chunks_to_index.append(meta_summary)

    # 6. Generate embeddings and index chunks into PostgreSQL vector DB
    indexer = ChunkIndexer(db=db, embedder=embedder)
    chunk_metadata_list = [
        {
            "title": doc_title,
            "filename": file.filename,
            "category": category or "General",
            "subject": subject or category or "General",
            "tags": tags or "",
            "price": price or 0.0,
            **extracted_metadata,
        }
        for _ in chunks_to_index
    ]

    indexed = await indexer.index_chunks(
        file_id=db_file.id,
        chunks=chunks_to_index,
        metadata=chunk_metadata_list,
    )

    await db.commit()

    return {
        "success": True,
        "file_id": str(db_file.id),
        "file_name": file.filename,
        "storage_path": storage_key,
        "chunks_indexed": len(indexed),
        "title": doc_title,
    }


# File Download endponts 
@router.get("/download")
async def download_note(
    user_id: str,
    file_name: str,
):
    # Temporary testing flag
    payment = True

    if not payment:
        raise HTTPException(
            status_code=403,
            detail="Payment required",
        )

    file_content = download_file(
        user_id=user_id,
        file_name=file_name,
    )

    return Response(
        content=file_content,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{file_name}"'
        },
    )

# Delete User Storage endpont 
@router.delete("/user/{user_id}")
async def delete_user_storage(user_id: str):
    delete_user_files(user_id)

    return {
        "success": True,
        "message": "All user files deleted",
    }