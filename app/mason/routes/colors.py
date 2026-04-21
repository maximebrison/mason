from fastapi import APIRouter, Form
from typing import Annotated
from mason.controllers.color_scheme_generator import ColorSchemeCreator
from mason.models import ResponseColorsModel, BaseResponseModel, ColorsModel
from mason.controllers.log import log

controller = ColorSchemeCreator()

# ----- Public routes
colors_public_router = APIRouter(
    prefix="/colors"
)

# ----- Admin routes
colors_admin_router = APIRouter(
    prefix="/colors"
)

@colors_admin_router.post("/set_dark", response_model=BaseResponseModel)
async def dark(colors: Annotated[ColorsModel, Form()]):
    try:
        controller.make_file(dark_in=colors)
        log("Colors", "Colors updated")
        return BaseResponseModel(
            success=True,
            msg="Successfully updated dark theme colors")
    except Exception as e:
        log("Colors", "Something went wront", e)
        return BaseResponseModel(
            success=False,
            msg=f"Something went wrong : {e}"
        )

@colors_admin_router.post("/set_light", response_model=BaseResponseModel)
async def light(colors: Annotated[ColorsModel, Form()]):
    try:
        controller.make_file(light_in=colors)
        log("Colors", "Colors updated")
        return BaseResponseModel(
            success=True,
            msg="Successfully updated light theme colors")
    except Exception as e:
        log("Colors", "Something went wront", e)
        return BaseResponseModel(
            success=False,
            msg=f"Something went wrong : {e}"
        )

@colors_admin_router.get("/get")
async def colors():
    return controller.get_colors()