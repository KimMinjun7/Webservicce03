"use client";

import { useState } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import PageTitle from "@/components/PageTitle";

type Category = "length" | "weight" | "temp" | "speed" | "area";

const UNITS: Record<Category, { label: string; units: { key: string; name: string; toBase: (v: number) => number; fromBase: (v: number) => number }[] }> = {
  length: {
    label: "길이",
    units: [
      { key: "mm", name: "밀리미터 (mm)", toBase: v => v / 1000, fromBase: v => v * 1000 },
      { key: "cm", name: "센티미터 (cm)", toBase: v => v / 100, fromBase: v => v * 100 },
      { key: "m", name: "미터 (m)", toBase: v => v, fromBase: v => v },
      { key: "km", name: "킬로미터 (km)", toBase: v => v * 1000, fromBase: v => v / 1000 },
      { key: "in", name: "인치 (in)", toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { key: "ft", name: "피트 (ft)", toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { key: "mi", name: "마일 (mi)", toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
    ],
  },
  weight: {
    label: "무게",
    units: [
      { key: "mg", name: "밀리그램 (mg)", toBase: v => v / 1e6, fromBase: v => v * 1e6 },
      { key: "g", name: "그램 (g)", toBase: v => v / 1000, fromBase: v => v * 1000 },
      { key: "kg", name: "킬로그램 (kg)", toBase: v => v, fromBase: v => v },
      { key: "t", name: "톤 (t)", toBase: v => v * 1000, fromBase: v => v / 1000 },
      { key: "lb", name: "파운드 (lb)", toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
      { key: "oz", name: "온스 (oz)", toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
    ],
  },
  temp: {
    label: "온도",
    units: [
      { key: "c", name: "섭씨 (°C)", toBase: v => v, fromBase: v => v },
      { key: "f", name: "화씨 (°F)", toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
      { key: "k", name: "켈빈 (K)", toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
  },
  speed: {
    label: "속도",
    units: [
      { key: "ms", name: "m/s", toBase: v => v, fromBase: v => v },
      { key: "kmh", name: "km/h", toBase: v => v / 3.6, fromBase: v => v * 3.6 },
      { key: "mph", name: "mph", toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      { key: "knot", name: "노트 (knot)", toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    ],
  },
  area: {
    label: "넓이",
    units: [
      { key: "m2", name: "㎡", toBase: v => v, fromBase: v => v },
      { key: "km2", name: "km²", toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { key: "py", name: "평", toBase: v => v * 3.30579, fromBase: v => v / 3.30579 },
      { key: "acre", name: "에이커", toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
    ],
  },
};

const CATEGORY_LABELS: [Category, string, IconName][] = [
  ["length", "길이", "ruler"],
  ["weight", "무게", "scale"],
  ["temp", "온도", "thermometer"],
  ["speed", "속도", "rocket"],
  ["area", "넓이", "drafting"],
];

export default function UnitPage() {
  const [cat, setCat] = useState<Category>("length");
  const [value, setValue] = useState(1);
  const [fromUnit, setFromUnit] = useState("m");

  const current = UNITS[cat];
  const from = current.units.find(u => u.key === fromUnit) ?? current.units[0];
  const base = from.toBase(value);

  const fmt = (n: number) => {
    if (Math.abs(n) >= 1e9) return n.toExponential(4);
    if (Math.abs(n) >= 0.001 || n === 0) return parseFloat(n.toPrecision(7)).toString();
    return n.toExponential(4);
  };

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="ruler" title="단위 변환" />
        <p className="muted">길이·무게·온도·속도·넓이를 변환합니다.</p>
      </div>
      <div className="panel">
        <div className="tab-group">
          {CATEGORY_LABELS.map(([key, label, icon]) => (
            <button key={key} className={`tab-btn${cat === key ? " active" : ""}`}
              onClick={() => { setCat(key); setFromUnit(UNITS[key].units[0].key); }}>
              <Icon name={icon} size={14} />
              {label}
            </button>
          ))}
        </div>
        <div className="row">
          <label>변환할 값</label>
          <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>단위 선택</label>
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
            {current.units.map(u => <option key={u.key} value={u.key}>{u.name}</option>)}
          </select>
        </div>
        <div className="result" style={{ marginTop: 16 }}>
          {current.units.filter(u => u.key !== fromUnit).map(u => (
            <div key={u.key} className="result-item" style={{ marginBottom: 8 }}>
              <div className="label">{u.name}</div>
              <div className="value">{fmt(u.fromBase(base))}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
