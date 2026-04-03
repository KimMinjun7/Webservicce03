import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "All-in-One Utility",
  description: "계산기, 변환기, AI 도구를 한 곳에서 빠르게",
  icons: {
    icon: "/allinone-icon.png",
    apple: "/allinone-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <nav className="site-nav">
          <div className="site-nav-inner">
            <Link href="/" className="nav-logo">
              <span className="nav-logo-icon" aria-hidden="true">
                <Image src="/allinone-icon.png" alt="" width={20} height={20} style={{ objectFit: "contain" }} />
              </span>
              All-in-One
            </Link>
            <div className="nav-links">
              <Link href="/#date" className="nav-link"><Icon name="date" size={15} />날짜</Link>
              <Link href="/#calc" className="nav-link"><Icon name="calculator" size={15} />계산기</Link>
              <Link href="/#ai" className="nav-link"><Icon name="bot" size={15} />AI 도구</Link>
              <Link href="/#test" className="nav-link"><Icon name="brain" size={15} />테스트</Link>
              <Link href="/#life" className="nav-link"><Icon name="coins" size={15} />생활계산</Link>
            </div>
          </div>
        </nav>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
