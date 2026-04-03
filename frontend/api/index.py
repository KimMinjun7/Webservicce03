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
    hf_token = _normalize_hf_token(os.getenv("HF_API_TOKEN"))
    if not hf_token:
        return TextResponse(result=payload.text[:200] + "...", provider="mock:missing-hf-token")

    model = payload.model_id.strip() if payload.model_id and payload.model_id.strip() else os.getenv("HF_SUMMARIZE_MODEL", "facebook/bart-large-cnn")
    is_qwen = "qwen" in model.lower()
    try:
        if is_qwen:
            prompt = "다음 글을 핵심만 간결하게 요약해줘. 요약문만 출력해.\n\n글:\n{}".format(payload.text)
            result = _call_hf_model(token=hf_token, model=model, prompt=prompt, raw_text=payload.text)
        else:
            body = {"inputs": payload.text, "parameters": {"max_length": 200, "min_length": 40}}
            req = request.Request(
                "https://router.huggingface.co/hf-inference/models/{}".format(model),
                data=json.dumps(body).encode("utf-8"),
                headers={
                    "Authorization": "Bearer {}".format(hf_token),
                    "Content-Type": "application/json",
                    "x-wait-for-model": "true",
                },
                method="POST",
            )
            with request.urlopen(req, timeout=60) as resp:
                parsed = json.loads(resp.read().decode("utf-8"))
            if isinstance(parsed, list) and parsed:
                result = parsed[0].get("summary_text") or parsed[0].get("generated_text", "")
            else:
                result = ""
        if not result:
            raise HTTPException(status_code=502, detail="empty summary output")
        return TextResponse(result=result.strip(), provider="huggingface:{}".format(model))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or "HTTP {}".format(exc.code)
        raise HTTPException(status_code=502, detail="huggingface error: {}".format(detail)) from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="huggingface connection failed: {}".format(exc)) from exc


@app.post("/api/ai/refine", response_model=TextResponse)
def refine(payload: TextRequest):
    hf_token = _normalize_hf_token(os.getenv("HF_API_TOKEN"))
    if not hf_token:
        return TextResponse(result=payload.text, provider="mock:missing-hf-token")

    model = payload.model_id.strip() if payload.model_id and payload.model_id.strip() else os.getenv("HF_REFINE_MODEL", "Qwen/Qwen3-7B")
    prompt = "다음 문장을 더 자연스럽고 명확하게 다듬어줘. 같은 언어로, 다듬은 문장만 출력해.\n\n문장:\n{}".format(payload.text)
    try:
        result = _call_hf_model(token=hf_token, model=model, prompt=prompt, raw_text=payload.text)
        if not result:
            raise HTTPException(status_code=502, detail="empty output")
        return TextResponse(result=result, provider="huggingface:{}".format(model))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or "HTTP {}".format(exc.code)
        raise HTTPException(status_code=502, detail="huggingface error: {}".format(detail)) from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="huggingface connection failed: {}".format(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="refine failed: {}".format(exc)) from exc


@app.post("/api/ai/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest):
    hf_token = _normalize_hf_token(os.getenv("HF_API_TOKEN"))
    if not hf_token:
        return TranslateResponse(
            translated_text="[dev-fallback:{}] {}".format(payload.target_lang, payload.text),
            provider="mock:missing-hf-token",
        )

    model = os.getenv("HF_TRANSLATION_MODEL", "Helsinki-NLP/opus-mt-ko-en")
    source_lang = payload.source_lang or "auto"
    prompt = (
        "Translate the following text.\n"
        "Source language: {}\nTarget language: {}\n"
        "Return translated text only.\n\nText:\n{}".format(source_lang, payload.target_lang, payload.text)
    )

    candidate_models = [model]
    pair_model = _select_pair_translation_model(source_lang=source_lang, target_lang=payload.target_lang)
    if pair_model and pair_model not in candidate_models:
        candidate_models.append(pair_model)

    last_error = "unknown"
    for candidate_model in candidate_models:
        try:
            is_marian = "opus-mt" in candidate_model
            if is_marian:
                chunks = _split_text(payload.text)
                parts = [p for p in (_call_hf_model(token=hf_token, model=candidate_model, prompt=prompt, raw_text=c) for c in chunks) if p]
                translated = " ".join(parts)
            else:
                translated = _call_hf_model(token=hf_token, model=candidate_model, prompt=prompt, raw_text=payload.text)
            if translated:
                return TranslateResponse(translated_text=translated, provider="huggingface:{}".format(candidate_model))
            last_error = "empty translation output"
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore") or "HTTP {}".format(exc.code)
            if exc.code == 404:
                last_error = "{} not found".format(candidate_model)
                continue
            raise HTTPException(status_code=502, detail="huggingface error: {}".format(detail)) from exc
        except error.URLError as exc:
            raise HTTPException(status_code=502, detail="huggingface connection failed: {}".format(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=502, detail="translation failed: {}".format(exc)) from exc

    raise HTTPException(status_code=502, detail="huggingface error: {}".format(last_error))


# ── Helpers ──────────────────────────────────────────────
def _parse_date_or_400(raw, field_name):
    try:
        return datetime.strptime(raw, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="invalid {} format, use YYYY-MM-DD".format(field_name)) from exc


def _normalize_hf_token(raw):
    if not raw:
        return ""
    token = raw.strip().strip('"').strip("'")
    if token.lower().startswith("bearer "):
        token = token[7:].strip()
    return token


def _split_text(text, max_chars=400):
    import re
    sentences = re.split(r"(?<=[.!?。！？\n])\s*", text.strip())
    chunks, current = [], ""
    for sent in sentences:
        if not sent:
            continue
        if len(current) + len(sent) + 1 > max_chars and current:
            chunks.append(current.strip())
            current = sent
        else:
            current = (current + " " + sent).strip() if current else sent
    if current:
        chunks.append(current.strip())
    return chunks or [text]


def _select_pair_translation_model(source_lang, target_lang):
    src = source_lang.lower().strip()
    tgt = target_lang.lower().strip()
    if src in ("ko", "korean", "auto") and tgt == "en":
        return "Helsinki-NLP/opus-mt-ko-en"
    if src == "en" and tgt in ("ko", "korean"):
        return "Helsinki-NLP/opus-mt-en-ko"
    return ""


def _call_hf_model(token, model, prompt, raw_text=""):
    url = "https://router.huggingface.co/hf-inference/models/{}".format(model)
    is_marian = "opus-mt" in model
    body = {"inputs": raw_text or prompt} if is_marian else {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 512, "temperature": 0.2, "return_full_text": False},
    }
    req = request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": "Bearer {}".format(token),
            "Content-Type": "application/json",
            "x-wait-for-model": "true",
        },
        method="POST",
    )
    with request.urlopen(req, timeout=60) as resp:
        raw = resp.read().decode("utf-8")
    parsed = json.loads(raw)
    return _extract_hf_translation(parsed)


def _extract_hf_translation(parsed):
    if isinstance(parsed, list) and parsed:
        first = parsed[0]
        if isinstance(first, dict):
            if "translation_text" in first and isinstance(first["translation_text"], str):
                return first["translation_text"].strip()
            if "generated_text" in first and isinstance(first["generated_text"], str):
                return first["generated_text"].strip()
    if isinstance(parsed, dict):
        if "generated_text" in parsed and isinstance(parsed["generated_text"], str):
            return parsed["generated_text"].strip()
        if "translation_text" in parsed and isinstance(parsed["translation_text"], str):
            return parsed["translation_text"].strip()
    return ""
