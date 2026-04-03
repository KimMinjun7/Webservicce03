import SearchBox from "@/components/SearchBox";
import Icon from "@/components/Icon";
import ToolCard from "@/components/ToolCard";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <h1>검색 한 번으로, 바로 해결</h1>
        <p>계산기 · 변환기 · AI 도구 · 재미 테스트를 한 곳에서</p>
        <SearchBox />
      </section>

      <section className="section" id="date">
        <div className="section-header">
          <span className="category-badge badge-date"><Icon name="date" size={14} />날짜/시간</span>
          <h2>날짜 계산</h2>
        </div>
        <div className="grid">
          <ToolCard icon="moon" title="음력↔양력 변환" desc="명절 날짜, 생일 변환" href="/utils/lunar-solar" />
          <ToolCard icon="cake" title="만 나이 계산" desc="만 나이 · 한국 나이 모두" href="/utils/age" />
          <ToolCard icon="calendarRange" title="D-Day 계산" desc="목표일까지 남은 날짜" href="/utils/dday" />
          <ToolCard icon="calendar" title="요일 계산" desc="특정 날짜가 무슨 요일" href="/utils/weekday" isNew />
          <ToolCard icon="badge" title="띠 계산" desc="생년으로 동물띠 확인" href="/utils/zodiac" isNew />
        </div>
      </section>

      <section className="section" id="calc">
        <div className="section-header">
          <span className="category-badge badge-calc"><Icon name="calculator" size={14} />계산기</span>
          <h2>계산기</h2>
        </div>
        <div className="grid">
          <ToolCard icon="percent" title="퍼센트 계산" desc="비율·할인율·증가율" href="/utils/percent" />
          <ToolCard icon="scale" title="BMI 계산" desc="체질량지수 & 정상 범위" href="/utils/bmi" isNew />
          <ToolCard icon="coins" title="연봉 실수령액" desc="세금 공제 후 실수령액" href="/utils/salary" isNew />
          <ToolCard icon="ruler" title="단위 변환" desc="길이·무게·온도·속도" href="/utils/unit" isNew />
        </div>
      </section>

      <section className="section" id="ai">
        <div className="section-header">
          <span className="category-badge badge-ai"><Icon name="bot" size={14} />AI 도구</span>
          <h2>번역 & 텍스트</h2>
        </div>
        <div className="grid">
          <ToolCard icon="languages" title="번역" desc="한↔영, 일본어, 중국어" href="/ai/translate" />
          <ToolCard icon="fileText" title="문장 요약" desc="긴 글을 핵심만 요약" href="/ai/summarize" isNew />
          <ToolCard icon="wand" title="문장 다듬기" desc="어색한 문장을 자연스럽게" href="/ai/refine" isNew />
        </div>
      </section>

      <section className="section" id="test">
        <div className="section-header">
          <span className="category-badge badge-test"><Icon name="brain" size={14} />테스트</span>
          <h2>재미 테스트</h2>
        </div>
        <div className="grid">
          <ToolCard icon="brain" title="MBTI 테스트" desc="16가지 성격 유형 분석" href="/test/mbti" isNew />
          <ToolCard icon="heart" title="연애 궁합" desc="이름으로 궁합 확인 (재미용)" href="/test/love" isNew />
          <ToolCard icon="paw" title="닮은 동물 찾기" desc="나와 닮은 동물은?" href="/test/animal" isNew />
          <ToolCard icon="spark" title="심리 테스트" desc="선택으로 알아보는 내 성격" href="/test/psychology" isNew />
        </div>
      </section>

      <section className="section" id="life">
        <div className="section-header">
          <span className="category-badge badge-life"><Icon name="coins" size={14} />생활 계산</span>
          <h2>생활 밀착형</h2>
        </div>
        <div className="grid">
          <ToolCard icon="bank" title="대출 이자 계산" desc="원리금 균등 상환 기준" href="/utils/loan" isNew />
          <ToolCard icon="bulb" title="전기요금 계산" desc="한전 누진제 기준" href="/utils/electricity" isNew />
          <ToolCard icon="car" title="자동차 유지비" desc="주유·보험·세금 연간 비용" href="/utils/car" isNew />
          <ToolCard icon="building" title="부동산 세금" desc="취득세·재산세 간편 계산" href="/utils/property-tax" isNew />
          <ToolCard icon="fileText" title="연말정산 간편계산기" desc="국세청 연말정산 간편계산" href="https://mob.tbys.hometax.go.kr/jsonAction.do?actionId=ATEYSEAA001M01" isNew external />
          <ToolCard icon="gift" title="정부지원금 조회" desc="복지로에서 지원 가능한 혜택 확인" href="https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do" isNew external />
        </div>
      </section>
    </main>
  );
}
