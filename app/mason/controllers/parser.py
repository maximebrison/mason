from mason.models import PageModel, APIError
from mason.controllers.utils import Utils
from mason.controllers.log import log
import os, requests, uuid, re
from marko import Markdown
from marko.ext.gfm import make_extension as gfm
from marko.ext.codehilite import make_extension as codehilite
from bs4 import BeautifulSoup
from PIL import Image
from pathlib import Path

markdown = Markdown(extensions=[
    gfm(), 
    codehilite()
])

class Parser:
    """
    Parses the READMEs to retrieve assets (img, associated files), and creates ready-to-use HTML.
    """
    def __init__(self):
        self.REPOS_FOLDER = Path("/app/repos")
        self.utils = Utils()

    def parse(self, repo_dir: str, filename: str):
        log("Parser", f'Processing {repo_dir}...')
        html: str
        with open(self.REPOS_FOLDER.joinpath(repo_dir, filename)) as f:
            html = markdown.convert(f.read())

        soup = BeautifulSoup(html, 'html.parser')

        soup = self._set_headers_id(soup)
        self._fetch_assets(soup, repo_dir)

        log("Parser", f'Processing done.')

    def _fetch_assets(self, soup: BeautifulSoup, repo_dir: str):
        log("Parser", f'Fetching assets...')
        newFilenames = []

        try:
            for l in soup.find_all("img"):
                url = l.get("src")
                if url.startswith("http"):
                    try:
                        res = requests.get(url=url)
                        (nUrl, filename) = self._process(res.content, res.headers["content-type"], repo_dir)
                        newFilenames.append(filename)
                        l["src"] = nUrl
                        if not filename.endswith(".svg"):
                            with Image.open(f"/app{nUrl}") as i:
                                if not l.get("width"):
                                    l["width"] = i.width
                                if not l.get("height"):
                                    l["height"] = i.height
                        else:
                            if "shields.io" in url or "badge" in url.lower():
                                l["height"] = "20"
                    except Exception as e:
                        log("Parser", f'Failed to fetch {url}', exception=e)
                        raise APIError

            log("Parser", f'Removing old assets...')
            for f in os.scandir(self.REPOS_FOLDER.joinpath(repo_dir, "assets")):
                if f.is_file and f.name not in newFilenames:
                    os.remove(f.path)
        except Exception as e:
            log("Parser", f'An error occured while fetching assets for {repo_dir}', exception=e)
            

        with open(self.REPOS_FOLDER.joinpath(repo_dir, "index.html"), "w") as f:
            f.write(str(soup))

    def _set_headers_id(self, soup: BeautifulSoup):
        for h in soup.find_all(re.compile(r"h\d")):
            text: str = h.text
            normalized = text.lower().replace(" ", "-")
            h["id"] = normalized

        return soup

    def _process(self, fileContent: bytes, contentType: str, repo_dir: str):
        filename = str(uuid.uuid4())
        processers = {
            "svg": self._process_svg,
            "png": self._process_png,
            "ico": self._process_ico,
            "jpeg": self._process_jpeg
        }

        for p in processers:
            if p in contentType:
                processers[p](fileContent, filename, repo_dir)
                return f'/repos/{repo_dir}/assets/{filename}.{p}', f'{filename}.{p}'
            
    def _process_svg(self, fileContent: bytes, filename: str, repo_dir: str):
        with open(self.REPOS_FOLDER.joinpath(repo_dir, "assets", f"{filename}.svg"), "wb") as f:
            f.write(fileContent) 

    def _process_png(self, fileContent: bytes, filename: str, repo_dir: str):
        with open(self.REPOS_FOLDER.joinpath(repo_dir, "assets", f"{filename}.png"), "wb") as f:
            f.write(fileContent)

    def _process_ico(self, fileContent: bytes, filename: str, repo_dir: str):
        with open(self.REPOS_FOLDER.joinpath(repo_dir, "assets", f"{filename}.ico"), "wb") as f:
            f.write(fileContent)

    def _process_jpeg(self, fileContent: bytes, filename: str, repo_dir: str):
        with open(self.REPOS_FOLDER.joinpath(repo_dir, "assets", f"{filename}.jpeg"), "wb") as f:
            f.write(fileContent)