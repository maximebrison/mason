from fastapi import APIRouter, Request, Depends
from mason.controllers.engine import Engine
from mason.models import BaseResponseModel

# ----- Admin routes
logs_admin_router = APIRouter(
    prefix="/logs"
)

def get_engine(request: Request):
    engine: Engine = request.app.state.engine
    return engine

@logs_admin_router.get("/get")
async def get_logs(engine: Engine = Depends(get_engine)):
    return engine.utils.get_logs()

@logs_admin_router.get("/clear", response_model=BaseResponseModel)
async def clear_logs(engine: Engine = Depends(get_engine)):
    return engine.utils.clear_logs()