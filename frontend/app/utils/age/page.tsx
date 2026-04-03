"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { getJson } from "@/lib/api";

type AgeResponse = { birth: string; today: string; age: number };

export default function AgePage() {
  const [birth, setBirth] = useState("1990-01-01");
  const [result, setResult] = useState<AgeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const data = await getJson<AgeResponse>(`/api/utils/age?birth=${birth}`);
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const year = birth ? new Date().getFullYear() - parseInt(birth.slice(0, 4)) + 1 : null;

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="cake" title="만 나이 계산" />
        <p className="muted">생년월일을 기준으로 만 나이와 한국 나이를 계산합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>생년월일</label>
          <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
        </div>
        <button className="button" onClick={onSubmit} disabled={loading}>
          {loading ? "계산 중..." : "계산하기"}
        </button>
        {result && (
          <div className="result">
            <div className="result-grid">
              <div className="result-item">
                <div className="label">만 나이</div>
                <div className="value highlight">{result.age}세</div>
              </div>
              <div className="result-item">
                <div className="label">한국 나이 (세는 나이)</div>
                <div className="value">{year}세</div>
              </div>
              <div className="result-item">
                <div className="label">기준일</div>
                <div className="value" style={{ fontSize:"1rem" }}>{result.today}</div>
              </div>
              <div className="result-item">
                <div className="label">생년월일</div>
                <div className="value" style={{ fontSize:"1rem" }}>{result.birth}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
