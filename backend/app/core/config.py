from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/notes_all"
    )

    OPENAI_API_KEY: str

    EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()