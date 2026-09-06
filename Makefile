.PHONY: up down logs rebuild frontend backend help

help:
	@echo "OmniParse Developer Commands:"
	@echo "--------------------------------------------------------"
	@echo "make up        - Start all Docker containers in background"
	@echo "make down      - Stop and remove all Docker containers"
	@echo "make logs      - View logs for all containers (follow)"
	@echo "make rebuild   - Force rebuild all Docker images and start"
	@echo "make clean     - Stop containers and remove volumes (WARNING: destroys DB data)"
	@echo "--------------------------------------------------------"
	@echo "make frontend  - Start the Vite React development server locally"
	@echo "make backend   - Start the FastAPI backend locally (outside Docker)"
	@echo "--------------------------------------------------------"

# Docker commands
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

rebuild:
	docker compose up -d --build

clean:
	docker compose down -v

# Local Development Commands (if not using Docker)
frontend:
	cd frontend && npm run dev

backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
