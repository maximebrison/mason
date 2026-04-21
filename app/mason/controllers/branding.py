import json
from pathlib import Path
from pydantic import BaseModel
from typing import Literal
from mason.models import BaseResponseModel
from mason.controllers.log import log

class BrandingModel(BaseModel):
    title: str
    copyright: str
    social: list[SocialModel]

    @classmethod
    def default(cls, fmt: Literal["obj", "str"] = "obj"):
        default = cls(
            title = "MasonCMS",
            copyright = "©{year}",
            social = []
        )

        if fmt == "obj":
            return default
        if fmt == "str":
            return default.model_dump_json(indent=2)

class SocialModel(BaseModel):
    icon_class: str
    url: str

class BrandingController:
    def __init__(self):
        self.JSON_PATH = Path("/app/config/branding.json")
        self._exists()

    def edit_title(self, title: str):
        try:
            with open(self.JSON_PATH, "r+") as f:
                branding = BrandingModel(**json.loads(f.read()))
                branding.title = title
                f.seek(0)
                f.write(branding.model_dump_json(indent=2))
                f.truncate()

            log("Branding", "Successfully updated title.")

            return BaseResponseModel(
                success=True,
                msg="Successfully updated title."
            )
        except Exception as e:
            log("Branding", "Something wrong occured : ", e)

            return BaseResponseModel(
                success=False,
                msg=f"Something wrong occured : {e}"
            )

    def edit_copyright(self, copyright: str):
        try:
            with open(self.JSON_PATH, "r+") as f:
                branding = BrandingModel(**json.loads(f.read()))
                branding.copyright = copyright
                f.seek(0)
                f.write(branding.model_dump_json(indent=2))
                f.truncate()

            log("Branding", "Successfully updated copyright.")

            return BaseResponseModel(
                success=True,
                msg="Successfully updated copyright."
            )
        except Exception as e:
            log("Branding", "Something wrong occured : ", e)

            return BaseResponseModel(
                success=False,
                msg=f"Something wrong occured : {e}"
            )

    def add_social(self, link: SocialModel):
        try:
            with open(self.JSON_PATH, "r+") as f:
                branding = BrandingModel(**json.loads(f.read()))
                branding.social.append(link)
                f.seek(0)
                f.write(branding.model_dump_json(indent=2))
                f.truncate()

            log("Branding", f"Successfully added {link.url}.")

            return BaseResponseModel(
                success=True,
                msg=f"Successfully added {link.url}."
            )
        except Exception as e:
            log("Branding", "Something wrong occured : ", e)

            return BaseResponseModel(
                success=False,
                msg=f"Something wrong occured : {e}"
            )
        
    def remove_social(self, link: SocialModel):
        log("Branding", f"To remove: {link}")
        try:
            with open(self.JSON_PATH, "r+") as f:
                branding = BrandingModel(**json.loads(f.read()))
                branding.social.remove(link)
                f.seek(0)
                f.write(branding.model_dump_json(indent=2))
                f.truncate()

            log("Branding", f"Successfully removed {link.url}.")

            return BaseResponseModel(
                success=True,
                msg=f"Successfully removed {link.url}."
            )
        except Exception as e:
            log("Branding", "Something wrong occured : ", e)

            return BaseResponseModel(
                success=False,
                msg=f"Something wrong occured : {e}"
            )

    def get(self):
        with open(self.JSON_PATH, "r") as f:
            try:
                branding = BrandingModel(**json.loads(f.read()))
                return branding
            except:
                branding: BrandingModel = BrandingModel.default()
                return branding
            
    def _exists(self):
        if not self.JSON_PATH.exists():
            self.JSON_PATH.write_text(BrandingModel.default("str"))