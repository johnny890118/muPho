import Link from "next/link";

const heroSource = "https://commons.wikimedia.org/wiki/File:Pontevedra_-_rainy_night.jpg";
export const heroWorkId = "178917189";

export function SearchShell({ children, actions, compact }: {
  children: React.ReactNode; actions: React.ReactNode; compact?: React.ReactNode;
}) {
  return (
    <>
      <header className={compact ? "relative z-10 border-b border-border/65 bg-background" : "relative z-10"}>
        <div className="mx-auto flex min-h-16 max-w-[100rem] flex-wrap items-center justify-between gap-x-6 px-4 sm:px-8">
          <Link href="/" className="order-0 inline-flex min-h-11 items-center rounded-sm font-display text-[1.85rem] font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-ring">MuPho</Link>
          {compact && <div className="order-2 w-full min-w-0 pb-2 md:order-1 md:w-auto md:max-w-4xl md:flex-1 md:pb-0">{compact}</div>}
          <div className="order-1 md:order-2">{actions}</div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}

export function SearchHero({ children, featured, showPhoto }: {
  children: React.ReactNode; featured?: React.ReactNode; showPhoto: boolean;
}) {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border/60 bg-card">
        {showPhoto && <>
          <div className="hero-image absolute inset-y-0 right-0 -z-10 w-full opacity-35 md:w-[70%] md:opacity-85">
            {/* eslint-disable-next-line @next/next/no-img-element -- Commons serves the licensed thumbnail directly. */}
            <img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Pontevedra_-_rainy_night.jpg/960px-Pontevedra_-_rainy_night.jpg"
              alt="" width={960} height={640} fetchPriority="high" className="size-full object-cover object-[center_55%]" />
          </div>
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-background/85 via-background/25 to-background/25" />
        </>}
        <div className="mx-auto max-w-[91rem] px-5 pt-12 pb-14 sm:px-12 md:pt-20 md:pb-24">
          <h1 className="max-w-2xl font-display text-[1.7rem] font-semibold leading-snug tracking-wide sm:text-[2.55rem]">把一首歌，變成你想分享的畫面。</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">用歌曲找出相應的影像，讓旋律的氛圍被看見。</p>
          {children}
        </div>
        {showPhoto && <p className="absolute right-4 bottom-2 rounded bg-background/90 px-2 py-1 text-xs text-muted-foreground">
          <a href={heroSource} target="_blank" rel="noreferrer">Jorge Franganillo</a>
          {" · "}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY 4.0</a>
          {" · 裁切呈現"}
        </p>}
      </section>
      {featured}
    </>
  );
}
