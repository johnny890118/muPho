"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bookmark, RefreshCw, SlidersHorizontal } from "lucide-react";
import { heroWorkId, SearchHero, SearchShell } from "./search-shell";
import { SearchForm } from "./search-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import { FeaturedWorks } from "./featured-work";
import { WorkImage, WorkPreview } from "./work-preview";
import { readFavorites, similarWorks, type FavoriteWork } from "@/lib/work-actions";
import { fetchImageBatch } from "@/lib/image-search";
import { LyricsInput } from "./lyrics-input";
import { TrackOptions } from "./track-options";
import { canonicalQuery, describeTrack, type VisualIntent } from "@/lib/song-intents";
import type { ImageBatch, Media, SearchErrorCode, Track, Work } from "@/lib/search-types";

const messages: Record<SearchErrorCode, string> = {
  disabled: "這個環境尚未啟用搜尋服務。",
  invalid: "請輸入 1–100 字的歌名或圖片關鍵字。",
  limited: "目前已達搜尋額度，請稍後再試。",
  upstream_limited: "圖片或歌曲來源正在限流，請稍後再試。",
  busy: "搜尋服務正在處理其他請求，請稍候。",
  offline: "來源服務暫時無法回應，請稍後再試。",
};

async function search<T>(params: Record<string, string>, signal: AbortSignal): Promise<T> {
  const url = "/api/search?" + new URLSearchParams(params);
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { signal });
    const data = await response.json().catch(() => undefined);
    if (response.ok && data) return data as T;
    if (data?.error !== "busy" || attempt >= 2) throw new Error(messages[data?.error as SearchErrorCode] ?? messages.offline);
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
  const [choosing, setChoosing] = useState(false);
  const [track, setTrack] = useState<Track>();
  const [lyricsIntent, setLyricsIntent] = useState<VisualIntent>();
  const [media, setMedia] = useState<Media>("photo");
  const [imageLabel, setImageLabel] = useState("");
  const [status, setStatus] = useState<ImageBatch["status"]>();
  const [refining, setRefining] = useState(false);
  const [appliedRefine, setAppliedRefine] = useState("");
  const [query, setQuery] = useState("");
  const [nextPage, setNextPage] = useState<number>();
  const [works, setWorks] = useState<Work[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<FavoriteWork[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState("");
  const [selected, setSelected] = useState<string>();
  const [refine, setRefine] = useState("");
  const [reference, setReference] = useState<Work>();
  const focusOrigin = useRef<HTMLButtonElement>(null);
  const favoritesButton = useRef<HTMLButtonElement>(null);
  const current = useRef<AbortController | null>(null);
  const results = useRef<HTMLElement>(null);
  const retrySearch = useRef<() => void>(null);


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
    const song = track ? { title: track.title, artist: track.artist } : undefined;
    const updated = saved ? favorites.filter((item) => item.id !== work.id) : [{ ...work, song }, ...favorites].slice(0, 200);
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

  function load(q: string, kind: Media, offset = 0, append = false, fallback?: string) {
    setQuery(q);
    setMedia(kind);
    if (offset === 0) setNextPage(undefined);
    retrySearch.current = () => void load(q, kind, offset, append, fallback);
    return run(async (signal) => {
      const data = await fetchImageBatch(q, offset === 0 ? fallback : undefined, (candidate) =>
        search<ImageBatch>({ kind: "images", q: candidate, media: kind, page: String(offset) }, signal),
      );
      signal.throwIfAborted();
      setQuery(data.query);
      setWorks((previous) => [...new Map([...(append ? previous : []), ...data.works].map((work) => [work.id, work])).values()]);
      setNextPage(data.hasMore ? data.nextPage ?? offset + 1 : undefined);
      setStatus(data.status);
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = input.trim();
    if (!q) return;
    setShowFavorites(false);
    setReference(undefined);
    setRefine("");
    setAppliedRefine("");
    setRefining(false);
    setTrack(undefined);
    setLyricsIntent(undefined);
    setTracks(null);
    setChoosing(false);
    setQuery("");
    setWorks([]);
    setNextPage(undefined);
    setStatus(undefined);
    setSearched(true);
    window.scrollTo({ top: 0 });
    if (mode === "image") { setImageLabel(q); return void load(q, media); }
    retrySearch.current = lookup;
    lookup();

    function lookup() {
      void run(async (signal) => {
        const data = await search<{ tracks: Track[] }>({ kind: "tracks", q }, signal);
        signal.throwIfAborted();
        setTracks(data.tracks);
        const canonical = canonicalQuery(q).toLowerCase();
        const only = data.tracks.length === 1 ? data.tracks[0] : undefined;
        if (only && canonical === canonicalQuery(`${only.title} — ${only.artist}`).toLowerCase()) select(only);
        else setChoosing(data.tracks.length > 0);
      });
    }
  }

  function loadInitial(item: Track | undefined, kind: Media, refinement = "", provided?: VisualIntent) {
    const intent = provided ?? (item ? describeTrack(item) : undefined);
    const base = intent?.query ?? imageLabel;
    const q = [base, refinement].filter(Boolean).join(" ").slice(0, 100);
    setReference(undefined);
    setWorks([]);
    setStatus(undefined);
    void load(q, kind, 0, false, refinement ? undefined : intent?.fallback);
  }

  function select(item: Track) {
    setTrack(item);
    setLyricsIntent(undefined);
    setChoosing(false);
    setRefine("");
    setAppliedRefine("");
    setRefining(false);
    loadInitial(item, media);
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
        {mode === "song" && <div className="mt-4 max-w-xl" role="group" aria-labelledby="song-examples">
          <p id="song-examples" className="mb-2 text-sm font-medium text-foreground">試試看</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["晴天", "周杰倫"],
              ["Space Oddity", "David Bowie"],
              ["夜に駆ける", "YOASOBI"],
              ["봄날", "BTS"],
            ].map(([title, artist]) => (
              <Button key={title} type="button" variant="outline" aria-label={`${title} — ${artist}`}
                className="h-full min-h-12 min-w-0 flex-col items-start gap-0.5 border-input/70 bg-background/85 px-2.5 py-1.5 text-left whitespace-normal dark:bg-background/85 dark:hover:bg-secondary"
                onClick={() => setInput(`${title} — ${artist}`)}>
                <span className="text-xs leading-tight font-medium">{title}</span>
                <span className="text-xs leading-tight font-normal text-muted-foreground">{artist}</span>
              </Button>
            ))}
          </div>
        </div>}
      </SearchHero>}
      {compact && <section ref={results} tabIndex={-1} aria-label="搜尋結果" aria-busy={pending}
        className="mx-auto max-w-[100rem] px-2.5 pt-4 pb-8 outline-none sm:px-6 lg:px-8">
        {showFavorites ? <>
          <h2 className="font-display text-2xl">本機收藏</h2>
          <p className="my-3 text-sm text-muted-foreground">收藏保存在這個瀏覽器。清除瀏覽器資料會移除收藏。</p>
          {favoriteStatus && <p role="status">{favoriteStatus}</p>}
          {favorites.length === 0 && <p className="py-8 text-muted-foreground">還沒有收藏作品。</p>}
        </> : <>
          {tracks && !track && !query && <div className="px-2 py-4">
            <h2 className="font-display text-2xl">{tracks.length ? "選擇歌曲版本" : "找不到符合的歌曲"}</h2>
            {tracks.length > 0
              ? <Button variant="outline" className="mt-3 min-h-11" onClick={() => setChoosing(true)}>查看歌曲版本</Button>
              : <p className="mt-2 text-sm text-muted-foreground">試試原文歌名，或用「歌名 — 歌手」縮小搜尋範圍。</p>}
          </div>}
          {choosing && tracks?.length ? <TrackOptions tracks={tracks} onSelect={select} onClose={() => setChoosing(false)}
            restoreFocus={() => results.current?.focus({ preventScroll: true })} /> : null}
          {query && <>
            <div className="md:mb-3 md:flex md:items-center md:justify-between md:gap-5">
            <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1.5 sm:px-0 md:mb-0 md:flex-1 md:justify-start">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl leading-tight break-words sm:text-3xl">
                  {track ? <>{track.title}<span className="ml-2 font-sans text-sm text-muted-foreground sm:text-base">· {track.artist}</span></> : imageLabel}
                </h2>
                {track && <p className="mt-1 text-xs text-muted-foreground">{lyricsIntent ? "依你提供的歌詞擷取意象" : "依歌曲資料推薦・未分析完整歌詞"}</p>}
              </div>
              {track && <Button variant="ghost" className="min-h-11 shrink-0 px-2 text-primary" onClick={() => setChoosing(true)}>
                <RefreshCw />更換歌曲
              </Button>}
            </div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1.5 sm:px-0 md:mb-0">
              <Tabs value={media} onValueChange={(value) => loadInitial(track, value as Media, appliedRefine, lyricsIntent)}>
                <TabsList aria-label="圖片類型" className="media-tabs h-auto rounded-full bg-secondary p-0.5">
                  <TabsTrigger value="photo" className="min-h-11 rounded-full px-5 dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground">攝影</TabsTrigger>
                  <TabsTrigger value="illustration" className="min-h-11 rounded-full px-5 dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground">插畫</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-1">
                <Button variant="ghost" className="min-h-11 px-2 text-muted-foreground" aria-expanded={refining} onClick={() => setRefining(!refining)}>
                  <SlidersHorizontal />微調
                </Button>
                <Button variant="ghost" className="size-11 text-muted-foreground" aria-label="更新結果" disabled={pending}
                  onClick={() => loadInitial(track, media, appliedRefine, lyricsIntent)}><RefreshCw /></Button>
              </div>
            </div>
            </div>
            {track && <LyricsInput key={track.id} pending={pending} active={Boolean(lyricsIntent)}
              onApply={(intent) => {
                setLyricsIntent(intent);
                setAppliedRefine("");
                setRefine("");
                setRefining(false);
                loadInitial(track, media, "", intent);
              }} onReset={() => {
                setLyricsIntent(undefined);
                loadInitial(track, media, appliedRefine);
              }} />}
            {refining && <form className="mb-4 flex max-w-md gap-2" onSubmit={(event) => {
              event.preventDefault();
              const text = refine.trim();
              setAppliedRefine(text);
              loadInitial(track, media, text, lyricsIntent);
            }}>
              <Input aria-label="微調關鍵字" className="min-h-11" placeholder="加上場景、光線或物件" maxLength={36} value={refine} onChange={(event) => setRefine(event.target.value)} />
              <Button variant="outline" type="submit" className="min-h-11" disabled={pending}>套用</Button>
            </form>}
            {reference && <Button variant="ghost" className="mb-2 min-h-11" onClick={() => setReference(undefined)}>返回原搜尋排序</Button>}
            {!pending && !error && !works.length && <div className="rounded-md bg-card px-4 py-6">
              <h3 className="font-display text-xl">{status === "empty" ? "目前沒有相符的作品" : "這一批沒有符合類型與授權條件的作品。"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{media === "illustration"
                ? "可搜尋較常見的場景，或切換到攝影。"
                : "試著縮短關鍵字，或從光線、場景與物件中選一項微調。"}</p>
              <Button variant="ghost" className="mt-2 min-h-11 px-0 text-primary" onClick={() => setRefining(true)}>調整關鍵字</Button>
            </div>}
          </>}
          {error && <div className="mb-3 rounded-md bg-card px-4 py-3">
            <p role="alert" className="text-destructive">{error}</p>
            {(error === messages.offline || error === messages.busy) && <Button variant="ghost" className="min-h-11 px-0 text-primary" onClick={() => retrySearch.current?.()}>重試</Button>}
          </div>}
          {pending && <div role="status" className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            <span className="sr-only">搜尋中</span>{[0, 1, 2, 3].map((id) => <Skeleton key={id} className="aspect-[5/3] bg-card" />)}
          </div>}
        </>}
        <div className="columns-2 gap-2 md:columns-3 xl:columns-4">
          {visibleWorks.map((work) => <WorkCard key={work.id} work={work} saved={favorites.some((item) => item.id === work.id)}
            onToggle={() => setFavoriteStatus(toggleFavorite(work))} onOpen={(button) => openPreview(work.id, button)} />)}
        </div>
        {!showFavorites && nextPage !== undefined && <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" disabled={pending} onClick={() => void load(query, media, nextPage, true)}>載入更多</Button>
          <Button variant="outline" disabled={pending} onClick={() => { setReference(undefined); void load(query, media, nextPage); }}>換一批</Button>
        </div>}
        {!showFavorites && favoriteStatus && <p role="status" className="sr-only">{favoriteStatus}</p>}
        {selectedWork && <WorkPreview work={selectedWork} track={showFavorites ? favorites.find((work) => work.id === selectedWork.id)?.song : track}
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

function WorkCard({ work, saved, onToggle, onOpen }: {
  work: Work; saved: boolean; onToggle: () => void; onOpen: (button: HTMLButtonElement) => void;
}) {
  return (
    <article className="relative mb-2 break-inside-avoid overflow-hidden rounded-md bg-card">
      <button type="button" onClick={(event) => onOpen(event.currentTarget)} aria-label={`預覽 ${work.title}`}
        className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]">
        <WorkImage work={work} />
      </button>
      <Button variant="ghost" size="icon" aria-label={`${saved ? "取消收藏" : "收藏"} ${work.title}`} aria-pressed={saved} onClick={onToggle}
        className="absolute top-1 right-1 size-11 rounded-md bg-background/75 text-foreground hover:bg-background">
        <Bookmark fill={saved ? "currentColor" : "none"} />
      </Button>
      <p className="px-2 py-1.5 text-xs break-words text-muted-foreground">{work.author} · <a className="underline" href={work.licenseUrl} target="_blank" rel="noreferrer">{work.license}</a></p>
    </article>
  );
}
