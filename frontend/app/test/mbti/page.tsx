"use client";

import { useState } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import PageTitle from "@/components/PageTitle";

const QUESTIONS = [
  { q: "파티나 모임에서 나는...", a: "새로운 사람을 만나면 에너지가 생긴다", b: "어느 순간 혼자 있고 싶어진다", dim: "EI" },
  { q: "주말에 혼자 있을 때 나는...", a: "친구에게 연락해서 약속을 잡는다", b: "집에서 혼자 충전하는 게 좋다", dim: "EI" },
  { q: "새로운 아이디어를 접할 때 나는...", a: "현실적으로 적용 가능한지 먼저 생각한다", b: "가능성과 미래 잠재력에 흥분한다", dim: "SN" },
  { q: "정보를 처리할 때 나는...", a: "구체적인 사실과 데이터를 중시한다", b: "전체적인 패턴과 의미를 찾는다", dim: "SN" },
  { q: "어떤 것을 배울 때 나는...", a: "실용적이고 검증된 방법을 선호한다", b: "이론적 배경과 개념부터 이해하려 한다", dim: "SN" },
  { q: "친구가 고민을 털어놓을 때 나는...", a: "해결책을 먼저 제시한다", b: "먼저 충분히 들어주고 공감한다", dim: "TF" },
  { q: "결정을 내릴 때 나는...", a: "논리와 객관적 기준을 따른다", b: "관계와 감정의 영향을 고려한다", dim: "TF" },
  { q: "비판을 받을 때 나는...", a: "내용이 논리적이면 수용한다", b: "어떻게 말했는지가 중요하다", dim: "TF" },
  { q: "여행 계획을 세울 때 나는...", a: "일정, 숙소, 동선을 미리 정한다", b: "큰 그림만 잡고 즉흥적으로 즐긴다", dim: "JP" },
  { q: "마감 기한이 있을 때 나는...", a: "여유 있게 미리 끝낸다", b: "마감이 다가와야 집중이 잘 된다", dim: "JP" },
  { q: "내 책상/방은...", a: "정리되어 있고 물건 위치가 정해져 있다", b: "창의적 혼돈 상태지만 내가 찾을 수 있다", dim: "JP" },
  { q: "일을 할 때 나는...", a: "계획대로 체계적으로 진행한다", b: "상황에 맞게 유연하게 대처한다", dim: "JP" },
];

const TYPES: Record<string, { title: string; desc: string; icon: IconName }> = {
  INTJ: { icon: "building", title: "전략가", desc: "독창적이고 결단력 있는 전략적 사고자. 목표를 향해 체계적으로 나아갑니다." },
  INTP: { icon: "microscope", title: "논리술사", desc: "지식에 목마른 혁신적인 발명가. 독창적이고 논리적인 해결책을 찾습니다." },
  ENTJ: { icon: "crown", title: "통솔자", desc: "대담하고 창의적인 리더. 길이 없으면 직접 만듭니다." },
  ENTP: { icon: "bulb", title: "변론가", desc: "빠른 두뇌의 호기심 많은 발명가. 지적 도전을 즐깁니다." },
  INFJ: { icon: "spark", title: "옹호자", desc: "사려 깊고 원칙적인 비전가. 사람들을 돕기 위해 지치지 않습니다." },
  INFP: { icon: "palette", title: "중재자", desc: "시적이고 친절한 이상주의자. 선한 것에서 최선을 봅니다." },
  ENFJ: { icon: "heart", title: "선도자", desc: "카리스마 넘치는 영감의 원천. 사람들이 잠재력을 발휘하도록 이끕니다." },
  ENFP: { icon: "butterfly", title: "활동가", desc: "열정적이고 창의적인 사교가. 어디서나 미소와 희망을 줍니다." },
  ISTJ: { icon: "checkSquare", title: "현실주의자", desc: "신뢰할 수 있는 책임감의 현실주의자. 약속을 반드시 지킵니다." },
  ISFJ: { icon: "shield", title: "수호자", desc: "헌신적이고 따뜻한 보호자. 사랑하는 사람을 지킵니다." },
  ESTJ: { icon: "gear", title: "경영자", desc: "탁월한 관리자. 규칙과 질서로 사람들을 하나로 묶습니다." },
  ESFJ: { icon: "gift", title: "집정관", desc: "돌봄과 사교성의 달인. 주변을 항상 따뜻하게 만듭니다." },
  ISTP: { icon: "wrench", title: "장인", desc: "대담하고 실용적인 실험가. 온갖 도구를 자유자재로 다룹니다." },
  ISFP: { icon: "flower", title: "모험가", desc: "유연하고 매력적인 예술가. 항상 새것을 탐험하려 합니다." },
  ESTP: { icon: "bolt", title: "사업가", desc: "스마트하고 에너지 넘치는 인식가. 위험도 즐깁니다." },
  ESFP: { icon: "theater", title: "연예인", desc: "즉흥적이고 활발한 엔터테이너. 삶을 즐기게 만드는 사람." },
};

export default function MbtiPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [result, setResult] = useState<string | null>(null);

  const answer = (isA: boolean) => {
    const q = QUESTIONS[step];
    const [pos, neg] = isA
      ? [q.dim[0] as keyof typeof scores, q.dim[1] as keyof typeof scores]
      : [q.dim[1] as keyof typeof scores, q.dim[0] as keyof typeof scores];
    const next = { ...scores, [pos]: scores[pos] + 1 };
    setScores(next);
    if (step + 1 >= QUESTIONS.length) {
      const type =
        (next.E >= next.I ? "E" : "I") +
        (next.S >= next.N ? "S" : "N") +
        (next.T >= next.F ? "T" : "F") +
        (next.J >= next.P ? "J" : "P");
      setResult(type);
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => { setStep(0); setScores({ E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0 }); setResult(null); };

  const progress = Math.round((step / QUESTIONS.length) * 100);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="brain" title="MBTI 테스트" />
        <p className="muted">12문항으로 나의 성격 유형을 알아봅니다.</p>
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
              <button className="quiz-option" onClick={() => answer(true)}>A. {QUESTIONS[step].a}</button>
              <button className="quiz-option" onClick={() => answer(false)}>B. {QUESTIONS[step].b}</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div className="result-icon">
              <Icon name={TYPES[result]?.icon ?? "brain"} size={38} />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", marginBottom: 4 }}>{result}</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 12 }}>{TYPES[result]?.title}</div>
            <div className="result" style={{ textAlign: "left", marginBottom: 16 }}>{TYPES[result]?.desc}</div>
            <div className="result-grid" style={{ marginBottom: 16 }}>
              {(["EI","SN","TF","JP"] as const).map(dim => {
                const [a,b] = [dim[0] as keyof typeof scores, dim[1] as keyof typeof scores];
                const total = scores[a] + scores[b];
                const pct = total > 0 ? Math.round(scores[a] / total * 100) : 50;
                return (
                  <div key={dim} className="result-item">
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontWeight:700, color: result.includes(a) ? "var(--primary)" : "var(--muted)" }}>{a}</span>
                      <span style={{ fontWeight:700, color: result.includes(b) ? "var(--primary)" : "var(--muted)" }}>{b}</span>
                    </div>
                    <div className="quiz-bar-bg">
                      <div className="quiz-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ textAlign:"center", fontSize:"0.8rem", color:"var(--muted)", marginTop:2 }}>{pct}% {a} / {100-pct}% {b}</div>
                  </div>
                );
              })}
            </div>
            <button className="button" onClick={reset}>다시 테스트하기</button>
          </div>
        )}
      </div>
    </main>
  );
}
