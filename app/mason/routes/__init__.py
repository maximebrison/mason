"""
API Routes
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from mason.models import BaseResponseModel
from mason.controllers.database import Database
from mason.controllers.engine import Engine

from mason.routes.utils import utils_admin_router, utils_public_router
from mason.routes.logs import logs_admin_router
from mason.routes.config import config_admin_router, config_public_router
from mason.routes.colors import colors_admin_router
from mason.routes.index import index_admin_router, index_public_router
from mason.routes.assets import assets_admin_router, assets_public_router
from mason.routes.auth import auth_public_router, auth_admin_router
from mason.routes.api_keys import keys_admin_router
from mason.routes.blog import blog_admin_router, blog_public_router
from mason.routes.branding import branding_admin_router, branding_public_router

def get_engine(request: Request):
    engine: Engine = request.app.state.engine
    return engine

def admin_required(request: Request):
    db = Database()
    user = request.session.get('user')
    if not user in db.get_users():
        request.session.clear()
        raise HTTPException(status_code=403, detail=BaseResponseModel(success=False, msg="Your account has been removed").model_dump())
    if not user:
        raise HTTPException(status_code=401, detail=BaseResponseModel(success=False, msg="Not logged in").model_dump())
    
def check_key(request: Request):
    if not request.session.get("CONFIG_KEY") or request.session.get("CONFIG_KEY") != request.app.state.engine.config_key:
        raise HTTPException(status_code=401, detail=BaseResponseModel(success=False, msg="Wrong CONFIG_KEY").model_dump())

admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[
        Depends(admin_required)
    ]
)

admin_router.include_router(utils_admin_router)
admin_router.include_router(logs_admin_router)
admin_router.include_router(config_admin_router)
admin_router.include_router(colors_admin_router)
admin_router.include_router(index_admin_router)
admin_router.include_router(assets_admin_router)
admin_router.include_router(keys_admin_router)
admin_router.include_router(blog_admin_router)
admin_router.include_router(branding_admin_router)
admin_router.include_router(auth_admin_router)

public_router = APIRouter(
    prefix="/public",
    tags=["public"]
)

public_router.include_router(config_public_router)
public_router.include_router(index_public_router)
public_router.include_router(assets_public_router)
public_router.include_router(utils_public_router)
public_router.include_router(auth_public_router)
public_router.include_router(blog_public_router)
public_router.include_router(branding_public_router)

config_flow_router = APIRouter(
    prefix="/config_flow",
    tags=["config_flow"],
    dependencies=[
        Depends(check_key)
    ]
)

config_flow_router.include_router(keys_admin_router)
config_flow_router.include_router(auth_admin_router)

@config_flow_router.get("/first_run", response_model=BaseResponseModel)
async def first_run(engine: Engine = Depends(get_engine)):
    try:
        engine.run()
        return BaseResponseModel(
            success=True,
            msg="Successfully ran the application"
        )
    except Exception as e:
        return BaseResponseModel(
            success=False,
            msg=f"Something went wrong : {e}"
        )

def list_routers():
    """
    Return a list containing every main router in /routes
    """

    return [admin_router, public_router, config_flow_router]