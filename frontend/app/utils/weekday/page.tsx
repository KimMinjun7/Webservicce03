"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { getJson } from "@/lib/api";

type WeekdayResponse = {
  date: string;
  weekday: string;
  weekday_en: string;
  is_weekend: boolean;
};

export default function WeekdayPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [target, setTarget] = useState(today);
  const [result, setResult] = useState<WeekdayResponse | null>(null);

  const onCalc = async () => {
    const data = await getJson<WeekdayResponse>(`/api/utils/weekday?target=${target}`);
    setResult(data);
  };

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="calendar" title="요일 계산" />
        <p className="muted">특정 날짜가 무슨 요일인지 확인합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>날짜</label>
          <input type="date" value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
        <button className="button" onClick={onCalc}>요일 확인</button>
        {result && (
          <div className="result">
            <div className="result-big" style={{ color: result.is_weekend ? "#dc2626" : "var(--primary)" }}>
              {result.weekday}
            </div>
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.9rem" }}>
              {result.date} · {result.weekday_en} · {result.is_weekend ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="spark" size={14} />
                  주말
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="calendarRange" size={14} />
                  평일
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
