import os
import json
from typing import Optional
from datetime import date, datetime
from urllib import error, request

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from korean_lunar_calendar import KoreanLunarCalendar
from pydantic import BaseModel, Field


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
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        return TextResponse(result=payload.text[:200] + "...", provider="mock:missing-groq-token")

    model = payload.model_id.strip() if payload.model_id and payload.model_id.strip() else os.getenv("GROQ_SUMMARIZE_MODEL", "llama-3.1-8b-instant")
    _validate_groq_model(model)
    try:
        prompt = "다음 글을 핵심만 간결하게 요약해줘. 요약문만 출력해.\n\n글:\n{}".format(payload.text)
        result = _call_groq(model, prompt)
        if not result:
            raise HTTPException(status_code=502, detail="empty summary output")
        return TextResponse(result=result.strip(), provider="groq:{}".format(model))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or "HTTP {}".format(exc.code)
        raise HTTPException(status_code=502, detail="groq error: {}".format(detail)) from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="groq connection failed: {}".format(exc)) from exc


@app.post("/api/ai/refine", response_model=TextResponse)
def refine(payload: TextRequest):
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        return TextResponse(result=payload.text, provider="mock:missing-groq-token")

    model = payload.model_id.strip() if payload.model_id and payload.model_id.strip() else os.getenv("GROQ_REFINE_MODEL", "llama-3.1-8b-instant")
    _validate_groq_model(model)
    prompt = "다음 문장을 더 자연스럽고 명확하게 다듬어줘. 같은 언어로, 다듬은 문장만 출력해.\n\n문장:\n{}".format(payload.text)
    try:
        result = _call_groq(model, prompt)
        if not result:
            raise HTTPException(status_code=502, detail="empty output")
        return TextResponse(result=result, provider="groq:{}".format(model))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or "HTTP {}".format(exc.code)
        raise HTTPException(status_code=502, detail="groq error: {}".format(detail)) from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="groq connection failed: {}".format(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="refine failed: {}".format(exc)) from exc


@app.post("/api/ai/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest):
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        return TranslateResponse(
            translated_text="[dev-fallback:{}] {}".format(payload.target_lang, payload.text),
            provider="mock:missing-groq-token",
        )

    model = os.getenv("GROQ_TRANSLATION_MODEL", "llama-3.1-8b-instant")
    _validate_groq_model(model)
    source_lang = payload.source_lang or "auto"
    prompt = (
        "Translate the following text.\n"
        "Source language: {}\nTarget language: {}\n"
        "Return translated text only.\n\nText:\n{}".format(source_lang, payload.target_lang, payload.text)
    )
    try:
        translated = _call_groq(model, prompt)
        if not translated:
            raise HTTPException(status_code=502, detail="empty translation output")
        return TranslateResponse(translated_text=translated, provider="groq:{}".format(model))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or "HTTP {}".format(exc.code)
        raise HTTPException(status_code=502, detail="groq error: {}".format(detail)) from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="groq connection failed: {}".format(exc)) from exc
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
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with request.urlopen(req, timeout=60) as resp:
        parsed = json.loads(resp.read().decode("utf-8"))
    return parsed.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

