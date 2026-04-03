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
  - 번역 (Hugging Face Router + HF Inference)

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
HF_API_TOKEN=your_huggingface_token
HF_TRANSLATION_MODEL=Helsinki-NLP/opus-mt-ko-en
ALLOWED_ORIGINS=http://localhost:3000
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 번역 모델 변경

`HF_TRANSLATION_MODEL` 값만 바꾸면 됩니다.

예:

- `google/flan-t5-base`
- `Helsinki-NLP/opus-mt-ko-en`

모델에 따라 응답 속도/품질이 다를 수 있습니다.

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
