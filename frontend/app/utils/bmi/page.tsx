"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";

function calcBmi(height: number, weight: number) {
  const bmi = weight / ((height / 100) ** 2);
  let label = "", color = "";
  if (bmi < 18.5) { label = "저체중"; color = "#3b82f6"; }
  else if (bmi < 23) { label = "정상"; color = "#059669"; }
  else if (bmi < 25) { label = "과체중"; color = "#d97706"; }
  else if (bmi < 30) { label = "비만"; color = "#dc2626"; }
  else { label = "고도비만"; color = "#7c3aed"; }
  const ideal = [18.5, 23].map(b => Math.round(b * (height / 100) ** 2 * 10) / 10);
  return { bmi: Math.round(bmi * 10) / 10, label, color, ideal };
}

export default function BmiPage() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [result, setResult] = useState<ReturnType<typeof calcBmi> | null>(null);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="scale" title="BMI 계산" />
        <p className="muted">체질량지수(Body Mass Index)로 체중 상태를 확인합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>키 (cm)</label>
          <input type="number" min={100} max={250} value={height}
            onChange={(e) => setHeight(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>몸무게 (kg)</label>
          <input type="number" min={20} max={300} value={weight}
            onChange={(e) => setWeight(Number(e.target.value))} />
        </div>
        <button className="button" onClick={() => setResult(calcBmi(height, weight))}>계산하기</button>
        {result && (
          <div className="result">
            <div className="result-big" style={{ color: result.color }}>{result.bmi}</div>
            <div style={{ textAlign: "center", fontWeight: 800, fontSize: "1.1rem", color: result.color, marginBottom: 16 }}>
              {result.label}
            </div>
            <div className="result-grid">
              <div className="result-item">
                <div className="label">정상 체중 범위</div>
                <div className="value">{result.ideal[0]} ~ {result.ideal[1]} kg</div>
              </div>
              <div className="result-item">
                <div className="label">BMI 기준</div>
                <div className="value" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                  {"< 18.5 저체중 · 18.5~23 정상 · 23~25 과체중 · 25~30 비만"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
