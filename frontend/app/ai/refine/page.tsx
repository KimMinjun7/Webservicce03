"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { postJson } from "@/lib/api";

type TextResponse = { result: string; provider: string };

const MODELS = [
  { value: "Qwen/Qwen3-4B", label: "Qwen3-4B (한·영)" },
  { value: "Qwen/Qwen3-14B", label: "Qwen3-14B (고품질)" },
  { value: "Helsinki-NLP/opus-mt-ko-en", label: "OPUS-MT (한→영)" },
];

export default function RefinePage() {
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState(MODELS[0].value);
  const [result, setResult] = useState<TextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await postJson<TextResponse>("/api/ai/refine", { text, model_id: modelId });
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
        <PageTitle icon="wand" title="문장 다듬기" />
        <p className="muted">어색하거나 불명확한 문장을 자연스럽게 다듬습니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>원문</label>
          <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="다듬을 문장을 입력하세요" />
        </div>
        <div className="row">
          <label>모델</label>
          <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
            {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <button className="button" onClick={onSubmit} disabled={loading || !text.trim()}>
          {loading ? <><Icon name="hourglass" size={16} />처리 중...</> : "다듬기"}
        </button>
        {error && <div className="result" style={{ background: "#fee2e2", borderColor: "#fca5a5" }}>{error}</div>}
        {result && <div className="result">{result.result}</div>}
      </div>
    </main>
  );
}
