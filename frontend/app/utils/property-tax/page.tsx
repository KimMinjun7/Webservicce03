"use client";

import { useState } from "react";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";

function calcAcquisitionTax(price: number, homes: number, isAdjusted: boolean) {
  // 주택 취득세 (2024)
  let rate = 0;
  if (homes === 1) {
    if (price <= 600000000) rate = 0.01;
    else if (price <= 900000000) rate = 0.02;
    else rate = 0.03;
  } else if (homes === 2) {
    rate = isAdjusted ? 0.08 : 0.01;
  } else {
    rate = isAdjusted ? 0.12 : 0.08;
  }
  const acqTax = Math.round(price * rate);
  const localEdu = Math.round(acqTax * 0.1);
  const agriSpecial = Math.round(price * 0.002); // 농특세
  return {
    rate: (rate * 100).toFixed(1),
    acqTax: acqTax.toLocaleString(),
    localEdu: localEdu.toLocaleString(),
    agriSpecial: price <= 600000000 ? "비과세" : agriSpecial.toLocaleString() + "원",
    total: (acqTax + localEdu + (price > 600000000 ? agriSpecial : 0)).toLocaleString(),
  };
}

function calcPropertyTax(publicPrice: number) {
  // 재산세 (주택 공시가격 기준)
  const base = publicPrice * 0.6; // 공정시장가액비율 60%
  let tax = 0;
  if (base <= 60000000) tax = base * 0.001;
  else if (base <= 150000000) tax = 60000 + (base - 60000000) * 0.0015;
  else if (base <= 300000000) tax = 195000 + (base - 150000000) * 0.0025;
  else tax = 570000 + (base - 300000000) * 0.004;
  const cityTax = Math.round(tax * 0.14); // 도시지역분
  const eduTax = Math.round(tax * 0.2);   // 지방교육세
  const total = Math.round(tax + cityTax + eduTax);
  return {
    base: Math.round(base).toLocaleString(),
    propertyTax: Math.round(tax).toLocaleString(),
    cityTax: cityTax.toLocaleString(),
    eduTax: eduTax.toLocaleString(),
    total: total.toLocaleString(),
  };
}

type Tab = "acquisition" | "property";

export default function PropertyTaxPage() {
  const [tab, setTab] = useState<Tab>("acquisition");
  const [price, setPrice] = useState(500000000);
  const [homes, setHomes] = useState(1);
  const [isAdjusted, setIsAdjusted] = useState(false);
  const [publicPrice, setPublicPrice] = useState(300000000);
  const [acqResult, setAcqResult] = useState<ReturnType<typeof calcAcquisitionTax> | null>(null);
  const [propResult, setPropResult] = useState<ReturnType<typeof calcPropertyTax> | null>(null);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="building" title="부동산 세금" />
        <p className="muted">취득세·재산세를 간편하게 계산합니다. (2024년 기준)</p>
      </div>
      <div className="panel">
        <div className="tab-group">
          <button className={`tab-btn${tab === "acquisition" ? " active" : ""}`} onClick={() => setTab("acquisition")}>취득세</button>
          <button className={`tab-btn${tab === "property" ? " active" : ""}`} onClick={() => setTab("property")}>재산세</button>
        </div>

        {tab === "acquisition" && (
          <>
            <div className="row">
              <label>주택 취득가액 (원)</label>
              <input type="number" step={10000000} min={0} value={price}
                onChange={(e) => setPrice(Number(e.target.value))} />
              <span className="muted" style={{ fontSize: "0.88rem" }}>{price.toLocaleString()}원</span>
            </div>
            <div className="row">
              <label>취득 후 보유 주택 수</label>
              <select value={homes} onChange={(e) => setHomes(Number(e.target.value))}>
                <option value={1}>1주택</option>
                <option value={2}>2주택</option>
                <option value={3}>3주택 이상</option>
              </select>
            </div>
            {homes > 1 && (
              <div className="row">
                <label>
                  <input type="checkbox" checked={isAdjusted}
                    onChange={(e) => setIsAdjusted(e.target.checked)} style={{ marginRight: 6 }} />
                  조정대상지역 내 취득
                </label>
              </div>
            )}
            <button className="button" onClick={() => setAcqResult(calcAcquisitionTax(price, homes, isAdjusted))}>계산하기</button>
            {acqResult && (
              <div className="result">
                <div className="result-big">{acqResult.total}원</div>
                <div style={{ textAlign: "center", color: "var(--muted)", marginBottom: 16 }}>총 취득세 ({acqResult.rate}%)</div>
                <div className="result-grid">
                  <div className="result-item"><div className="label">취득세</div><div className="value">{acqResult.acqTax}원</div></div>
                  <div className="result-item"><div className="label">지방교육세</div><div className="value">{acqResult.localEdu}원</div></div>
                  <div className="result-item"><div className="label">농특세</div><div className="value">{acqResult.agriSpecial}</div></div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "property" && (
          <>
            <div className="row">
              <label>주택 공시가격 (원)</label>
              <input type="number" step={10000000} min={0} value={publicPrice}
                onChange={(e) => setPublicPrice(Number(e.target.value))} />
              <span className="muted" style={{ fontSize: "0.88rem" }}>{publicPrice.toLocaleString()}원</span>
            </div>
            <button className="button" onClick={() => setPropResult(calcPropertyTax(publicPrice))}>계산하기</button>
            {propResult && (
              <div className="result">
                <div className="result-big">{propResult.total}원</div>
                <div style={{ textAlign: "center", color: "var(--muted)", marginBottom: 16 }}>연간 재산세 합계</div>
                <div className="result-grid">
                  <div className="result-item"><div className="label">과세표준 (공시가×60%)</div><div className="value">{propResult.base}원</div></div>
                  <div className="result-item"><div className="label">재산세</div><div className="value">{propResult.propertyTax}원</div></div>
                  <div className="result-item"><div className="label">도시지역분</div><div className="value">{propResult.cityTax}원</div></div>
                  <div className="result-item"><div className="label">지방교육세</div><div className="value">{propResult.eduTax}원</div></div>
                </div>
              </div>
            )}
          </>
        )}
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 16 }}>
          * 간이 계산으로 실제 금액과 다를 수 있습니다. 정확한 금액은 관할 세무서에 문의하세요.
        </p>
      </div>
    </main>
  );
}
