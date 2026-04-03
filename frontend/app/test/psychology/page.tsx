"use client";

import { useState } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import PageTitle from "@/components/PageTitle";

const RESULTS = [
  { key: "A", icon: "wave" as IconName, title: "자유로운 영혼", color: "#3b82f6",
    desc: "변화를 두려워하지 않고 항상 새로운 것을 추구합니다. 창의적이고 호기심이 많으며, 틀을 깨는 것을 즐깁니다. 때로는 계획 없이 흘러가도 괜찮다고 생각하는 낙천주의자입니다." },
  { key: "B", icon: "tree" as IconName, title: "안정의 수호자", color: "#059669",
    desc: "믿음직하고 성실합니다. 가족과 가까운 사람들을 위해 헌신하며, 작은 것에서 행복을 찾습니다. 감정보다 이성을 앞세우지만 속으로는 따뜻한 마음을 품고 있습니다." },
  { key: "C", icon: "flame" as IconName, title: "열정의 도전자", color: "#dc2626",
    desc: "목표를 향해 끊임없이 달려가는 에너지가 넘칩니다. 경쟁을 즐기고 결과로 말합니다. 때로는 무모해 보여도 그 열정이 주변 사람들에게 동력이 됩니다." },
  { key: "D", icon: "moon" as IconName, title: "깊은 사색가", color: "#7c3aed",
    desc: "표면보다 깊은 곳에서 세상을 바라봅니다. 감수성이 풍부하고 예술적 감각이 있으며, 혼자만의 시간에서 충전합니다. 말보다 행동과 글로 자신을 더 잘 표현합니다." },
];

const QUESTIONS = [
  {
    q: "갑자기 일주일 휴가가 생겼다면?",
    options: [
      { text: "즉흥적으로 여행을 떠난다", score: "A" },
      { text: "집에서 푹 쉬고 가족과 시간을 보낸다", score: "B" },
      { text: "그동안 못 했던 일을 몰아서 한다", score: "C" },
      { text: "혼자 독서하거나 취미에 몰두한다", score: "D" },
    ],
  },
  {
    q: "당신의 방을 표현한다면?",
    options: [
      { text: "자주 바뀌는 인테리어, 새것으로 가득", score: "A" },
      { text: "편안하고 따뜻한 분위기", score: "B" },
      { text: "목표, 계획표, 동기부여 문구가 붙어있다", score: "C" },
      { text: "어둡고 조용하며 나만의 세계가 있다", score: "D" },
    ],
  },
  {
    q: "오랜 친구를 만났을 때 주로 하는 말은?",
    options: [
      { text: "야 우리 어디 가자, 뭔가 해보자!", score: "A" },
      { text: "요즘 어떻게 지내? 밥은 잘 먹고 다니?", score: "B" },
      { text: "나 요즘 이런 거 하고 있어, 너는?", score: "C" },
      { text: "그냥 같이 있어도 편한 사이잖아", score: "D" },
    ],
  },
  {
    q: "중요한 결정을 앞두고 나는?",
    options: [
      { text: "일단 해보고 나서 생각한다", score: "A" },
      { text: "주변 사람들의 의견을 충분히 듣는다", score: "B" },
      { text: "장단점 분석표를 만들어 비교한다", score: "C" },
      { text: "혼자 오래 생각하고 직관에 따른다", score: "D" },
    ],
  },
  {
    q: "나에게 가장 행복한 순간은?",
    options: [
      { text: "처음 가는 낯선 장소에서 새로운 경험을 할 때", score: "A" },
      { text: "소중한 사람들과 평범한 일상을 보낼 때", score: "B" },
      { text: "목표를 달성하거나 인정받을 때", score: "C" },
      { text: "깊은 생각에 빠져 무언가를 깨달을 때", score: "D" },
    ],
  },
  {
    q: "스트레스 해소 방법은?",
    options: [
      { text: "밖에 나가서 활발하게 움직인다", score: "A" },
      { text: "맛있는 음식을 먹거나 누군가와 이야기한다", score: "B" },
      { text: "운동이나 생산적인 무언가에 집중한다", score: "C" },
      { text: "음악 듣거나 일기를 쓰며 혼자 정리한다", score: "D" },
    ],
  },
];

export default function PsychologyPage() {
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({ A:0, B:0, C:0, D:0 });
  const [result, setResult] = useState<typeof RESULTS[number] | null>(null);

  const choose = (score: string) => {
    const next = { ...counts, [score]: counts[score] + 1 };
    setCounts(next);
    if (step + 1 >= QUESTIONS.length) {
      const winner = Object.entries(next).sort((a, b) => b[1] - a[1])[0][0];
      setResult(RESULTS.find(r => r.key === winner) ?? RESULTS[0]);
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => { setStep(0); setCounts({ A:0,B:0,C:0,D:0 }); setResult(null); };
  const progress = Math.round((step / QUESTIONS.length) * 100);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="spark" title="심리 테스트" />
        <p className="muted">6문항으로 나의 숨겨진 성격을 알아봅니다.</p>
      </div>
      <div className="panel">
        {!result ? (
          <>
            <div className="quiz-progress">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--muted)" }}>
                <span>질문 {step + 1} / {QUESTIONS.length}</span>
                <span>{progress}%</span>
              </div>
              <div className="quiz-bar-bg"><div className="quiz-bar-fill" style={{ width: `${progress}%` }} /></div>
            </div>
            <div className="quiz-question">{QUESTIONS[step].q}</div>
            <div className="quiz-options">
              {QUESTIONS[step].options.map((opt, i) => (
                <button key={i} className="quiz-option" onClick={() => choose(opt.score)}>
                  {opt.text}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div className="result-icon" style={{ color: result.color }}>
              <Icon name={result.icon} size={38} />
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: result.color, marginBottom: 16 }}>{result.title}</div>
            <div className="result" style={{ textAlign: "left", marginBottom: 20 }}>{result.desc}</div>
            <div className="result-grid" style={{ marginBottom: 16 }}>
              {RESULTS.map(r => (
                <div key={r.key} className="result-item" style={{ textAlign:"center",
                  background: r.key === result.key ? "#eff6ff" : "#fff" }}>
                  <div className="result-icon-sm" style={{ color: r.color, background: `${r.color}14` }}>
                    <Icon name={r.icon} size={20} />
                  </div>
                  <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{r.title}</div>
                  <div style={{ fontSize:"0.85rem", color:"var(--muted)" }}>{counts[r.key]}표</div>
                </div>
              ))}
            </div>
            <button className="button" onClick={reset}>다시 테스트하기</button>
          </div>
        )}
      </div>
    </main>
  );
}
