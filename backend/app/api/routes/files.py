from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response

from app.services.storage_service import (
    upload_file,
    download_file,
    delete_user_files,
)

router = APIRouter(prefix="/files", tags=["Files"])

# File Upload endponts 
@router.post("/upload")
async def upload_note(
    user_id: str,
    file: UploadFile = File(...),
):
    content = await file.read()

    upload_file(
        user_id=user_id,
        file_name=file.filename,
        file_content=content,
        content_type=file.content_type or "application/octet-stream",
    )

    return {
        "success": True,
        "file_name": file.filename,
        "storage_path": f"{user_id}/{file.filename}",
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