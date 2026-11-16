"use client";

import { useRef, useState, type CSSProperties } from "react";
import { ArrowDownToLine, Bookmark, ChevronLeft, ChevronRight, Copy, ExternalLink, ImageOff, Music2, ScanSearch, Share2, X } from "lucide-react";
import type { Work } from "@/lib/search-types";
import { attribution, shareText, type SongCredit } from "@/lib/work-actions";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";

export function WorkImage({ work, preview = false }: { work: Work; preview?: boolean }) {
  const [usingThumbnail, setUsingThumbnail] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const source = preview && !usingThumbnail ? work.previewUrl ?? work.thumbnail : work.thumbnail;
  return (
    <div className={cn("relative isolate overflow-hidden bg-black/25", preview && "size-full")}
      style={preview ? undefined : { aspectRatio: work.width / work.height }}>
      {state === "loading" && <Skeleton aria-hidden="true" className="absolute inset-0 rounded-none bg-card" />}
      {state === "failed" ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center text-sm text-muted-foreground">
          <ImageOff aria-hidden="true" size={18} />圖片已無法載入
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- Use Commons renditions without a transformation service.
        <img src={source} alt={work.title} width={work.width} height={work.height}
          loading={preview ? "eager" : "lazy"} fetchPriority={preview ? "high" : undefined} decoding="async"
          onLoad={() => setState("ready")} onError={() => {
            if (source !== work.thumbnail) { setUsingThumbnail(true); setState("loading"); }
            else setState("failed");
          }} className={cn("absolute inset-0 size-full object-contain", state === "loading" && "opacity-0")} />
      )}
    </div>
  );
}

type PreviewProps = {
  work: Work; track?: SongCredit; saved: boolean; toggle: () => string; onClose: () => void;
  previous?: () => void; next?: () => void; similar?: () => string; reportUrl?: string; restoreFocus: () => void;
};

