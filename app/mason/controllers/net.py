import functools
from datetime import datetime, timedelta
from fastapi import HTTPException

attempts: dict[str, list[datetime]] = {}

def limiter(*, max_attempts: int = 5, cooldown_in_minutes: int = 1):
    def limiter(func):
        @functools.wraps(func)
        def nfunc(*args, **kwargs):
            if("request" in kwargs.keys()):
                ip = kwargs["request"].client.host
                now = datetime.now()
                cooldown = now - timedelta(minutes=cooldown_in_minutes)
                if ip in attempts.keys():
                    attempts[ip] = [d for d in attempts[ip] if d > cooldown]

                    if len(attempts[ip]) >= max_attempts:
                        delta = now - attempts[ip][max_attempts - 1]
                        countdown = 60*cooldown_in_minutes - delta.seconds
                        raise HTTPException(429, detail=f"Too many attempts. Try again in {countdown}s")
                    else:
                        attempts[ip].append(now)
                else:
                    attempts[ip] = [now]
            return func(*args, **kwargs)
        return nfunc
    return limiter