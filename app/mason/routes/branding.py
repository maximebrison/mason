from fastapi import APIRouter, Form
from typing import Annotated
from mason.controllers.branding import BrandingController, BrandingModel, SocialModel
from mason.models import BaseResponseModel

controller = BrandingController()

# ----- Public routes
branding_public_router = APIRouter(
    prefix="/branding"
)

@branding_public_router.get("/get", response_model=BrandingModel)
async def get_branding():
    return controller.get()

# ----- Admin routes
branding_admin_router = APIRouter(
    prefix="/branding"
)

@branding_admin_router.put("/add_social", response_model=BaseResponseModel)
async def add_social(payload: Annotated[SocialModel, Form()]):
    return controller.add_social(payload)

@branding_admin_router.delete("/remove_social", response_model=BaseResponseModel)
async def remove_social(payload: Annotated[SocialModel, Form()]):
    return controller.remove_social(payload)

@branding_admin_router.patch("/edit_copyright", response_model=BaseResponseModel)
async def edit_copyright(copyright: Annotated[str, Form()]):
    return controller.edit_copyright(copyright)

@branding_admin_router.patch("/edit_title", response_model=BaseResponseModel)
async def edit_title(title: Annotated[str, Form()]):
    return controller.edit_title(title)

@branding_admin_router.put("/update")
async def update_branding(payload: BrandingModel):
    return controller.update(payload)