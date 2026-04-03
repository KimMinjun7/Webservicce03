import os
import json
import threading
from typing import Optional
from datetime import date, datetime
from urllib import error, request

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from korean_lunar_calendar import KoreanLunarCalendar
from pydantic import BaseModel, Field

DEFAULT_HTTP_HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
}

_PIPELINE_CACHE = {}
_PIPELINE_LOCK = threading.Lock()


# ── Schemas ──────────────────────────────────────────────
class TranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    target_lang: str = Field(default="en", min_length=2, max_length=10)
    source_lang: Optional[str] = Field(default=None, max_length=10)


class TranslateResponse(BaseModel):
    translated_text: str
    provider: str


class TextRequest(BaseModel):
    text: str = Field(min_length=1, max_length=8000)
    model_id: Optional[str] = Field(default="")


class TextResponse(BaseModel):
    result: str
    provider: str


# ── App ──────────────────────────────────────────────────
app = FastAPI(title="All-in-One Utility API", version="0.1.0")

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ───────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "all-in-one-utility-backend"}


@app.get("/api/utils/age")
def get_age(birth: str = Query(..., description="YYYY-MM-DD")):
    birth_dt = _parse_date_or_400(birth, "birth")
    today = date.today()
    age = (
        today.year
        - birth_dt.year
        - ((today.month, today.day) < (birth_dt.month, birth_dt.day))
    )
    return {"birth": birth_dt.isoformat(), "today": today.isoformat(), "age": age}


@app.get("/api/utils/dday")
def get_dday(target: str = Query(..., description="YYYY-MM-DD")):
    target_dt = _parse_date_or_400(target, "target")
    today = date.today()
    diff = (target_dt - today).days
    label = "D-{}".format(diff) if diff >= 0 else "D+{}".format(abs(diff))
    return {
        "today": today.isoformat(),
        "target": target_dt.isoformat(),
        "diff_days": diff,
        "label": label,
    }


@app.get("/api/utils/percent")
def get_percent(value: float = Query(...), total: float = Query(...)):
    if total == 0:
        raise HTTPException(status_code=400, detail="total cannot be 0")
    percent = round((value / total) * 100, 2)
    return {"value": value, "total": total, "percent": percent}


@app.get("/api/utils/lunar-solar")
def convert_lunar_solar(
    date: str = Query(..., description="YYYY-MM-DD"),
    type: str = Query("solar-to-lunar", pattern="^(solar-to-lunar|lunar-to-solar)$"),
    is_leap_month: bool = Query(False),
):
    input_dt = _parse_date_or_400(date, "date")
    cal = KoreanLunarCalendar()

    if type == "solar-to-lunar":
        success = cal.setSolarDate(input_dt.year, input_dt.month, input_dt.day)
        if not success:
            raise HTTPException(status_code=400, detail="invalid solar date")
        return {
            "input_date": input_dt.isoformat(),
            "type": type,
            "result_date": cal.LunarIsoFormat(),
            "is_leap_month": cal.isIntercalation,
        }

    success = cal.setLunarDate(input_dt.year, input_dt.month, input_dt.day, is_leap_month)
    if not success:
        raise HTTPException(status_code=400, detail="invalid lunar date")
    return {
        "input_date": input_dt.isoformat(),
        "type": type,
        "result_date": cal.SolarIsoFormat(),
        "is_leap_month": is_leap_month,
    }


@app.get("/api/utils/weekday")
def get_weekday(target: str = Query(..., description="YYYY-MM-DD")):
    dt = _parse_date_or_400(target, "target")
    weekdays = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
    weekdays_en = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    idx = dt.weekday()
    return {
        "date": dt.isoformat(),
        "weekday": weekdays[idx],
        "weekday_en": weekdays_en[idx],
        "is_weekend": idx >= 5,
    }


@app.post("/api/ai/summarize", response_model=TextResponse)
def summarize(payload: TextRequest):
    provider, model = _resolve_text_provider(
        requested_model=payload.model_id,
        env_key="SUMMARIZE_MODEL",
        default_local="Qwen/Qwen3-0.6B",
        default_groq="llama-3.1-8b-instant",
    )
    try:
        prompt = "다음 글을 핵심만 간결하게 요약해줘. 요약문만 출력해.\n\n글:\n{}".format(payload.text)
        result = _call_model(provider, model, prompt)
        if not result:
            raise HTTPException(status_code=502, detail="empty summary output")
        return TextResponse(result=result.strip(), provider="{}:{}".format(provider, model))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or "HTTP {}".format(exc.code)
        raise HTTPException(status_code=502, detail="{} error: {}".format(provider, detail)) from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="{} connection failed: {}".format(provider, exc)) from exc
    except ImportError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/ai/refine", response_model=TextResponse)
def refine(payload: TextRequest):
    provider, model = _resolve_text_provider(
        requested_model=payload.model_id,
        env_key="REFINE_MODEL",
        default_local="Qwen/Qwen3-0.6B",
        default_groq="llama-3.1-8b-instant",
    )
    prompt = "다음 문장을 더 자연스럽고 명확하게 다듬어줘. 같은 언어로, 다듬은 문장만 출력해.\n\n문장:\n{}".format(payload.text)
    try:
        result = _call_model(provider, model, prompt)
        if not result:
            raise HTTPException(status_code=502, detail="empty output")
        return TextResponse(result=result, provider="{}:{}".format(provider, model))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or "HTTP {}".format(exc.code)
        raise HTTPException(status_code=502, detail="{} error: {}".format(provider, detail)) from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="{} connection failed: {}".format(provider, exc)) from exc
    except ImportError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="refine failed: {}".format(exc)) from exc


