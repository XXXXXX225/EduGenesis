import base64
import hashlib
import hmac
import json
import math
import os
import re
import ssl
import time
from dataclasses import dataclass
from typing import Any, Optional
from urllib.parse import urlencode, urlparse
from wsgiref.handlers import format_date_time

import requests
import websocket

from app.db import db_get_model_routing, db_get_user_providers


@dataclass
class AIModelConfig:
    api_base: str
    api_key: str
    model_name: str
    provider_id: str
    capability: str


def extract_json_block(text: str) -> str:
    text_clean = (text or "").strip()
    code_block_match = re.search(r"```(?:json)?\s*(.*?)\s*```", text_clean, re.DOTALL)
    if code_block_match:
        return code_block_match.group(1).strip()
    braces_match = re.search(r"(\{.*\})", text_clean, re.DOTALL)
    if braces_match:
        return braces_match.group(1).strip()
    return text_clean


def get_capability_config(username: str, capability: str) -> AIModelConfig:
    try:
        routing = db_get_model_routing(username)
        provider_id = routing.get(f"{capability}_provider_id", "xunfei")
        model_name = routing.get(f"{capability}_model", "generalv3.5")

        # For embedding capability, 'chat_fallback' means reuse the chat provider's
        # api_base/api_key but use the embedding-specific model_name from routing.
        if capability == "embedding" and provider_id == "chat_fallback":
            chat_config = get_capability_config(username, "chat")
            return AIModelConfig(
                api_base=chat_config.api_base,
                api_key=chat_config.api_key,
                model_name=model_name,
                provider_id="chat_fallback",
                capability=capability,
            )

        providers = db_get_user_providers(username)
        provider = next((item for item in providers if item["provider_id"] == provider_id), None)
        if provider and provider.get("is_enabled"):
            api_key = provider.get("api_key") or ""
            if api_key == "env":
                api_key = os.getenv("LLM_API_KEY", "")
            return AIModelConfig(
                api_base=provider.get("api_base", os.getenv("LLM_API_BASE", "https://spark-api-open.xf-yun.com/v1")),
                api_key=api_key,
                model_name=model_name,
                provider_id=provider_id,
                capability=capability,
            )
    except Exception as exc:
        print(f"Error resolving AI capability config for {username}/{capability}: {exc}")

    return AIModelConfig(
        api_base=os.getenv("LLM_API_BASE", "https://spark-api-open.xf-yun.com/v1"),
        api_key=os.getenv("LLM_API_KEY", ""),
        model_name=os.getenv("LLM_MODEL", "generalv3.5"),
        provider_id="xunfei",
        capability=capability,
    )


def supports_json_response(config: AIModelConfig) -> bool:
    model_lower = config.model_name.lower()
    base_lower = config.api_base.lower()
    return any(
        marker in model_lower or marker in base_lower
        for marker in ("gpt", "deepseek", "openrouter", "siliconflow")
    )


def build_chat_payload(
    config: AIModelConfig,
    messages: list[dict[str, str]],
    *,
    temperature: float,
    stream: bool = False,
    max_tokens: Optional[int] = None,
    response_format: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": config.model_name,
        "messages": messages,
        "temperature": temperature,
    }
    if stream:
        payload["stream"] = True
    if max_tokens is not None:
        payload["max_tokens"] = max_tokens
    if response_format is not None:
        payload["response_format"] = response_format
    return payload


def request_chat_completion(
    username: str,
    capability: str,
    messages: list[dict[str, str]],
    *,
    temperature: float,
    timeout: int,
    stream: bool = False,
    max_tokens: Optional[int] = None,
    expect_json: bool = False,
) -> Optional[requests.Response]:
    config = get_capability_config(username, capability)
    return request_chat_completion_with_config(
        config,
        messages,
        temperature=temperature,
        timeout=timeout,
        stream=stream,
        max_tokens=max_tokens,
        expect_json=expect_json,
    )


def request_chat_completion_with_config(
    config: AIModelConfig,
    messages: list[dict[str, str]],
    *,
    temperature: float,
    timeout: int,
    stream: bool = False,
    max_tokens: Optional[int] = None,
    expect_json: bool = False,
) -> Optional[requests.Response]:
    if not config.api_key:
        return None

    url = f"{config.api_base.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {config.api_key}",
        "Content-Type": "application/json",
    }
    payload = build_chat_payload(
        config,
        messages,
        temperature=temperature,
        stream=stream,
        max_tokens=max_tokens,
        response_format={"type": "json_object"} if expect_json and supports_json_response(config) else None,
    )

    # Streaming requests are not retried (the caller consumes the response lazily)
    if stream:
        return requests.post(url, headers=headers, json=payload, timeout=timeout, stream=True)

    max_attempts = 3
    retry_statuses = {429, 503}
    for attempt in range(max_attempts):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=timeout, stream=False)
            if response.status_code not in retry_statuses or attempt == max_attempts - 1:
                return response
            print(f"[retry] HTTP {response.status_code} on attempt {attempt + 1}, retrying in {2 ** attempt}s...")
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as exc:
            if attempt == max_attempts - 1:
                print(f"[retry] Request failed after {max_attempts} attempts: {exc}")
                raise
            print(f"[retry] {type(exc).__name__} on attempt {attempt + 1}, retrying in {2 ** attempt}s...")
        time.sleep(2 ** attempt)
    return None  # unreachable, but satisfies type checker


