"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bookmark } from "lucide-react";
import { heroWorkId, SearchHero, SearchShell } from "./search-shell";
import { SearchForm } from "./search-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import { FeaturedWorks } from "./featured-work";
import { WorkImage, WorkPreview } from "./work-preview";
import { readFavorites, similarWorks } from "@/lib/work-actions";
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
    const data = await response.json().catch(() => ({}));
    if (response.ok) return data as T;
    if (data.error !== "busy" || attempt >= 2) throw new Error(messages[data.error as SearchErrorCode] ?? messages.offline);
    const retry = Number(response.headers.get("retry-after")) || 1;
    await new Promise((resolve) => setTimeout(resolve, Math.min(retry, 3) * 1000 + 100));
    signal.throwIfAborted();
  }
}

const favoritesKey = "mupho-favorites-v1";

export function Explorer({ reportUrl, blockedIds }: { reportUrl?: string; blockedIds: string[] }) {
  const [searched, setSearched] = useState(false);
  const [mode, setMode] = useState("song");
  const [input, setInput] = useState("");
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [track, setTrack] = useState<Track>();
  const [media, setMedia] = useState<Media>("photo");
  const [baseQuery, setBaseQuery] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Work[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState("");
  const [selected, setSelected] = useState<string>();
  const [refine, setRefine] = useState("");
  const [reference, setReference] = useState<Work>();
  const focusOrigin = useRef<HTMLButtonElement>(null);
  const favoritesButton = useRef<HTMLButtonElement>(null);
  const current = useRef<AbortController | null>(null);


  useEffect(() => {
    function refresh() {
      try {
        setFavorites(readFavorites(localStorage.getItem(favoritesKey)).filter((work) => !blockedIds.includes(work.id)));
      } catch {
        setFavoriteStatus("目前無法讀取本機收藏。");
      }
    }
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [blockedIds]);

  function toggleFavorite(work: Work) {
    const saved = favorites.some((item) => item.id === work.id);
    const updated = saved ? favorites.filter((item) => item.id !== work.id) : [work, ...favorites].slice(0, 200);
    setFavorites(updated);
    try {
      localStorage.setItem(favoritesKey, JSON.stringify(updated));
      return saved ? "已取消收藏。" : "已加入收藏。";
    } catch {
      return "瀏覽器無法儲存收藏，本次頁面關閉後將失去變更。";
    }
  }

  function openPreview(id: string, button: HTMLButtonElement) {
    focusOrigin.current = button;
    setSelected(id);
  }

  function restoreFocus() {
    const origin = focusOrigin.current;
    if (origin?.isConnected) origin.focus({ preventScroll: true });
    else favoritesButton.current?.focus({ preventScroll: true });
  }

  const visibleWorks = showFavorites ? favorites : reference ? similarWorks(reference, works) : works;
  const focused = visibleWorks.findIndex((work) => work.id === selected);
  const selectedWork = visibleWorks[focused];

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
    if (!append) setMore(false);
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
    setShowFavorites(false);
    setReference(undefined);
    setRefine("");
    setTrack(undefined);
    setTracks(null);
    setQuery("");
    setWorks([]);
    setMore(false);
    setSearched(true);
    window.scrollTo({ top: 0 });
    if (mode === "image") { setBaseQuery(q); return void load(q, media); }
    void run(async (signal) => {
      const data = await search<{ tracks: Track[] }>({ kind: "tracks", q }, signal);
      signal.throwIfAborted();
      setTracks(data.tracks);
      if (data.tracks.length === 1 && q.includes(" — ") &&
          `${data.tracks[0].title} — ${data.tracks[0].artist}`.normalize("NFKC").toLowerCase() === q.normalize("NFKC").toLowerCase()) {
        select(data.tracks[0]);
      }
    });
  }

  function select(item: Track) {
    setTrack(item);
    setReference(undefined);
    setRefine("");
    const intent = describeTrack(item).query;
    setBaseQuery(intent);
    void load(intent, media);
  }

  const compact = searched || showFavorites;
  const form = <SearchForm mode={mode} input={input} onMode={setMode} onInput={setInput} onSubmit={submit} compact={compact} />;
  const favoritesControl = <Button ref={favoritesButton} variant="ghost" aria-pressed={showFavorites}
    className="min-h-11 text-muted-foreground hover:text-foreground" onClick={() => {
      setShowFavorites(!showFavorites); setSelected(undefined); window.scrollTo({ top: 0 });
    }}><Bookmark />{showFavorites ? "返回搜尋" : `收藏${favorites.length ? `（${favorites.length}）` : ""}`}</Button>;

  return (
    <SearchShell actions={favoritesControl} compact={compact ? form : undefined}>
      {!compact && <SearchHero showPhoto={!blockedIds.includes(heroWorkId)} featured={<FeaturedWorks blockedIds={blockedIds} />}>
        {form}
        {mode === "song" && <div className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span className="mr-1">試試看</span>
          {["晴天 — 周杰倫", "Space Oddity — David Bowie", "夜に駆ける — YOASOBI", "봄날 — BTS"].map((example) =>
            <Button key={example} variant="ghost" className="min-h-11 rounded-full px-2.5 text-xs hover:bg-secondary" onClick={() => setInput(example)}>{example}</Button>)}
        </div>}
      </SearchHero>}
      {compact && <section aria-label="搜尋結果" aria-busy={pending} className="mx-auto max-w-[100rem] px-3 py-5 sm:px-8">
        {showFavorites ? <>
          <h2 className="text-xl font-semibold">本機收藏</h2>
          <p className="my-3 text-sm text-muted-foreground">收藏保存在這個瀏覽器，無跨裝置同步。清除瀏覽器資料會移除收藏。</p>
          {favoriteStatus && <p role="status">{favoriteStatus}</p>}
          {favorites.length === 0 && <p className="text-muted-foreground">還沒有收藏作品。</p>}
        </> : <>
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
                      current.current?.abort(); setPending(false); setError(""); setTrack(undefined); setQuery(""); setWorks([]); setReference(undefined);
                    }} className="mt-2 px-0">更換歌曲</Button>
                    <details className="mt-2 max-w-xl text-sm text-muted-foreground">
                      <summary className="cursor-pointer">歌詞分析</summary>
                      <p className="mt-2">目前未啟用歌詞分析或上傳。圖片以選定的歌曲資料與搜尋線索查找。</p>
                    </details>
                  </>
                )}
              </div>
              <Tabs value={media} onValueChange={(value) => {
                setReference(undefined); setWorks([]); void load(query, value as Media);
              }}>
                <TabsList aria-label="圖片類型">
                  <TabsTrigger value="photo">攝影</TabsTrigger>
                  <TabsTrigger value="illustration">插畫</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <form className="mb-5 flex max-w-md gap-2" onSubmit={(event) => {
              event.preventDefault();
              const base = baseQuery;
              if (!base) return;
              setReference(undefined); setWorks([]); void load([base, refine.trim()].filter(Boolean).join(" ").slice(0, 100), media);
            }}>
              <Input aria-label="微調關鍵字" placeholder="加上場景、光線或物件" maxLength={36} value={refine} onChange={(event) => setRefine(event.target.value)} />
              <Button variant="outline" type="submit" disabled={pending}>微調</Button>
            </form>
            {reference && <Button variant="ghost" className="mb-4" onClick={() => setReference(undefined)}>返回原搜尋排序</Button>}
            {!pending && !error && !works.length && <p className="mb-4 text-muted-foreground">這一批沒有符合類型與授權條件的作品。</p>}
          </>
        )}
        {pending && <div role="status" className="mt-4 grid gap-3 sm:grid-cols-3"><span className="sr-only">搜尋中</span>{[0, 1, 2].map((id) => <Skeleton key={id} className="h-28 bg-card" />)}</div>}
        </>}
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {visibleWorks.map((work) => <WorkCard key={work.id} work={work} onOpen={(button) => openPreview(work.id, button)} />)}
        </div>
        {!showFavorites && more && <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" disabled={pending} onClick={() => void load(query, media, page + 1, true)}>載入更多</Button>
          <Button variant="outline" disabled={pending} onClick={() => { setReference(undefined); setWorks([]); void load(query, media, page + 1); }}>換一批</Button>
        </div>}
        {selectedWork && <WorkPreview key={selectedWork.id} work={selectedWork} track={showFavorites ? undefined : track}
          saved={favorites.some((item) => item.id === selectedWork.id)} toggle={() => {
            const status = toggleFavorite(selectedWork);
            if (showFavorites) { setFavoriteStatus(status); setSelected(undefined); }
            return status;
          }} onClose={() => setSelected(undefined)} restoreFocus={restoreFocus} reportUrl={reportUrl}
          previous={focused > 0 ? () => setSelected(visibleWorks[focused - 1].id) : undefined}
          next={focused + 1 < visibleWorks.length ? () => setSelected(visibleWorks[focused + 1].id) : undefined}
          similar={showFavorites ? undefined : () => {
            if (!similarWorks(selectedWork, works).length) return "目前這批作品的描述線索不足。可以再載入一批，或用關鍵字微調。";
            setReference(selectedWork); setSelected(undefined); return "";
          }} />}
      </section>}
    </SearchShell>
  );
}

function formatDuration(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function WorkCard({ work, onOpen }: { work: Work; onOpen: (button: HTMLButtonElement) => void }) {
  return (
    <article className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-border bg-card">
      <button type="button" onClick={(event) => onOpen(event.currentTarget)} aria-label={`預覽 ${work.title}`}
        className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]">
        <WorkImage work={work} />
      </button>
      <p className="p-2 text-xs break-words text-muted-foreground">{work.author} · <a className="underline" href={work.licenseUrl} target="_blank" rel="noreferrer">{work.license}</a></p>
    </article>
  );
}