@app.post("/api/ai/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest):
    provider, model = _resolve_text_provider(
        requested_model="",
        env_key="TRANSLATION_MODEL",
        default_local="Qwen/Qwen3-0.6B",
        default_groq="llama-3.1-8b-instant",
    )
    source_lang = payload.source_lang or "auto"
    prompt = (
        "Translate the following text.\n"
        "Source language: {}\nTarget language: {}\n"
        "Return translated text only.\n\nText:\n{}".format(source_lang, payload.target_lang, payload.text)
    )
    try:
        translated = _call_model(provider, model, prompt)
        if not translated:
            raise HTTPException(status_code=502, detail="empty translation output")
        return TranslateResponse(translated_text=translated, provider="{}:{}".format(provider, model))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or "HTTP {}".format(exc.code)
        raise HTTPException(status_code=502, detail="{} error: {}".format(provider, detail)) from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="{} connection failed: {}".format(provider, exc)) from exc
    except ImportError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="translation failed: {}".format(exc)) from exc


# ── Helpers ──────────────────────────────────────────────
def _parse_date_or_400(raw, field_name):
    try:
        return datetime.strptime(raw, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="invalid {} format, use YYYY-MM-DD".format(field_name)) from exc


GROQ_MODELS = {
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "llama3-8b-8192",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
}


def _validate_groq_model(model):
    if model not in GROQ_MODELS:
        raise HTTPException(status_code=400, detail="unsupported model: {}".format(model))


def _resolve_text_provider(requested_model, env_key, default_local, default_groq):
    requested_model = (requested_model or "").strip()
    preferred_provider = os.getenv("AI_PROVIDER", "").strip().lower()
    local_enabled = os.getenv("LOCAL_MODEL_ENABLED", "true").strip().lower() in {"1", "true", "yes", "on"}
    groq_key = os.getenv("GROQ_API_KEY", "").strip()

    if requested_model:
        if requested_model in GROQ_MODELS:
            if not groq_key:
                raise HTTPException(status_code=502, detail="GROQ_API_KEY not set")
            return "groq", requested_model
        return "local", requested_model

    if preferred_provider == "groq":
        if not groq_key:
            raise HTTPException(status_code=502, detail="GROQ_API_KEY not set")
        model = os.getenv("GROQ_{}".format(env_key), default_groq)
        _validate_groq_model(model)
        return "groq", model

    if preferred_provider == "local" and local_enabled:
        return "local", os.getenv("LOCAL_{}".format(env_key), default_local)

    if groq_key:
        model = os.getenv("GROQ_{}".format(env_key), default_groq)
        _validate_groq_model(model)
        return "groq", model

    if local_enabled:
        return "local", os.getenv("LOCAL_{}".format(env_key), default_local)

    raise HTTPException(status_code=502, detail="no AI provider configured")


def _call_model(provider, model, prompt):
    if provider == "groq":
        return _call_groq(model, prompt)
    if provider == "local":
        return _call_local_pipeline(model, prompt)
    raise HTTPException(status_code=400, detail="unsupported provider: {}".format(provider))


def _call_groq(model, prompt):
    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key:
        raise HTTPException(status_code=502, detail="GROQ_API_KEY not set")
    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "temperature": 0.3,
    }
    req = request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": "Bearer {}".format(groq_key),
            **DEFAULT_HTTP_HEADERS,
        },
        method="POST",
    )
    with request.urlopen(req, timeout=60) as resp:
        parsed = json.loads(resp.read().decode("utf-8"))
    return parsed.get("choices", [{}])[0].get("message", {}).get("content", "").strip()


def _get_local_pipeline(model):
    with _PIPELINE_LOCK:
        if model in _PIPELINE_CACHE:
            return _PIPELINE_CACHE[model]

        try:
            from transformers import pipeline
        except ImportError as exc:
            raise ImportError("local model requires transformers (and torch) to be installed") from exc

        pipeline_kwargs = {
            "task": "text-generation",
            "model": model,
        }
        device_pref = os.getenv("LOCAL_MODEL_DEVICE", "").strip().lower()
        if device_pref == "auto":
            pipeline_kwargs["device_map"] = "auto"
        pipe = pipeline(**pipeline_kwargs)
        _PIPELINE_CACHE[model] = pipe
        return pipe


def _call_local_pipeline(model, prompt):
    pipe = _get_local_pipeline(model)
    messages = [{"role": "user", "content": prompt}]
    outputs = pipe(
        messages,
        max_new_tokens=int(os.getenv("LOCAL_MAX_NEW_TOKENS", "512")),
        do_sample=False,
    )

    if not outputs:
        return ""

    first = outputs[0]
    if isinstance(first, dict):
        generated = first.get("generated_text")
        if isinstance(generated, list) and generated:
            last = generated[-1]
            if isinstance(last, dict):
                return str(last.get("content", "")).strip()
        if isinstance(generated, str):
            return generated.strip()
    return str(first).strip()
