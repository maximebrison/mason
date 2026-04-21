from datetime import datetime
from fastapi import UploadFile
from mason.models import BlogPostModel, BaseResponseModel, FilterBlogIndexModel
from mason.controllers.utils import Utils
from mason.controllers.log import log
import shutil, os, json, secrets
from pathlib import Path
from uuid import uuid4
from marko import Markdown
from marko.ext.gfm import make_extension as gfm
from marko.ext.codehilite import make_extension as codehilite
from bs4 import BeautifulSoup
from PIL import Image, UnidentifiedImageError
from typing import Literal

class Blog:
    def __init__(self):
        self.BLOG_DIR_PATH = Path("/app/blog")
        self.TEMP_PATH = Path("/app/temp")
        self.UPLOAD_PATH = Path("/app/uploads")
        self.index = BlogIndex()

    def post(self, content: str, title: str | None = None, linked_page: str | None = None):
        try:
            now = datetime.now()
            post_id = f"{now.strftime("%Y-%m-%d")}_{secrets.token_hex(4)}"

            if not title:
                title = now.strftime("%d %B - %H:%M")

            if not linked_page:
                linked_page = "misc"

            with open(self.BLOG_DIR_PATH.joinpath(f"{post_id}.md"), "w+") as f:
                f.write(content)

            with open(self.BLOG_DIR_PATH.joinpath(f"{post_id}.html"), "w+") as f:
                f.write(self._parse(content))

            post = BlogPostModel(**{
                "post_id": str(post_id),
                "title": title,
                "timestamp": now.timestamp(),
                "linked_page": linked_page
            })

            self.index.add_new(post)

            self._empty_temp()

            log("Blog", f"Successfully added {title}")

            return BaseResponseModel(
                success=True, 
                msg=f"Successfully added {title}"
            )
        except Exception as e:
            log("Blog", f"Something went wrong :", e)

            return BaseResponseModel(
                success=False,
                msg=f"Something went wrong : {e}"
            )
    
    def update(self, post_id: str, title: str, content: str, linked_page: str):
        try:
            with open(self.BLOG_DIR_PATH.joinpath(f"{post_id}.md"), "w+") as f:
                f.write(content)

            with open(self.BLOG_DIR_PATH.joinpath(f"{post_id}.html"), "w+") as f:
                f.write(self._parse(content))

            self.index.update(post_id, linked_page, title)

            self._empty_temp()

            log("Blog", f"Successfully updated {title}")

            return BaseResponseModel(
                success=True,
                msg=f"Successfully updated {post_id}"
            )
        except Exception as e:
            log("Blog", f"Something went wrong :", e)

            return BaseResponseModel(
                success=False,
                msg=f"Something went wrong : {e}"
            )

    def delete(self, post_id: str):
        try:
            with open(self.BLOG_DIR_PATH.joinpath(f"{post_id}.html"), "r") as f:
                log("Blog", f"Removing assets for {post_id}...")
                soup = BeautifulSoup(f.read())

                for i in soup.find_all("img"):
                    filename = i["src"].replace("/uploads/", "")
                    os.remove(self.UPLOAD_PATH.joinpath(filename))
                log("Blog", "Done.")
            os.remove(self.BLOG_DIR_PATH.joinpath(f"{post_id}.md"))
            os.remove(self.BLOG_DIR_PATH.joinpath(f"{post_id}.html"))
            self.index.remove(post_id)

            log("Blog", f"Successfully deleted {post_id}")

            return BaseResponseModel(
                success=True,
                msg=f"Succesfully deleted {post_id}"
            )
        except Exception as e:
            log("Blog", f"Something went wrong :", e)

            return BaseResponseModel(
                success=False,
                msg=f"Something went wrong : {e}"
            )

    def get(self, post_id: str, doctype: Literal["html", "md"] = "html"):
        if doctype == "html":
            with open(f"{self.BLOG_DIR_PATH}/{post_id}.html", "r") as f:
                return f.read()
        if doctype == "md":
            self._copy_assets_to_temp(post_id)
            with open(f"{self.BLOG_DIR_PATH}/{post_id}.md", "r") as f:
                return f.read()

    def upload_image(self, image: bytes, ext: str):
        filename = f"{uuid4()}.{ext}"
        with open(self.TEMP_PATH.joinpath(filename), "wb") as f:
            f.write(image)

        return f"/temp/{filename}"
    
    def _empty_temp(self):
        log("Blog", "Removing temp files...")
        
        for f in os.scandir(self.TEMP_PATH):
            os.remove(f)

        log("Blog", "Done.")

    def _parse(self, content: str):
        log("Blog", "Parsing blog post...")
        markdown = Markdown(extensions=[
            gfm(), 
            codehilite()
        ])

        html = markdown.convert(content)
        soup = BeautifulSoup(html, "html.parser")

        for i in soup.find_all("img"):
            wrapper = soup.new_tag("div")
            wrapper["class"] = "image-wrapper"

            src = i.get("src")
            alt = i.get("alt")
            title = i.get("title")
            i["src"] = src.replace("/temp/", "/uploads/")
            if title:
                i["alt"] = title
                caption = soup.new_tag("p")
                caption.string = title
                caption["class"] = "caption"
                i.insert_after(caption)
            if alt:
                i["style"] = f"width: {float(alt)*100}%"

            i.wrap(wrapper)

        for f in os.listdir(self.TEMP_PATH):
            if f not in os.listdir(self.UPLOAD_PATH):
                self._compress_and_move(self.TEMP_PATH.joinpath(f), self.UPLOAD_PATH.joinpath(f))

        log("Blog", "Done.")

        return str(soup)
    
    def _compress_and_move(self, input_path: Path, output_path: Path):
        try:
            img = Image.open(input_path)
            if img.format == "PNG":
                img.save(output_path, "PNG", optimize=True)
            else:
                img = img.convert("RGB")
                img.save(output_path, "JPEG", quality=70, optimize=True)
            log("Blog", "Image compressed and moved.")
        except Exception as e:
            log("Blog", f"Unable to compress image : {e}")
            shutil.copy(input_path, output_path)

    def _copy_assets_to_temp(self, post_id: str):
        log("Blog", "Copying assets to temp...")
        with open(self.BLOG_DIR_PATH.joinpath(f"{post_id}.html"), "r") as f:
            soup = BeautifulSoup(f.read())

            for i in soup.find_all("img"):
                filename = i["src"].replace("/uploads/", "")
                shutil.copy(self.UPLOAD_PATH.joinpath(filename), self.TEMP_PATH.joinpath(filename))
        log("Blog", "Done.")

