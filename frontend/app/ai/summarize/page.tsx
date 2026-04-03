"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { postJson } from "@/lib/api";

type TextResponse = { result: string; provider: string };

export default function SummarizePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await postJson<TextResponse>("/api/ai/summarize", { text });
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
          <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="요약할 텍스트를 입력하세요 (영문 권장, 한국어는 품질이 낮을 수 있음)" />
          <span className="muted" style={{ fontSize: "0.85rem" }}>{text.length} / 8000자</span>
        </div>
        <button className="button" onClick={onSubmit} disabled={loading || !text.trim()}>
          {loading ? <><Icon name="hourglass" size={16} />요약 중...</> : "요약하기"}
        </button>
        {error && <div className="result" style={{ background: "#fee2e2", borderColor: "#fca5a5" }}>{error}</div>}
        {result && (
          <div className="result">
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 8 }}>[{result.provider}]</div>
            {result.result}
          </div>
        )}
      </div>
    </main>
  );
}
