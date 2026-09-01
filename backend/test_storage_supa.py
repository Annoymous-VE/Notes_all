import asyncio
from app.services.storage_service import upload_file, download_file, delete_user_files

def test_storage():
    user_id = "test_user_123"
    filename = "hello.txt"
    content = b"Hello from NotesAll backend test!"
    print("Testing upload...")
    try:
        res = upload_file(user_id, filename, content, "text/plain")
        print("Upload result:", res)
        print("Testing download...")
        data = download_file(user_id, filename)
        print("Downloaded content:", data[:30])
        print("Cleaning up...")
        delete_user_files(user_id)
        print("Storage test PASSED!")
    except Exception as e:
        print("Storage test FAILED:", type(e), e)

if __name__ == '__main__':
    test_storage()
