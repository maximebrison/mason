from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from mason.routes import list_routers
from mason.controllers.engine import Engine
import os, secrets

host = os.getenv("HOST", "0.0.0.0")
port = int(os.getenv("PORT", "8005"))
debug = os.getenv("DEBUG", "false").lower() == "true"
secret_key = os.getenv("SECRET_KEY", "ABCabc123456")

engine = Engine()

@asynccontextmanager
async def lifespan(app: FastAPI):
	print(debug)
	scheduler = AsyncIOScheduler()
	scheduler.add_job(engine.update, "interval", hours=12)
	scheduler.start()
	engine.run()
	yield

app = FastAPI(
	redirect_slashes=False, 
	lifespan=lifespan,
	version="0.5.0",
	docs_url="/docs" if debug else None,
	redoc_url="/redoc" if debug else None
)

app.state.engine = engine

app.add_middleware(
	SessionMiddleware,
	secret_key=secret_key,
	session_cookie="login"
)

for r in list_routers():
	app.include_router(r, prefix="/api")

app.mount("/assets", StaticFiles(directory="/app/site/assets", html=False), name="assets")
app.mount("/temp", StaticFiles(directory="/app/temp", html=False), name="assets")
app.mount("/uploads", StaticFiles(directory="/app/uploads", html=False), name="assets")

@app.get("/status")
def root():
	return {"Status":"Up"}

@app.get("/repos/{repo}/{path:path}")
async def serve_repo_file(repo: str, path: str = "index.html"):
	repo_path = engine.indexer.REPOS_FOLDER.joinpath(repo)

	if not os.path.isdir(repo_path):
		raise HTTPException(404)
	
	file_path = os.path.join(repo_path, path)

	if not os.path.exists(file_path):
		raise HTTPException(404)
	
	return FileResponse(file_path)

@app.get("/")
def site():
	return FileResponse("/app/site/index.html")

@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
	return RedirectResponse("/")

if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host=host, port=port)