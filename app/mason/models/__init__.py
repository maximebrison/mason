from pydantic import BaseModel, field_validator
from typing import Literal

class APIError(Exception):
    """
    Base Exception for handling failed requests
    """
    pass

class CommitModel(BaseModel):
    author: str
    message: str

class PageModel(BaseModel):
    provider: str
    id: str
    repo_name: str
    friendly_name: str
    full_name: str
    description: str | None
    private: bool
    fork: bool
    url: str
    readme_filename: str | None = None
    created: str
    last_update: str
    featured: bool
    show: bool
    languages: dict[str, int] | None = None
    last_commit: CommitModel | None = None

    def auto_update(self, data: PageModel):
        self.repo_name = data.repo_name
        self.full_name = data.full_name
        self.description = data.description
        self.private = data.private
        self.fork = data.fork
        self.url = data.url
        self.created = data.created
        self.last_update = data.last_update
        self.readme_filename = data.readme_filename
        self.last_commit = data.last_commit

    def user_update(self, data: UpdatePageModel):
        self.friendly_name = data.friendly_name
        self.featured = data.featured
        self.show = data.show

class FilterPageIndexModel(BaseModel):
    shown: bool | None = None
    featured: bool | None = None
    homepage: bool | None = None

class UpdatePageModel(BaseModel):
    id: str
    friendly_name: str
    show: bool
    featured: bool

class ConfigModel(BaseModel):
    enable_private_repo: bool = False
    enable_forked_repo: bool = True
    show_by_default: bool = False
    verbose_mode: bool = True
    logs_max_size_bytes: int = 500000

class ColorsModel(BaseModel):
    bg: str
    alternate_bg: str
    card_bg: str
    alternate_card_bg: str
    banner: str
    border: str
    text: str
    accent1: str
    accent2: str
    accent3: str
    scrollbar_thumb: str
    pre: str

    @classmethod
    def default_dark(cls):
        return cls(
            bg = "202022",
            alternate_bg = "46454A",
            card_bg = "28282A",
            alternate_card_bg = "323234",
            banner = "202022",
            border = "46454A",
            text = "FFF0EB",
            accent1 = "C8553D",
            accent2 = "28965A",
            accent3 = "5972D9",
            scrollbar_thumb = "C8553D",
            pre = "232A2F"
        )

    @classmethod
    def default_light(cls):
        return cls(
            bg = "FEFEFE",
            alternate_bg = "FFF1D6",
            card_bg = "FFF8EB",
            alternate_card_bg = "FFEAC2",
            banner = "202022",
            border = "FFC759",
            text = "121516",
            accent1 = "C8553D",
            accent2 = "28965A",
            accent3 = "5972D9",
            scrollbar_thumb = "C8553D",
            pre = "F1F2EE"
        )

class BlogPostModel(BaseModel):
    post_id: str
    title: str
    timestamp: float
    linked_page: str | None

class FilterBlogIndexModel(BaseModel):
    linked_page: str | None = None
    start_date: float | None = None
    end_date: float | None = None
    start: int | None = None
    limit: int | None = None
    order: Literal["asc", "desc"] = "desc"

class ResponseColorsModel(BaseModel):
    dark: ColorsModel
    light: ColorsModel

class BaseResponseModel(BaseModel):
    success: bool
    msg: str

class ProviderKeyModel(BaseModel):
    id: int
    provider: str
    key: str

class NewUserModel(BaseModel):
    username: str
    password: str
    retype_password: str

class UserModel(BaseModel):
    username: str
    password: str

class BannerLogoModel(BaseModel):
    src: str
    show: bool = True
    border_radius: str = "0"

class BannerBackgroundModel(BaseModel):
    background_type: str = "image"
    src: str
    show: bool = True
    background_size: str = "auto"
    background_position: str = "0"
    background_repeat: bool = True

class FooterBackgroundModel(BaseModel):
    src: str
    show: bool = True
    background_size: str = "auto"
    background_position: str = "0"
    background_repeat: bool = True