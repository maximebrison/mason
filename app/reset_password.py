from pathlib import Path
import sqlite3, hashlib, os, base64, secrets

class ResetPassword:
    def __init__(self):
        self.DB_PATH = Path("/app/config/mason.db")

    def run(self):
        print("Enter the user for which you want to reset the password.")
        username = input("Username: ")
        if(not self._check_username(username)):
            print("User does not exist. Trying again...\n")
            self.run()
        else:
            self._change_password(username)

    def _check_username(self, username: str):
        try:
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                res = cur.execute("SELECT id FROM login WHERE username = ?", (username,))
                if(len(res.fetchall()) > 0):
                    return True
                return False
        except Exception as e:
            print(e)
            return False

    def _change_password(self, username: str):
        try:
            password, password_hash = self._generate_password()
            with sqlite3.connect(self.DB_PATH) as con:
                cur = con.cursor()
                cur.execute("UPDATE login SET password_hash = ? WHERE username = ?", (password_hash, username))
            print(f"Success ! Your new password : {password}")
        except Exception as e:
            print(f"Something went wrong : {e}")
            
    def _generate_password(self):
        password = secrets.token_urlsafe()
        print(f"New password : ")
        salt = os.urandom(16)
        hash_bytes = hashlib.pbkdf2_hmac(
            hash_name="sha256", 
            password=password.encode(), 
            salt=salt, 
            iterations=300_000
        )

        return (password, base64.b64encode(salt + hash_bytes).decode())
    
app = ResetPassword()
app.run()