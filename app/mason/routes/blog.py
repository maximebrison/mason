from fastapi import APIRouter, Form, Depends, UploadFile, Request
from pydantic import BaseModel
from typing import Annotated, Literal
from mason.controllers.blog import Blog
from mason.controllers.engine import Engine
from mason.models import FilterBlogIndexModel, BaseResponseModel
import PIL

controller = Blog()

blog_public_router = APIRouter(
    prefix="/blog"
)

@blog_public_router.get("/get")
async def get_post(post_id: str):
    return controller.get(post_id, "html")

@blog_public_router.get("/get_index")
async def get_post(request: Request, payload: FilterBlogIndexModel = Depends()):
    engine: Engine = request.app.state.engine
    return controller.index.filter_by(payload, engine.indexer.shown())

blog_admin_router = APIRouter(
    prefix="/blog"
)

class PostBlogModel(BaseModel):
    title: str | None = None
    linked_page: str | None = None
    content: str

@blog_admin_router.post("/post")
async def add_post(payload: Annotated[PostBlogModel, Form()]):
    return controller.post(**payload.model_dump())

@blog_admin_router.delete("/delete")
async def delete_post(post_id: Annotated[str, Form()]):
    return controller.delete(post_id)

class UpdatePostModel(BaseModel):
    post_id: str
    title: str
    linked_page: str
    content: str

@blog_admin_router.put("/update")
async def update_post(payload: Annotated[UpdatePostModel, Form()]):
    return controller.update(**payload.model_dump())

@blog_admin_router.get("/get_markdown")
async def get_markdown(post_id: str):
    return controller.get(post_id, "md")

@blog_admin_router.post("/upload_image")
async def upload_image(image: UploadFile):
    unpacked_filename = image.filename.split(".")
    ext = unpacked_filename[len(unpacked_filename) - 1]

    try:
        PIL.Image.open(image.file)
        image.file.seek(0)
        return controller.upload_image(image.file.read(), ext)
    except PIL.UnidentifiedImageError as e:
        if ext.lower() == "svg":
            image.file.seek(0)
            return controller.upload_image(image.file.read(), ext)
        return BaseResponseModel(
            success=False,
            msg=f"Not a valid image"
        )
    except Exception as e:
        return BaseResponseModel(
            success=False,
            msg=f"Something wrong occured: {e}"
        )