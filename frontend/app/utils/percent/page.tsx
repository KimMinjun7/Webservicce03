"use client";

import { useState } from "react";
import Link from "next/link";
import { getJson } from "@/lib/api";

type PercentResponse = { value: number; total: number; percent: number };

export default function PercentPage() {
  const [value, setValue] = useState("23");
  const [total, setTotal] = useState("57");
  const [result, setResult] = useState<PercentResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const data = await getJson<PercentResponse>(`/api/utils/percent?value=${value}&total=${total}`);
      setResult(data);
    } catch { setResult(null); }
    finally { setLoading(false); }
  };

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <h1>% 퍼센트 계산</h1>
        <p className="muted">값이 전체에서 차지하는 비율을 계산합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>값 (부분)</label>
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="예: 23" />
        </div>
        <div className="row">
          <label>전체</label>
          <input value={total} onChange={(e) => setTotal(e.target.value)} placeholder="예: 57" />
        </div>
        <button className="button" onClick={onSubmit} disabled={loading}>
          {loading ? "계산 중..." : "계산하기"}
        </button>
        {result && (
          <div className="result">
            <div className="result-big">{result.percent}%</div>
            <div style={{ textAlign: "center", color: "var(--muted)" }}>
              {result.value}는 {result.total}의 {result.percent}%
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
