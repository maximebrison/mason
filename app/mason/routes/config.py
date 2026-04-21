from fastapi import APIRouter, Request, Depends, Form
from typing import Annotated
from mason.controllers.engine import Engine
from mason.models import ConfigModel, BaseResponseModel

def get_engine(request: Request):
    engine: Engine = request.app.state.engine
    return engine

# ----- Public routes
config_public_router = APIRouter(
    prefix="/config"
)

@config_public_router.get("/get")
async def get_config(engine = Depends(get_engine)):
    """
    Returns config.json
    """
    return engine.utils.get_config()

# ----- Admin routes
config_admin_router = APIRouter(
    prefix="/config"
)

@config_admin_router.put("/update", response_model=BaseResponseModel)
async def set_config(payload: Annotated[ConfigModel, Form()], engine: Engine = Depends(get_engine)):
    return engine.utils.merge_config(payload.model_dump())