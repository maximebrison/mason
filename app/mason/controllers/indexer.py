import json, requests, os, shutil
from pathlib import Path
from mason.models import APIError, PageModel, CommitModel, BaseResponseModel, UpdatePageModel, FilterPageIndexModel
from mason.controllers.parser import Parser
from mason.controllers.utils import Utils
from mason.controllers.log import log

class Indexer:
    """
    Indexes repos from different providers, creating directories, fetching and updating READMEs content.
    """
    def __init__(self):
        self.REPOS_FOLDER = Path("/app/repos")
        self.INDEX_FILE = Path("/app/repos/index.json")
        self.NAVBAR_INDEX = Path("/app/repos/navbar.json")
        self.pages_index: list[PageModel] = []
        self.navbar: list[str] = []
        self.utils = Utils()
        self.parser = Parser()
        self.in_process_key_id: int
        self._load_index()
        self.utils.load_tokens()

    def index(self, data: PageModel, key_id: int, force_update: bool = False):
        self.in_process_key_id = key_id
        action = self._determine_action(data)
        if force_update: action = "update"
        match data.provider:
            case "github":
                match action:
                    case "create":
                        try:
                            self._get_languages(data)
                            self._get_last_commit(data)
                            (filename, readme) = self._get_readme(data)
                            data.readme_filename = filename
                            self._create_folder(data.id)
                            self._update_readme(data, filename, readme)
                            self.parser.parse(repo_dir=data.id, filename=data.readme_filename)
                            if data.id == 'homepage': self._get_navbar(data)
                            self._add_to_index(data)
                            log("GitHub", f'Successfully created {data.full_name}')
                        except Exception as e:
                            log("Github", f'An error occured while creating {data.full_name}', e)
                            raise e
                    case "update":
                        self._get_languages(data)
                        self._get_last_commit(data)
                        (filename, readme) = self._get_readme(data)
                        data.readme_filename = filename
                        self._update_readme(data, filename, readme)
                        self.parser.parse(repo_dir=data.id, filename=data.readme_filename)
                        if data.id == 'homepage': 
                            self._pop_from_index("homepage")
                            self._get_navbar(data)
                            self._add_to_index(data)
                        else:
                            self._auto_update_index(data)
                        log("GitHub", f'Successfully updated {data.full_name}')
                    case "nothing":
                        log("GitHub", f'{data.full_name} is up to date')

            case "codeberg":
                match action:
                    case "create":
                        try:
                            self._get_languages(data)
                            self._get_last_commit(data)
                            (filename, readme) = self._get_readme(data)
                            data.readme_filename = filename
                            self._create_folder(data.id)
                            self._update_readme(data, filename, readme)
                            self.parser.parse(repo_dir=data.id, filename=data.readme_filename)
                            if data.id == 'homepage': self._get_navbar(data)
                            self._add_to_index(data)
                            log("Codeberg", f'Successfully created {data.full_name}')
                        except Exception as e:
                            log("Codeberg", f'An error occured while creating {data.full_name}', e)
                    case "update":
                        self._get_languages(data)
                        self._get_last_commit(data)
                        (filename, readme) = self._get_readme(data)
                        data.readme_filename = filename
                        self._update_readme(data, filename, readme)
                        self.parser.parse(repo_dir=data.id, filename=data.readme_filename)
                        if data.id == 'homepage': 
                            self._pop_from_index("homepage")
                            self._get_navbar(data)
                            self._add_to_index(data)
                        else:
                            self._auto_update_index(data)
                        self._auto_update_index(data)
                        log("Codeberg", f'Successfully updated {data.full_name}')
                    case "nothing":
                        log("Codeberg", f'{data.full_name} is up to date')

    def hard_reset(self):
        for d in os.scandir(self.REPOS_FOLDER):
            if d.is_dir():
                shutil.rmtree(d.path)

        self.INDEX_FILE.write_text("[]")
        self.NAVBAR_INDEX.write_text("[]")

    def update_index(self, repo: UpdatePageModel):
        try:
            self._load_index()
            for r in self.pages_index:
                if r.id == repo.id:
                    r.user_update(repo)

            self._save_index()
            log("Indexer", f'Repo {repo.id} successfully updated')
            return BaseResponseModel(
                success=True,
                msg=f'Repo {repo.id} successfully updated'
            )
        except Exception as e:
            log("Indexer", "Something went wrong :", exception=e)
            return BaseResponseModel(
                success=False,
                msg=f"Something went wrong : {e}"
            )

    def filter_index(self, filters: FilterPageIndexModel):
        index = self._load_index()

        if filters.homepage:
            index = [p for p in index if p.id == "homepage"]
        else:
            index = [p for p in index if p.id != "homepage"]

        if filters.shown != None:
            index = [p for p in index if p.show == filters.shown]
        
        if filters.featured != None:
            index = [p for p in index if p.featured == filters.featured]

        return index

    def shown(self):
        index = self._load_index()
        return [p.id for p in index if p.show == True]

    def _get_languages(self, data: PageModel):
        match data.provider:
            case "github":
                url = f'https://api.github.com/repos/{data.full_name}/languages'
                res = requests.get(url, headers=self.utils.get_headers(self.in_process_key_id))
                data.languages = res.json()

            case "codeberg":
                url = f'https://codeberg.org/api/v1/repos/{data.full_name}/languages'
                res = requests.get(url, headers=self.utils.get_headers(self.in_process_key_id))
                data.languages = res.json()

    def _update_readme(self, data: PageModel, filename: str, readme: str):
        with open(self.REPOS_FOLDER.joinpath(data.id, filename), "+w") as f:
            f.write(readme)

    def _create_folder(self, name: str):
        if not name in os.listdir(self.REPOS_FOLDER):
            os.mkdir(self.REPOS_FOLDER.joinpath(name))
            os.mkdir(self.REPOS_FOLDER.joinpath(name, "assets"))

    def _get_readme(self, data: PageModel):
        match data.provider:
            case "github":
                readmeUrl = f'https://api.github.com/repos/{data.full_name}/readme'
                try:
                    res = requests.get(readmeUrl, headers=self.utils.get_headers(self.in_process_key_id), timeout=5)
                    readmeInfo = res.json()
                    filename = readmeInfo["name"]
                    readme = requests.get(readmeInfo["download_url"], headers=self.utils.get_headers(self.in_process_key_id), timeout=5)

                    return (filename, readme.text)
                except:
                    raise APIError
            case "codeberg":
                repoContentUrl = f'https://codeberg.org/api/v1/repos/{data.full_name}/contents'
                try:
                    repoContent = requests.get(repoContentUrl, headers=self.utils.get_headers(self.in_process_key_id), timeout=5)

                    for i in repoContent.json():
                        if i["name"] in ["README.md", "readme.md", "readme.rst", "README.rst"]:
                            readme = i["name"]

                    if readme:
                        readmeUrl = f'https://codeberg.org/api/v1/repos/{data.full_name}/raw/{readme}'
                        res = requests.get(readmeUrl, headers=self.utils.get_headers(self.in_process_key_id), timeout=5)
                        return (readme, res.text)
                    else:
                        raise APIError
                except:
                    raise APIError

    def _get_navbar(self, data: PageModel):
        log("Indexer", f"Fetching navbar from {data.provider}")
        match data.provider:
            case "github":
                url = f'https://api.github.com/repos/{data.full_name}/contents'
            case "codeberg":
                url = f'https://codeberg.org/api/v1/repos/{data.full_name}/contents'
        res = requests.get(url=url, headers=self.utils.get_headers(self.in_process_key_id))

        old_navbar = self._load_navbar()
        new_navbar = []

        for p in res.json():
            filename_raw: list[str] = p["name"].split(".")
            if len(filename_raw) > 2 or p["name"] == data.readme_filename: continue

            basename = filename_raw[0]
            ext = filename_raw[1]

            if ext.lower() == "md":
                self._create_folder(basename)
                md = requests.get(url=p["download_url"], headers=self.utils.get_headers(self.in_process_key_id))

                with open(self.REPOS_FOLDER.joinpath(basename, p["name"]), "+w") as f:
                    f.write(md.text)

                self.parser.parse(repo_dir=basename, filename=p["name"])

                new_navbar.append(basename)
                log("Indexer", f"{basename} successfully added to Navbar.")
            try:
                old_navbar.remove(basename)
            except ValueError:
                pass

        log("Indexer", "Removing old navbar items...")
        for p in old_navbar:
            shutil.rmtree(self.REPOS_FOLDER.joinpath(p))

        with open(self.NAVBAR_INDEX, "+w") as f:
            f.write(json.dumps(new_navbar, indent=2))

    def _load_navbar(self):
        try:
            with open(self.NAVBAR_INDEX, "r") as f:
                navbar: list = json.loads(f.read())
                return navbar
        except:
            return []

    def _get_last_commit(self, data: PageModel):
        match data.provider:
            case "github":
                url = f'https://api.github.com/repos/{data.full_name}/commits'
                try:
                    res = requests.get(url=url, headers=self.utils.get_headers(self.in_process_key_id))
                    lastCommitInfo = res.json()[0]
                    data.last_commit = CommitModel(**{
                        "author": lastCommitInfo["author"]["login"],
                        "message": lastCommitInfo["commit"]["message"]
                    })
                except Exception as e:
                    raise e
            case "codeberg":
                url = f'https://codeberg.org/api/v1/repos/{data.full_name}/commits'
                try:
                    res = requests.get(url=url, headers=self.utils.get_headers(self.in_process_key_id))
                    lastCommitInfo = res.json()[0]
                    data.last_commit = CommitModel(**{
                        "author": lastCommitInfo["author"]["login"],
                        "message": lastCommitInfo["commit"]["message"]
                    })
                except:
                    raise APIError

    def _repo_exists(self, data: PageModel):
        self._load_index()

        for r in self.pages_index:
            if r.id == data.id:
                return True
            
        return False

    def _needs_update(self, data: PageModel):
        self._load_index()

        for r in self.pages_index:
            if r.id == data.id and r.last_update != data.last_update:
                return True
            
        return False

    def _determine_action(self, data: PageModel):
        """
        Checks if the repo has already been downloaded, or needs update, and returns the linked action.
        """
        if self._repo_exists(data) and not self._needs_update(data):
            return "nothing"
        if not self._repo_exists(data):
            return "create"
        if self._repo_exists(data) and self._needs_update(data):
            return "update"
        
    def _add_to_index(self, data: PageModel):
        self._load_index()
        self.pages_index.append(data)
        self._save_index()

    def _pop_from_index(self, id: str):
        index = self._load_index()
        to_remove = list(filter(lambda x: x.id == id, index))
        try:
            index.remove(to_remove[0])
            log("Indexer", f"Removing {id}")
            self.pages_index = index
            self._save_index()
        except ValueError:
            log("Indexer", f"{id} didn't exist, pass...")
        except Exception as e:
            log("Indexer", "Something wrong occured...", e)

    def _load_index(self):
        """
        Checks if /app/repos/index.json exists and is correctly formatted. If not, it recreates it.
        """
        try:
            with open(self.INDEX_FILE, "r") as f:
                indexes = json.loads(f.read())
                if not type(indexes) == list:
                    raise TypeError
                self.pages_index = [PageModel(**i) for i in indexes]
                return self.pages_index
        except:
            self.pages_index = []
            with open(self.INDEX_FILE, "w") as f:
                f.write(json.dumps(self.pages_index, indent=2))
            return self.pages_index

    def _save_index(self):
        with open(self.INDEX_FILE, "w") as f:
            f.write(json.dumps([i.model_dump() for i in self.pages_index], indent=2))

    def _auto_update_index(self, data: PageModel):
        self._load_index()

        for r in self.pages_index:
            if r.id == data.id:
                r.auto_update(data)

        self._save_index()