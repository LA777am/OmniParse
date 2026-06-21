# OmniParse

OmniParse is an intelligent document parsing and querying application. It extracts text, tables, and paragraphs from PDF documents along with their spatial coordinates, generates vector embeddings, and enables users to query their documents using an LLM to receive accurate answers with citations.

## Architecture

The project consists of a backend API and a modern web frontend.

### Backend
- **Framework:** FastAPI
- **Database:** MongoDB
- **Async Tasks & Queue:** Celery with Redis
- **Document Parsing:** pdfplumber (extracts tables and paragraphs using vertical proximity clustering and bounding boxes)
- **Embeddings:** sentence-transformers (`all-MiniLM-L6-v2`)

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion

## Features

- **Document Upload:** Upload PDF files for processing.
- **Data Extraction:** Accurately extracts text, tables, and bounding box coordinates for each component.
- **Vector Search (In Progress):** Uses exact k-NN vector search for relevant document retrieval.
- **LLM Integration (In Progress):** Query documents using Google Gemini LLM and get answers with citations referencing the specific parts of the PDF.

## Getting Started

### Prerequisites
- Docker and docker-compose
- Node.js (for frontend development)
- Python 3.9+ (for backend development)

### Running Locally with Docker

You can run the entire backend stack (FastAPI, Redis, MongoDB, Celery) using docker-compose:

```bash
docker-compose up --build
```

### Development

**Backend Setup:**
1. Navigate to the `backend` directory.
2. Install dependencies (e.g., using a virtual environment and `requirements.txt` or `pipenv` / `poetry` if configured).
3. Copy `.env.example` to `.env` and fill in the required environment variables.
4. Run the development server.

**Frontend Setup:**
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

## Next Steps / Roadmap
- Complete the asynchronous Celery pipeline to process documents seamlessly in the background.
- Integrate vector search and the LLM endpoint for the query chat interface.
- Finalize the React shell to integrate API calls and display bounding box overlays on top of the PDF.
