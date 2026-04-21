from typing import Literal
from mason.models import BaseResponseModel, BannerBackgroundModel, BannerLogoModel, FooterBackgroundModel
import json, secrets, os, shutil
from pathlib import Path

class AssetsManager:
    def __init__(self):
        self.ASSETS_DIR = Path("/app/uploads/")
        self.ASSETS_CONFIG = Path("/app/config/assets.json")
        self.ASSETS_BASE_PATH = Path("/uploads/")
        self.banner_logo: BannerLogoModel = BannerLogoModel(src="/assets/banner_logo.svg")
        self.banner_bg: BannerBackgroundModel = BannerBackgroundModel(src="/assets/banner_bg.svg")
        self.site_icon: str = "/assets/site_icon.svg"
        self.footer_bg: FooterBackgroundModel = FooterBackgroundModel(src="/assets/footer_bg.svg")
        self._load_paths()

    def save_file(self, file: bytes, filename: str):
        new_filename = self._checks_out(filename)
        if new_filename:
            with open(self.ASSETS_DIR.joinpath(new_filename), "wb") as f:
                f.write(file)

            self._cleanup(new_filename)
            self.save_paths()

            return BaseResponseModel(success=True, msg=f'File {new_filename} successfully saved.')
        else:
            return BaseResponseModel(success=False, msg="Filename incorrect")

    def get_paths(self):
        return {
            "banner_logo": self.banner_logo,
            "banner_bg": self.banner_bg,
            "site_icon": self.site_icon,
            "footer_bg": self.footer_bg
        }

    def save_paths(self):
        with open(self.ASSETS_CONFIG, "w+") as f:
            f.write(json.dumps({
                "banner_logo": self.banner_logo.model_dump(),
                "banner_bg": self.banner_bg.model_dump(),
                "site_icon": self.site_icon,
                "footer_bg": self.footer_bg.model_dump()
            }, indent=2))

    def _checks_out(self, filename: str):
        (basename, ext) = filename.lower().split(".")

        if "banner_logo" in filename and ext in ["svg", "png", "jpeg", "jpg"]:
            new_path = f"{basename}.{secrets.token_hex(4)}.{ext}"
            self.banner_logo.src = str(self.ASSETS_BASE_PATH.joinpath(new_path))
            return new_path
        if "banner_bg" in filename and ext in ["svg", "png", "jpeg", "jpg"]:
            new_path = f"{basename}.{secrets.token_hex(4)}.{ext}"
            self.banner_bg.src = str(self.ASSETS_BASE_PATH.joinpath(new_path))
            return new_path
        if "site_icon" in filename and ext in ["svg", "png", "jpeg", "jpg", "ico"]:
            new_path = f"{basename}.{secrets.token_hex(4)}.{ext}"
            self.site_icon = str(self.ASSETS_BASE_PATH.joinpath(new_path))
            return new_path
        if "footer_bg" in filename and ext in ["svg", "png", "jpeg", "jpg", "ico"]:
            new_path = f"{basename}.{secrets.token_hex(4)}.{ext}"
            self.footer_bg.src = str(self.ASSETS_BASE_PATH.joinpath(new_path))
            return new_path
        
        return False

    def _cleanup(self, new_filename: str):
        (basename, _, _) = new_filename.split(".")
        for f in os.listdir(self.ASSETS_DIR):
            if basename in f and not f == new_filename:
                os.remove(self.ASSETS_DIR.joinpath(f))

    def _load_paths(self):
        try:
            with open(self.ASSETS_CONFIG, "r") as f:
                paths = json.loads(f.read())
                self.banner_logo = BannerLogoModel(**paths["banner_logo"])
                self.banner_bg = BannerBackgroundModel(**paths["banner_bg"])
                self.site_icon = paths["site_icon"]
                self.footer_bg = FooterBackgroundModel(**paths["footer_bg"])
        except Exception as e:
            self.save_paths()