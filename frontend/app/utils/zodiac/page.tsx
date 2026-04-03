"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";

const ZODIAC = [
  { animal: "쥐", years: [2020, 2008, 1996, 1984, 1972, 1960] },
  { animal: "소", years: [2021, 2009, 1997, 1985, 1973, 1961] },
  { animal: "호랑이", years: [2022, 2010, 1998, 1986, 1974, 1962] },
  { animal: "토끼", years: [2023, 2011, 1999, 1987, 1975, 1963] },
  { animal: "용", years: [2024, 2012, 2000, 1988, 1976, 1964] },
  { animal: "뱀", years: [2025, 2013, 2001, 1989, 1977, 1965] },
  { animal: "말", years: [2026, 2014, 2002, 1990, 1978, 1966] },
  { animal: "양", years: [2027, 2015, 2003, 1991, 1979, 1967] },
  { animal: "원숭이", years: [2028, 2016, 2004, 1992, 1980, 1968] },
  { animal: "닭", years: [2029, 2017, 2005, 1993, 1981, 1969] },
  { animal: "개", years: [2030, 2018, 2006, 1994, 1982, 1970] },
  { animal: "돼지", years: [2031, 2019, 2007, 1995, 1983, 1971] },
];

function getZodiac(year: number) {
  const idx = ((year - 4) % 12 + 12) % 12;
  return ZODIAC[idx];
}

export default function ZodiacPage() {
  const [year, setYear] = useState(new Date().getFullYear() - 30);
  const [result, setResult] = useState<(typeof ZODIAC)[0] | null>(null);

  const onCalc = () => {
    if (year < 1900 || year > 2100) return;
    setResult(getZodiac(year));
  };

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="badge" title="띠 계산" />
        <p className="muted">생년으로 동물띠를 확인합니다.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>태어난 연도</label>
          <input
            type="number"
            min={1900} max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            placeholder="예: 1990"
          />
        </div>
        <button className="button" onClick={onCalc}>띠 확인</button>
        {result && (
          <div className="result">
            <div className="result-big" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <span className="title-icon"><Icon name="badge" size={20} /></span>
              {result.animal}띠
            </div>
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.88rem", marginTop: 8 }}>
              같은 띠: {result.years.filter(y => y >= 1920).join("년 · ")}년
            </div>
          </div>
        )}
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>전체 띠 목록</p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {ZODIAC.map((z) => (
            <div key={z.animal} className="result-item" style={{ textAlign: "center" }}>
              <div className="result-icon-sm"><Icon name="badge" size={18} /></div>
              <div style={{ fontWeight: 700 }}>{z.animal}띠</div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{z.years[1]}년생</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
