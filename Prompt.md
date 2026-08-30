# Task: Implement PostgreSQL Database Layer

You are working inside the existing backend project.

The folder structure has **already been created** and `uv` has already been initialized. A virtual environment already exists at:

```text
backend/.venv
```

## Objective

Implement the PostgreSQL database layer for the project using:

* PostgreSQL
* SQLAlchemy 2.x
* Alembic
* psycopg 3
* pgvector

**Do not recreate or modify the existing folder structure unless absolutely necessary.**

**Do not create a separate vector database.** PostgreSQL + pgvector will handle vector storage and similarity search.

---

# 1. Existing Structure

Use the existing files:

```text
backend/app/core/config.py
backend/app/core/database.py

backend/app/models/user.py
backend/app/models/file.py
backend/app/models/chunk.py
backend/app/models/payment.py
backend/app/models/gold_bar.py

backend/migrations/
```

You may create additional supporting files only when required by SQLAlchemy/Alembic.

---

# 2. Python Environment

The existing environment is:

```text
backend/.venv
```

Use **uv** to install dependencies into this environment.

Do NOT create another virtual environment.

Install the required packages using `uv`, including appropriate versions of:

```text
sqlalchemy
alembic
psycopg[binary]
pgvector
pydantic-settings
```

Add all runtime dependencies to `backend/requirements.txt` as well.

---

# 3. Environment Configuration

Implement database configuration in:

```text
backend/app/core/config.py
```

Read the PostgreSQL connection URL from environment variables.

Expected variable:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE
```

Do not hardcode credentials.

Update/create `.env.example` if necessary.

---

# 4. SQLAlchemy Database Setup

Implement:

```text
backend/app/core/database.py
```

Use SQLAlchemy 2.x style.

Provide:

* SQLAlchemy engine
* session factory
* declarative `Base`
* database session dependency/helper suitable for FastAPI

Use the PostgreSQL `psycopg` driver.

---

# 5. Database Models

Implement the following models exactly.

## User

File:

```text
backend/app/models/user.py
```

Table:

```text
users
```

Columns:

```text
id              UUID          PRIMARY KEY
email           VARCHAR       UNIQUE NOT NULL
password_hash   VARCHAR       NOT NULL
name            VARCHAR       NOT NULL
created_at      TIMESTAMP     NOT NULL
```

Do NOT add:

```text
is_active
updated_at
```

---

## File

File:

```text
backend/app/models/file.py
```

Table:

```text
files
```

Columns:

```text
id           UUID        PRIMARY KEY
user_id      UUID        FK → users.id
filename     VARCHAR     NOT NULL
storage_key  VARCHAR     NOT NULL
mime_type    VARCHAR     NOT NULL
size_bytes   BIGINT      NOT NULL
created_at   TIMESTAMP   NOT NULL
```

Do NOT add:

```text
status
updated_at
```

Create an index on:

```text
files.user_id
```

Relationship:

```text
User 1 ─── N Files
```

---

# 6. File Chunks + Vector Storage

File:

```text
backend/app/models/chunk.py
```

Table:

```text
file_chunks
```

Columns:

```text
id            UUID          PRIMARY KEY
file_id       UUID          FK → files.id
chunk_index   INTEGER       NOT NULL
content       TEXT          NOT NULL
embedding     VECTOR(N)
metadata      JSONB
created_at    TIMESTAMP     NOT NULL
```

Requirements:

* Enable the PostgreSQL `vector` extension.
* Use `pgvector`'s SQLAlchemy integration.
* `embedding` must use the pgvector `VECTOR` type.
* The vector dimension must match the selected embedding model.
* Do NOT arbitrarily choose a dimension.
* Make the embedding dimension easy to change/configure.
* Use cosine similarity for semantic search.
* Add the appropriate pgvector vector index once the embedding dimension/model is defined.

Relationship:

```text
File 1 ─── N FileChunks
```

The purpose of this table is both:

1. storing extracted document chunks
2. storing their embeddings for semantic search

There must be **no separate vector database**.

---

# 7. Gold Bars

File:

```text
backend/app/models/gold_bar.py
```

Table:

```text
gold_bars
```

Columns:

```text
id          UUID        PRIMARY KEY
user_id     UUID        FK → users.id UNIQUE
balance     INTEGER     NOT NULL DEFAULT 0
updated_at  TIMESTAMP   NOT NULL
```

Relationship:

```text
User 1 ─── 1 GoldBarBalance
```

A user must have at most one gold-bar balance record.

---

# 8. Payments

File:

```text
backend/app/models/payment.py
```

Table:

```text
payments
```

Columns:

```text
id                    UUID            PRIMARY KEY
user_id               UUID            FK → users.id
provider              VARCHAR         NOT NULL
provider_payment_id   VARCHAR         NOT NULL
amount                NUMERIC(12,2)   NOT NULL
currency              VARCHAR(3)      NOT NULL
gold_bars_used        INTEGER         NOT NULL DEFAULT 0
gold_bars_credited    INTEGER         NOT NULL DEFAULT 0
status                VARCHAR/ENUM    NOT NULL
created_at            TIMESTAMP       NOT NULL
updated_at            TIMESTAMP       NOT NULL
```

Allowed payment statuses:

```text
completed
failed
```

Do NOT include:

```text
pending
refunded
```

Create a unique constraint on:

```text
(provider, provider_payment_id)
```

This prevents duplicate payment transactions.

`gold_bars_used` represents gold bars consumed by the user to reduce the payment amount.

Example:

```text
Original price = ₹100
Gold bars used = 100
Final payment amount = ₹0
```

The database model only needs to record the transaction data. Do not implement payment business logic yet.

---

# 9. Relationships

Implement these SQLAlchemy relationships:

```text
User
 ├── files
 ├── gold_bar_balance
 └── payments

