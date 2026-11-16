"use client";

import { useRef, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, Copy, ExternalLink, ScanSearch, Share2, X } from "lucide-react";
import type { Track, Work } from "@/lib/search-types";
import { attribution, shareText } from "@/lib/work-actions";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";

export function WorkImage({ work, preview = false }: { work: Work; preview?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="grid min-h-28 place-items-center bg-card p-3 text-sm">圖片已無法載入</span>;
  // eslint-disable-next-line @next/next/no-img-element -- Commons serves the source thumbnail without a MuPho proxy.
  return <img src={work.thumbnail} alt={work.title} width={work.width} height={work.height} loading={preview ? "eager" : "lazy"}
    decoding="async" onError={() => setFailed(true)}
    className={preview ? "max-h-[43dvh] w-full object-contain" : "h-auto w-full"} />;
}

export function WorkPreview({ work, track, saved, toggle, onClose, previous, next, similar, reportUrl, restoreFocus }: {
  work: Work; track?: Track; saved: boolean; toggle: () => string; onClose: () => void;
  previous?: () => void; next?: () => void; similar?: () => string; reportUrl?: string; restoreFocus: () => void;
}) {
  const [text, setText] = useState(() => shareText(work, track));
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const start = useRef<number | null>(null);
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
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-1.5rem)] max-w-[calc(100%-1.5rem)] overflow-auto border-border p-4 sm:max-w-3xl sm:p-6"
        onCloseAutoFocus={(event) => { event.preventDefault(); restoreFocus(); }}
        onKeyDown={(event) => {
          if (event.target instanceof HTMLTextAreaElement) return;
          if (event.key === "ArrowLeft") { event.preventDefault(); previous?.(); }
          if (event.key === "ArrowRight") { event.preventDefault(); next?.(); }
        }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <DialogTitle className="font-semibold break-words">{work.title}</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">{work.author} · Wikimedia Commons</DialogDescription>
          </div>
          <Button size="icon" variant="ghost" aria-label="關閉預覽" onClick={onClose}><X /></Button>
        </div>
        <div className="relative overflow-hidden rounded-md bg-card" onTouchStart={(event) => { start.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            if (start.current === null) return;
            const dx = (event.changedTouches[0]?.clientX ?? start.current) - start.current;
            start.current = null;
            if (dx > 60) previous?.();
            if (dx < -60) next?.();
          }}>
          <WorkImage work={work} preview />
          <Button aria-label="上一張" size="icon" disabled={!previous} onClick={previous} className="absolute top-1/2 left-2 -translate-y-1/2"><ChevronLeft /></Button>
          <Button aria-label="下一張" size="icon" disabled={!next} onClick={next} className="absolute top-1/2 right-2 -translate-y-1/2"><ChevronRight /></Button>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <a href={work.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">來源／取得原檔 <ExternalLink size={14} /></a>
          <a href={work.licenseUrl} target="_blank" rel="noreferrer" className="underline">{work.license}</a>
          <span>授權資料擷取於 {work.checkedAt.slice(0, 10)}</span>
          {reportUrl && <a href={reportUrl} target="_blank" rel="noreferrer" className="underline">回報作品</a>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" aria-pressed={saved} onClick={() => setStatus(toggle())}><Bookmark fill={saved ? "currentColor" : "none"} />{saved ? "取消收藏" : "收藏"}</Button>
          <Button variant="outline" onClick={() => { setEditing(!editing); setStatus(""); }}><Share2 />分享</Button>
          <Button variant="outline" onClick={() => void copy(attribution(work))}><Copy />複製署名</Button>
          {similar && <Button variant="outline" onClick={() => setStatus(similar())}><ScanSearch />更像這張</Button>}
        </div>
        {editing && <div className="grid gap-2">
          <Textarea aria-label="編輯分享文案" value={text} maxLength={2000} onChange={(event) => setText(event.target.value)} rows={4} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void share()}>分享文案</Button>
            <Button size="sm" variant="outline" onClick={() => void copy(text)}>複製文案</Button>
          </div>
        </div>}
        {status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
      </DialogContent>
    </Dialog>
  );
}
