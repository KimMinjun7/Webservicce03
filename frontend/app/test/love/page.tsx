"use client";

import { useState } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import PageTitle from "@/components/PageTitle";

function calcLove(name1: string, name2: string) {
  const str = (name1 + name2).split("").map(c => c.charCodeAt(0));
  let hash = str.reduce((acc, v) => ((acc << 5) - acc + v) | 0, 0);
  const score = Math.abs(hash % 41) + 60; // 60~100

  let level = "", desc = "", icon: IconName = "heart", color = "var(--primary)";
  if (score >= 95) { level = "천생연분"; icon = "spark"; color = "#b45309"; desc = "운명적인 만남! 전생에 맺어진 인연입니다."; }
  else if (score >= 85) { level = "최상의 궁합"; icon = "heart"; color = "#dc2626"; desc = "서로를 이해하고 보완하는 완벽한 파트너입니다."; }
  else if (score >= 75) { level = "좋은 궁합"; icon = "gift"; color = "#db2777"; desc = "함께하면 행복한 시간이 많을 것입니다."; }
  else if (score >= 65) { level = "보통 궁합"; icon = "shield"; color = "#ca8a04"; desc = "노력하면 좋은 관계를 만들 수 있습니다."; }
  else { level = "노력 필요"; icon = "wave"; color = "#2563eb"; desc = "서로의 다름을 이해하는 과정이 필요합니다."; }

  return { score, level, desc, icon, color };
}

export default function LovePage() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcLove> | null>(null);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="heart" title="연애 궁합" />
        <p className="muted">이름으로 연애 궁합을 확인합니다. 재미용 테스트로 즐겨주세요.</p>
      </div>
      <div className="panel">
        <div className="row">
          <label>첫 번째 이름</label>
          <input type="text" value={name1} onChange={(e) => setName1(e.target.value)} placeholder="이름 입력" maxLength={20} />
        </div>
        <div className="row">
          <label>두 번째 이름</label>
          <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} placeholder="이름 입력" maxLength={20} />
        </div>
        <button className="button" onClick={() => { if(name1 && name2) setResult(calcLove(name1, name2)); }}
          disabled={!name1.trim() || !name2.trim()}>
          궁합 확인
        </button>
        {result && (
          <div className="result" style={{ textAlign: "center" }}>
            <div className="result-icon" style={{ color: result.color as string }}>
              <Icon name={result.icon} size={40} />
            </div>
            <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--primary)", marginBottom: 4 }}>
              {result.score}점
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>{result.level}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.97rem", marginBottom: 16 }}>{result.desc}</div>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
              <div className="quiz-bar-bg">
                <div className="quiz-bar-fill" style={{ width: `${result.score}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--muted)", marginTop: 4 }}>
                <span>{name1}</span><span>{name2}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
