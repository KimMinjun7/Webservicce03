import os
import json
from pathlib import Path
from datetime import date, datetime
from urllib import error, request

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from korean_lunar_calendar import KoreanLunarCalendar

from app.schemas import TranslateRequest, TranslateResponse, TextRequest, TextResponse

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")

app = FastAPI(title="All-in-One Utility API", version="0.1.0")

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [
    origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    label = f"D-{diff}" if diff >= 0 else f"D+{abs(diff)}"
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

    success = cal.setLunarDate(
        input_dt.year, input_dt.month, input_dt.day, is_leap_month
    )
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

    model = os.getenv("HF_SUMMARIZE_MODEL", "facebook/bart-large-cnn")
    try:
        body = {"inputs": payload.text, "parameters": {"max_length": 200, "min_length": 40}}
        req = request.Request(
            f"https://router.huggingface.co/hf-inference/models/{model}",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {hf_token}",
                "Content-Type": "application/json",
                "x-wait-for-model": "true",
            },
            method="POST",
        )
        with request.urlopen(req, timeout=120) as resp:
            parsed = json.loads(resp.read().decode("utf-8"))
        if isinstance(parsed, list) and parsed:
            result = parsed[0].get("summary_text") or parsed[0].get("generated_text", "")
        else:
            result = ""
        if not result:
            raise HTTPException(status_code=502, detail="empty summary output")
        return TextResponse(result=result.strip(), provider=f"huggingface:{model}")
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or f"HTTP {exc.code}"
        raise HTTPException(status_code=502, detail=f"huggingface error: {detail}") from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail=f"huggingface connection failed: {exc}") from exc


@app.post("/api/ai/refine", response_model=TextResponse)
def refine(payload: TextRequest):
    hf_token = _normalize_hf_token(os.getenv("HF_API_TOKEN"))
    if not hf_token:
        return TextResponse(result=payload.text, provider="mock:missing-hf-token")

    model = os.getenv("HF_REFINE_MODEL", "Helsinki-NLP/opus-mt-ko-en")
    prompt = (
        "Rewrite the following text to be clearer, more natural, and more polished. "
        "Keep the same language and meaning.\n\n"
        f"Text:\n{payload.text}"
    )
    try:
        translated = _call_hf_model(token=hf_token, model=model, prompt=prompt, raw_text=payload.text)
        if not translated:
            raise HTTPException(status_code=502, detail="empty output")
        return TextResponse(result=translated, provider=f"huggingface:{model}")
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore") or f"HTTP {exc.code}"
        raise HTTPException(status_code=502, detail=f"huggingface error: {detail}") from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail=f"huggingface connection failed: {exc}") from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"refine failed: {exc}") from exc


@app.post("/api/ai/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest):
    hf_token = _normalize_hf_token(os.getenv("HF_API_TOKEN"))
    if not hf_token:
        return TranslateResponse(
            translated_text=f"[dev-fallback:{payload.target_lang}] {payload.text}",
            provider="mock:missing-hf-token",
        )

    model = os.getenv("HF_TRANSLATION_MODEL", "Helsinki-NLP/opus-mt-ko-en")
    source_lang = payload.source_lang or "auto"
    prompt = (
        "Translate the following text.\n"
        f"Source language: {source_lang}\n"
        f"Target language: {payload.target_lang}\n"
        "Return translated text only.\n\n"
        f"Text:\n{payload.text}"
    )

    candidate_models = [model]
    pair_model = _select_pair_translation_model(
        source_lang=source_lang, target_lang=payload.target_lang
    )
    if pair_model and pair_model not in candidate_models:
        candidate_models.append(pair_model)

    last_error = "unknown"
    for candidate_model in candidate_models:
        try:
            is_marian = "opus-mt" in candidate_model
            if is_marian:
                chunks = _split_text(payload.text)
                parts = []
                for chunk in chunks:
                    part = _call_hf_model(
                        token=hf_token,
                        model=candidate_model,
                        prompt=prompt,
                        raw_text=chunk,
                    )
                    if part:
                        parts.append(part)
                translated = " ".join(parts)
            else:
                translated = _call_hf_model(
                    token=hf_token,
                    model=candidate_model,
                    prompt=prompt,
                    raw_text=payload.text,
                )
            if translated:
                return TranslateResponse(
                    translated_text=translated,
                    provider=f"huggingface:{candidate_model}",
                )
            last_error = "empty translation output"
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore") or f"HTTP {exc.code}"
            if exc.code == 404:
                last_error = f"{candidate_model} not found on hf-inference"
                continue
            raise HTTPException(
                status_code=502, detail=f"huggingface error: {detail}"
            ) from exc
        except error.URLError as exc:
            raise HTTPException(
                status_code=502, detail=f"huggingface connection failed: {exc}"
            ) from exc
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=502, detail=f"translation failed: {exc}"
            ) from exc

    raise HTTPException(status_code=502, detail=f"huggingface error: {last_error}")


def _parse_date_or_400(raw: str, field_name: str) -> date:
    try:
        return datetime.strptime(raw, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(
            status_code=400, detail=f"invalid {field_name} format, use YYYY-MM-DD"
        ) from exc


def _extract_hf_translation(parsed: object) -> str:
    if isinstance(parsed, list) and parsed:
        first = parsed[0]
        if isinstance(first, dict):
            if "translation_text" in first and isinstance(
                first["translation_text"], str
            ):
                return first["translation_text"].strip()
            if "generated_text" in first and isinstance(first["generated_text"], str):
                return first["generated_text"].strip()
    if isinstance(parsed, dict):
        if "generated_text" in parsed and isinstance(parsed["generated_text"], str):
            return parsed["generated_text"].strip()
        if "translation_text" in parsed and isinstance(parsed["translation_text"], str):
            return parsed["translation_text"].strip()
    return ""


def _normalize_hf_token(raw: str | None) -> str:
    if not raw:
        return ""
    token = raw.strip().strip('"').strip("'")
    if token.lower().startswith("bearer "):
        token = token[7:].strip()
    return token


def _split_text(text: str, max_chars: int = 400) -> list[str]:
    """문장 단위로 분할해 max_chars 이하의 청크로 묶음."""
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


def _select_pair_translation_model(source_lang: str, target_lang: str) -> str:
    src = source_lang.lower().strip()
    tgt = target_lang.lower().strip()

    if src in ("ko", "korean", "auto") and tgt == "en":
        return "Helsinki-NLP/opus-mt-ko-en"
    if src == "en" and tgt in ("ko", "korean"):
        return "Helsinki-NLP/opus-mt-en-ko"
    return ""


def _call_hf_model(token: str, model: str, prompt: str, raw_text: str = "") -> str:
    url = f"https://router.huggingface.co/hf-inference/models/{model}"
    # MarianMT(opus-mt) 계열은 원문 텍스트만 입력으로 받음
    is_marian = "opus-mt" in model
    body: dict
    if is_marian:
        body = {"inputs": raw_text or prompt}
    else:
        body = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 512,
                "temperature": 0.2,
                "return_full_text": False,
            },
        }
    req = request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "x-wait-for-model": "true",
        },
        method="POST",
    )
    with request.urlopen(req, timeout=120) as resp:
        raw = resp.read().decode("utf-8")
    parsed = json.loads(raw)
    return _extract_hf_translation(parsed)
