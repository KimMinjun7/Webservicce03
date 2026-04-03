"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";

function calcSalary(annual: number, dependents: number) {
  const monthly = Math.floor(annual / 12);
  // 4대보험 (2024 기준)
  const pension = Math.min(monthly, 5900000) * 0.045;
  const health = monthly * 0.03545;
  const ltc = health * 0.1281;
  const employment = monthly * 0.009;
  const insurance = Math.round(pension + health + ltc + employment);

  // 근로소득세 간이세액표 근사
  let incomeTax = 0;
  if (monthly <= 1060000) incomeTax = 0;
  else if (monthly <= 1500000) incomeTax = Math.round((monthly - 1060000) * 0.06 * 0.55);
  else if (monthly <= 3000000) incomeTax = Math.round(monthly * 0.1 - 119000);
  else if (monthly <= 4500000) incomeTax = Math.round(monthly * 0.15 - 249000);
  else if (monthly <= 7800000) incomeTax = Math.round(monthly * 0.24 - 655000);
  else incomeTax = Math.round(monthly * 0.35 - 1514000);

  // 부양가족 공제
  incomeTax = Math.max(0, incomeTax - (dependents - 1) * 12500);
  const localTax = Math.round(incomeTax * 0.1);
  const totalDeduction = insurance + incomeTax + localTax;
  const takehome = monthly - totalDeduction;

  return {
    monthly: monthly.toLocaleString(),
    pension: Math.round(pension).toLocaleString(),
    health: Math.round(health + ltc).toLocaleString(),
    employment: Math.round(employment).toLocaleString(),
    incomeTax: incomeTax.toLocaleString(),
    localTax: localTax.toLocaleString(),
    totalDeduction: totalDeduction.toLocaleString(),
    takehome: takehome.toLocaleString(),
    takehomeAnnual: (takehome * 12).toLocaleString(),
  };
}

export default function SalaryPage() {
  const [annual, setAnnual] = useState(40000000);
  const [dependents, setDependents] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calcSalary> | null>(null);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="coins" title="연봉 실수령액" />
        <p className="muted">4대보험 및 소득세 공제 후 실수령액을 계산합니다. (2024년 기준)</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>연봉 (원)</label>
          <input type="number" step={1000000} min={0} value={annual}
            onChange={(e) => setAnnual(Number(e.target.value))} />
          <span className="muted" style={{ fontSize: "0.88rem" }}>{annual.toLocaleString()}원</span>
        </div>
        <div className="row">
          <label>부양가족 수 (본인 포함)</label>
          <input type="number" min={1} max={10} value={dependents}
            onChange={(e) => setDependents(Number(e.target.value))} />
        </div>
        <button className="button" onClick={() => setResult(calcSalary(annual, dependents))}>계산하기</button>
        {result && (
          <div className="result">
            <div className="result-big">{result.takehome}원</div>
            <div style={{ textAlign: "center", color: "var(--muted)", marginBottom: 16 }}>월 실수령액 (연간 {result.takehomeAnnual}원)</div>
            <div className="result-grid">
              <div className="result-item">
                <div className="label">월 세전 급여</div>
                <div className="value">{result.monthly}원</div>
              </div>
              <div className="result-item">
                <div className="label">국민연금 (4.5%)</div>
                <div className="value">{result.pension}원</div>
              </div>
              <div className="result-item">
                <div className="label">건강보험+장기요양</div>
                <div className="value">{result.health}원</div>
              </div>
              <div className="result-item">
                <div className="label">고용보험 (0.9%)</div>
                <div className="value">{result.employment}원</div>
              </div>
              <div className="result-item">
                <div className="label">소득세</div>
                <div className="value">{result.incomeTax}원</div>
              </div>
              <div className="result-item">
                <div className="label">지방소득세</div>
                <div className="value">{result.localTax}원</div>
              </div>
              <div className="result-item" style={{ gridColumn: "span 2", background: "#eff6ff" }}>
                <div className="label">총 공제액</div>
                <div className="value highlight">{result.totalDeduction}원</div>
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 12 }}>
              * 간이세액표 기준 근사값입니다. 실제 금액과 다를 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
