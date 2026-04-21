.PHONY: backend frontend dev stop health

backend:
	cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8001

frontend:
	cd frontend && npm run dev

dev:
	make -j2 backend frontend

stop:
	@lsof -ti:8001 | xargs kill -9 2>/dev/null || true
	@lsof -ti:5174 | xargs kill -9 2>/dev/null || true
	@echo "zone5 stopped."

health:
	@curl -s http://localhost:8001/health | python3 -m json.tool
