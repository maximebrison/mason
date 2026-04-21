from fastapi import APIRouter, Request, Form, Depends, HTTPException
from pydantic import BaseModel
from mason.controllers.database import Database
from mason.controllers.engine import Engine
from mason.controllers.net import limiter
from mason.models import BaseResponseModel, UserModel
from typing import Annotated
from uuid import uuid4
import hashlib, os, base64, asyncio

signup_tokens = set()
async def remove_token(token: str):
    await asyncio.sleep(300)
    signup_tokens.discard(token)

def get_engine(request: Request):
    engine: Engine = request.app.state.engine
    return engine

db = Database()

auth_admin_router = APIRouter(
    prefix="/auth"
)

@auth_admin_router.post("/create_user", response_model=BaseResponseModel)
async def create_user(payload: Annotated[UserModel, Form()]):
    salt = os.urandom(16)
    hash_bytes = hashlib.pbkdf2_hmac(
        hash_name="sha256", 
        password=payload.password.encode(), 
        salt=salt, 
        iterations=300_000
    )

    return db.add_user(username=payload.username, password_hash=base64.b64encode(salt + hash_bytes).decode())

@auth_admin_router.delete("/pop_user", response_model=BaseResponseModel)
async def pop_user(username: Annotated[str, Form()]):
    if len(db.get_users()) <= 1:
        return BaseResponseModel(
            success=False,
            msg="Can't remove the only user"
        )
    return db.pop_user(username)

@auth_admin_router.get("/get_users")
async def get_users():
    return db.get_users()

@auth_admin_router.post("/exists")
async def user_exists(user: Annotated[str, Form()]):
    if user not in db.get_users():
        return False
    return True

@auth_admin_router.get("/generate_token")
async def generate_token():
    """
    Creates a temporary token *(valid for 5 minutes)* to allow someone to register as a new admin
    """
    token = str(uuid4())
    signup_tokens.add(token)
    asyncio.create_task(remove_token(token))
    return token

@auth_admin_router.get("/valid_tokens")
async def valid_tokens():
    return signup_tokens

class ChangePasswordModel(BaseModel):
    username: str
    current: str
    new: str

@auth_admin_router.patch("/change_password")
async def change_password(payload: Annotated[ChangePasswordModel, Form()]):
    valid = db.check_password(payload.username, payload.current)
    if not valid.success:
        return valid
    
    salt = os.urandom(16)
    hash_bytes = hashlib.pbkdf2_hmac(
        hash_name="sha256", 
        password=payload.new.encode(), 
        salt=salt, 
        iterations=300_000
    )

    return db.change_password(payload.username, base64.b64encode(salt + hash_bytes).decode())

auth_public_router = APIRouter(
    prefix="/auth"
)

class SignupModel(BaseModel):
    username: str
    password: str
    token: str

@auth_public_router.post("/signup")
@limiter()
async def signup(payload: Annotated[SignupModel, Form()]):
    if payload.token not in signup_tokens:
        raise HTTPException(status_code=401, detail=BaseResponseModel(success=False, msg="Token expired or invalid").model_dump())
    
    salt = os.urandom(16)
    hash_bytes = hashlib.pbkdf2_hmac(
        hash_name="sha256", 
        password=payload.password.encode(), 
        salt=salt, 
        iterations=300_000
    )

    res = db.add_user(username=payload.username, password_hash=base64.b64encode(salt + hash_bytes).decode())

    if res.success:
        signup_tokens.discard(payload.token)

    return res

@auth_public_router.post("/login", response_model=BaseResponseModel)
@limiter()
async def login(request: Request, username: Annotated[str, Form()], password: Annotated[str, Form()]):
    if db.check_password(username, password).success:
        request.session["user"] = username
        return BaseResponseModel(success=True, msg="Logged in")
    return BaseResponseModel(success=False, msg="Invalid credentials")

@auth_public_router.post("/logout", response_model=BaseResponseModel)
async def logout(request: Request):
    request.session.clear()
    return BaseResponseModel(success=True, msg="Logged out")

@auth_public_router.get("/me")
async def me(request: Request):
    return request.session.get("user")

class ConfigKeyPayload(BaseModel):
    key: str

@auth_public_router.post("/validate_config_key")
async def validate_key(payload: ConfigKeyPayload, request: Request, engine: Engine = Depends(get_engine)):
    if payload.key == engine.config_key:
        request.session["CONFIG_KEY"] = payload.key
        return True
    else:
        return False
    
@auth_public_router.post("/validate_signup_token")
async def validate_signup_token(token: Annotated[str, Form()]):
    if token in signup_tokens:
        return True
    else:
        return False