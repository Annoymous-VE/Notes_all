(AI_ChatBot named Crow_Ai)-------------(Arj)
----------------------------------->

(Folder Structure)

backend/
└── app/
    ├── agent/                         # NEW
    │   ├── orchestrator.py            # Crow's main decision-making loop
    │   ├── intent.py                  # Understand user intent
    │   ├── query_rewriter.py          # Rewrite/expand search queries
    │   ├── conversation.py            # Conversation/context handling
    │   └── tools.py                   # Tools Crow can call
    │
    ├── rag/                           # NEW
    │   ├── retriever.py               # Retrieve relevant chunks/notes
    │   ├── context_builder.py         # Build LLM context
    │   └── citation.py                # Source/note references
    │
    ├── search/                        # EXISTING — extend this
    │   ├── hybrid.py                  # Keyword + vector
    │   └── reranker.py                # Result reranking
    │
    ├── ingestion/                     # EXISTING — extend this
    │   ├── extractor.py
    │   ├── chunker.py
    │   ├── embedder.py
    │   └── indexer.py
    │
    ├── llm/                           # EXISTING — extend this
    │   ├── client.py
    │   └── prompts.py
    │
    ├── services/                      # EXISTING — extend this
    │   ├── crow_service.py             # Crow business logic
    │   └── gold_bar_service.py         # Existing coin logic
    │
    ├── api/routes/                    # EXISTING — add
    │   └── crow.py                    # Chat API endpoints
    │
    ├── schemas/                       # EXISTING — add/extend
    │   └── crow.py                    # Chat request/response schemas
    │
    └── models/                        # EXISTING — add
        └── conversation.py            # Chat/conversation persistence


        
[AI architecture]

Crow API
   ↓
Crow Service
   ↓
Agent / Orchestrator
   ↓
 ┌───────────────┬────────────────┐
 │               │                │
Search          RAG             User/Coins
 │               │                │
 ↓               ↓                ↓
Hybrid        Retriever       Gold Service
Search        + Context       Permissions
 ↓               ↓
Reranker       LLM
       \         /
        → Crow Response