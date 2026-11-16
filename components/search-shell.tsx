import Link from "next/link";
import { AudioLines } from "lucide-react";

export function SearchShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 rounded-sm text-xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-ring">
            <AudioLines aria-hidden="true" size={22} className="text-primary" /> MuPho
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}

export function SearchHero({ children, featured }: { children: React.ReactNode; featured?: React.ReactNode }) {
  return (
    <section className="hero border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-16 lg:grid-cols-[1.55fr_1fr]">
        <div>
        <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">從一首歌<br />找到一幅畫面</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">輸入歌名，探索與它相呼應的攝影和插畫。</p>
          {children}
        </div>
        {featured && <div className="w-full max-w-sm justify-self-start lg:justify-self-end">{featured}</div>}
      </div>
    </section>
  );
}