def probe_provider_connection(api_base: str, api_key: str, model_name: str) -> tuple[bool, str]:
    config = AIModelConfig(
        api_base=api_base,
        api_key=api_key,
        model_name=model_name,
        provider_id="probe",
        capability="probe",
    )
    response = request_chat_completion_with_config(
        config,
        [{"role": "user", "content": "hello"}],
        temperature=0.0,
        timeout=15,
        max_tokens=5,
    )
    if response is None:
        return False, "API Key is empty."
    if response.status_code == 200:
        return True, "连接测试成功！"
    return False, f"连接失败 (HTTP {response.status_code}): {response.text[:150]}"


def request_json_completion(
    username: str,
    capability: str,
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.2,
    timeout: int = 12,
    max_tokens: Optional[int] = None,
) -> Optional[dict[str, Any]]:
    response = request_chat_completion(
        username,
        capability,
        messages,
        temperature=temperature,
        timeout=timeout,
        max_tokens=max_tokens,
        expect_json=True,
    )
    if not response or response.status_code != 200:
        return None
    try:
        content = response.json()["choices"][0]["message"]["content"]
        return json.loads(extract_json_block(content))
    except Exception as exc:
        print(f"Failed to parse JSON completion for {capability}: {exc}")
        return None


def request_text_completion(
    username: str,
    capability: str,
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.3,
    timeout: int = 10,
    max_tokens: Optional[int] = None,
) -> Optional[str]:
    response = request_chat_completion(
        username,
        capability,
        messages,
        temperature=temperature,
        timeout=timeout,
        max_tokens=max_tokens,
    )
    if not response or response.status_code != 200:
        return None
    try:
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        print(f"Failed to parse text completion for {capability}: {exc}")
        return None


def request_stream_completion(
    username: str,
    capability: str,
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.7,
    timeout: int = 12,
) -> Optional[requests.Response]:
    return request_chat_completion(
        username,
        capability,
        messages,
        temperature=temperature,
        timeout=timeout,
        stream=True,
    )


def _local_hash_embedding(text: str) -> list[float]:
    tokens = re.findall(r"[\u4e00-\u9fff]|[a-zA-Z0-9_]+", text or "")
    vector = [0.0] * 128
    if not tokens:
        vector[0] = 1.0
        return vector
    for token in tokens:
        token_hash = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
        vector[token_hash % 128] += 1.0
    magnitude = math.sqrt(sum(x * x for x in vector))
    if magnitude > 0:
        return [x / magnitude for x in vector]
    vector[0] = 1.0
    return vector


def generate_embedding_vector(text: str, username: str = "default_user") -> list[float]:
    config = get_capability_config(username, "embedding")
    if config.api_base and config.api_key:
        url = f"{config.api_base.rstrip('/')}/embeddings"
        headers = {
            "Authorization": f"Bearer {config.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": config.model_name,
            "input": text,
        }
        for attempt in range(2):
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=6)
                if response.status_code == 200:
                    embedding = response.json()["data"][0]["embedding"]
                    if isinstance(embedding, list) and embedding:
                        return embedding
                break
            except requests.exceptions.Timeout as exc:
                if attempt == 0:
                    print(f"Embedding request timed out, retrying once: {exc}")
                    continue
                print(f"Embedding request failed after retry, fallback to local vector: {exc}")
            except Exception as exc:
                print(f"Embedding request failed, fallback to local vector: {exc}")
                break
    return _local_hash_embedding(text)


def synthesize_tts_audio(text: str) -> bytes:
    appid = os.getenv("TTS_APPID")
    apikey = os.getenv("TTS_API_KEY")
    apisecret = os.getenv("TTS_API_SECRET")

    if not appid or not apikey or not apisecret:
        raise ValueError("Xunfei TTS credentials (TTS_APPID, TTS_API_KEY, TTS_API_SECRET) not fully configured in environment.")

    ws_url = "wss://tts-api.xfyun.cn/v2/tts"
    parsed_url = urlparse(ws_url)
    host = parsed_url.netloc
    path = parsed_url.path
    date = format_date_time(time.time())

    signature_origin = f"host: {host}\ndate: {date}\nGET {path} HTTP/1.1"
    signature_sha = hmac.new(
        apisecret.encode("utf-8"),
        signature_origin.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()
    signature_sha_base64 = base64.b64encode(signature_sha).decode("utf-8")
    authorization_origin = (
        f'api_key="{apikey}", algorithm="hmac-sha256", '
        f'headers="host date request-line", signature="{signature_sha_base64}"'
    )
    authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode("utf-8")
    auth_url = f"{ws_url}?{urlencode({'authorization': authorization, 'date': date, 'host': host})}"

    ssl_options = None
    if os.getenv("TTS_ALLOW_INSECURE_SSL", "").lower() in {"1", "true", "yes"}:
        ssl_options = {"cert_reqs": ssl.CERT_NONE}

    ws = websocket.create_connection(auth_url, sslopt=ssl_options)
    payload = {
        "common": {"app_id": appid},
        "business": {
            "aue": "lame",
            "sfl": 1,
            "auf": "audio/L16;rate=16000",
            "vcn": "xiaoyan",
            "tte": "utf8",
            "speed": 50,
            "volume": 50,
            "pitch": 50,
        },
        "data": {
            "status": 2,
            "text": base64.b64encode(text[:800].encode("utf-8")).decode("utf-8"),
            "encoding": "utf8",
        },
    }
    ws.send(json.dumps(payload))

    audio_data = b""
    while True:
        try:
            message = ws.recv()
            if not message:
                break
            res = json.loads(message)
            if res.get("code") != 0:
                raise RuntimeError(f"Xunfei TTS Error Code {res.get('code')}: {res.get('message')}")
            audio = res.get("data", {}).get("audio", "")
            if audio:
                audio_data += base64.b64decode(audio)
            if res.get("data", {}).get("status") == 2:
                break
        except websocket.WebSocketConnectionClosedException:
            break

    ws.close()
    return audio_data
