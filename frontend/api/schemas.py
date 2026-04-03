from pydantic import BaseModel, Field


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    target_lang: str = Field(default="en", min_length=2, max_length=10)
    source_lang: str | None = Field(default=None, max_length=10)


class TranslateResponse(BaseModel):
    translated_text: str
    provider: str


class TextRequest(BaseModel):
    text: str = Field(min_length=1, max_length=8000)


class TextResponse(BaseModel):
    result: str
    provider: str
