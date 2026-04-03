"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { getJson } from "@/lib/api";

type LunarSolarResponse = { input_date: string; type: string; result_date: string; is_leap_month?: boolean };

export default function LunarSolarPage() {
  const [date, setDate] = useState("1990-01-01");
  const [type, setType] = useState("solar-to-lunar");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [result, setResult] = useState<LunarSolarResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date, type, is_leap_month: String(isLeapMonth) });
      const data = await getJson<LunarSolarResponse>(`/api/utils/lunar-solar?${params}`);
      setResult(data);
    } catch { setResult(null); }
    finally { setLoading(false); }
  };

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="moon" title="음력 ↔ 양력 변환" />
        <p className="muted">명절, 생일 등의 날짜를 음력↔양력으로 변환합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>날짜</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="row">
          <label>변환 방향</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="solar-to-lunar">양력 → 음력</option>
            <option value="lunar-to-solar">음력 → 양력</option>
          </select>
        </div>
        {type === "lunar-to-solar" && (
          <div className="row">
            <label>
              <input type="checkbox" checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)} style={{ marginRight: 6 }} />
              윤달 여부
            </label>
          </div>
        )}
        <button className="button" onClick={onSubmit} disabled={loading}>
          {loading ? "변환 중..." : "변환하기"}
        </button>
        {result && (
          <div className="result">
            <div className="result-grid">
              <div className="result-item">
                <div className="label">입력 날짜</div>
                <div className="value" style={{ fontSize: "1rem" }}>{result.input_date}</div>
              </div>
              <div className="result-item">
                <div className="label">변환 결과</div>
                <div className="value highlight">{result.result_date}{result.is_leap_month ? " (윤달)" : ""}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