class BlogIndex:
    def __init__(self):
        self.JSON_PATH = Path("/app/blog/index.json")

    def update(self, post_id: str, linked_page: str, title: str):
        with open(self.JSON_PATH, "r+") as f:
            index: list = json.loads(f.read())
            for p in index:
                if p["post_id"] == post_id:
                    p["title"] = title
                    p["linked_page"] = linked_page
            f.seek(0)
            f.write(json.dumps(index, indent=2))
            f.truncate()


    def add_new(self, post: BlogPostModel):
        if not self.JSON_PATH.exists():
            self.JSON_PATH.write_text("[]")

        with open(self.JSON_PATH, "r+") as f:
            index: list = json.loads(f.read())
            index.append(post.model_dump())
            f.seek(0)
            f.write(json.dumps(index, indent=2))
            f.truncate()

    def filter_by(self, filters: FilterBlogIndexModel, shown: list[str]):
        index = []
        try:
            with open(self.JSON_PATH, "r") as f:
                posts = json.loads(f.read())
                index = [BlogPostModel(**i) for i in posts]
        except Exception as e:
            log("Blog", "Creating index file...")
            self.JSON_PATH.write_text("[]")
            return []
        
        index = [p for p in index if p.linked_page in shown or p.linked_page == "main"]

        if filters.linked_page:
            index = [p for p in index if p.linked_page == filters.linked_page]

        if filters.start_date:
            index = [p for p in index if p.timestamp >= filters.start_date]

        if filters.end_date:
            index = [p for p in index if p.timestamp <= filters.end_date]

        match filters.order:
            case "asc":
                index.sort(key=lambda x: x.timestamp, reverse=False)
            case "desc":
                index.sort(key=lambda x: x.timestamp, reverse=True)

        return index[filters.start:filters.limit]

    def remove(self, post_id: str):
        with open(self.JSON_PATH, "r+") as f:
            index: list = json.loads(f.read())
            post_to_remove = list(filter(lambda x: x["post_id"] == post_id, index))
            index.remove(post_to_remove[0])
            f.seek(0)
            f.write(json.dumps(index, indent=2))
            f.truncate()
        log("Blog", f"Successfully removed {post_id} from index")