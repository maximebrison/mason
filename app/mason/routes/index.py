from fastapi import APIRouter, Request, Depends, Form
from typing import Annotated
import json
from mason.controllers.engine import Engine
from mason.models import UpdatePageModel, BaseResponseModel, FilterPageIndexModel

def get_engine(request: Request):
    engine: Engine = request.app.state.engine
    return engine

# ----- Public routes
index_public_router = APIRouter(
    prefix="/index"
)

@index_public_router.get("/get")
async def get(payload: FilterPageIndexModel = Depends(), engine: Engine = Depends(get_engine)):
    return engine.indexer.filter_index(payload)
    
@index_public_router.get("/get_navbar")
async def get_navbar():
    with open("/app/repos/navbar.json") as f:
        return json.loads(f.read())

# ----- Admin routes
index_admin_router = APIRouter(
    prefix="/index"
)

@index_admin_router.put("/update", response_model=BaseResponseModel)
async def update(payload: Annotated[UpdatePageModel, Form()], engine: Engine = Depends(get_engine)):
    return engine.indexer.update_index(payload)