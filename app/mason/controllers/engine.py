from requests.exceptions import RequestException
from mason.models import PageModel
from mason.controllers.log import log
from mason.controllers.utils import Utils
from mason.controllers.indexer import Indexer
from mason.controllers.database import Database
from mason.controllers.color_scheme_generator import ColorSchemeCreator
import requests, secrets

class Engine:
    """
    Initializes the application.
    """
    def __init__(self):
        self.utils: Utils
        self.indexer: Indexer
        self.config_key: str|None = None

    def run(self, force_update: bool = False):
        init = self._check_init()
        if(init):
            self.utils = Utils()
            self.indexer = Indexer()
            self.utils.load_tokens()
            self._get_repositories(force_update)
            colors = ColorSchemeCreator()
            colors.make_file()

    def update(self):
        self._get_repositories(False)

    def _check_init(self):
        db = Database()
        if(db.needs_setup()):
            self.config_key = secrets.token_urlsafe()
            print(f'CONFIG_KEY: {self.config_key}')
            return False
        return True

    def _get_repositories(self, force_update: bool):
        """
        Fetches the repositories for each provider initialized.
        """
        for t in self.utils.tokens:
            match t.provider:
                case "github":
                    self._process_github(force_update, t.id)
                
                case "codeberg":
                    self._process_codeberg(force_update, t.id)

    def _process_github(self, force_update: bool, key_id: int):
        queue = []
        timedOut = False

        url = 'https://api.github.com/user/repos'

        try:
            repos = requests.get(url, headers=self.utils.get_headers(key_id), timeout=10)

            for r in repos.json():
                repo_id: str
                if r["name"] == r["owner"]["login"]:
                    db = Database()
                    if not db.is_primary(key_id):
                        continue
                    repo_id = "homepage"
                else:
                    repo_id = f'github{r["id"]}'
                queue.append({
                    "provider": "github",
                    "id": repo_id,
                    "repo_name": r["name"],
                    "friendly_name": r["name"],
                    "full_name": r["full_name"],
                    "description": r["description"],
                    "private": r["private"],
                    "fork": r["fork"],
                    "url": r["html_url"],
                    "created": r["created_at"],
                    "last_update": r["updated_at"],
                    "featured": False,
                    "show": self.utils.config.show_by_default,
                })
        except RequestException as e:
            log("GitHub", f"Timeout while fetching Github repos : {e}")
            timedOut = True

        if not timedOut:
            for i in queue:
                page = PageModel(**i)
                if self.utils.checks_out(page):
                    self.indexer.index(page, key_id, force_update)

    def _process_codeberg(self, force_update: bool, key_id: int):
        queue = []
        timedOut = False

        url = 'https://codeberg.org/api/v1/user/repos'

        try:
            repos = requests.get(url, headers=self.utils.get_headers(key_id), timeout=10)

            for r in repos.json():
                repo_id: str
                if r["name"] == r["owner"]["login"]:
                    db = Database()
                    if not db.is_primary(key_id):
                        continue
                    repo_id = "homepage"
                else:
                    repo_id = f'codeberg{r["id"]}'
                queue.append({
                    "provider": "codeberg",
                    "id": repo_id,
                    "repo_name": r["name"],
                    "friendly_name": r["name"],
                    "full_name": r["full_name"],
                    "description": r["description"],
                    "private": r["private"],
                    "fork": r["fork"],
                    "url": r["html_url"],
                    "created": r["created_at"],
                    "last_update": r["updated_at"],
                    "featured": False,
                    "show": self.utils.config.show_by_default,
                })
        except RequestException as e:
            log("Codeberg", f"Timeout while fetching Codeberg repos: {e}")
            timedOut = True

        if not timedOut:
            for i in queue:
                page = PageModel(**i)
                if self.utils.checks_out(page):
                    self.indexer.index(page, key_id, force_update)