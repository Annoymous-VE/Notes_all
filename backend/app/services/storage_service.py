# supabase_client.py

import os
from supabase import create_client
from dotenv import load_dotenv
# from supabase_client import supabase


load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

BUCKET_NAME = "Notes_all"

# Uplaoding the file 
def upload_file(user_id: str, file_name: str, file_content: bytes, content_type: str):
    storage_path = f"{user_id}/{file_name}"

    return (
        supabase.storage
        .from_(BUCKET_NAME)
        .upload(
            storage_path,
            file_content,
            {
                "content-type": content_type,
                "upsert": "true",
            },
        )
    )

# Downloading the file 
def download_file(user_id: str, file_name: str):
    storage_path = f"{user_id}/{file_name}"

    return (
        supabase.storage
        .from_(BUCKET_NAME)
        .download(storage_path)
    )

# Deleting the whole folder 
def delete_user_files(user_id: str):
    files = (
        supabase.storage
        .from_(BUCKET_NAME)
        .list(user_id)
    )

    if not files:
        return None

    paths = [
        f"{user_id}/{file['name']}"
        for file in files
        if file.get("name")
    ]

    if paths:
        return (
            supabase.storage
            .from_(BUCKET_NAME)
            .remove(paths)
        )

    return None