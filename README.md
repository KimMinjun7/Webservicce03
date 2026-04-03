# All-in-One Utility MVP

검색 유입형 유틸리티 + AI 도구 서비스의 실행 가능한 MVP입니다.

## 구성

- `frontend`: Next.js 14(App Router)
- `backend`: FastAPI

## MVP 기능

- 유틸리티
  - 음력/양력 변환
  - 만 나이 계산
  - D-Day 계산
  - 퍼센트 계산
- AI
  - 번역 / 요약 / 문장 다듬기
  - 로컬 `Qwen/Qwen3-0.6B` 또는 Groq 사용 가능

## 빠른 실행

### 1) Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

기본 주소:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

## 환경 변수

### backend/.env

```env
AI_PROVIDER=local
LOCAL_MODEL_ENABLED=true
LOCAL_SUMMARIZE_MODEL=Qwen/Qwen3-0.6B
LOCAL_REFINE_MODEL=Qwen/Qwen3-0.6B
LOCAL_TRANSLATION_MODEL=Qwen/Qwen3-0.6B
LOCAL_MAX_NEW_TOKENS=512
LOCAL_MODEL_DEVICE=
GROQ_API_KEY=
ALLOWED_ORIGINS=http://localhost:3000
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## AI 모델 변경

로컬 모델 사용:

- `AI_PROVIDER=local`
- `LOCAL_SUMMARIZE_MODEL`, `LOCAL_REFINE_MODEL`, `LOCAL_TRANSLATION_MODEL` 설정

Groq 사용:

- `AI_PROVIDER=groq`
- `GROQ_API_KEY` 설정
- `GROQ_SUMMARIZE_MODEL`, `GROQ_REFINE_MODEL`, `GROQ_TRANSLATION_MODEL` 설정

로컬 Qwen은 첫 실행 시 모델 다운로드 때문에 시간이 걸릴 수 있습니다.

## API 예시

- `GET /api/utils/lunar-solar?date=1990-01-01&type=solar-to-lunar`
- `GET /api/utils/age?birth=1990-01-01`
- `GET /api/utils/dday?target=2026-12-25`
- `GET /api/utils/percent?value=23&total=57`
- `POST /api/ai/translate`

```json
{
  "text": "안녕하세요",
  "target_lang": "en"
}
```
