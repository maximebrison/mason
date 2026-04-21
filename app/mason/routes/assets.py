from fastapi import APIRouter, File, Form, UploadFile
from mason.controllers.assets_manager import AssetsManager
from mason.models import BaseResponseModel, BannerLogoModel
from typing import Annotated

controller = AssetsManager()

# ----- Public routes
assets_public_router = APIRouter(
    prefix="/assets"
)

@assets_public_router.get("/get_paths")
async def get_assets_paths():
    return controller.get_paths()

# ----- Admin routes
assets_admin_router = APIRouter(
    prefix="/assets"
)

@assets_admin_router.put("/upload/banner_logo", response_model=BaseResponseModel)
async def uploadBannerLogo(file: UploadFile, border_radius: Annotated[str, Form()], show: Annotated[bool, Form()] = False):
    try:

        controller.banner_logo.show = show
        controller.banner_logo.border_radius = border_radius
        if file.filename:
            unpacked_filename = file.filename.split(".")
            ext = unpacked_filename[len(unpacked_filename) - 1]
            return controller.save_file(file.file.read(), f"banner_logo.{ext}")
        else:
            controller.save_paths()
            return BaseResponseModel(success=True, msg="Successfully updated banner_logo")
    except Exception as e:
        return BaseResponseModel(success=False, msg=f"Something wrong happened : {e}")

@assets_admin_router.put("/upload/banner_bg", response_model=BaseResponseModel)
async def uploadBannerBg(file: UploadFile, background_size: Annotated[str, Form()], background_position: Annotated[str, Form()],  background_type: Annotated[str, Form()] = "image", background_repeat: Annotated[bool, Form()] = False, show: Annotated[bool, Form()] = False):
    try:

        controller.banner_bg.background_type = background_type
        controller.banner_bg.background_position = background_position
        controller.banner_bg.background_size = background_size
        controller.banner_bg.background_repeat = background_repeat
        controller.banner_bg.show = show
        if file.filename:
            unpacked_filename = file.filename.split(".")
            ext = unpacked_filename[len(unpacked_filename) - 1]
            return controller.save_file(file.file.read(), f"banner_bg.{ext}")
        else:
            controller.save_paths()
            return BaseResponseModel(success=True, msg="Successfully updated banner_bg")
    except Exception as e:
        return BaseResponseModel(success=False, msg=f"Something wrong happened : {e}")

@assets_admin_router.put("/upload/footer_bg", response_model=BaseResponseModel)
async def uploadFooterBg(file: UploadFile,  background_size: Annotated[str, Form()], background_position: Annotated[str, Form()], background_repeat: Annotated[bool, Form()] = False, show: Annotated[bool, Form()] = False):
    try:

        controller.footer_bg.background_position = background_position
        controller.footer_bg.background_size = background_size
        controller.footer_bg.background_repeat = background_repeat
        controller.footer_bg.show = show
        if file.filename:
            unpacked_filename = file.filename.split(".")
            ext = unpacked_filename[len(unpacked_filename) - 1]
            return controller.save_file(file.file.read(), f"footer_bg.{ext}")
        else:
            controller.save_paths()
            return BaseResponseModel(success=True, msg="Successfully updated footer_bg")
    except Exception as e:
        return BaseResponseModel(success=False, msg=f"Something wrong happened : {e}")
    
@assets_admin_router.put("/upload/site_icon", response_model=BaseResponseModel)
async def uploadSiteIcon(file: UploadFile):
    try:

        unpacked_filename = file.filename.split(".")
        ext = unpacked_filename[len(unpacked_filename) - 1]
        return controller.save_file(file.file.read(), f"site_icon.{ext}")
    except Exception as e:
        return BaseResponseModel(success=False, msg=f"Something wrong happened : {e}")