"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";

function calcCar(cc: number, km: number, fuelEff: number, fuelPrice: number, insurance: number) {
  // 자동차세 (비영업용 승용차 기준)
  let taxPerCC = 0;
  if (cc <= 1000) taxPerCC = 80;
  else if (cc <= 1600) taxPerCC = 140;
  else if (cc <= 2000) taxPerCC = 200;
  else if (cc <= 2500) taxPerCC = 220;
  else taxPerCC = 240;
  const carTax = Math.round(cc * taxPerCC * 1.3); // 지방교육세 30% 포함
  const fuelAnnual = Math.round((km / fuelEff) * fuelPrice);
  const maintenanceAnnual = Math.round(km * 50); // 평균 주행거리당 정비비 약 50원/km
  const total = carTax + fuelAnnual + insurance * 10000 + maintenanceAnnual;
  return {
    carTax: carTax.toLocaleString(),
    fuel: fuelAnnual.toLocaleString(),
    insurance: (insurance * 10000).toLocaleString(),
    maintenance: maintenanceAnnual.toLocaleString(),
    total: total.toLocaleString(),
    monthly: Math.round(total / 12).toLocaleString(),
  };
}

export default function CarPage() {
  const [cc, setCc] = useState(1600);
  const [km, setKm] = useState(15000);
  const [fuelEff, setFuelEff] = useState(12);
  const [fuelPrice, setFuelPrice] = useState(1700);
  const [insurance, setInsurance] = useState(80); // 만원 단위

  const [result, setResult] = useState<ReturnType<typeof calcCar> | null>(null);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="car" title="자동차 유지비" />
        <p className="muted">연간 자동차 유지비를 추정합니다. (비영업용 승용차 기준)</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>배기량 (cc)</label>
          <input type="number" step={100} min={500} max={6000} value={cc}
            onChange={(e) => setCc(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>연간 주행거리 (km)</label>
          <input type="number" step={1000} min={0} value={km}
            onChange={(e) => setKm(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>연비 (km/L)</label>
          <input type="number" step={0.5} min={1} max={50} value={fuelEff}
            onChange={(e) => setFuelEff(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>연료 단가 (원/L)</label>
          <input type="number" step={10} min={500} value={fuelPrice}
            onChange={(e) => setFuelPrice(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>연간 보험료 (만원)</label>
          <input type="number" step={5} min={0} value={insurance}
            onChange={(e) => setInsurance(Number(e.target.value))} />
        </div>
        <button className="button" onClick={() => setResult(calcCar(cc, km, fuelEff, fuelPrice, insurance))}>계산하기</button>
        {result && (
          <div className="result">
            <div className="result-big">{result.total}원</div>
            <div style={{ textAlign: "center", color: "var(--muted)", marginBottom: 16 }}>연간 유지비 (월 {result.monthly}원)</div>
            <div className="result-grid">
              <div className="result-item"><div className="label">자동차세</div><div className="value">{result.carTax}원</div></div>
              <div className="result-item"><div className="label">주유비</div><div className="value">{result.fuel}원</div></div>
              <div className="result-item"><div className="label">보험료</div><div className="value">{result.insurance}원</div></div>
              <div className="result-item"><div className="label">정비비 (추정)</div><div className="value">{result.maintenance}원</div></div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 12 }}>
              * 정비비는 주행거리 기준 평균값이며 차량 상태에 따라 다릅니다.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
