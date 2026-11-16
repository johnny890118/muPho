"use client";

import { useRef, useState, type FormEvent } from "react";
import { Image as ImageIcon, Music2, Search } from "lucide-react";
import { SearchHero } from "./search-shell";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import { describeTrack } from "@/lib/song-intents";
import type { Media, SearchErrorCode, Track, Work } from "@/lib/search-types";

const messages: Record<SearchErrorCode, string> = {
  disabled: "這個環境尚未啟用搜尋服務。",
  invalid: "請輸入 1–100 字的歌名或圖片關鍵字。",
  limited: "目前已達搜尋額度，請稍後再試。",
  busy: "搜尋服務正在處理其他請求，請稍候。",
  offline: "來源服務暫時無法回應，請稍後再試。",
};

async function search<T>(params: Record<string, string>, signal: AbortSignal): Promise<T> {
  const url = "/api/search?" + new URLSearchParams(params);
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { signal });
    const data = await response.json();
    if (response.ok) return data as T;
    if (data.error !== "busy" || attempt >= 2) throw new Error(messages[data.error as SearchErrorCode] ?? messages.offline);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    signal.throwIfAborted();
  }
}

export function Explorer() {
  const [mode, setMode] = useState("song");
  const [input, setInput] = useState("");
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [track, setTrack] = useState<Track>();
  const [media, setMedia] = useState<Media>("photo");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const current = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  async function run(operation: (signal: AbortSignal) => Promise<void>) {
    current.current?.abort();
    const controller = new AbortController();
    current.current = controller;
    setPending(true);
    setError("");
    try {
      await operation(controller.signal);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : messages.offline);
    } finally {
      if (current.current === controller) setPending(false);
    }
  }

  function load(q: string, kind: Media, offset = 0, append = false) {
    setQuery(q);
    setMedia(kind);
    if (!append) {
      setWorks([]);
      setMore(false);
    }
    return run(async (signal) => {
      const data = await search<{ works: Work[]; hasMore: boolean }>({
        kind: "images", q, media: kind, page: String(offset),
      }, signal);
      signal.throwIfAborted();
      setWorks((previous) => [...new Map([...(append ? previous : []), ...data.works].map((work) => [work.id, work])).values()]);
      setPage(offset);
      setMore(data.hasMore);
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = input.trim();
    if (!q) return;
    setTrack(undefined);
    setTracks(null);
    setQuery("");
    setWorks([]);
    setMore(false);
    resultRef.current?.scrollIntoView({ block: "start" });
    if (mode === "image") return void load(q, media);
    void run(async (signal) => {
      const data = await search<{ tracks: Track[] }>({ kind: "tracks", q }, signal);
      signal.throwIfAborted();
      setTracks(data.tracks);
    });
  }

  function select(item: Track) {
    setTrack(item);
    void load(describeTrack(item).query, media);
  }

  return (
    <>
      <SearchHero>
        <form onSubmit={submit} className="mt-8 max-w-2xl">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList aria-label="搜尋模式">
              <TabsTrigger value="song"><Music2 />歌曲找圖</TabsTrigger>
              <TabsTrigger value="image"><ImageIcon />圖片搜尋</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-3 flex gap-2">
            <Input aria-label={mode === "song" ? "歌名" : "圖片關鍵字"} value={input} onChange={(event) => setInput(event.target.value)}
              placeholder={mode === "song" ? "例如 晴天 — 周杰倫" : "例如 海邊日落"} maxLength={100} required className="h-12 bg-background text-base" />
            <Button type="submit" className="h-12 px-4"><Search />搜尋</Button>
          </div>
        </form>
      </SearchHero>
      <section ref={resultRef} aria-label="搜尋結果" aria-busy={pending} className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {error && <p role="alert" className="rounded-md border border-border bg-card p-4 text-destructive">{error}</p>}
        {tracks && !track && (
          <>
            <h2 className="mb-3 text-xl font-semibold">{tracks.length ? "選擇歌曲版本" : "找不到符合的歌曲"}</h2>
            {tracks.length === 0 && <p className="text-muted-foreground">可以試試原文歌名，或用「歌名 — 歌手」縮小搜尋範圍。</p>}
            <ul className="grid gap-2 sm:grid-cols-2">
              {tracks.map((item) => (
                <li key={item.id}>
                  <Button variant="outline" className="h-auto min-h-14 w-full flex-col items-start gap-1 p-3 text-left whitespace-normal" onClick={() => select(item)}>
                    <span>{item.title} — {item.artist}</span>
                    <span className="text-xs text-muted-foreground">{[item.album, item.version, item.milliseconds && formatDuration(item.milliseconds)].filter(Boolean).join(" · ")}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
        {query && (
          <>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{track ? `${track.title} — ${track.artist}` : query}</h2>
                {track && (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">歌曲資料推薦，未分析完整歌詞。搜尋線索為「{query}」。</p>
                    <Button variant="ghost" onClick={() => {
                      current.current?.abort(); setPending(false); setError(""); setTrack(undefined); setQuery(""); setWorks([]);
                    }} className="mt-2 px-0">更換歌曲</Button>
                  </>
                )}
              </div>
              <Tabs value={media} onValueChange={(value) => void load(query, value as Media)}>
                <TabsList aria-label="圖片類型">
                  <TabsTrigger value="photo">攝影</TabsTrigger>
                  <TabsTrigger value="illustration">插畫</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
              {works.map((work) => <WorkCard key={work.id} work={work} />)}
            </div>
            {!pending && !error && !works.length && <p className="text-muted-foreground">這一批沒有符合類型與授權條件的作品。</p>}
            {more && <Button variant="outline" disabled={pending} className="mt-5" onClick={() => void load(query, media, page + 1, true)}>載入更多</Button>}
          </>
        )}
        {pending && <div role="status" className="mt-4 grid gap-3 sm:grid-cols-3"><span className="sr-only">搜尋中</span>{[0, 1, 2].map((id) => <Skeleton key={id} className="h-28 bg-card" />)}</div>}
      </section>
    </>
  );
}

function formatDuration(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function WorkCard({ work }: { work: Work }) {
  const [failed, setFailed] = useState(false);
  return (
    <article className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-border bg-card">
      <a href={work.source} target="_blank" rel="noreferrer" className="block focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]">
        {failed ? <span className="grid min-h-24 place-items-center p-2 text-sm">圖片已無法載入</span> :
          // eslint-disable-next-line @next/next/no-img-element -- Use the provider's thumbnail directly.
          <img src={work.thumbnail} alt={work.title} width={work.width} height={work.height} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-auto w-full" />}
      </a>
      <p className="p-2 text-xs break-words text-muted-foreground">{work.author} · <a className="underline" href={work.licenseUrl} target="_blank" rel="noreferrer">{work.license}</a></p>
    </article>
  );
}
