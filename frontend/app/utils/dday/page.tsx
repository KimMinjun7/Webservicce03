"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { getJson } from "@/lib/api";

type DDayResponse = { today: string; target: string; diff_days: number; label: string };

export default function DDayPage() {
  const [target, setTarget] = useState("2026-12-25");
  const [result, setResult] = useState<DDayResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const data = await getJson<DDayResponse>(`/api/utils/dday?target=${target}`);
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="calendarRange" title="D-Day 계산" />
        <p className="muted">목표일까지 남은 날짜 또는 지난 날짜를 계산합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>목표일</label>
          <input type="date" value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
        <button className="button" onClick={onSubmit} disabled={loading}>
          {loading ? "계산 중..." : "계산하기"}
        </button>
        {result && (
          <div className="result">
            <div className="result-big" style={{ color: result.diff_days >= 0 ? "var(--primary)" : "#dc2626" }}>
              {result.label}
            </div>
            <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 8 }}>
              {result.today} → {result.target} ({Math.abs(result.diff_days)}일)
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
