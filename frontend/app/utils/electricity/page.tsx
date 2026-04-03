"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";

function calcElectricity(kwh: number) {
  // 2024 한전 주택용 저압 누진제
  let base = 0, energy = 0;
  if (kwh <= 200) {
    base = 910; energy = kwh * 88.3;
  } else if (kwh <= 400) {
    base = 1600; energy = 200 * 88.3 + (kwh - 200) * 182.9;
  } else {
    base = 7300; energy = 200 * 88.3 + 200 * 182.9 + (kwh - 400) * 275.6;
  }
  const climate = kwh * 9;       // 기후환경요금
  const fuel = kwh * 5;          // 연료비조정요금
  const subtotal = base + energy + climate + fuel;
  const vat = Math.round(subtotal * 0.1);
  const fund = Math.round(subtotal * 0.037);
  const total = Math.round(subtotal + vat + fund);
  return {
    base: Math.round(base).toLocaleString(),
    energy: Math.round(energy).toLocaleString(),
    climate: Math.round(climate).toLocaleString(),
    vat: vat.toLocaleString(),
    fund: fund.toLocaleString(),
    total: total.toLocaleString(),
    perKwh: (total / kwh).toFixed(1),
  };
}

export default function ElectricityPage() {
  const [kwh, setKwh] = useState(300);
  const [result, setResult] = useState<ReturnType<typeof calcElectricity> | null>(null);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="bulb" title="전기요금 계산" />
        <p className="muted">한전 주택용 저압 누진제 기준 (2024년)으로 계산합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>월 사용량 (kWh)</label>
          <input type="number" min={0} max={2000} value={kwh}
            onChange={(e) => setKwh(Number(e.target.value))} />
        </div>
        <button className="button" onClick={() => setResult(calcElectricity(kwh))}>계산하기</button>
        {result && (
          <div className="result">
            <div className="result-big">{result.total}원</div>
            <div style={{ textAlign: "center", color: "var(--muted)", marginBottom: 16 }}>kWh당 평균 {result.perKwh}원</div>
            <div className="result-grid">
              <div className="result-item"><div className="label">기본요금</div><div className="value">{result.base}원</div></div>
              <div className="result-item"><div className="label">전력량요금</div><div className="value">{result.energy}원</div></div>
              <div className="result-item"><div className="label">기후환경요금</div><div className="value">{result.climate}원</div></div>
              <div className="result-item"><div className="label">부가세 + 기반기금</div><div className="value">{result.vat}원 + {result.fund}원</div></div>
            </div>
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef3c7", borderRadius: 8, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="bulb" size={16} />
              누진 구간: 200kWh 이하 1구간 / 201~400kWh 2구간 / 401kWh 초과 3구간
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
