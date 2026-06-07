import time
from threading import Lock
from collections import defaultdict
from fastapi import Request, HTTPException, status

# Thread-safe in-memory sliding window rate limiter
class RateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.history = defaultdict(list)
        self.lock = Lock()

    def check(self, key: str) -> bool:
        with self.lock:
            now = time.time()
            before_len = len(self.history[key])
            self.history[key] = [t for t in self.history[key] if now - t < self.window_seconds]
            after_len = len(self.history[key])
            print(f"[DEBUG check] id={id(self)}, key={key}, before_len={before_len}, after_len={after_len}, limit={self.requests_limit}")
            if len(self.history[key]) >= self.requests_limit:
                return False
            self.history[key].append(now)
            return True

# Initialize limiters
chat_limiter = RateLimiter(requests_limit=5, window_seconds=10)
resource_limiter = RateLimiter(requests_limit=2, window_seconds=10)

def rate_limit_chat(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    allowed = chat_limiter.check(client_ip)
    print(f"[DEBUG rate_limit_chat] ip={client_ip}, allowed={allowed}")
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="您的对话请求过于频繁，请稍候再试（安全校验智能体限制）。"
        )

def rate_limit_resource(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    allowed = resource_limiter.check(client_ip)
    print(f"[DEBUG rate_limit_resource] ip={client_ip}, allowed={allowed}")
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="资源生成、沙盒测试或路线更新过于频繁，请稍候再试（安全校验智能体限制）。"
        )
