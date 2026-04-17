from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import runs, lifts, nutrition, sleep, weight

# Create the FastAPI app — this is the core object everything attaches to
app = FastAPI(title="Zone 5 API")

# CORS middleware — controls which frontends are allowed to talk to this API
# Without this, the browser blocks requests from localhost:5173 (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server — update this when deployed
    allow_methods=["*"],    # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],    # allow any headers
)

# Register routers — each router handles all routes for one resource
# Adding a router here is what makes its endpoints reachable
app.include_router(runs.router)
app.include_router(lifts.router)
app.include_router(nutrition.router)
app.include_router(sleep.router)
app.include_router(weight.router)
