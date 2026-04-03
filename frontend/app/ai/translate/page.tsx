"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { postJson } from "@/lib/api";

type TranslateResponse = { translated_text: string; provider: string };

export default function TranslatePage() {
  const [text, setText] = useState("안녕하세요. 반갑습니다.");
  const [targetLang, setTargetLang] = useState("en");
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await postJson<TranslateResponse>("/api/ai/translate", { text, target_lang: targetLang });
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="languages" title="번역" />
        <p className="muted">한국어↔영어, 일본어, 중국어를 번역합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>원문</label>
          <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="번역할 텍스트를 입력하세요." />
        </div>
        <div className="row">
          <label>목표 언어</label>
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
            <option value="en">영어 (en)</option>
            <option value="ko">한국어 (ko)</option>
            <option value="ja">일본어 (ja)</option>
            <option value="zh">중국어 (zh)</option>
          </select>
        </div>
        <button className="button" onClick={onSubmit} disabled={loading}>
          {loading ? <><Icon name="hourglass" size={16} />번역 중...</> : "번역하기"}
        </button>
        {error && <div className="result" style={{ background: "#fee2e2", borderColor: "#fca5a5" }}>{error}</div>}
        {result && (
          <div className="result">
            {result.translated_text}
          </div>
        )}
      </div>
    </main>
  );
}
