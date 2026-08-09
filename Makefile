.PHONY: up down logs backend frontend verify

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

verify:
	@echo "Checking services..."
	@curl -sf http://localhost:8000/health && echo " FastAPI: OK" || echo " FastAPI: FAILED (run 'make backend' first)"
	@docker exec fraudshield_redis redis-cli ping 2>/dev/null | grep -q PONG && echo " Redis:   OK" || echo " Redis:   FAILED"
	@docker exec fraudshield_postgres pg_isready -U fraudshield 2>/dev/null | grep -q accepting && echo " Postgres: OK" || echo " Postgres: FAILED"
	@echo " Redpanda console: http://localhost:8080"
