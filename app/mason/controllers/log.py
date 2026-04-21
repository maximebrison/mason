from mason.models import ConfigModel
from pathlib import Path
from math import floor
import datetime, os, json

CONFIG_FILE = Path("/app/config/config.json")
LOG_FILE = Path("/app/config/logs.log")
    
def log(sender: str, message: str, exception: Exception = None):
    """
    Logs stuff happening in /app/config/logs.log.
    When logs_max_size_bytes is reached (as specified in config.json), it removes 3/4 of the file, starting at the first line, to free up space.
    """

    config: ConfigModel

    try:
        with open(CONFIG_FILE, "r") as f:
            raw = json.loads(f.read())
            config = ConfigModel(**raw)
    except:
        config = ConfigModel()
    
    if not config.verbose_mode: return

    if not LOG_FILE.exists():
        LOG_FILE.write_text("")
    
    logSize = os.path.getsize(LOG_FILE)
    if logSize >= config.logs_max_size_bytes:
        with open(LOG_FILE, "r+") as f:
            f.readlines(floor(config.logs_max_size_bytes * 3/4))
            data = f.read()
            f.seek(0)
            f.write(data)
            f.truncate()
    timestamp = datetime.datetime.now()
    with open(LOG_FILE, "a") as f:
        if exception:
            f.write(f'{timestamp} [ERROR] [{sender}] {message} : {exception}\n')
        else:
            f.write(f'{timestamp} [{sender}] {message}\n')