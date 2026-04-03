"use client";

import { useState } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import PageTitle from "@/components/PageTitle";

const ANIMALS = [
  { key: "dog", icon: "dog" as IconName, name: "강아지", desc: "충성스럽고 사교적이에요. 주변 사람들을 편안하게 해주는 따뜻한 성격을 가졌습니다." },
  { key: "cat", icon: "cat" as IconName, name: "고양이", desc: "독립적이고 섬세해요. 자신만의 기준이 뚜렷하고 좋아하는 것에 깊이 집중합니다." },
  { key: "rabbit", icon: "rabbit" as IconName, name: "토끼", desc: "온화하고 감수성이 풍부해요. 평화를 좋아하고 사랑하는 사람에게 헌신적입니다." },
  { key: "fox", icon: "fox" as IconName, name: "여우", desc: "영리하고 매력적이에요. 상황 파악이 빠르고 어디서든 돋보이는 존재입니다." },
  { key: "bear", icon: "bear" as IconName, name: "곰", desc: "든든하고 포용력이 있어요. 느긋하지만 한번 화나면 무서운 참을성 있는 성격입니다." },
  { key: "deer", icon: "deer" as IconName, name: "사슴", desc: "우아하고 감성적이에요. 아름다운 것에 민감하고 예술적 감각이 뛰어납니다." },
  { key: "penguin", icon: "penguin" as IconName, name: "펭귄", desc: "의리 있고 부지런해요. 집단 속에서 역할을 다하며 가족을 소중히 여깁니다." },
  { key: "hamster", icon: "hamster" as IconName, name: "햄스터", desc: "귀엽고 활동적이에요. 작지만 에너지가 넘치고 자기 영역에서는 최선을 다합니다." },
];

type AnimalKey = typeof ANIMALS[number]["key"];

const QUESTIONS = [
  {
    q: "주말 오전, 이상적인 시간 보내기는?",
    options: [
      { text: "친구들과 함께 브런치", scores: { dog: 2, penguin: 1, hamster: 1 } },
      { text: "혼자 카페에서 책 읽기", scores: { cat: 2, deer: 1, rabbit: 1 } },
      { text: "늦잠 자고 여유롭게", scores: { bear: 2, cat: 1 } },
      { text: "새로운 장소 탐방", scores: { fox: 2, hamster: 1, deer: 1 } },
    ],
  },
  {
    q: "친구가 고민을 털어놓을 때 나는?",
    options: [
      { text: "끝까지 들어주고 공감한다", scores: { dog: 2, rabbit: 2 } },
      { text: "해결책을 바로 제시한다", scores: { fox: 2, penguin: 1 } },
      { text: "조용히 곁에 있어준다", scores: { deer: 2, bear: 1, cat: 1 } },
      { text: "재밌는 이야기로 분위기를 바꾼다", scores: { hamster: 2, dog: 1 } },
    ],
  },
  {
    q: "나를 가장 잘 표현하는 단어는?",
    options: [
      { text: "따뜻함", scores: { dog: 2, rabbit: 2, penguin: 1 } },
      { text: "독립적", scores: { cat: 2, fox: 1 } },
      { text: "신중함", scores: { bear: 2, deer: 1 } },
      { text: "활발함", scores: { hamster: 2, fox: 1, dog: 1 } },
    ],
  },
  {
    q: "갑작스러운 변화가 생겼을 때?",
    options: [
      { text: "유연하게 적응한다", scores: { fox: 2, hamster: 1, dog: 1 } },
      { text: "계획을 다시 세운다", scores: { penguin: 2, bear: 1 } },
      { text: "잠깐 혼자 생각하고 싶다", scores: { cat: 2, deer: 1, rabbit: 1 } },
      { text: "주변에 도움을 요청한다", scores: { dog: 2, rabbit: 1 } },
    ],
  },
  {
    q: "여행 스타일은?",
    options: [
      { text: "꼼꼼한 계획표 대로", scores: { penguin: 2, bear: 1 } },
      { text: "즉흥적으로, 바람대로", scores: { fox: 2, hamster: 1 } },
      { text: "자연 속 조용한 여행", scores: { deer: 2, rabbit: 2 } },
      { text: "친구들과 활동적으로", scores: { dog: 2, hamster: 1 } },
    ],
  },
];

export default function AnimalPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<AnimalKey, number>>(
    Object.fromEntries(ANIMALS.map(a => [a.key, 0])) as Record<AnimalKey, number>
  );
  const [result, setResult] = useState<typeof ANIMALS[number] | null>(null);

  const choose = (optionScores: Record<string, number>) => {
    const next = { ...scores };
    for (const [k, v] of Object.entries(optionScores)) {
      next[k as AnimalKey] = (next[k as AnimalKey] || 0) + v;
    }
    setScores(next);
    if (step + 1 >= QUESTIONS.length) {
      const winner = Object.entries(next).sort((a, b) => b[1] - a[1])[0][0];
      setResult(ANIMALS.find(a => a.key === winner) ?? ANIMALS[0]);
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setScores(Object.fromEntries(ANIMALS.map(a => [a.key, 0])) as Record<AnimalKey, number>);
    setResult(null);
  };

  const progress = Math.round((step / QUESTIONS.length) * 100);

  return (
    <main className="tool-page">
      <div className="page-header">
        <Link href="/" className="back-link">← 홈으로</Link>
        <PageTitle icon="paw" title="닮은 동물 찾기" />
        <p className="muted">5문항으로 나와 닮은 동물을 찾아봅니다.</p>
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
                <button key={i} className="quiz-option" onClick={() => choose(opt.scores)}>
                  {opt.text}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div className="result-icon">
              <Icon name={result.icon} size={42} />
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", marginBottom: 12 }}>
              나는 {result.name}!
            </div>
            <div className="result" style={{ textAlign: "left", marginBottom: 20 }}>{result.desc}</div>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 16 }}>
              다른 동물들도 궁금하다면?
            </p>
            <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 16 }}>
              {ANIMALS.map(a => (
                <div key={a.key} style={{ textAlign:"center", padding:"8px 4px", background: a.key === result.key ? "var(--bg-accent)" : "#fff",
                  border:"1px solid var(--border)", borderRadius:10 }}>
                  <div className="result-icon-sm">
                    <Icon name={a.icon} size={18} />
                  </div>
                  <div style={{ fontSize:"0.82rem", fontWeight:600 }}>{a.name}</div>
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
