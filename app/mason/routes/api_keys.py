from fastapi import APIRouter, Form
from pydantic import BaseModel
from typing import Literal, Annotated
from mason.controllers.database import Database
from mason.models import BaseResponseModel

controller = Database()

keys_admin_router = APIRouter(
    prefix="/api_keys",
)

class InsertKeyModel(BaseModel):
    provider: Literal["github", "codeberg"]
    key: str
    
@keys_admin_router.post("/insert", response_model=BaseResponseModel)
async def insert_key(payload: Annotated[InsertKeyModel, Form()]):
    return controller.set_api_key(provider=payload.provider, key=payload.key)

class PopKeyModel(BaseModel):
    key_id: int

@keys_admin_router.post("/pop", response_model=BaseResponseModel)
async def pop_key(payload: PopKeyModel):
    return controller.pop_api_key(payload.key_id)

@keys_admin_router.get("/get")
async def get_keys():
    return controller.get_api_keys()

@keys_admin_router.post("/make_primary", response_model=BaseResponseModel)
async def make_primary(payload: PopKeyModel):
    return controller.make_primary(payload.key_id)

@keys_admin_router.get("/available_providers")
async def available_providers():
    return ["github", "codeberg"]