export function WorkPreview({ work, track, saved, toggle, onClose, previous, next, similar, reportUrl, restoreFocus }: PreviewProps) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false}
        className="inset-0 block h-dvh w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 p-0 sm:max-w-none"
        onCloseAutoFocus={(event) => { event.preventDefault(); restoreFocus(); }}
        onKeyDown={(event) => {
          if (event.target instanceof HTMLTextAreaElement || event.altKey || event.metaKey || event.ctrlKey) return;
          if (event.key === "ArrowLeft" && previous) { event.preventDefault(); previous(); }
          if (event.key === "ArrowRight" && next) { event.preventDefault(); next(); }
        }}>
        <div className="flex min-h-full flex-col bg-background">
          <div className="flex h-13 shrink-0 items-center gap-2 border-b border-border/65 px-2 sm:px-6">
            <Button size="icon" variant="ghost" aria-label="關閉預覽" className="size-11" onClick={onClose}><X /></Button>
            <span className="font-display text-2xl">MuPho</span>
          </div>
          <div className="grid flex-1 content-start lg:grid-cols-[minmax(0,1fr)_minmax(17rem,25%)] lg:gap-6 lg:px-6 lg:py-4">
            <div className="relative aspect-(--work-aspect) max-h-[56dvh] min-w-0 touch-pan-y overflow-hidden bg-[#0b0b0a] lg:aspect-auto lg:h-[calc(100dvh-5.25rem)] lg:max-h-none lg:min-h-52 lg:rounded-sm"
              style={{ "--work-aspect": Math.max(0.35, Math.min(3, work.width / work.height)) } as CSSProperties}
              onTouchStart={(event) => {
                const touch = event.touches[0];
                start.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
              }}
              onTouchCancel={() => { start.current = null; }}
              onTouchEnd={(event) => {
                const first = start.current;
                start.current = null;
                const touch = event.changedTouches[0];
                if (!first || !touch) return;
                const dx = touch.clientX - first.x;
                if (Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(touch.clientY - first.y)) return;
                if (dx > 0) previous?.();
                else next?.();
              }}>
              <WorkImage key={work.id} work={work} preview />
              <Button aria-label="上一張" size="icon" variant="secondary" disabled={!previous} onClick={previous}
                className="absolute top-1/2 left-2 size-11 -translate-y-1/2 rounded-full bg-background/85 text-foreground hover:bg-background"><ChevronLeft /></Button>
              <Button aria-label="下一張" size="icon" variant="secondary" disabled={!next} onClick={next}
                className="absolute top-1/2 right-2 size-11 -translate-y-1/2 rounded-full bg-background/85 text-foreground hover:bg-background"><ChevronRight /></Button>
            </div>
            <PreviewDetails key={work.id} work={work} track={track} saved={saved} toggle={toggle} similar={similar} reportUrl={reportUrl} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewDetails({ work, track, saved, toggle, similar, reportUrl }: Pick<PreviewProps, "work" | "track" | "saved" | "toggle" | "similar" | "reportUrl">) {
  const [text, setText] = useState(() => shareText(work, track));
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("已複製。");
    } catch {
      setText(value);
      setEditing(true);
      setStatus("請選取下方文案手動複製。");
    }
  }
  async function share() {
    if (!navigator.share) {
      await copy(text);
      return;
    }
    try {
      await navigator.share({ text });
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) await copy(text);
    }
  }

  return (
    <aside className="min-w-0 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 lg:max-h-[calc(100dvh-5.25rem)] lg:overflow-y-auto lg:px-2 lg:py-5">
      {track && <p className="mb-3 flex items-start gap-2 border-b border-border pb-3 font-display text-lg break-words">
        <Music2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" /><span className="min-w-0">{track.title} — {track.artist}</span>
      </p>}
      <DialogTitle className="font-display text-xl leading-snug break-words sm:text-2xl">{work.title}</DialogTitle>
      <DialogDescription className="mt-1 text-sm leading-relaxed break-words text-muted-foreground">{work.author} · Wikimedia Commons</DialogDescription>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <a href={work.licenseUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-7 items-center gap-1 underline">{work.license} <ExternalLink size={12} aria-hidden="true" /></a>
        <span>授權資料擷取於 {new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", dateStyle: "medium" }).format(new Date(work.checkedAt))}</span>
      </div>
      {similar && <Button className="mt-3 min-h-11 w-full" onClick={() => setStatus(similar())}><ScanSearch />更像這張</Button>}
      <div className="mt-2 grid grid-cols-3 divide-x divide-border border-b border-border pb-2">
        <Button variant="ghost" className="h-auto min-h-13 flex-col gap-1 px-1 text-xs" aria-pressed={saved} onClick={() => setStatus(toggle())}><Bookmark fill={saved ? "currentColor" : "none"} />{saved ? "取消收藏" : "收藏"}</Button>
        <Button variant="ghost" className="h-auto min-h-13 flex-col gap-1 px-1 text-xs" aria-expanded={editing} onClick={() => { setEditing(!editing); setStatus(""); }}><Share2 />分享</Button>
        <Button variant="ghost" className="h-auto min-h-13 flex-col gap-1 px-1 text-xs" onClick={() => void copy(attribution(work))}><Copy />複製署名</Button>
      </div>
      {editing && <div className="mt-3 grid gap-2">
        <Textarea aria-label="編輯分享文案" value={text} maxLength={2000} onChange={(event) => setText(event.target.value)} rows={4} />
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-11" onClick={() => void share()}>分享文案</Button>
          <Button variant="outline" className="min-h-11" onClick={() => void copy(text)}>複製文案</Button>
        </div>
      </div>}
      {status && <p role="status" className="mt-2 text-sm text-muted-foreground">{status}</p>}
      <a href={work.source} target="_blank" rel="noreferrer" className="mt-1 flex min-h-11 items-center gap-2 text-sm text-primary underline-offset-4 hover:underline">
        <ArrowDownToLine size={15} aria-hidden="true" />來源／取得原檔 <ExternalLink size={13} aria-hidden="true" />
      </a>
      {reportUrl && <a href={reportUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline">回報作品</a>}
    </aside>
  );
}
