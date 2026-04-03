"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { postJson } from "@/lib/api";

type TextResponse = { result: string; provider: string };

const MODELS = [
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (빠름) — Groq" },
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (고품질) — Groq" },
  { value: "llama3-8b-8192", label: "Llama 3 8B 8K — Groq" },
  { value: "gemma2-9b-it", label: "Gemma2 9B — Groq" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B — Groq" },
];

export default function SummarizePage() {
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState(MODELS[0].value);
  const [result, setResult] = useState<TextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await postJson<TextResponse>("/api/ai/summarize", { text, model_id: modelId });
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
        <PageTitle icon="fileText" title="문장 요약" />
        <p className="muted">긴 글을 핵심만 요약합니다. AI 처리로 수초~수십초 소요될 수 있습니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>원문</label>
          <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="요약할 텍스트를 입력하세요" />
        </div>
        <div className="row">
          <label>모델</label>
          <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
            {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <button className="button" onClick={onSubmit} disabled={loading || !text.trim()}>
          {loading ? <><Icon name="hourglass" size={16} />요약 중...</> : "요약하기"}
        </button>
        {error && <div className="result" style={{ background: "#fee2e2", borderColor: "#fca5a5" }}>{error}</div>}
        {result && <div className="result">{result.result}</div>}
      </div>
    </main>
  );
}
