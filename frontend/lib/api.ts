// 로컬: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
// Vercel: 환경변수 미설정 시 같은 도메인(/api/...)으로 요청
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "요청 실패");
  }
  return (await res.json()) as T;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "요청 실패");
  }
  return (await res.json()) as T;
}