File
 └── chunks
```

Use appropriate foreign keys and relationship configuration.

---

# 10. Timestamps

Use UTC timestamps.

For automatically created records:

```text
created_at
```

should receive the current timestamp automatically.

For mutable records:

```text
gold_bars.updated_at
payments.updated_at
```

must be maintained appropriately by the model/database layer.

Do not add `updated_at` to users or files.

---

# 11. Alembic

Configure Alembic using:

```text
backend/migrations/
```

Create an initial migration that creates:

```text
users
files
file_chunks
gold_bars
payments
```

and:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

The migration must correctly create:

* tables
* primary keys
* foreign keys
* indexes
* unique constraints
* timestamps
* pgvector column
* required PostgreSQL types

The migration must be reproducible from an empty PostgreSQL database.

Make sure Alembic imports all SQLAlchemy models before autogeneration.

---

# 12. Important Implementation Rules

Follow these rules strictly:

1. Do not redesign the existing architecture.
2. Do not create unnecessary tables.
3. Do not create a separate vector database.
4. Do not add columns that were explicitly removed above.
5. Do not implement payment processing logic yet.
6. Do not implement authentication logic yet.
7. Do not implement file ingestion yet.
8. Do not implement embeddings yet.
9. Only implement the database foundation.
10. Keep the code production-quality and typed.
11. Follow SQLAlchemy 2.x conventions.
12. Use UUIDs rather than auto-increment integers for primary keys.
13. Use PostgreSQL-native types where appropriate.
14. Keep model definitions clean and modular.

---

# 13. Validation

After implementation:

1. Verify all required packages are installed into the existing `backend/.venv`.
2. Verify imports work.
3. Verify SQLAlchemy can initialize.
4. Verify Alembic can detect the models.
5. Generate the initial migration.
6. Run the migration against PostgreSQL if a configured database is available.
7. Verify all five tables exist.
8. Verify the `vector` extension exists.
9. Verify foreign keys and unique constraints.
10. Verify the pgvector column exists.

If PostgreSQL is not running/configured, do everything possible locally and clearly report the remaining database command that needs to be executed.

Do not stop after creating empty files. **Actually implement the complete code in the designated files.**

At the end, provide a concise summary of:

* files created/modified
* packages installed
* migration created
* database setup status
* any action still required from me
