# OmniParse AI - Document Intelligence & RAG Platform

OmniParse is a distributed, intelligent document parsing and Retrieval-Augmented Generation (RAG) platform. It extracts text, tables, and paragraphs from PDF documents along with their exact spatial coordinates, generates 384-dimensional vector embeddings, and enables users to query their documents using the Gemini 2.5 Flash LLM with precise context citations.

## 🏗 System Architecture

The project is engineered as a containerized microservices architecture orchestrated via Docker Compose, ensuring high availability, fault tolerance, and process isolation.

### Core Microservices
- **API Gateway (FastAPI):** Handles HTTP connections, validates 50MB payloads, streams files to volumes, and dispatches asynchronous tasks.
- **Message Broker (Redis):** Acts as a low-latency, in-memory queue to pass extraction payloads from the API to background workers.
- **Background Workers (Celery):** Executes the heavy-lifting ML pipeline (spatial chunking via `pdfplumber`, PyTorch vectorization via `sentence-transformers`) with a strict **3-retry fault-tolerance protocol**.
- **Database (MongoDB):** NoSQL document store persisting task states, parsed spatial chunks, and embeddings for in-memory k-NN vector search.

### 📊 Observability & Monitoring (The LGTM Stack)
To ensure production readiness and rapid issue resolution, the system is instrumented with an end-to-end observability stack:
- **Prometheus:** Scrapes backend metrics (latency, throughput, error rates) via FastAPI instrumentation endpoints (`/metrics`).
- **Loki & Promtail:** Promtail interfaces directly with the Docker daemon to aggregate and stream raw container logs from all microservices into the centralized Loki database.
- **Grafana:** Zero-touch provisioned dashboards (exposed on port `3000`) for unified visualization of system telemetry and log aggregation.

### Frontend
- **Framework:** React + Vite
- **Styling & Animation:** Tailwind CSS, Framer Motion, GSAP, Lenis

## ✨ Features

- **Asynchronous Document Ingestion:** Non-blocking 50MB PDF uploads with real-time client status polling.
- **Spatial Data Extraction:** Accurately extracts text and tables along with their absolute bounding box coordinates (`[x0, y0, x1, y1]`).
- **Semantic RAG Engine:** Executes in-memory PyTorch cosine similarity vector searches.
- **LLM Integration:** Context-aware Q&A using Google Gemini 2.5 Flash LLM.

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local frontend development)
- Python 3.11+ (for local backend development)

### Running the Entire Stack Locally

You can spin up the entire distributed system (FastAPI, Redis, MongoDB, Celery, Prometheus, Loki, Promtail, Grafana) with a single command:

```bash
docker-compose up --build -d
```

**Services Exposed:**
- **FastAPI Backend:** `http://localhost:8000`
- **Grafana Dashboard:** `http://localhost:3000` (Default login: `admin` / `admin`)
- **React Frontend:** `http://localhost:5173` (If running locally via `npm run dev`)

### Development Setup

**Backend (Local Python Env):**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your GEMINI_API_KEY
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
