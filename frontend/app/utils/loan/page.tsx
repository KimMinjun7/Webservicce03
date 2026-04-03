"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";

function calcLoan(principal: number, ratePercent: number, months: number) {
  const r = ratePercent / 100 / 12;
  if (r === 0) {
    const monthly = Math.round(principal / months);
    return { monthly, totalPayment: monthly * months, totalInterest: 0 };
  }
  const monthly = Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;
  return { monthly, totalPayment, totalInterest };
}

export default function LoanPage() {
  const [principal, setPrincipal] = useState(100000000);
  const [rate, setRate] = useState(4.5);
  const [months, setMonths] = useState(120);
  const [result, setResult] = useState<ReturnType<typeof calcLoan> | null>(null);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="bank" title="대출 이자 계산" />
        <p className="muted">원리금 균등 상환 방식으로 계산합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>대출 원금 (원)</label>
          <input type="number" step={1000000} min={0} value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))} />
          <span className="muted" style={{ fontSize: "0.88rem" }}>{principal.toLocaleString()}원</span>
        </div>
        <div className="row">
          <label>연이율 (%)</label>
          <input type="number" step={0.1} min={0} max={50} value={rate}
            onChange={(e) => setRate(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>대출 기간 (개월) — {Math.floor(months / 12)}년 {months % 12}개월</label>
          <input type="number" step={12} min={1} max={600} value={months}
            onChange={(e) => setMonths(Number(e.target.value))} />
        </div>
        <button className="button" onClick={() => setResult(calcLoan(principal, rate, months))}>계산하기</button>
        {result && (
          <div className="result">
            <div className="result-big">{result.monthly.toLocaleString()}원</div>
            <div style={{ textAlign: "center", color: "var(--muted)", marginBottom: 16 }}>월 상환금</div>
            <div className="result-grid">
              <div className="result-item">
                <div className="label">총 상환금액</div>
                <div className="value">{result.totalPayment.toLocaleString()}원</div>
              </div>
              <div className="result-item">
                <div className="label">총 이자</div>
                <div className="value highlight">{result.totalInterest.toLocaleString()}원</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
