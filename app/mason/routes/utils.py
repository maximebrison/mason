from fastapi import APIRouter, Request, Depends
from mason.controllers.engine import Engine
from mason.controllers.log import log
from mason.controllers.database import Database
from mason.models import BaseResponseModel

utils_public_router = APIRouter(
    prefix="/utils"
)

@utils_public_router.get("/needs_setup")
async def needs_setup():
    db = Database()
    return db.needs_setup()

utils_admin_router = APIRouter(
    prefix="/utils"
)

def get_engine(request: Request):
    engine: Engine = request.app.state.engine
    return engine

@utils_admin_router.get("/update", response_model=BaseResponseModel)
async def update(engine: Engine = Depends(get_engine)):
    try:
        engine.update()
        return BaseResponseModel(
            success=True,
            msg="Update successful."
        )
    except Exception as e:
        log("Update", f'Something\'s wrong', exception=e)
        return BaseResponseModel(
            success=False,
            msg=f"Something went wrong : {e}"
        )

@utils_admin_router.get("/hard_update", response_model=BaseResponseModel)
async def hard_update(engine = Depends(get_engine)):
    try:
        engine.indexer.hard_reset()
        engine.run()
        return BaseResponseModel(
            success=True,
            msg="Hard update successful."
        )
    except Exception as e:
        log("hardUpdate", f'Something\'s wrong', exception=e)
        return BaseResponseModel(
            success=False,
            msg=f"Something went wrong : {e}"
        )

@utils_admin_router.get("/status")
async def status(engine: Engine = Depends(get_engine)):
    return engine.utils.services_status()