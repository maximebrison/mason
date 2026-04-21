import sqlite3, requests, hashlib, base64
from typing import Literal
from pathlib import Path
from mason.models import APIError, BaseResponseModel, ProviderKeyModel

class Database:
    def __init__(self):
        self.DB_PATH = Path("/app/config/mason.db")

    def needs_setup(self):
        if(self._login_exists() and self._api_keys_exists()):
            return False
        else:
            return True
        
    def set_api_key(self, provider: Literal["github", "codeberg"], key: str):
        first_created_key = False
        if not self._api_keys_exists():
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                cur.execute("CREATE TABLE api_keys (id INTEGER PRIMARY KEY, provider TEXT NOT NULL, username TEXT, key TEXT NOT NULL UNIQUE, is_primary BOOLEAN NOT NULL)")
            first_created_key = True
        try:
            username = self._fetch_username(provider, key)
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                cur.execute("INSERT INTO api_keys (provider, username, key, is_primary) VALUES(?, ?, ?, ?)", (provider, username, key, first_created_key))
            return BaseResponseModel(
                success=True, 
                msg=f'Successfully added {provider}/{username} !'
            )
        except APIError:
            return BaseResponseModel(
                success=False, 
                msg="Failed to fetch user infos. Either the key is incorrect, or the provider is down."
            )
        except sqlite3.IntegrityError:
            return BaseResponseModel(
                success=False, 
                msg="Key already exists."
            )
        
    def pop_api_key(self, key_id: int):
        if not self._api_keys_exists(): return BaseResponseModel(success=False, msg="Table doesn't exist.")
        if not self._process_if_primary(key_id): return BaseResponseModel(success=False, msg="Couldn't change the primary key")
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                cur.execute("DELETE FROM api_keys WHERE id = ?", (key_id,))
            return BaseResponseModel(success=True, msg="Successfully deleted key")
        except:
            return BaseResponseModel(success=False, msg="Didn't find entry.")

    def get_api_keys(self):
        if not self._api_keys_exists(): return []
        with sqlite3.connect(self.DB_PATH) as con:
            con.row_factory = sqlite3.Row
            cur = con.cursor()
            res = cur.execute("SELECT id, provider, username, is_primary FROM api_keys")
            rows = res.fetchall()
            return [dict(row) for row in rows]
        
    def get_tokens(self):
        with sqlite3.connect(self.DB_PATH) as con:
            con.row_factory = sqlite3.Row
            cur = con.cursor()
            res = cur.execute("SELECT id, provider, key FROM api_keys")
            rows = res.fetchall()
            return [ProviderKeyModel(**row) for row in rows]

    def add_user(self, username: str, password_hash: str):
        with sqlite3.connect(self.DB_PATH) as con:
            cur = con.cursor()
            if not self._login_exists():
                cur.execute("CREATE TABLE login (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL)")
            try:
                cur.execute("INSERT INTO login (username, password_hash) VALUES(?, ?)", (username, password_hash))
                return BaseResponseModel(success=True, msg=f"Successfully created user : {username}")
            except sqlite3.IntegrityError:
                return BaseResponseModel(success=False, msg=f"User {username} already exists")
            except:
                return BaseResponseModel(success=False, msg="Something went wrong while creating user")

    def pop_user(self, username: str):
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                cur.execute("DELETE FROM login WHERE username = ?", (username,))
            return BaseResponseModel(
                success=True,
                msg=f"Successfully deleted {username}"
            )
        except Exception as e:
            return BaseResponseModel(
                success=False,
                msg=f"Something wrong happened : {e}"
            )
        
    def get_users(self):
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                res = cur.execute("SELECT username FROM login")
                return [i[0] for i in res.fetchall()]
        except Exception as e:
            return []

    def change_password(self, username: str, new_password_hash: str):
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                cur.execute("UPDATE login SET password_hash = ? WHERE username = ?", (new_password_hash, username,))
            return BaseResponseModel(
                success=True,
                msg=f"Successfully changed password for {username}"
            )
        except Exception as e:
            return BaseResponseModel(
                success=False,
                msg=f"Something went wrong {e}"
            )

    def check_password(self, username: str, password: str):
        stored = self._get_user_password_hash(username)
        if stored == None:
            return BaseResponseModel(success=False, msg="Wrong username")
        raw = base64.b64decode(stored[0])
        salt = raw[:16]
        stored_hash = raw[16:]

        new_hash = hashlib.pbkdf2_hmac(
            hash_name="sha256", 
            password=password.encode(), 
            salt=salt, 
            iterations=300_000
        )

        if new_hash == stored_hash:
            return BaseResponseModel(success=True, msg="Login OK")
        else:
            return BaseResponseModel(success=False, msg="Wrong password")

    def make_primary(self, key_id: int):
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                cur.execute("UPDATE api_keys SET is_primary = FALSE WHERE is_primary = TRUE")
                cur.execute("UPDATE api_keys SET is_primary = TRUE WHERE id = ?", (key_id,))
            return BaseResponseModel(success=True, msg="Successfully updated the primary key")
        except Exception as e:
            print(f"make_primary : {e}")
            return BaseResponseModel(success=False, msg=f"Failed to update primary for id : {key_id}. {e}")
        
    def is_primary(self, key_id: int):
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                res = cur.execute("SELECT is_primary FROM api_keys WHERE id = ?", (key_id,))
                primary: bool = res.fetchone()[0]
                return primary 
        except:
            return False

    def _process_if_primary(self, key_id: int):
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                res = cur.execute("SELECT is_primary FROM api_keys WHERE id = ?", (key_id,))
                is_primary: bool = res.fetchone()[0]
                if is_primary:
                    res = cur.execute("SELECT id FROM api_keys WHERE id != ? ORDER BY id ASC", (key_id,))
                    if self.make_primary(res.fetchone()[0]).success:
                        return True
                    else:
                        return False
                return True
        except Exception as e:
            print(f"_process_if_primary : {e}")
            return False


    def _get_user_password_hash(self, username: str):
        with sqlite3.connect(self.DB_PATH) as con:
            cur = con.cursor()
            res = cur.execute("SELECT password_hash FROM login WHERE username = ?", (username,))
            return res.fetchone()

    def _login_exists(self):
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                cur.execute("SELECT * FROM login")
            return True
        except sqlite3.OperationalError as e:
            return False
        
    def _api_keys_exists(self):
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                cur.execute("SELECT * FROM api_keys")
            return True
        except sqlite3.OperationalError as e:
            return False

    def _fetch_username(self, provider: Literal["github", "codeberg"], key: str):
        match provider:
            case "github":
                headers = {
                    "Accept": "application/vnd.github+json",
                    "Authorization": f'Bearer {key}',
                    "X-Github-Api-Version": "2022-11-28"
                }
                res = requests.get("https://api.github.com/user", headers=headers)
                if res.status_code == 200:
                    return res.json()["login"]
                else:
                    raise APIError
            case "codeberg":
                headers = {
                    "accept": "application/json"
                }
                res = requests.get(f'https://codeberg.org/api/v1/user?token={key}', headers=headers)
                if res.status_code == 200:
                    return res.json()["login"]
                else:
                    raise APIError