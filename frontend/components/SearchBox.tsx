"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/Icon";

const ROUTES: { keyword: string; href: string }[] = [
  { keyword: "음력", href: "/utils/lunar-solar" },
  { keyword: "양력", href: "/utils/lunar-solar" },
  { keyword: "음력변환", href: "/utils/lunar-solar" },
  { keyword: "나이", href: "/utils/age" },
  { keyword: "만나이", href: "/utils/age" },
  { keyword: "한국나이", href: "/utils/age" },
  { keyword: "요일", href: "/utils/weekday" },
  { keyword: "무슨요일", href: "/utils/weekday" },
  { keyword: "디데이", href: "/utils/dday" },
  { keyword: "dday", href: "/utils/dday" },
  { keyword: "d-day", href: "/utils/dday" },
  { keyword: "띠", href: "/utils/zodiac" },
  { keyword: "동물띠", href: "/utils/zodiac" },
  { keyword: "퍼센트", href: "/utils/percent" },
  { keyword: "비율", href: "/utils/percent" },
  { keyword: "bmi", href: "/utils/bmi" },
  { keyword: "체질량", href: "/utils/bmi" },
  { keyword: "연봉", href: "/utils/salary" },
  { keyword: "실수령", href: "/utils/salary" },
  { keyword: "단위", href: "/utils/unit" },
  { keyword: "단위변환", href: "/utils/unit" },
  { keyword: "대출", href: "/utils/loan" },
  { keyword: "이자", href: "/utils/loan" },
  { keyword: "전기", href: "/utils/electricity" },
  { keyword: "전기요금", href: "/utils/electricity" },
  { keyword: "자동차", href: "/utils/car" },
  { keyword: "유지비", href: "/utils/car" },
  { keyword: "부동산", href: "/utils/property-tax" },
  { keyword: "취득세", href: "/utils/property-tax" },
  { keyword: "번역", href: "/ai/translate" },
  { keyword: "요약", href: "/ai/summarize" },
  { keyword: "다듬기", href: "/ai/refine" },
  { keyword: "문장", href: "/ai/refine" },
  { keyword: "mbti", href: "/test/mbti" },
  { keyword: "궁합", href: "/test/love" },
  { keyword: "동물", href: "/test/animal" },
  { keyword: "심리", href: "/test/psychology" },
  { keyword: "연말정산", href: "https://mob.tbys.hometax.go.kr/jsonAction.do?actionId=ATEYSEAA001M01" },
  { keyword: "정부지원금", href: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do" },
  { keyword: "복지", href: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do" },
];

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSearch = () => {
    const q = query.trim().toLowerCase().replace(/\s/g, "");
    if (!q) return;
    const found = ROUTES.find((r) => q.includes(r.keyword.replace(/\s/g, "")));
    if (!found) { router.push("/"); return; }
    if (found.href.startsWith("http")) { window.open(found.href, "_blank", "noopener,noreferrer"); return; }
    router.push(found.href);
  };

  return (
    <div className="search-box">
      <input
        placeholder="예: 요일 계산, 연봉 실수령, MBTI, 번역..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
      />
      <button onClick={onSearch}>
        <Icon name="search" size={16} />
        검색
      </button>
    </div>
  );
}
