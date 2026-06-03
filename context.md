# OmniParse Context

This document outlines the current state of the Lean OmniParse project as of the latest development phase. It summarizes what has been built, following the initial `implementation_plan.md`.

## Current State of Development

The project is actively being developed. We have successfully laid the foundation and implemented the core synchronous parsing logic, as well as the basic frontend shell.

### Backend (FastAPI + MongoDB + Redis + Celery)
*   **Infrastructure (Sprint 1):** `docker-compose.yml` is configured to run the FastAPI app, Celery worker, Redis, and MongoDB locally. Health checks and CORS middleware are configured.
*   **Parsing Pipeline (Sprint 2):** Fully implemented in `app/services/parser.py`. It uses `pdfplumber` to:
    *   Extract tables and their cell bounding boxes.
    *   Extract paragraphs by clustering words based on vertical proximity.
    *   Map extracted data to spatial coordinates (`x0`, `y0`, `x1`, `y1`).
*   **Upload Endpoint:** `POST /api/v1/documents/upload` accepts a PDF, saves it, processes it synchronously (for now), generates embeddings, and saves the chunks into MongoDB.
*   **Embeddings (Sprint 4 start):** Local embedding generation using `sentence-transformers/all-MiniLM-L6-v2` is implemented in `app/services/embeddings.py`.
*   **Async Queue (Sprint 3):** The Celery worker is scaffolded (`app/worker/celery_app.py`, `app/worker/tasks.py`), but the `process_document` task is currently a stub waiting to be fully asynchronous.
*   **Query Endpoint:** The `POST /api/v1/documents/{document_id}/query` endpoint is currently a stub. Vector search and LLM integration are pending.

### Frontend (React + Vite + Tailwind CSS + Framer Motion)
*   **Application Shell (Sprint 1 / Sprint 5 prep):** The main interface (`App.tsx`) is built with a cohesive dark-mode design system (`index.css` and `tailwind.config.js`).
*   **State Machine Mockup:** The UI transitions between three mock states with Framer Motion animations:
    1.  **Upload State:** A drag-and-drop placeholder zone.
    2.  **Processing State:** An animated loading indicator.
    3.  **Query State:** A dual-pane layout containing placeholders for the Chat interface and the PDF Viewer.
*   **Pending Integrations:** The components (`<UploadZone />`, `<StatusIndicator />`, `<ChatPane />`, `<PDFViewer />`) are yet to be split into separate files and connected to the real backend APIs.

## Next Steps
Following the implementation plan, the immediate next goals are:
1.  **Sprint 3:** Move the synchronous parsing logic from `routers/documents.py` into the Celery background task (`worker/tasks.py`) so the upload endpoint returns an HTTP 202 instantly.
2.  **Sprint 4:** Implement exact k-NN vector search in MongoDB and integrate the Gemini LLM for answering queries with citations.
3.  **Sprint 5/6:** Flesh out the frontend React components to make real API calls and integrate `react-pdf` with bounding box overlays.
