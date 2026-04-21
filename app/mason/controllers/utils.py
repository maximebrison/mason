from mason.models import ConfigModel, APIError, PageModel, ProviderKeyModel, BaseResponseModel
from mason.controllers.database import Database
from pathlib import Path
import json, requests

class Utils:
    """
    Random utilities, for handling logs, config, request headers, API tokens...
    """
    def __init__(self):
        self.CONFIG_FILE = Path("/app/config/config.json")
        self.LOG_FILE = Path("/app/config/logs.log")
        self.config: ConfigModel = None
        self.providers = []
        self.tokens: list[ProviderKeyModel] = []
        self._load_config()

    def get_logs(self):
        with open(self.LOG_FILE, "r")as f:
            return f.read()

    def clear_logs(self):
        with open(self.LOG_FILE, "w+") as f:
            f.write("")
        return BaseResponseModel(
            success=True,
            msg="Successfully cleared logs."
        )

    def get_headers(self, key_id: int):
        """
        Returns headers based on the different providers.
        """
        for t in self.tokens:
            if key_id == t.id:
                match t.provider:
                    case "github":
                        return {
                            "Accept": "application/vnd.github+json",
                            "Authorization": f'Bearer {t.key}',
                            "X-Github-Api-Version": "2022-11-28"
                        }
                    case "codeberg":
                        return {
                            'accept': 'application/json',
                            'Authorization': f'token {t.key}'
                }

    def services_status(self):
        status = []
        for h in self.tokens:
            match h:
                case "github":
                    try:
                        url = "https://api.github.com/rate_limit"
                        res = requests.get(url=url, headers=self.get_headers("github"), timeout=5)
                        if res.status_code != 200:
                            raise APIError
                        status.append({
                            "github": True
                        })
                    except:
                        status.append({
                            "github": False
                        })
                case "codeberg":
                    try:
                        url = f'https://codeberg.org/api/v1/version?token={self.tokens["codeberg"]}'
                        res = requests.get(url=url, headers=self.get_headers("codeberg"), timeout=5)
                        if res.status_code != 200:
                            raise APIError
                        status.append({
                            "codeberg": True
                        })
                    except:
                        status.append({
                            "codeberg": False
                        })
                case "gitlab":
                    status.append({
                        "gitlab": False
                    })
        return status

    def save_config(self, key: str, value: any):
        """
        Updates the specified key to a specified value.
        """
        self._load_config()
        setattr(self.config, key, value)
        with open(self.CONFIG_FILE, "+w") as f:
            f.write(json.dumps(self.config.model_dump(), indent=2))

    def merge_config(self, config: dict):
        self._load_config()
        try:
            self.config = ConfigModel(**config)
            with open(self.CONFIG_FILE, "+w") as f:
                f.write(json.dumps(self.config.model_dump(), indent=2))
            return BaseResponseModel(success=True, msg="Config successfully saved.")
        except Exception as e:
            return BaseResponseModel(success=False, msg=f"Something went wrong : {e}")

    def get_config(self):
        self._load_config()
        return self.config

    def checks_out(self, data: PageModel):
        """
        Checks *config.enable_private_repo* and *config.enable_forked_repo*, and compares it to *data: PageModel*.<br/>
        Returns ``True`` if *data* passed all the tests.<br/>
        Returns ``False`` otherwise.
        """
        self._load_config()

        if not self.config.enable_forked_repo and data.fork == True:
            return False
        
        if not self.config.enable_private_repo and data.private == True:
            return False
        return True

    def load_tokens(self):
        """
        Checks the database for API_KEYS, and loads the different git providers tokens.

        Currently supported:
        - GitHub
        - Codeberg
        """
        db = Database()
        self.tokens = db.get_tokens()

    def _load_config(self):
        """
        Loads /app/config/config.json. If file doesn't exist, it's created from ConfigModel.
        """
        try:
            with open(self.CONFIG_FILE, "+r") as f:
                config = json.loads(f.read())
                self.config = self._check_config_up_to_date(config)
        except:
            with open(self.CONFIG_FILE, "+w") as f:
                self.config = ConfigModel()
                f.write(json.dumps(self.config.model_dump(), indent=2))

    def _check_config_up_to_date(self, config: dict):
        """
        Checks if the config saved in config.json is up to date with potential new fields.
        """
        for k in ConfigModel.model_fields:
            if k not in config.keys():
                config[k] = ConfigModel.model_fields[k].default

        for k in config.keys():
            if k not in ConfigModel.model_fields:
                config.pop(k)

        with open(self.CONFIG_FILE, "+w") as f:
            f.write(json.dumps(config, indent=2))
        return ConfigModel(**config)